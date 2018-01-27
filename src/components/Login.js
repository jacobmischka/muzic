/* @flow */

import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';

import Spotify from '../native-modules/Spotify.js';

import { spotifyColor } from '../styles.js';

export default class Login extends Component<{}, {}> {
	render() {
		return (
			<View style={styles.container}>
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
		justifyContent: 'center',
		alignItems: 'center'
	},
	button: {
		width: '80%'
	}
});
