import * as s3 from 'aws-cdk-lib/aws-s3';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';
import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import dotenv from 'dotenv';
dotenv.config();

const authFunction = defineFunction({
	entry: './data/custom-authorizer.ts'
});

const seedPuzzleDbFunction = defineFunction({
	entry: './data/build-puzzle-collection.ts',
	timeoutSeconds: 600,
	memoryMB: 1024
});

const backend = defineBackend({
	seedPuzzleDbFunction,
	authFunction,
	auth,
	storage,
	data: data(authFunction)
});

// Set up custom authorizor lambda
const underlyingAuthLambda = backend.authFunction.resources.lambda as LambdaFunction;
underlyingAuthLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);

// Set up seed db lambda
const underlyingSeedLambda = backend.seedPuzzleDbFunction.resources.lambda as LambdaFunction;
underlyingSeedLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);
const eventRule = new events.Rule(
	backend.seedPuzzleDbFunction.resources.lambda.stack,
	'scheduleRule',
	{
		schedule: events.Schedule.cron({ minute: '0', hour: '1' })
	}
);
eventRule.addTarget(new targets.LambdaFunction(backend.seedPuzzleDbFunction.resources.lambda));

// Set up S3 Storage bucket
const bucket = backend.storage.resources.bucket;
// allow any authenticated user to read and write to the bucket
const authRole = backend.auth.resources.authenticatedUserIamRole;
bucket.grantReadWrite(authRole);

// allow any guest (unauthenticated) user to read from the bucket
const unauthRole = backend.auth.resources.unauthenticatedUserIamRole;
bucket.grantReadWrite(unauthRole);
(bucket as s3.Bucket).addCorsRule({
	allowedHeaders: ['*'],
	allowedMethods: [
		s3.HttpMethods.GET,
		s3.HttpMethods.HEAD,
		s3.HttpMethods.PUT,
		s3.HttpMethods.POST,
		s3.HttpMethods.DELETE
	],
	allowedOrigins: ['*'],
	exposedHeaders: ['x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2', 'ETag'],
	maxAge: 3000
});
