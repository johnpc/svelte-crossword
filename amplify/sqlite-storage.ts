import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnFunction, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

export const DB_MOUNT_PATH = '/mnt/db';
export const DB_PATH = `${DB_MOUNT_PATH}/crossword.sqlite`;

export interface SqliteStorageProps {
	vpc: ec2.IVpc;
	subnetIds: string[];
	/** Security group shared by every Lambda that mounts the database. */
	lambdaSecurityGroup: ec2.ISecurityGroup;
}

/**
 * EFS file system + access point that hold the SQLite database, and a helper
 * to mount it into a Lambda. The VPC spans two AZs, so the file system is
 * regional (One Zone can't serve both subnets). RETAIN: the data must survive
 * a stack delete. Only the Lambda security group may reach NFS (2049).
 */
export class SqliteStorage {
	readonly fileSystem: efs.FileSystem;
	readonly accessPoint: efs.AccessPoint;

	constructor(
		scope: Construct,
		private readonly props: SqliteStorageProps
	) {
		this.fileSystem = new efs.FileSystem(scope, 'CrosswordSqliteEfs', {
			vpc: props.vpc,
			vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
			encrypted: true,
			performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
			throughputMode: efs.ThroughputMode.BURSTING,
			lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
			outOfInfrequentAccessPolicy: efs.OutOfInfrequentAccessPolicy.AFTER_1_ACCESS,
			removalPolicy: cdk.RemovalPolicy.RETAIN
		});
		this.fileSystem.connections.allowDefaultPortFrom(
			props.lambdaSecurityGroup,
			'SQLite Lambdas (NFS)'
		);
		this.accessPoint = this.fileSystem.addAccessPoint('CrosswordSqliteAccessPoint', {
			path: '/crossword',
			createAcl: { ownerUid: '1000', ownerGid: '1000', permissions: '755' },
			posixUser: { uid: '1000', gid: '1000' }
		});
	}

	/**
	 * Puts the Lambda in the VPC on the shared security group and mounts the
	 * access point at /mnt/db. vpcConfig and fileSystemConfigs are set on the
	 * CfnFunction because Amplify's defineFunction has already constructed the
	 * L2 Function, whose vpc/filesystem props are constructor-only.
	 */
	attach(fn: LambdaFunction): void {
		const cfn = fn.node.defaultChild as CfnFunction;
		cfn.vpcConfig = {
			securityGroupIds: [this.props.lambdaSecurityGroup.securityGroupId],
			subnetIds: this.props.subnetIds
		};
		cfn.fileSystemConfigs = [
			{ arn: this.accessPoint.accessPointArn, localMountPath: DB_MOUNT_PATH }
		];
		// Lambda refuses to create a function whose mount targets aren't ready yet.
		cfn.node.addDependency(this.fileSystem.mountTargetsAvailable);
		fn.role?.addManagedPolicy(
			iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
		);
		fn.addToRolePolicy(
			new iam.PolicyStatement({
				actions: ['elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite'],
				resources: [this.fileSystem.fileSystemArn],
				conditions: {
					StringEquals: { 'elasticfilesystem:AccessPointArn': this.accessPoint.accessPointArn }
				}
			})
		);
		fn.addEnvironment('DB_PATH', DB_PATH);
	}
}
