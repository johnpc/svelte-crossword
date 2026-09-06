import { CfnFunction, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { seedPuzzleDbFunction } from './function/resource';
import { generatePuzzleFunction } from './function/generate-puzzle/resource';
import { sqlQueriesFunction } from './function/sql-queries/resource';
import { adminSqlFunction } from './function/admin-sql/resource';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import dotenv from 'dotenv';
dotenv.config();

const authFunction = defineFunction({
	entry: './data/custom-authorizer.ts'
});

const backend = defineBackend({
	seedPuzzleDbFunction,
	generatePuzzleFunction,
	sqlQueriesFunction,
	adminSqlFunction,
	authFunction,
	auth,
	storage,
	data: data(authFunction)
});

// Extend refresh token validity to 10 years (max allowed)
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = 3650;
cfnUserPoolClient.tokenValidityUnits = { refreshToken: 'days' };

// Set up custom authorizor lambda
const underlyingAuthLambda = backend.authFunction.resources.lambda as LambdaFunction;
underlyingAuthLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);

// Set up SQL queries lambda
const underlyingSqlLambda = backend.sqlQueriesFunction.resources.lambda as LambdaFunction;
underlyingSqlLambda.addEnvironment('SQL_CONNECTION_STRING', process.env.SQL_CONNECTION_STRING!);

// Set up seed db lambda
const underlyingSeedLambda = backend.seedPuzzleDbFunction.resources.lambda as LambdaFunction;
underlyingSeedLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);
underlyingSeedLambda.addEnvironment('SQL_QUERIES_FUNCTION_NAME', underlyingSqlLambda.functionName);

// Grant seed lambda permission to invoke SQL queries lambda
underlyingSeedLambda.addToRolePolicy(
	new cdk.aws_iam.PolicyStatement({
		actions: ['lambda:InvokeFunction'],
		resources: [underlyingSqlLambda.functionArn]
	})
);

// Set up generate puzzle lambda
const underlyingGenerateLambda = backend.generatePuzzleFunction.resources.lambda as LambdaFunction;
underlyingGenerateLambda.addEnvironment(
	'SQL_QUERIES_FUNCTION_NAME',
	underlyingSqlLambda.functionName
);

// Grant generate puzzle lambda permission to invoke SQL queries lambda
underlyingGenerateLambda.addToRolePolicy(
	new cdk.aws_iam.PolicyStatement({
		actions: ['lambda:InvokeFunction'],
		resources: [underlyingSqlLambda.functionArn]
	})
);

// Grant generate puzzle lambda permission to invoke Bedrock.
// Cross-region inference profiles require both the profile ARN and the
// underlying foundation models across all regions the profile spans.
underlyingGenerateLambda.addToRolePolicy(
	new cdk.aws_iam.PolicyStatement({
		actions: ['bedrock:InvokeModel'],
		resources: ['arn:aws:bedrock:*::foundation-model/*', 'arn:aws:bedrock:*:*:inference-profile/*']
	})
);

// Grant authenticated users permission to invoke SQL queries lambda
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
	new cdk.aws_iam.PolicyStatement({
		actions: ['lambda:InvokeFunction'],
		resources: [underlyingSqlLambda.functionArn]
	})
);

// Grant unauthenticated (guest) users permission to invoke SQL queries lambda
backend.auth.resources.unauthenticatedUserIamRole.addToPrincipalPolicy(
	new cdk.aws_iam.PolicyStatement({
		actions: ['lambda:InvokeFunction'],
		resources: [underlyingSqlLambda.functionArn]
	})
);

// Set up admin SQL lambda. NOTE: intentionally NOT granted to the app's
// authenticated/guest user roles — it executes arbitrary SQL and is for
// laptop admin scripts using admin IAM credentials only.
const underlyingAdminSqlLambda = backend.adminSqlFunction.resources.lambda as LambdaFunction;
underlyingAdminSqlLambda.addEnvironment(
	'SQL_CONNECTION_STRING',
	process.env.SQL_CONNECTION_STRING!
);

// Add REST API for SQL queries
backend.addOutput({
	custom: {
		sqlQueriesFunctionName: underlyingSqlLambda.functionName,
		adminSqlFunctionName: underlyingAdminSqlLambda.functionName
	}
});

// Set up RDS MySQL database
const sqlStack = backend.createStack('crossword-sql-stack');

const vpc = ec2.Vpc.fromVpcAttributes(sqlStack, 'DefaultVPC', {
	vpcId: 'vpc-dd670bb5',
	availabilityZones: ['us-west-2a', 'us-west-2b'],
	publicSubnetIds: ['subnet-de670bb6', 'subnet-df670bb7']
});

const dbInstance = new rds.DatabaseInstance(sqlStack, 'CrosswordDB', {
	// MySQL 8.4 is the current LTS and is in RDS standard support. Staying on 8.0
	// (community EOL) triggers the RDS Extended Support surcharge (~$43/mo); moving
	// to 8.4 removes that fee. A major-version bump (8.0 -> 8.4) requires
	// allowMajorVersionUpgrade, otherwise RDS rejects the modify.
	engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_4_6 }),
	allowMajorVersionUpgrade: true,
	instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
	vpc,
	vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
	allocatedStorage: 20,
	maxAllocatedStorage: 100,
	databaseName: 'crossword',
	credentials: rds.Credentials.fromPassword(
		'admin',
		cdk.SecretValue.unsafePlainText(process.env.DB_PASSWORD!)
	),
	// Private-only: the sole prod client is the in-VPC SQL queries Lambda, and
	// dropping the public IP saves the IPv4 charge. For laptop admin scripts
	// (scripts/direct-rds-migration.ts etc.), use a CloudShell VPC environment
	// or temporarily flip this back on for a maintenance session.
	publiclyAccessible: false,
	removalPolicy: cdk.RemovalPolicy.DESTROY,
	deletionProtection: false,
	backupRetention: cdk.Duration.days(7)
});

// Run the SQL queries Lambda inside the VPC so DB ingress can be scoped to its
// security group instead of 0.0.0.0/0. No NAT or VPC endpoints are needed: the
// handler only speaks MySQL, and the connection string arrives via env var.
const sqlLambdaSecurityGroup = new ec2.SecurityGroup(sqlStack, 'SqlQueriesLambdaSG', {
	vpc,
	description: 'SQL queries Lambda to RDS access',
	allowAllOutbound: true
});

const cfnSqlFunction = underlyingSqlLambda.node.defaultChild as CfnFunction;
cfnSqlFunction.vpcConfig = {
	securityGroupIds: [sqlLambdaSecurityGroup.securityGroupId],
	subnetIds: ['subnet-de670bb6', 'subnet-df670bb7']
};
underlyingSqlLambda.role?.addManagedPolicy(
	cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
);

dbInstance.connections.allowFrom(sqlLambdaSecurityGroup, ec2.Port.tcp(3306), 'SQL queries Lambda');

// The admin SQL lambda shares the SQL queries lambda's security group so the
// single DB ingress rule covers both in-VPC functions.
const cfnAdminSqlFunction = underlyingAdminSqlLambda.node.defaultChild as CfnFunction;
cfnAdminSqlFunction.vpcConfig = {
	securityGroupIds: [sqlLambdaSecurityGroup.securityGroupId],
	subnetIds: ['subnet-de670bb6', 'subnet-df670bb7']
};
underlyingAdminSqlLambda.role?.addManagedPolicy(
	cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
);
