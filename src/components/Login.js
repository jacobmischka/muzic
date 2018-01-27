/* @flow */

import React, { Component } from 'react';
import { View, Button, Image, StyleSheet } from 'react-native';

import Spotify from '../native-modules/Spotify.js';

import muzicLogo from '../assets/png/muzic.png';

import { spotifyColor } from '../styles.js';

export default class Login extends Component<{}, {}> {
	render() {
		return (
			<View style={styles.container}>
				<Image width={50}
					height={100}
					source={muzicLogo} />
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
	heading: {
		fontSize: 72
	},
	button: {
		width: '80%'
	}
});
