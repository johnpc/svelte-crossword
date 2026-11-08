import { CfnFunction, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { seedPuzzleDbFunction } from './function/resource';
import { generatePuzzleFunction } from './function/generate-puzzle/resource';
import { sqlQueriesFunction } from './function/sql-queries/resource';
import { adminSqliteFunction } from './function/admin-sqlite/resource';
import { backupSqliteFunction } from './function/backup-sqlite/resource';
import { SqliteStorage } from './sqlite-storage';
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
	adminSqliteFunction,
	backupSqliteFunction,
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

// SQL queries lambda (SQLite on EFS; mounted further down once the file system exists)
const underlyingSqlLambda = backend.sqlQueriesFunction.resources.lambda as LambdaFunction;

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

// Admin SQL lambda ({ sql, params } passthrough for laptop scripts). NOTE:
// intentionally NOT granted to the app's authenticated/guest user roles — it
// executes arbitrary SQL and is for admin IAM credentials only.
const underlyingAdminSqliteLambda = backend.adminSqliteFunction.resources.lambda as LambdaFunction;
const underlyingBackupSqliteLambda = backend.backupSqliteFunction.resources
	.lambda as LambdaFunction;

// backup-sqlite runs in the VPC (to mount EFS) with no NAT. Amplify's
// allow.resource() grant would hand it the bucket name via an SSM lookup at
// cold start, and SSM is unreachable from there — so pass the name as a plain
// CloudFormation ref and grant S3 directly. S3 itself is reached through the
// VPC's S3 gateway endpoint.
const puzBucket = backend.storage.resources.bucket;
backend.backupSqliteFunction.addEnvironment('BACKUP_BUCKET', puzBucket.bucketName);
puzBucket.grantPut(underlyingBackupSqliteLambda, 'internal/backups/*');

// Function names the client and admin scripts resolve from amplify_outputs.json
backend.addOutput({
	custom: {
		sqlQueriesFunctionName: underlyingSqlLambda.functionName,
		// Kept under its historical key so scripts/admin-sql-client.ts keeps working.
		adminSqlFunctionName: underlyingAdminSqliteLambda.functionName
	}
});

// Networking + SQLite storage stack (historical id kept so CloudFormation updates in place)
const sqlStack = backend.createStack('crossword-sql-stack');

const SUBNET_IDS = ['subnet-de670bb6', 'subnet-df670bb7'];
const vpc = ec2.Vpc.fromVpcAttributes(sqlStack, 'DefaultVPC', {
	vpcId: 'vpc-dd670bb5',
	availabilityZones: ['us-west-2a', 'us-west-2b'],
	publicSubnetIds: SUBNET_IDS
});

// Security group shared by every Lambda that mounts the SQLite file system.
// Its logical id/description predate the EFS move; renaming would replace it.
const sqlLambdaSecurityGroup = new ec2.SecurityGroup(sqlStack, 'SqlQueriesLambdaSG', {
	vpc,
	description: 'SQL queries Lambda to RDS access',
	allowAllOutbound: true
});

// SQLite on EFS: the only database. NFS (2049) is admitted solely from the
// security group above; the Lambdas need no NAT or VPC endpoints for it.
const sqliteStorage = new SqliteStorage(sqlStack, {
	vpc,
	subnetIds: SUBNET_IDS,
	lambdaSecurityGroup: sqlLambdaSecurityGroup
});
sqliteStorage.attach(underlyingAdminSqliteLambda);
sqliteStorage.attach(underlyingBackupSqliteLambda);
sqliteStorage.attach(underlyingSqlLambda);

// Single writer: SQLite over NFS must not see concurrent writers from several
// containers. Traffic is ~1.3 invocations/min, and the client's Lambda SDK
// retries the rare throttle, so one concurrent execution is plenty.
const cfnSqlFunction = underlyingSqlLambda.node.defaultChild as CfnFunction;
cfnSqlFunction.reservedConcurrentExecutions = 1;
