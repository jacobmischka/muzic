/* @flow */

import React, { Component } from 'react';
import { Button, Image, Text, TextInput, View, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import SpotifyClipper from './SpotifyClipper.js';
import UserLibraryList from './UserLibraryList.js';

import postIcon from '../assets/png/plus.png';

import { primaryColor } from '../styles.js';

type Props = {
	screenProps: {
		spotifyToken: ?string,
		songUri: ?string
	}
};

type State = {
	songUri: ?string,
	body: string,
	startTime: number,
	endTime: number
};

export default class CreatePost extends Component<Props, State> {
	static navigationOptions = {
		tabBarLabel: 'Create post',
		tabBarIcon: ({ tintColor }) => (
			<Image source={postIcon}
				style={[styles.icon, {tintColor}]} />
		)
	}

	constructor(props: Props) {
		super(props);

		const { screenProps: { songUri } } = props;

		this.state = {
			songUri,
			body: '',
			startTime: 0,
			endTime: 0
		};
	}

	render() {
		const { screenProps: { spotifyToken } } = this.props;
		const { songUri, body, startTime, endTime } = this.state;

		return songUri && spotifyToken
			? (
				<View>
					<SpotifyClipper spotifyToken={spotifyToken}
						songUri={songUri}
						startTime={startTime}
						endTime={endTime}
						onStartChange={startTime => {
							this.setState({startTime});
						}}
						onEndChange={endTime => {
							this.setState({endTime});
						}} />

					<TextInput value={body}
							onChangeText={body => {
							this.setState({body});
						}} />

					<Button title="Post" color={primaryColor}
						onPress={this.handlePost} />
				</View>
			)
			: spotifyToken
				? (
					<View>
						<UserLibraryList spotifyToken={spotifyToken}
							onSelect={songUri => {
								this.setState({ songUri });
							}} />
					</View>
				)
				: (
					<Text>No token</Text>
				);
	}

	handlePost = () => {
		const { screenProps: { firebaseUser } } = this.props;
		const { songUri, body, startTime, endTime } = this.state;

		const newPostRef = firebase.database().ref('/posts').push();
		newPostRef.set({
			id: newPostRef.key,
			postedBy: firebaseUser.uid,
			songUri,
			body,
			startTime,
			endTime,
			postedAt: new Date()
		}).then(() => {
			this.setState({
				body: null,
				songUri: null,
				startTime: null,
				endTime: null
			});
		});
	}
}

const styles = StyleSheet.create({
	icon: {
		width: 26,
		height: 26
	}
});
