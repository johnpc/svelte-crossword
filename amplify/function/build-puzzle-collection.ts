import { generateClient } from 'aws-amplify/api';
import { Schema } from '../data/resource';
import { puzToJson } from '../data/helpers/puz-to-json';
import { Amplify } from 'aws-amplify';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import dotenv from 'dotenv';
// @ts-expect-error cannot parse js file
import validateClues from '../../src/routes/components/crossword/helpers/validateClues';
// @ts-expect-error cannot parse js file
import createClues from '../../src/routes/components/crossword/helpers/createClues';
import { env } from '$amplify/env/seedPuzzleDbFunction';
import { createPuzzle } from './graphql/mutations';
import { listPuzzles } from './graphql/queries';

dotenv.config();
const s3 = new S3Client();
const lambda = new LambdaClient({ region: env.AWS_REGION });
Amplify.configure(
	{
		API: {
			GraphQL: {
				endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
				region: env.AWS_REGION,
				defaultAuthMode: 'identityPool'
			}
		}
	},
	{
		Auth: {
			credentialsProvider: {
				getCredentialsAndIdentityId: async () => ({
					credentials: {
						accessKeyId: env.AWS_ACCESS_KEY_ID,
						secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
						sessionToken: env.AWS_SESSION_TOKEN
					}
				}),
				clearCredentialsAndIdentityId: () => {
					/* noop */
				}
			}
		}
	}
);
type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

const client = generateClient<Schema>();
const getMiniPuzzleFeedUrl = (today: Date) => {
	const year = today.getFullYear();
	const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
	return `https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fdailyminis%2F${year}%2F${month}&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`;
};
const newestPuzzleFeedUrl =
	'https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fnewest%2F1&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json';

// const getUserPuzzleFeedUrls = () => {
// 	const allUrls: string[] = [];
// 	const users = [
// 		'erk',
// 		'sayuga',
// 		'pile',
// 		'smaximus',
// 		'Yoti',
// 		'sendhil',
// 		'PuzzledInCNY',
// 		'dilly',
// 		'peterduttonmp',
// 		'benchen71',
// 		'kieranjboyd',
// 		'PuzzlingEvidence',
// 		'blackcrossword',
// 		'contraptions',
// 		'jimmyblank'
// 	];
// 	const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// 	for (const user of users) {
// 		allUrls.push(
// 			`https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2F${user}%2F1&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`
// 		);
// 		for (const pageNumber of pageNumbers) {
// 			allUrls.push(
// 				`https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2F${user}%2Fpage%2F${pageNumber}%2F1&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`
// 			);
// 		}
// 	}
// 	return users.map(
// 		(user) =>
// 			`https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2F${user}%2F1&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`
// 	);
// };
const puzFileLocationPrefix = 'https://crosshare.org/api/puz'; // .puz file available from https://crosshare.org/api/puz/Mf1l08Ofuj8pmEoV9nyO
const createDynamoRecord = async (buffer: Buffer, puzKey: string): Promise<boolean> => {
	const json = puzToJson(buffer);
	const across = Object.values(json.clues.across) as Clue[];
	const down = Object.values(json.clues.down) as Clue[];
	const clues = [...across, ...down];
	const isValid = validateClues(createClues(clues));
	if (!isValid) {
		return false;
	}
	console.log({ isValid, puzKey });

	// Create in DynamoDB
	const createdPuzzle = await client.graphql({
		query: createPuzzle,
		variables: {
			input: {
				id: puzKey,
				puzJson: JSON.stringify(json),
				puzKey
			}
		}
	});
	console.log({ createdPuzzle });

	if (createdPuzzle.errors) {
		console.log({
			msg: `error creating puzzle ${puzKey}`,
			error: JSON.stringify(createdPuzzle.errors, null, 2),
			input: {
				id: puzKey,
				puzJson: JSON.stringify(json),
				puzKey
			}
		});
		return false;
	}

	// Also create in SQL
	try {
		const puzzleData = json as { header?: { title?: string; author?: string } };
		const command = new InvokeCommand({
			FunctionName: env.SQL_QUERIES_FUNCTION_NAME,
			Payload: JSON.stringify({
				query: 'createPuzzle',
				puzzle: {
					id: puzKey,
					puz_json: JSON.stringify(json),
					puz_key: puzKey,
					title: puzzleData.header?.title || null,
					author: puzzleData.header?.author || null
				}
			})
		});
		await lambda.send(command);
	} catch (e) {
		console.log({ msg: 'SQL insert failed (may already exist)', puzKey, error: e });
	}

	return true;
};

