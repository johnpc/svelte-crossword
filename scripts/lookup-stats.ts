import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';
import config from '../amplify_outputs.json';
import { getAllUserPuzzles } from '../src/routes/helpers/getAllUserPuzzles';
import { getHumanReadableDuration } from '../src/routes/helpers/getHumanReadableDuration';
import { getStreakInfo } from '../src/routes/helpers/getStreakInfo';
import { HydratedProfile } from '../src/routes/helpers/types/types';
Amplify.configure(config);
const client = generateClient<Schema>({
	authMode: 'iam'
});

const selectionSet = ['id', 'email'] as readonly (
	| 'id'
	| 'email'
	| 'userId'
	| 'name'
	| 'completedPuzzles.*'
)[];
const main = async (email: string) => {
	const profiles = await client.models.Profile.list({ selectionSet });
	const fishProfile = profiles.data.find((profile) =>
		profile.email.includes(email)
	) as HydratedProfile;
	const completedPuzzles = await getAllUserPuzzles(fishProfile);
	const streakInfo = await getStreakInfo(fishProfile);
	const averagePuzzleTime = Math.floor(
		completedPuzzles
			.map(({ timeInSeconds }) => timeInSeconds)
			.reduce((acc, cur) => {
				return acc + cur;
			}, 0) / completedPuzzles.length
	);
	const medianPuzzleTime = () => {
		const sorted = [...completedPuzzles].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
		const middleIndex = Math.floor(sorted.length / 2);

		if (sorted.length % 2 === 0) {
			return (sorted[middleIndex - 1].timeInSeconds + sorted[middleIndex].timeInSeconds) / 2;
		} else {
			return sorted[middleIndex].timeInSeconds;
		}
	};

	console.log({
		averagePuzzleTime,
		median: medianPuzzleTime(),
		revealCount: completedPuzzles.filter((puzzle) => puzzle.usedReveal).length,
		totalTime: getHumanReadableDuration(averagePuzzleTime * completedPuzzles.length),
		streakInfo
	});
};

const email = 'test-email@example.com';
main(email);
