// flow-typed signature: bcb470fb63dd653c0c8056a45db9e902
// flow-typed version: <<STUB>>/spotify-web-api-js_v^0.23.0/flow_v0.62.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'spotify-web-api-js'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

export type Album = Object; // TODO
export type Artist = Object; // TODO
export type SpotifyType = 'track'; // TODO

export type Track = {
	duration_ms: number,
	explicit: boolean,
	href: string,
	id: string,
	name: string,
	popularity: number,
	preview_url: string,
	track_number: number,
	type: SpotifyType,
	uri: string
};

declare module 'spotify-web-api-js' {
  declare module.exports: any;
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */
declare module 'spotify-web-api-js/src/spotify-web-api' {
  declare module.exports: any;
}

// Filename aliases
declare module 'spotify-web-api-js/src/spotify-web-api.js' {
  declare module.exports: $Exports<'spotify-web-api-js/src/spotify-web-api'>;
}
