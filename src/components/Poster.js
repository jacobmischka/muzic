/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import { primaryColor } from '../styles.js';

import type { User } from '../types.js';

type Props = User;

export default class Poster extends Component<Props, {}> {
	render() {
		const { avatar, displayName } = this.props;
		return (
			<View style={styles.poster}>
				<Image
					style={styles.avatar}
					source={{uri: avatar}} />
				<Text style={styles.displayName}>
					{displayName}
				</Text>
			</View>
		);
	}
}

const avatarSize = 40;

const styles = StyleSheet.create({
	poster: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	avatar: {
		margin: 5,
		width: avatarSize,
		height: avatarSize,
		borderRadius: avatarSize,
		borderWidth: 2,
		borderColor: primaryColor
	},
	displayName: {
		margin: 5,
		fontSize: 18
	}
});