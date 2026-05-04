'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/src/features/home/components/sidebar';
import Navbar from '@/src/features/home/components/navbar';

const SIDEBAR_WIDTH = '18rem';
const SIDEBAR_COLLAPSED_WIDTH = '4rem';
const NAVBAR_HEIGHT = '4rem';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const isSidebarCollapsed = false;
	const sidebarWidth = isSidebarCollapsed
		? SIDEBAR_COLLAPSED_WIDTH
		: SIDEBAR_WIDTH;

	return (
		<div className="h-screen flex flex-col bg-background">
			<Sidebar
				className="fixed left-0 top-0 z-40 h-screen border-r bg-background"
				style={{ width: sidebarWidth }}
				onNewChat={() => router.push('/')}
			/>

			<Navbar
				className="fixed top-0 right-0 z-30 border-b bg-background/95 backdrop-blur"
				style={{
					left: sidebarWidth,
					height: NAVBAR_HEIGHT,
				}}
			/>

			<main
				className="flex-1 min-h-0 overflow-y-auto"
				style={{
					marginLeft: sidebarWidth,
					marginTop: NAVBAR_HEIGHT,
				}}
			>
				{children}
			</main>
		</div>
	);
}
