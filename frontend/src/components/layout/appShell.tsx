'use client';

import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ChatNavbar from '@/src/features/chat/components/chatNavbar';
import HomeNavbar from '@/src/features/home/components/homeNavbar';
import Sidebar from '@/src/features/home/components/sidebar';
import SettingsDrawer from '@/src/components/chat/SettingsDrawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const [settingsOpen, setSettingsOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const isOpen = useChatSidebarStore((s) => s.isOpen);

	const isChatRoute =
		pathname?.startsWith('/chat') || pathname?.includes('/chat/');

	let chatId: string | null = null;
	if (isChatRoute && pathname) {
		const segs = pathname.split('/');
		const idx = segs.findIndex((s) => s === 'chat');
		if (idx !== -1 && idx + 1 < segs.length) chatId = segs[idx + 1];
	}

	/* Global keyboard shortcuts */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const isMac = navigator.platform.includes('Mac');
			const modKey = isMac ? e.metaKey : e.ctrlKey;
			if (modKey && e.key === '/') {
				e.preventDefault();
				setSettingsOpen((v) => !v);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	return (
		<div className="flex h-screen w-full overflow-hidden bg-sidebar">
			{/* Sidebar column */}
			<Sidebar
				className="shrink-0 z-20"
				onNewChat={() => router.push('/')}
				onOpenSettings={() => setSettingsOpen(true)}
			/>

			{/* Main content panel */}
			<div
				className={cn(
					'relative flex flex-1 flex-col min-w-0 overflow-hidden',
					'bg-background',
					'transition-[border-radius] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
					isOpen
						? 'rounded-tl-2xl rounded-bl-2xl'
						: 'rounded-tl-none rounded-bl-none',
				)}
			>
				{/* Inset ring for depth illusion */}
				{isOpen && (
					<div
						className="pointer-events-none absolute inset-0 rounded-tl-2xl rounded-bl-2xl ring-1 ring-inset ring-white/[0.04] z-10"
						aria-hidden
					/>
				)}

				{/* Header */}
				{isChatRoute && chatId ? (
					<ChatNavbar chatId={chatId} className="sticky top-0 z-30" />
				) : (
					<HomeNavbar className="sticky top-0 z-30" />
				)}

				{/* Page content */}
				<main className="flex-1 overflow-hidden bg-chat-screen">
					{children}
				</main>
			</div>

			{/* Global settings drawer */}
			<SettingsDrawer
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
		</div>
	);
}
