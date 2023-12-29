# svelte-crossword

This is an app for playing unlimited crossword minis, built with Svelte and AWS Amplify.

## Installing dependencies

To install dependencies, run:

```bash
npm ci --force
```

Currently, `--force` is required (but I'm working on it).

## Set up environment

You'll need to configure your environment variables. First copy from the example

```bash
cp .env.example .env
```

Then fill in the desired environment variable values. There should be comments in the `.env.example` file that indicate how to get the values that you should set.

## Developing with Amplify

First, you'll want to set up a development sandbox in your AWS account. You can do that by running:

```bash
npm run sandbox
```

in a terminal tab. This process will watch for changes in the `amplify/` directory and apply them to your AWS backend resources. This includes auth (Cognito), storage (S3), and api (AppSync/DynamoDb) resources.

Once your resources are deployed, a file named `src/amplifyconfiguration.json` will be written. Now your app will use the AWS resources you've just deployed.

Start by seeding your database:

```bash
npm run seed
```

## Developing Svelte

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Now you can open http://localhost:5175/ to see your app in action (including hot reloading as you update the source code).

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/svelte-crossword)
