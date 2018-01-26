/* @flow */

export function playbackTimestamp(timeInMs: number): string {
	// Currently assumes songs will be less than one hour.
	let minutes = Math.floor(timeInMs / (1000 * 60));
	let seconds = Math.floor((timeInMs / 1000) % 60);

	if (minutes < 10)
		minutes = `0${minutes}`;

	if (seconds < 10)
		seconds = `0${seconds}`;

	return `${minutes}:${seconds}`;
}
