/* @flow */

import React, { Component } from 'react';
import { Slider, Text, View, StyleSheet } from 'react-native';
import SpotifyApi from 'spotify-web-api-js';

import SpotifyPlayer from './SpotifyPlayer.js';

import { logError } from '../errors.js';
import { playbackTimestamp } from '../formatters.js';
import { getIdFromUri } from '../utils.js';

import type { Track } from 'spotify-web-api-js';

type Props = {
	spotifyToken: string,
	songUri: string,

	startTime: number,
	endTime: number,

	onStartChange: ?(number) => void,
	onEndChange: ?(number) => void
};

type State = {
	track: ?Track
};

const spotifyApi = new SpotifyApi();

// FIXME: This is extremely crude

export default class SpotifyClipper extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			track: null
		};
	}

	componentWillMount() {
		const { spotifyToken } = this.props;

		spotifyApi.setAccessToken(spotifyToken);
	}

	componentDidMount() {
		const { songUri } = this.props;

		spotifyApi.getTrack(getIdFromUri(songUri)).then((track: Track) => {
			this.setState({track});
		}).catch(err => {
			// TODO: Handle this somehow
			logError(err);
		});
	}

	render() {
		const {
			spotifyToken,
			songUri,
			startTime,
			endTime,

			onStartChange,
			onEndChange
		} = this.props;
		const { track } = this.state;

		return track
			? (
				<View style={styles.clipper}>
					<SpotifyPlayer spotifyToken={spotifyToken}
						songUri={songUri} />

					<View style={styles.slidersContainer}>
						<View style={styles.sliderContainer}>
							<Text style={styles.sliderLabel}>
								Start time
							</Text>
							<Slider style={styles.slider}
								value={startTime}
								maximumValue={track.duration_ms}
								onValueChange={startTime => {
									if (onStartChange)
										onStartChange(startTime);
								}} />
							<Text>{playbackTimestamp(startTime)}</Text>
						</View>

						<View style={styles.sliderContainer}>
							<Text style={styles.sliderLabel}>
								End time
							</Text>
							<Slider style={styles.slider}
								value={endTime}
								minimumValue={startTime}
								maximumValue={track.duration_ms}
								onValueChange={endTime => {
									if (onEndChange)
										onEndChange(endTime);
								}} />
							<Text>{playbackTimestamp(endTime)}</Text>
						</View>
					</View>
				</View>
			)
			: (
				<Text>Loading...</Text>
			);
	}
}

const styles = StyleSheet.create({
	clipper: {

	},
	slidersContainer: {

	},
	sliderContainer: {
		flexDirection: 'row',
		padding: 5
	},
	slider: {
		flex: 1
	},
	sliderLabel: {
		flexBasis: 100,
		padding: 2,
		fontSize: 20
	}
});
