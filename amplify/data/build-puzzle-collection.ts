import { generateClient } from 'aws-amplify/api';
import { Schema } from './resource';
import { puzToJson } from './helpers/puz-to-json';
import { getUrl, uploadData } from 'aws-amplify/storage';
import { Amplify } from 'aws-amplify';
import config from '../../amplifyconfiguration.json';
import dotenv from 'dotenv';
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>();
const puzzleFeedUrl =
	'https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fdailyminis&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json';
const puzFileLocationPrefix = 'https://crosshare.org/api/puz'; // .puz file available from https://crosshare.org/api/puz/Mf1l08Ofuj8pmEoV9nyO

const createDynamoRecord = async (buffer: Buffer, puzKey: string) => {
	const json = puzToJson(buffer);
	const createdPuzzle = await client.models.Puzzle.create(
		{
			puzJson: JSON.stringify(json),
			puzKey
		},
		{
			authMode: 'iam'
		}
	);

	if (createdPuzzle.errors) {
		console.log({ msg: 'error creating puzzle', error: createdPuzzle.errors });
	}
};

const uploadPuzFile = async (
	filename: string,
	blob: any
): Promise<{ key: string; href: string; error?: Error }> => {
	try {
		const result = await uploadData({
			key: filename,
			data: blob
		}).result;
		const url = await getUrl({
			key: result.key
		});

		return {
			href: url.url.href,
			key: result.key
		};
	} catch (error) {
		console.log('Error : ', error);
		return {
			href: '',
			key: '',
			error: error as Error
		};
	}
};

export const handler = async (event: any) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);

	const puzzleFeedResult = await fetch(puzzleFeedUrl);
	// Url Formatted like: "https://crosshare.org/crosswords/Mf1l08Ofuj8pmEoV9nyO/jerms-mini-104",
	const puzzleFeedJson = (await puzzleFeedResult.json()) as { items: { url: string }[] };
	const puzzleIds = puzzleFeedJson.items.map((item) => {
		const trimmedFront = item.url.substring('https://crosshare.org/crosswords/'.length);
		const trimmedEnd = trimmedFront.substring(0, trimmedFront.indexOf('/'));
		return trimmedEnd;
	});

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
};
