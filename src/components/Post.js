/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import Poster from './Poster.js';
import SpotifyPlayer from './SpotifyPlayer.js';

import { dateTime } from '../formatters.js';

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
					{dateTime(postedAt)}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	post: {
		display: 'flex',
		marginBottom: 50,
		padding: 5,
		backgroundColor: 'white'
	},
	body: {
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 50,
		paddingRight: 10,
		fontSize: 18,
		color: 'rgba(0, 0, 0, 0.75)'
	},
	postedAt: {
		margin: 5,
		color: 'rgba(0, 0, 0, 0.5)',
		textAlign: 'right'
	}
});
