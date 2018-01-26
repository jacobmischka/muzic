/* @flow */

type ErrorLike = Error | string;

export function logError(err: ?ErrorLike) {
	// FIXME
	if (err) {
		console.error(err);
	}
}
