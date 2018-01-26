/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, Linking } from 'react-native';
import firebase from 'react-native-firebase';

import Timeline from './Timeline.js';

import homeIcon from '../assets/home.svg';

import type { NavigationScreenProp } from 'react-navigation';
import type { $npm$firebase$database$Reference } from 'firebase';
import type { User, Post } from '../types.js';

type Props = {
	navigation: NavigationScreenProp,
	screenProps: {
		spotifyToken: ?string,
		firebaseUser: User
	}
};

type State = {
	posts: Map<string, Post>
};

export default class Home extends Component<Props, State> {
	static navigationOptions = {
		tabBarLabel: 'Home',
		tabBarIcon: ({ tintColor }) => (
			<Image source={homeIcon}
				style={[styles.icon, {tintColor}]} />
		)
	};

	postsRef: ?$npm$firebase$database$Reference;

	constructor(props) {
		super(props);

		this.state = {
			posts: new Map()
		};
	}

	componentDidMount() {
		this.postsRef = firebase.database().ref('/posts');


		this.postsRef.once('value', snapshot => {
			const posts = new Map();

			for (const postSnapshot of snapshot) {
				posts.set(postSnapshot.key, postSnapshot.val());
			}

			this.setState({
				posts
			});
		});

		const childAddedOrChanged = snapshot => {
			this.setState(({posts}) => {
				const oldMap = Array.from(posts.entries());
				console.log('oldMap: ', oldMap);

				posts = new Map(oldMap);
				posts.set(snapshot.key, snapshot.val());
				return { posts };
			});
		};
		this.postsRef.on('child_added', childAddedOrChanged);
		this.postsRef.on('child_changed', childAddedOrChanged);
		this.postsRef.on('child_removed', snapshot => {
			this.setState(({posts}) => {
				posts = new Map(posts.entries());
				posts.delete(snapshot.key);
				return { posts };
			});
		});

		Linking.addEventListener('url', this.handleReceiveUrl);
	}

	componentWillUnmount() {
		if (this.postsRef)
			this.postsRef.off();

		Linking.removeEventListener('url', this.handleReceiveUrl);
	}

	render() {
		const { screenProps: { spotifyToken }} = this.props;
		const { posts } = this.state;

		return posts && posts.size > 0
			? (
				<View>
					<Timeline posts={Array.from(posts.values())} spotifyToken={spotifyToken} />
				</View>
			)
			: (
				<Text>Loading timeline...</Text>
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
