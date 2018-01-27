/* @flow */

import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	Slider,
	StyleSheet
} from 'react-native';
import SpotifyApi from 'spotify-web-api-js';

import SpotifyModule from '../native-modules/Spotify.js';
import placeholderArt from '../assets/png/bookmark.png';
import playImage from '../assets/png/play.png';
import pauseImage from '../assets/png/pause.png';

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

	getClipEnd = (): ?number => {
		const { endTime } = this.props;
		const { track } = this.state;

		return endTime
			? endTime
			: track
				? track.duration_ms
				: undefined;
	}

	getClipLength = (): number => {
		const { startTime } = this.props;

		const clipEnd = this.getClipEnd();

		if (clipEnd)
			return clipEnd - startTime;

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

	componentWillUnmount() {
		const { playing } = this.state;

		if (playing) {
			SpotifyModule.pause(null);
		}
	}

	render() {
		const { track, playing, currentTime } = this.state;

		const artSize = 100;
		const image = getImageForTrack(track, artSize);
		const imageSrc = image && image.url
			? {uri: image.url}
			: placeholderArt;

		const clipLength = this.getClipLength();

		return track
			? (
				<View style={styles.player}>
					<View style={styles.artContainer}>
						<Image style={{width: artSize, height: artSize}}
							source={imageSrc} />
					</View>
					<View style={styles.detailsContainer}>
						<Text>{track.name}</Text>
						<View style={styles.controlsContainer}>
							<TouchableOpacity onPress={this.handleTogglePlay}>
								<Image height={24} width={24}
									source={playing ? pauseImage : playImage} />
							</TouchableOpacity>
							<Slider style={styles.slider}
								value={currentTime}
								maximumValue={clipLength}
								onSlidingComplete={this.handleSeek} />
						</View>
						<View style={styles.timestampContainer}>
							<Text>
								{playbackTimestamp(currentTime)}
								{' / '}
								{playbackTimestamp(clipLength)}
							</Text>
						</View>
					</View>
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

	handleSeek = (position: number) => {
		const { track, started } = this.state;
		const index = 0; // FIXME: ?

		if (started) {
			SpotifyModule.seekToPosition(position, err => {
				if (err) {
					logError(err);
					return;
				}

				this.setState({
					currentTime: position
				}, this.addPlayingTimeInterval);
			});
		} else {
			SpotifyModule.playUri(track.uri, index, position, err => {
				if (err) {
					logError(err);
					return;
				}

				this.setState({
					started: true,
					playing: true,
					currentTime: position
				}, this.addPlayingTimeInterval);
			});
		}
	}
}

const styles = StyleSheet.create({
	player: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		paddingLeft: 20,
		paddingRight: 20
	},
	artContainer: {
		flex: 0,
		margin: 10
	},
	detailsContainer: {
		flex: 1,
		margin: 10
	},
	controlsContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	slider: {
		flex: 1
	},
	timestampContainer: {
		alignItems: 'center'
	}
});
