export const getHumanReadableDate = (date: Date): string => {
	const timeSuffix = date.getHours() < 12 ? 'am' : 'pm';
	const hours = date.getHours() % 12 || 12;
	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	return `${date.toDateString()} at ${hours}:${minutes}${timeSuffix}`;
};
