import AppShell from '@/src/components/layout/appShell';
import React from 'react';

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="h-full">
			<AppShell>{children}</AppShell>
		</div>
	);
};

export default WorkspaceLayout;
