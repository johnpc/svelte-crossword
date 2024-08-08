import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
// import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
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

export const seedPuzzleDbFunction = defineFunction({
	entry: './data/build-puzzle-collection.ts',
	runtime: 20,
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

// const bucket = backend.storage.resources.bucket;

// Set up custom authorizor lambda
const underlyingAuthLambda = backend.authFunction.resources.lambda as LambdaFunction;
underlyingAuthLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);

// Set up seed db lambda
const underlyingSeedLambda = backend.seedPuzzleDbFunction.resources.lambda as LambdaFunction;
underlyingSeedLambda.addEnvironment('ADMIN_API_KEY', process.env.ADMIN_API_KEY!);
// underlyingSeedLambda.addEnvironment('BUCKET_NAME', bucket.bucketName!);
// underlyingSeedLambda.addToRolePolicy(
// 	new PolicyStatement({
// 		actions: ['s3:PutObject'],
// 		resources: [bucket.bucketArn]
// 	})
// );
const eventRule = new events.Rule(
	backend.seedPuzzleDbFunction.resources.lambda.stack,
	'scheduleRule',
	{
		schedule: events.Schedule.cron({ minute: '0', hour: '1' })
	}
);
eventRule.addTarget(new targets.LambdaFunction(backend.seedPuzzleDbFunction.resources.lambda));
