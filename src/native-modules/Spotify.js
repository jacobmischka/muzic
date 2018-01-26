import { NativeModules } from 'react-native';

// Wrapper for native mobile spotify players

// Native definitions:

// Android: android/app/src/main/java/com/muzic/react/modules/spotify/SpotifyModule.java
// TODO: iOS
export default NativeModules.Spotify;

export type SpotifyPlaybackEvent =
	| 'kSpPlaybackEventAudioFlush'
	| 'kSpPlaybackNotifyAudioDeliveryDone'
	| 'kSpPlaybackNotifyBecameActive'
	| 'kSpPlaybackNotifyBecameInactive'
	| 'kSpPlaybackNotifyContextChanged'
	| 'kSpPlaybackNotifyLostPermission'
	| 'kSpPlaybackNotifyMetadataChanged'
	| 'kSpPlaybackNotifyNext'
	| 'kSpPlaybackNotifyPause'
	| 'kSpPlaybackNotifyPlay'
	| 'kSpPlaybackNotifyPrev'
	| 'kSpPlaybackNotifyRepeatOff'
	| 'kSpPlaybackNotifyRepeatOn'
	| 'kSpPlaybackNotifyShuffleOff'
	| 'kSpPlaybackNotifyShuffleOn'
	| 'kSpPlaybackNotifyTrackChanged'
	| 'kSpPlaybackNotifyTrackDelivered';

export type PlaybackState = {
	isActiveDevice: boolean,
	isPlaying: boolean,
	isRepeating: boolean,
	isShuffling: boolean,
	positionMs: number
};
