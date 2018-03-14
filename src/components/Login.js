/* @flow */

import React, { Component } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

import Spotify from '../native-modules/Spotify.js';

import { spotifyColor, primaryColor } from '../styles.js';

export default class Login extends Component<{}, {}> {
	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.heading}>MUZIC</Text>
				<Button title="Log in with Spotify"
					style={styles.button}
					color={spotifyColor}
					onPress={this.handleLoginClick} />
			</View>
		);
	}

	handleLoginClick = () => {
		Spotify.authenticate();
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	headingContainer: {
		backgroundColor: 'black'
	},
	heading: {
		fontSize: 72,
		color: primaryColor
	},
	button: {
		width: '80%'
	}
});
