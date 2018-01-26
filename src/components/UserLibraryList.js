import React, { Component } from 'react';
import { Button, View, Text, FlatList } from 'react-native';

import SpotifyApi from 'spotify-web-api-js';

import SpotifyPlayer from './SpotifyPlayer.js';

import type { Track } from 'spotify-web-api-js';

const spotifyApi = new SpotifyApi();

type Props = {
	spotifyToken: string,
	searchLimit: number,
	onSelect: ?(string) => void
};

type State = {
	tracks: Array<Track>,
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
			lastIndex: 0
		};
	}

	componentDidMount() {
		const { spotifyToken } = this.props;
		spotifyApi.setAccessToken(spotifyToken);

		this.fetchTracks();
	}

	render() {
		const { tracks } = this.state;

		return tracks.length > 0
			? (
				<View>
					<FlatList data={tracks}
						onEndReached={this.fetchTracks}
						keyExtractor={track => track.id}
						renderItem={this.renderTrack}/>
				</View>
			)
			: (
				<Text>Loading tracks...</Text>
			);
	}

	renderTrack = ({item: track}: {item: Track}) => {
		const { spotifyToken, onSelect } = this.props;

		return (
			<View>
				<Button title="Select track"
					onPress={() => {
						if (onSelect)
							onSelect(track.uri);
					}} />
				<SpotifyPlayer spotifyToken={spotifyToken}
					track={track} />
			</View>
		);
	}

	fetchTracks = () => {
		const { searchLimit } = this.props;
		const { lastIndex } = this.state;

		spotifyApi.getMySavedTracks({
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
