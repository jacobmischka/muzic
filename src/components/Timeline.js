/* @flow */

import React, { Component } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import PostView from './Post.js';

import type { $npm$firebase$database$Reference } from 'firebase';
import type { Post } from '../types.js';

type Props = {
	spotifyToken: string
};

type State = {
	posts: Map<string, Post>,
	refreshingPosts: boolean
};

export default class Timeline extends Component<Props, State> {
	postsRef: ?$npm$firebase$database$Reference;

	constructor(props) {
		super(props);

		this.state = {
			posts: new Map(),
			refreshingPosts: false
		};
	}

	componentDidMount() {
		this.postsRef = firebase.database().ref('/posts');


		const childAddedOrChanged = snapshot => {
			this.setState(({posts}) => {
				posts = new Map(posts.entries());
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
	}

	componentWillUnmount() {
		if (this.postsRef)
			this.postsRef.off();
	}

	refreshPosts = () => {
		if (!this.postsRef)
			return;

		this.setState({
			posts: new Map(),
			refreshingPosts: true
		}, () => {
			this.postsRef.once('value', snapshot => {
				const posts = new Map();

				for (const postSnapshot of snapshot) {
					posts.set(postSnapshot.key, postSnapshot.val());
				}

				this.setState({
					posts,
					refreshingPosts: false
				});
			});
		});
	}

	render() {
		const { spotifyToken } = this.props;
		const { posts, refreshingPosts } = this.state;

		const keys = Array.from(posts.keys());
		const sortedPosts = keys
			.sort((a, b) => {
				if (a > b)
					return -1;
				if (b > a)
					return 1;
				return 0;
			})
			.map(key => posts.get(key));

		return (
			<View style={styles.timeline}>
				<FlatList
					keyExtractor={post => post.id}
					data={sortedPosts}
					extraData={spotifyToken}
					renderItem={({item}) =>
						<PostView spotifyToken={spotifyToken} {...item} />
					}
					refreshing={refreshingPosts}
					onRefresh={this.fetchPosts} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	timeline: {
		backgroundColor: 'rgba(0, 0, 0, 0.03)',
		padding: 10
	}
});
