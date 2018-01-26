/* @flow */

import React, { Component } from 'react';
import {
	View,
	Text,
	Button,
	Image
} from 'react-native';
import SpotifyApi from 'spotify-web-api-js';

import SpotifyModule from '../native-modules/Spotify.js';
import plusCircleImage from '../assets/plus-circle.svg';

import { logError } from '../errors.js';
import { playbackTimestamp } from '../formatters.js';
import { getIdFromUri, getImageForTrack } from '../utils.js';

import type { Track } from 'spotify-web-api-js';
import type { PlaybackState } from '../native-modules/Spotify.js';

type Props = {
	spotifyToken: string,
	songUri: ?string,
	track: ?Track,

	intervalTime: number,
	startTime: number,
	endTime: ?number
};

type State = {
	track: ?Track,
	currentTime: ?number,
	started: boolean,
	playing: boolean
};

const spotifyApi = new SpotifyApi();

export default class SpotifyPlayer extends Component<Props, State> {
	timeInterval: number;

	static defaultProps = {
		startTime: 0,
		intervalTime: 500
	};

	constructor(props) {
		super(props);

		const { track } = props;

		this.state = {
			track,
			currentTime: null,
			started: false,
			playing: false
		};
	}

	getClipLength = (): number => {
		const { startTime, endTime } = this.props;
		const { track } = this.state;

		if (endTime || track) {
			const clipEnd = endTime
				? endTime
				: track.duration_ms;
			return clipEnd - startTime;
		}

		return 0;
	}

	componentWillMount() {
		const { spotifyToken } = this.props;

		spotifyApi.setAccessToken(spotifyToken);

		// DeviceEventEmitter.addListener(
		// 	'playbackEvent',
		// 	({playbackEvent}: {playbackEvent: SpotifyPlaybackEvent}) => {
		// 		switch (playbackEvent) {
		// 			case 'kSpPlaybackNotifyPause':
		// 				this.setState({playing: false});
		// 				this.removePlayingTimeInterval();
		// 				break;
		// 			case 'kSpPlaybackNotifyPlay':
		// 				this.setState({playing: true});
		// 				this.addPlayingTimeInterval();
		// 				break;
		// 		}
		// 	}
		// );
	}

	componentDidMount() {
		const { songUri } = this.props;
		const { track } = this.state;

		if (!track && songUri) {
			spotifyApi.getTrack(getIdFromUri(songUri)).then((track: Track) => {
				this.setState({track});
			}).catch(err => {
				// TODO: Handle this somehow
				logError(err);
			});
		}
	}

	render() {
		const { track, playing, currentTime } = this.state;

		const image = getImageForTrack(track);
		const imageSrc = image && image.url
			? {uri: image.url}
			: plusCircleImage;

		return track
			? (
				<View>
					<Text>{track.name}</Text>
					<Image style={{width: 100, height: 100}}
						source={imageSrc} />
					<Text>
						{playbackTimestamp(currentTime)}
						{' / '}
						{playbackTimestamp(this.getClipLength())}
					</Text>
					<Button title={playing ? 'Pause' : 'Play'}
						onPress={this.handleTogglePlay} />
				</View>
			)
			: (
				<Text>Loading...</Text>
			);
	}

	play = () => {
		const { started } = this.state;

		if (started) {
			SpotifyModule.resume(err => {
				if (err) {
					logError(err);
					return;
				}

				this.setState({playing: true});
				this.addPlayingTimeInterval();
			});
		} else {
			const { startTime } = this.props;
			const { track } = this.state;
			const index = 0; // FIXME: ?
			SpotifyModule.playUri(track.uri, index, startTime, err => {
				if (err) {
					logError(err);
					return;
				}

				this.setState({
					started: true,
					playing: true,
					currentTime: 0
				});
				this.addPlayingTimeInterval();
			});
		}
	}

	pause = () => {
		SpotifyModule.pause(err => {
			if (err) {
				logError(err);
				return;
			}

			this.setState({playing: false});
			this.removePlayingTimeInterval();
		});
	}

	stop = () => {
		SpotifyModule.pause(err => {
			if (err) {
				logError(err);
				return;
			}

			this.setState({
				started: false,
				playing: false,
				currentTime: null
			});

			this.removePlayingTimeInterval();
		});
	}

	syncPlaybackState = () => {
		// TODO: Call this occasionally and sync
		SpotifyModule.getPlaybackState((playbackState: PlaybackState, err) => {
			if (err) {
				logError(err);
				return;
			}

			if (this.state.playing !== playbackState.isPlaying) {
				if (playbackState.isPlaying) {
					this.addPlayingTimeInterval();
				} else {
					this.removePlayingTimeInterval();
				}
			}

			this.setState({
				playing: playbackState.isPlaying,
				currentTime: playbackState.positionMs
			});
		});
	}

	removePlayingTimeInterval = () => {
		if (this.timeInterval)
			clearInterval(this.timeInterval);
	}

	addPlayingTimeInterval = () => {
		this.removePlayingTimeInterval();

		const { intervalTime } = this.props;
		const clipLength = this.getClipLength();

		this.timeInterval = setInterval(() => {
			this.setState(({currentTime}) => {

				currentTime += intervalTime;

				if (clipLength) {
					if (currentTime >= clipLength) {
						this.stop();
					}
				}

				return {
					currentTime
				};
			});
		}, intervalTime);

	}

	handleTogglePlay = () => {
		const { playing } = this.state;

		if (playing) {
			this.stop();
		} else {
			this.play();
		}
	}
}
