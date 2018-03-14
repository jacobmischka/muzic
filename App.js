/* @flow */

import React, { Component } from 'react';
import { Text, View, StatusBar, DeviceEventEmitter } from 'react-native';
// $FlowFixMe: I don't feel like dealing with this right now
import { TabNavigator, TabBarBottom } from 'react-navigation';
import firebase from 'react-native-firebase';

import Login from './src/components/Login.js';
import Home from './src/components/Home.js';
import CreatePost from './src/components/CreatePost.js';

import { primaryColorDark, headerBackgroundColor } from './src/styles.js';
import { logError } from './src/errors.js';

import type { User } from './src/types.js';

const Navigator = TabNavigator({
	Home: {
		screen: Home
	},
	CreatePost: {
		screen: CreatePost
	}
}, {
	tabBarComponent: TabBarBottom,
	tabBarPosition: 'bottom',
	swipeEnabled: false,
	navigationOptions: {
		title: 'Muzic',
		headerMode: 'float',
		headerStyle: {
			backgroundColor: headerBackgroundColor,
			marginTop: StatusBar.currentHeight
		}
	},
	tabBarOptions: {
		activeTintColor: primaryColorDark
	}
});

type State = {
	loggedInSpotify: boolean,
	firebaseUser: User,
	spotifyToken: string
};

type LoginFailedResponse = {
	error: string
};

export default class App extends Component<{}, State> {
	unsubAuth: ?() => void;

	constructor(props) {
		super(props);

		this.state = {
			loggedInSpotify: false
		};
	}

	componentDidMount() {
		DeviceEventEmitter.addListener('loggedIn', () => {
			this.setState({loggedInSpotify: true});
		});

		DeviceEventEmitter.addListener(
			'receivedToken',
			({token}: {token: string}) => {
				this.setState({spotifyToken: token});
			}
		);

		DeviceEventEmitter.addListener('loggedOut', () => {
			this.setState({loggedInSpotify: false});
		});

		DeviceEventEmitter.addListener('loginFailed', ({error}: LoginFailedResponse) => {
			console.error('loginFailed', error);
		});

		this.unsubAuth = firebase.auth().onAuthStateChanged((firebaseUser: User) => {
			this.setState({firebaseUser});
			if (firebaseUser) {
				const userRef = firebase.database().ref(`/users/${firebaseUser.uid}`);
				userRef.set({
					id: firebaseUser.uid,
					username: 'muzic_user',
					displayName: 'Muzic user',
					avatar: `https://api.adorable.io/avatars/100/${firebaseUser.uid}.png`
				});
			}
			// userRef.on('value', snapshot => {
			// 	if (!snapshot.val()) {
			// 	}
			// });
		});

		firebase.auth().signInAnonymously().catch(logError);
	}

	componentWillUnmount() {
		if (this.unsubAuth)
			this.unsubAuth();
	}

	render() {
		const {spotifyToken, firebaseUser } = this.state;

		if (!firebaseUser)
			return (
				<View>
					<Text>Loading...</Text>
				</View>
			);

		return spotifyToken
		? (
			<View style={{flex: 1, marginTop: StatusBar.currentHeight}}>
				<StatusBar
					translucent={true}
					barStyle="dark-content"
					backgroundColor={headerBackgroundColor} />
				<Navigator screenProps={{spotifyToken, firebaseUser}} />
			</View>
		)
		: (
			<Login />
		);
	}
}
