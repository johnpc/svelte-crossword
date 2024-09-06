import { handler } from '../../function/build-puzzle-collection';
import dotenv from 'dotenv';
dotenv.config();

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

const seedDates = dateRange('2024-08-01', '2024-08-30', 30);
// const seedDates = dateRange('2021-01-01', '2021-01-01');

const main = async () => {
	console.log({ seedDates });
	for (const seedDate of seedDates) {
		await handler({ timeStamp: seedDate.getTime() } as Event);
	}
};
main();
