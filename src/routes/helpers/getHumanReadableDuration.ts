export const getHumanReadableDuration = (durationSeconds: number): string => {
	const units = ['d', 'h', 'm', 's'];
	const secondsToMinutes = 60;
	const secondsToHours = secondsToMinutes * 60;
	const secondsToDays = secondsToHours * 24;
	const days = Math.floor(durationSeconds / secondsToDays);
	const hours = Math.floor((durationSeconds % secondsToDays) / secondsToHours);
	const minutes = Math.floor((durationSeconds % secondsToHours) / secondsToMinutes);
	const seconds = Math.floor(durationSeconds % secondsToMinutes);
	return [days, hours, minutes, seconds]
		.map((number, index) => (number ? `${number}${units[index]}` : ''))
		.join(' ');
};
