/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import Poster from './Poster.js';
import SpotifyPlayer from './SpotifyPlayer.js';

import { formatDate } from '../utils.js';

import type { User, Post } from '../types.js';

type Props = Post & {
	spotifyToken: string
};
type State = {
	poster: User
};

export default class PostView extends Component<Props, State> {
	constructor(props) {
		super(props);

		this.state = {
			poster: null
		};
	}

	componentDidMount() {
		const { postedBy } = this.props;

		firebase.database().ref(`/users/${postedBy}`).on('value', snapshot => {
			this.setState({
				poster: snapshot.val()
			});
		});
	}

	render() {
		const {
			spotifyToken,
			body,
			songUri,
			postedAt,
			startTime,
			endTime
		} = this.props;
		const { poster } = this.state;
		return (
			<View style={styles.post}>
				{
					poster
						? (
							<Poster {...poster} />
						)
						: (
							<Text>Loading user...</Text>
						)
				}
				<Text style={styles.body}>
					{body}
				</Text>
				<SpotifyPlayer spotifyToken={spotifyToken}
					songUri={songUri}
					startTime={startTime}
					endTime={endTime} />
				<Text style={styles.postedAt}>
					{formatDate(postedAt)}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	post: {
		display: 'flex'
	},
	body: {
		padding: 50,
		fontSize: 18
	},
	postedAt: {
		margin: 5,
		color: 'rgba(0, 0, 0, 0.65)',
		textAlign: 'right'
	}
});
