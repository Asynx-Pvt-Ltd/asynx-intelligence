import React from 'react';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="min-h-screen flex justify-center items-center">
			{children}
		</div>
	);
};

export default AuthWrapper;
