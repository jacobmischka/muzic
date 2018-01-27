/* @flow */

import Intl from 'intl';
import 'intl/locale-data/jsonp/en.js';

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

type DateLike = Date | string;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: 'numeric',

});

export function date(date: DateLike) {
	return dateFormatter.format(ensureDate(date));
}

export function dateTime(date: DateLike) {
	return dateTimeFormatter.format(ensureDate(date));
}

function ensureDate(date: DateLike): Date {
	return typeof date === 'string'
		? new Date(date)
		: date;
}
