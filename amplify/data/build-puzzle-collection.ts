import { generateClient } from 'aws-amplify/api';
import { Schema } from './resource';
import { puzToJson } from './helpers/puz-to-json';
import { getUrl, uploadData } from 'aws-amplify/storage';
import { Amplify } from 'aws-amplify';
import config from '../../src/amplifyconfiguration.json';
// const config = {};
import dotenv from 'dotenv';
import validateClues from '../../src/routes/components/crossword/helpers/validateClues';
import createClues from '../../src/routes/components/crossword/helpers/createClues';

dotenv.config();

Amplify.configure(config);
type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

const client = generateClient<Schema>();
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
const miniPuzzleFeedUrl = `https://rss-bridge.org/bridge01/?action=display&bridge=CssSelectorBridge&home_page=https%3A%2F%2Fcrosshare.org%2Fdailyminis%2F${year}%2F${month}&url_selector=%23__next+%3E+div+%3E+div+%3E+a&url_pattern=&content_selector=&content_cleanup=&title_cleanup=&limit=100&format=Json`;
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
	console.log({ isValid });

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
		console.log({ msg: 'error creating puzzle', error: createdPuzzle.errors });
	}
};

const uploadPuzFile = async (
	filename: string,
	blob: Blob
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

export const handler = async (event: Event) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);
	console.log({ miniPuzzleFeedUrl, newestPuzzleFeedUrl });
	[miniPuzzleFeedUrl, newestPuzzleFeedUrl].map(async (puzzleFeedUrl) => {
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
		return event;
	});
};
