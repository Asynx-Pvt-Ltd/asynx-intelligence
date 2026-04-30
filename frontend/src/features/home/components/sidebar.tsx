'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, PanelLeft, PenSquare } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
	className?: string;
	style?: {};
	onNewChat: () => void;
}

const demoChats = [
	{ id: '1', title: 'How to learn system design' },
	{ id: '2', title: 'Build NestJS auth with Clerk' },
	{ id: '3', title: 'PostgreSQL docker setup' },
	{ id: '4', title: 'AI chatbot architecture' },
];

const Sidebar = ({ className = '', style = {}, onNewChat }: SidebarProps) => {
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				'flex h-screen w-72 flex-col border-r bg-background',
				className,
			)}
			style={style}
		>
			<div className="flex h-16 items-center gap-2 border-b px-3">
				<Button variant="ghost" size="icon">
					<PanelLeft className="h-5 w-5" />
				</Button>

				<Button onClick={onNewChat} className="flex-1 justify-start rounded-xl">
					<PenSquare className="mr-2 h-4 w-4" />
					New Chat
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto p-2">
				<div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
					Recent
				</div>

				<div className="space-y-1">
					{demoChats.map((chat) => {
						const isActive = pathname === `/chat/${chat.id}`;

						return (
							<Link
								key={chat.id}
								href={`/chat/${chat.id}`}
								className={cn(
									'flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
									isActive
										? 'bg-muted text-foreground'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground',
								)}
							>
								<MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
								<span className="line-clamp-2">{chat.title}</span>
							</Link>
						);
					})}
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
