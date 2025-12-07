import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { seedPuzzleDbFunction } from './function/resource';
import { sqlQueriesFunction } from './function/sql-queries/resource';
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
	sqlQueriesFunction,
	authFunction,
	auth,
	storage,
	data: data(authFunction)
});

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

// Add REST API for SQL queries
backend.addOutput({
	custom: {
		sqlQueriesFunctionName: underlyingSqlLambda.functionName
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
	engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_39 }),
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
	publiclyAccessible: true,
	removalPolicy: cdk.RemovalPolicy.DESTROY,
	deletionProtection: false,
	backupRetention: cdk.Duration.days(7)
});

dbInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306), 'Allow MySQL access');
