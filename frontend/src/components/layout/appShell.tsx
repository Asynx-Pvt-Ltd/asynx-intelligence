'use client';

import Navbar from '@/src/features/home/components/navbar';
import Sidebar from '@/src/features/home/components/sidebar';
import { useRouter } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background">
			<Sidebar
				className="shrink-0 transition-[width] duration-300 ease-in-out"
				onNewChat={() => router.push('/')}
			/>

			<div className="flex flex-1 flex-col min-w-0">
				<Navbar className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur" />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
