/* @flow */

import React, { Component } from 'react';
import { View, Button } from 'react-native';

import Spotify from '../native-modules/Spotify.js';

export default class Login extends Component<{}, {}> {
	render() {
		return (
			<View>
				<Button title="Log in with Spotify"
					onPress={this.handleLoginClick} />
			</View>
		);
	}

	handleLoginClick = () => {
		Spotify.authenticate();
	}
}
