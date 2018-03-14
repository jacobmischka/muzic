/* @flow */

import React, { Component } from 'react';
import { Text, View, StatusBar, DeviceEventEmitter } from 'react-native';
// $FlowFixMe: I don't feel like dealing with this right now
import { TabNavigator, TabBarBottom } from 'react-navigation';
import firebase from 'react-native-firebase';

import Login from './src/components/Login.js';
import Home from './src/components/Home.js';
import CreatePost from './src/components/CreatePost.js';
import EditUser from './src/components/EditUser.js';

import { primaryColorDark, headerBackgroundColor } from './src/styles.js';
import { logError } from './src/errors.js';

import type { User } from './src/types.js';

const Navigator = TabNavigator({
	Home: {
		screen: Home
	},
	CreatePost: {
		screen: CreatePost
	},
	EditUser: {
		screen: EditUser
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
	firebaseUser?: {
		// FIXME
		uid: string
	},
	user?: User,
	spotifyToken?: string
};

type LoginFailedResponse = {
	error: string
};

export default class App extends Component<{}, State> {
	unsubAuth: ?() => void;
	unsubUser: ?() => void;

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
				this.unsubUser = userRef.on('value', snapshot => {
					this.setState({user: snapshot.val()});
				});
			}
		});

		firebase.auth().signInAnonymously().catch(logError);
	}

	componentWillUnmount() {
		if (this.unsubAuth)
			this.unsubAuth();
		if (this.unsubUser)
			this.unsubUser();
	}

	render() {
		const { spotifyToken, firebaseUser, user } = this.state;

		if (!firebaseUser)
			return (
				<View>
					<Text>Loading...</Text>
				</View>
			);

		return spotifyToken
			? user
				? (
					<View style={{flex: 1, marginTop: StatusBar.currentHeight}}>
						<StatusBar
							translucent={true}
							barStyle="dark-content"
							backgroundColor={headerBackgroundColor} />
						<Navigator screenProps={{spotifyToken, firebaseUser, user}} />
					</View>
				)
				: (
					<EditUser screenProps={{firebaseUser}} />
				)
			: (
				<Login />
			);
	}
}
