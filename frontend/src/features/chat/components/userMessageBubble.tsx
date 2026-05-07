'use client';

import { UserAvatar } from '@clerk/nextjs';

const UserMessageBubble = () => {
	return (
		<UserAvatar
			appearance={{
				elements: {
					avatarBox: 'w-8 h-8 rounded-full',
				},
			}}
		/>
	);
};

export default UserMessageBubble;
