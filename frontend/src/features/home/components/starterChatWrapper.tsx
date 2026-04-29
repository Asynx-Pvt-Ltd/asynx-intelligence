import React from 'react';

const StarterChatWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex justify-center items-center min-h-[80vh]">
			{children}
		</div>
	);
};

export default StarterChatWrapper;
