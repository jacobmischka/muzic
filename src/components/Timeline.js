/* @flow */

import React, { Component } from 'react';
import { View, FlatList } from 'react-native';

import PostView from './Post.js';

import type { Post } from '../types.js';

type Props = {
	spotifyToken: string,
	posts: Array<Post>
};

export default class Timeline extends Component<Props, {}> {
	render() {
		const { posts, spotifyToken } = this.props;
		return (
			<View>
				<FlatList
					keyExtractor={post => post.id}
					data={posts}
					renderItem={({item}) =>
						<PostView spotifyToken={spotifyToken} {...item} />
					} />
			</View>
		);
	}
}
