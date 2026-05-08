'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Sidebar from '@/src/features/home/components/sidebar';
import HomeNavbar from '@/src/features/home/components/homeNavbar';
import ChatNavbar from '@/src/features/chat/components/chatNavbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const isChatRoute =
		pathname?.startsWith('/chat') || pathname?.includes('/chat/');

	let chatId: string | null = null;
	if (isChatRoute && pathname) {
		const pathSegments = pathname.split('/');
		const chatIndex = pathSegments.findIndex((segment) => segment === 'chat');
		if (chatIndex !== -1 && chatIndex + 1 < pathSegments.length) {
			chatId = pathSegments[chatIndex + 1];
		}
	}

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background">
			<Sidebar
				className="shrink-0 transition-[width] duration-300 ease-in-out"
				onNewChat={() => router.push('/')}
			/>

			<div className="flex flex-1 flex-col min-w-0">
				{isChatRoute && chatId ? (
					<ChatNavbar
						chatId={chatId}
						className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b"
					/>
				) : (
					<HomeNavbar className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b" />
				)}
				<main className="flex-1 overflow-hidden">{children}</main>
			</div>
		</div>
	);
}
