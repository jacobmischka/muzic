import React, { Component } from 'react';
import { View, TextInput, Button, Image, Text, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import userIcon from '../assets/png/user.png';

import type { User } from '../types.js';

type Props = {
	screenProps: {
		firebaseUser: {
			// FIXME
			uid: string
		},
		user?: User
	}
};

type State = {
	username: string,
	displayName: string,
	avatar: string
};

export default class EditUser extends Component<Props, State> {
	static navigationOptions = {
		tabBarLabel: 'Edit user',
		tabBarIcon: ({ tintColor }) => (
			<Image source={userIcon}
				style={[styles.icon, {tintColor}]} />
		)
	};

	constructor(props) {
		super(props);

		const { screenProps: { user } } = props;

		this.state = {
			username: user && user.username
				? user.username
				: '',
			displayName: user && user.displayName
				? user.displayName
				: '',
			avatar: user && user.avatar
				? user.avatar
				: ''
		};
	}

	render() {
		const { username, displayName, avatar } = this.state;

		return (
			<View>
				<Text>Edit user</Text>

				<TextInput value={username}
					placeholder="Username"
					onChangeText={username => {
						this.setState({username});
					}} />

				<TextInput value={displayName}
					placeholder="Display name"
					onChangeText={displayName => {
						this.setState({displayName});
					}} />

				<TextInput value={avatar}
					placeholder="Avatar"
					onChangeText={avatar => {
						this.setState({avatar});
					}} />

				<Button title="Save"
					onPress={this.handleSubmit} />
			</View>
		);
	}

	handleSubmit = () => {
		const { screenProps: { firebaseUser: { uid } } } = this.props;
		const { username, displayName, avatar } = this.state;

		firebase.database().ref(`/users/${uid}`).set({
			id: uid,
			username,
			displayName,
			avatar
		});
	}
}

const styles = StyleSheet.create({
	icon: {
		width: 26,
		height: 26
	}
});


// userRef.set({
// 	id: firebaseUser.uid,
// 	username: 'muzic_user',
// 	displayName: 'Muzic user',
// 	avatar: `https://api.adorable.io/avatars/100/${firebaseUser.uid}.png`
// });
