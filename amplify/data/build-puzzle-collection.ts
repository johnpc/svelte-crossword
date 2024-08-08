import { generateClient } from 'aws-amplify/api';
import { Schema } from './resource';
import { puzToJson } from './helpers/puz-to-json';
import { Amplify } from 'aws-amplify';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../../src/amplify_outputs.json';
// const config = {};
import dotenv from 'dotenv';
import validateClues from '../../src/routes/components/crossword/helpers/validateClues';
import createClues from '../../src/routes/components/crossword/helpers/createClues';

dotenv.config();
const s3 = new S3Client();
Amplify.configure(config);
type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

const client = generateClient<Schema>({
	authMode: 'lambda',
	authToken: process.env.ADMIN_API_KEY
});
const getMiniPuzzleFeedUrl = (today) => {
	const year = today.getFullYear();
	const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
	return `https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fdailyminis%2F${year}%2F${month}&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`;
};
const newestPuzzleFeedUrl =
	'https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fnewest%2F1&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json';
const puzFileLocationPrefix = 'https://crosshare.org/api/puz'; // .puz file available from https://crosshare.org/api/puz/Mf1l08Ofuj8pmEoV9nyO
const createDynamoRecord = async (buffer: Buffer, puzKey: string) => {
	const json = puzToJson(buffer);
	const across = Object.values(json.clues.across) as Clue[];
	const down = Object.values(json.clues.down) as Clue[];
	const clues = [...across, ...down];
	const isValid = validateClues(createClues(clues));
	if (!isValid) {
		return;
	}
	console.log({ isValid, puzKey });

	const createdPuzzle = await client.models.Puzzle.create(
		{
			id: puzKey,
			puzJson: JSON.stringify(json),
			puzKey
		},
		{
			authMode: 'iam'
		}
	);

	if (createdPuzzle.errors) {
		console.log({
			msg: 'error creating puzzle',
			error: JSON.stringify(createdPuzzle.errors, null, 2),
			input: {
				id: puzKey,
				puzJson: JSON.stringify(json),
				puzKey
			}
		});
	}
};

const uploadPuzFile = async (
	filename: string,
	blob: Blob
): Promise<{ key: string; error?: Error }> => {
	try {
		const buffer = await blob.arrayBuffer();
		const key = filename;
		const s3Response = await s3.send(
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME,
				Key: key,
				Body: Buffer.from(buffer)
			})
		);
		console.log({ uploadStatusCode: s3Response.$metadata.httpStatusCode });
		return {
			key
		};
	} catch (error) {
		console.log('Error : ', error);
		return {
			key: '',
			error: error as Error
		};
	}
};

export const handler = async (event: Event) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);
	const miniPuzzleFeedUrl = getMiniPuzzleFeedUrl(
		event.timeStamp ? new Date(event.timeStamp) : new Date()
	);
	console.log({ miniPuzzleFeedUrl, newestPuzzleFeedUrl });
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
			const puzFileContents = await fetch(`${puzFileLocationPrefix}/${puzzleId}`);
			const status = puzFileContents.status;
			const blob = await puzFileContents.blob();
			return {
				id: puzzleId,
				status,
				blob
			};
		});
		const puzFileContentsArray = await Promise.all(puzFileContentsPromises);
		const uploadPromises = puzFileContentsArray
			.filter((puzFileContents) => puzFileContents.status === 200)
			.map(async (puzFileContents) => {
				const uploadStatus = await uploadPuzFile(puzFileContents.id + '.puz', puzFileContents.blob);
				console.log({ uploadStatus, blobSize: puzFileContents.blob.size });

				const buffer = await puzFileContents.blob.arrayBuffer();
				await createDynamoRecord(Buffer.from(buffer), uploadStatus.key);
			});
		await Promise.all(uploadPromises);
		console.log(`Uploaded ${uploadPromises.length} puzzles`);
	});
	await Promise.all(allPromises);
	return event;
};