const countDynamoRecords = async (): Promise<number> => {
	const puzzles = await client.graphql({
		query: listPuzzles,
		variables: {
			limit: 10000
		}
	});
	return puzzles.data.listPuzzles.items.length;
};
const uploadPuzFile = async (
	filename: string,
	blob: Blob
): Promise<{ key: string; error?: Error }> => {
	try {
		console.log({ uploadPuzFile: true, filename, blob, starting: true });
		const buffer = await blob.arrayBuffer();
		const key = filename;
		const s3Response = await s3.send(
			new PutObjectCommand({
				Bucket: env.SMALL_CROSSWORDS_PUZ_FILE_STORAGE_BUCKET_NAME,
				Key: `internal/${key}`,
				Body: Buffer.from(buffer)
			})
		);
		if (s3Response.$metadata.httpStatusCode !== 200) {
			console.log({
				uploadPuzFile: true,
				filename,
				blob,
				uploadStatusCode: s3Response.$metadata.httpStatusCode
			});
			return {
				key,
				error: new Error(`Status Code from S3 was: ${s3Response.$metadata.httpStatusCode}`)
			};
		}
		console.log({ uploadPuzFile: true, filename, blob, success: true });
		return {
			key
		};
	} catch (error) {
		console.log({ uploadPuzFile: true, filename, blob, failed: true });
		console.log('Error : ', error);
		return {
			key: '',
			error: error as Error
		};
	}
};

const handlerHelper = async (today: Date) => {
	const miniPuzzleFeedUrl = getMiniPuzzleFeedUrl(today);
	console.log({ miniPuzzleFeedUrl, newestPuzzleFeedUrl });
	// const allPromises = [miniPuzzleFeedUrl, newestPuzzleFeedUrl, ...getUserPuzzleFeedUrls()].map(
	const allPromises = [miniPuzzleFeedUrl, newestPuzzleFeedUrl].map(async (puzzleFeedUrl) => {
		const puzzleFeedResult = await fetch(puzzleFeedUrl);
		// Url Formatted like: "https://crosshare.org/crosswords/Mf1l08Ofuj8pmEoV9nyO/jerms-mini-104",
		const puzzleFeedJson = (await puzzleFeedResult.json()) as { items: { url: string }[] };
		console.log({ puzzleFeedJson });
		const puzzleIds = puzzleFeedJson.items.map((item) => {
			const trimmedFront = item.url.substring('https://crosshare.org/crosswords/'.length);
			const trimmedEnd = trimmedFront.substring(0, trimmedFront.indexOf('/'));
			return trimmedEnd;
		});

		console.log({ puzzleIds });
		const puzFileContentsPromises = puzzleIds.map(async (puzzleId) => {
			try {
				const puzFileContents = await fetch(`${puzFileLocationPrefix}/${puzzleId}`);
				const status = puzFileContents.status;
				const blob = await puzFileContents.blob();
				return {
					id: puzzleId,
					status,
					blob
				};
			} catch (e) {
				console.log(`Failed to fetch ${`${puzFileLocationPrefix}/${puzzleId}`}`);
				console.log(e);
				return;
			}
		});
		const puzFileContentsArray = await Promise.all(puzFileContentsPromises);
		console.log({
			puzFileContentsArray
		});
		const uploadPromises = puzFileContentsArray
			.filter((puzFileContents) => puzFileContents?.status === 200)
			.map(async (puzFileContents) => {
				try {
					const uploadStatus = await uploadPuzFile(
						puzFileContents!.id + '.puz',
						puzFileContents!.blob
					);
					console.log({ uploadStatus, blobSize: puzFileContents!.blob.size });
					if (uploadStatus.error) {
						return false;
					}

					const buffer = await puzFileContents!.blob.arrayBuffer();
					return await createDynamoRecord(Buffer.from(buffer), uploadStatus.key);
				} catch (e) {
					console.log(`Failed to upload ${puzFileContents?.id}`);
					console.log(e);
					return false;
				}
			});
		const res = await Promise.all(uploadPromises);
		console.log(`Uploaded ${res.filter((result) => result).length} puzzles`);
		return res.filter((result) => result).length;
	});
	return await Promise.all(allPromises);
};

const dateRange = (startDate: string, endDate: string, steps = 1): Date[] => {
	const dateArray = [] as Date[];
	const currentDate = new Date(startDate);

	while (currentDate <= new Date(endDate)) {
		const dateCopy = new Date(currentDate);
		dateArray.push(dateCopy);
		currentDate.setUTCDate(currentDate.getUTCDate() + steps);
	}

	return dateArray;
};

type BuildPuzzleCollectionEvent = Event & {
	startDate?: string;
	endDate?: string;
};

export const handler = async (event: BuildPuzzleCollectionEvent) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);
	const beforeCount = await countDynamoRecords();
	const today = event.timeStamp ? new Date(event.timeStamp) : new Date();
	const startDate = event.startDate ? new Date(event.startDate) : undefined;
	const endDate = event.endDate ? new Date(event.endDate) : undefined;
	console.log({ today, startDate, endDate, beforeCount });

	let results: number[] = [];
	if (event.startDate && event.endDate) {
		const seedDates = dateRange(event.startDate, event.endDate, 30);
		for (const seedDate of seedDates) {
			const res = await handlerHelper(seedDate);
			results.concat(res);
		}
	} else {
		results = await handlerHelper(today);
	}

	const sleep = (durationMs: number) => new Promise((resolve) => setTimeout(resolve, durationMs));
	await sleep(1000);
	const afterCount = await countDynamoRecords();
	console.log({
		beforeCount,
		afterCount,
		createdPuzzles: results.flat(),
		totalCreatedPuzzleCount: results.flat().reduce((partialSum, a) => partialSum + a, 0)
	});
	return event;
};
