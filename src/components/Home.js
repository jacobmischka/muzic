/* @flow */

import React, { Component } from 'react';
import { Image, StyleSheet, Linking } from 'react-native';


import Timeline from './Timeline.js';

import homeIcon from '../assets/png/home.png';

import type { NavigationScreenProp } from 'react-navigation';
import type { User } from '../types.js';

type Props = {
	navigation: NavigationScreenProp,
	screenProps: {
		spotifyToken: ?string,
		firebaseUser: User
	}
};

export default class Home extends Component<Props, {}> {
	static navigationOptions = {
		tabBarLabel: 'Home',
		tabBarIcon: ({ tintColor }) => (
			<Image source={homeIcon}
				style={[styles.icon, {tintColor}]} />
		)
	};

	componentDidMount() {
		Linking.addEventListener('url', this.handleReceiveUrl);
	}

	componentWillUnmount() {
		Linking.removeEventListener('url', this.handleReceiveUrl);
	}

	render() {
		const { screenProps: { spotifyToken }} = this.props;

		return (
			<Timeline spotifyToken={spotifyToken} />
		);
	}


	handleReceiveUrl = (event: Event) => {
		console.log(event.url);
	}
}

const styles = StyleSheet.create({
	icon: {
		width: 26,
		height: 26
	}
});
