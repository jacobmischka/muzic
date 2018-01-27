/* @flow */

import delve from 'dlv';

import type { Track, Image } from 'spotify-web-api-js';

export function getIdFromUri(uri: string): string {
	const pieces = uri.split(':');
	return pieces[pieces.length - 1];
}

export function getImageForTrack(track: Track, targetSize: number): ?Image {
	const images = delve(track, 'album.images');
	if (images && Array.isArray(images)) {
		return images.reduce((acc, item) => {
			if (!acc)
				return item;

			return (
				Math.abs(targetSize - item.width) < Math.abs(targetSize - acc.width)
				&& item.width > targetSize
			)
				? item
				: acc;
		}, null);
	}
}
