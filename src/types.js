/* @flow */

type UserId = string;

export type User = {
	id: UserId,
	username: string,
	displayName: string,
	avatar: string
};

export type Post = {
	id: string,
	postedBy: UserId,
	body: string,
	songUri: string,
	startTime: number,
	endTime: number,
	postedAt: Date
};
