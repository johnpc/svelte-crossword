export const getHumanReadableDate = (date: Date): string => {
	const timeSuffix = date.getHours() < 12 ? 'am' : 'pm';
	const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	return `${date.toDateString()} at ${hours}:${minutes}${timeSuffix}`;
};
