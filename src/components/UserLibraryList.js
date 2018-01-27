import React, { Component } from 'react';
import {
	View,
	Text,
	Button,
	FlatList,
	StyleSheet
} from 'react-native';

import SpotifyApi from 'spotify-web-api-js';

import SpotifyPlayer from './SpotifyPlayer.js';

import { primaryColor } from '../styles.js';

import type { Track } from 'spotify-web-api-js';

const spotifyApi = new SpotifyApi();

type Props = {
	spotifyToken: string,
	searchLimit: number,
	onSelect: ?(string) => void
};

type State = {
	tracks: Array<Track>,
	refreshing: boolean,
	lastIndex: number
};

export default class UserLibraryList extends Component<Props, State> {
	static defaultProps = {
		searchLimit: 20
	};

	constructor(props) {
		super(props);

		this.state = {
			tracks: [],
			refreshing: false,
			lastIndex: 0
		};
	}

	componentDidMount() {
		const { spotifyToken } = this.props;
		spotifyApi.setAccessToken(spotifyToken);

		this.fetchTracks();
	}

	render() {
		const { spotifyToken, onSelect } = this.props;
		const { tracks, refreshing } = this.state;

		return tracks.length > 0
			? (
				<View style={styles.libraryList}>
					<Text style={styles.heading}>
						My library
					</Text>
					<FlatList data={tracks}
						onEndReached={this.fetchTracks}
						keyExtractor={track => track.id}
						extraData={{spotifyToken, onSelect}}
						renderItem={this.renderTrack}
						refreshing={refreshing}
						onRefresh={() => {
							this.setState({
								tracks: [],
								lastIndex: 0,
								refreshing: true
							}, () => {
								this.fetchTracks().then(() => {
									this.setState({
										refreshing: false
									});
								});
							});
						}}
						/>
				</View>
			)
			: (
				<Text>Loading tracks...</Text>
			);
	}

	renderTrack = ({item: track}: {item: Track}) => {
		const { spotifyToken, onSelect } = this.props;

		return (
			<View style={styles.trackSelector}>
				<SpotifyPlayer spotifyToken={spotifyToken}
					track={track} />
				<Button title="Select song"
					color={primaryColor}
					onPress={() => {
						if (onSelect)
							onSelect(track.uri);
					}} />
			</View>
		);
	}

	fetchTracks = (): Promise => {
		const { searchLimit } = this.props;
		const { lastIndex } = this.state;

		return spotifyApi.getMySavedTracks({
			limit: searchLimit,
			offset: lastIndex
		}).then(response => {
			const tracks = response.items.map(item => item.track);
			this.setState(state => ({
				tracks: state.tracks.concat(tracks),
				lastIndex: state.lastIndex + searchLimit
			}));
		});
	}
}

const styles = StyleSheet.create({
	libraryList: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.03)'
	},
	heading: {
		fontSize: 48,
		marginLeft: 10,
		marginBottom: 20
	},
	trackSelector: {
		alignItems: 'center',
		marginBottom: 50,
		backgroundColor: 'white',
		paddingTop: 20,
		paddingBottom: 20
	},
	selectContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
