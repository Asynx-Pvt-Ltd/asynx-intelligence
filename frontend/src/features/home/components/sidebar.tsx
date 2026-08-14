'use client';

import Logo from '@/src/components/ui/logo';
import { ThemeToggle } from '@/src/components/ui/themeToggle';
import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { MessageSquarePlus, PanelLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConversationActionsMenu from '../../../components/chat/conversationActionsMenu';
import { getConversations } from '../../chat/lib/chatHistory';
import { Conversation } from '../../chat/types/chatHistory';

interface SidebarProps {
	className?: string;
	style?: React.CSSProperties;
	onNewChat: () => void;
	onOpenSettings?: () => void;
}

type Group = { label: string; chats: Conversation[] };

function groupByDate(chats: Conversation[]): Group[] {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const groups: Group[] = [
		{ label: 'Today', chats: [] },
		{ label: 'Yesterday', chats: [] },
		{ label: 'Last 7 days', chats: [] },
		{ label: 'Older', chats: [] },
	];

	for (const chat of chats) {
		const d = new Date(chat.updated_at || chat.created_at);
		const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());

		if (day >= today) groups[0].chats.push(chat);
		else if (day >= yesterday) groups[1].chats.push(chat);
		else if (day >= sevenDaysAgo) groups[2].chats.push(chat);
		else groups[3].chats.push(chat);
	}

	return groups.filter((g) => g.chats.length > 0);
}

const iconBtn = cn(
	'flex h-8 w-8 items-center justify-center rounded-md cursor-pointer',
	'text-sidebar-foreground/50 hover:text-sidebar-foreground',
	'hover:bg-sidebar-accent transition-colors duration-100',
);

const Sidebar = ({
	className = '',
	style = {},
	onNewChat,
	onOpenSettings,
}: SidebarProps) => {
	const pathname = usePathname();
	const [chats, setChats] = useState<Conversation[]>([]);
	const [search, setSearch] = useState('');
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const conversationsDirty = useChatStore((s) => s.conversationsDirty);
	const isOpen = useChatSidebarStore((state) => state.isOpen);
	const toggle = useChatSidebarStore((state) => state.toggle);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				const convs: Conversation[] = await getConversations();
				setChats(convs);
			} catch {
				/* ignore */
			}
		};
		void fetchConversations();
	}, [conversationsDirty]);

	const filteredChats = chats.filter((c) =>
		c.title?.toLowerCase().includes(search.toLowerCase()),
	);

	const groups = groupByDate(filteredChats);

	return (
		<aside
			className={cn(
				'flex h-screen shrink-0 flex-row bg-sidebar border-r border-sidebar-border',
				'transition-[width] duration-250 ease-spring',
				isOpen ? 'w-[260px]' : 'w-[52px]',
				className,
			)}
			style={style}
		>
			{/* Icon strip */}
			<div className="flex w-[52px] shrink-0 flex-col items-center justify-between py-3 px-1.5">
				<div className="flex flex-col items-center gap-2">
					<Logo
						enableRedirect
						imageStyles="w-6 h-6 object-contain cursor-pointer"
					/>

					<button
						onClick={toggle}
						aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
						aria-expanded={isOpen}
						className={iconBtn}
					>
						<PanelLeft className="h-4 w-4" />
					</button>

					<button
						onClick={onNewChat}
						aria-label="New chat"
						className={iconBtn}
					>
						<MessageSquarePlus className="h-4 w-4" />
					</button>
				</div>

				<div className="flex flex-col items-center gap-1.5 pb-1">

					<div className={iconBtn}>
						<ThemeToggle className="h-8 w-8 rounded-md bg-transparent text-inherit shadow-none hover:bg-transparent" />
					</div>

					<div className={cn(iconBtn, 'rounded-md p-0')}>
						<OrganizationSwitcher
							afterSelectOrganizationUrl="/"
							appearance={{
								elements: {
									rootBox: 'flex h-8 w-8 items-center justify-center',
									organizationSwitcherTrigger:
										'flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border bg-transparent p-0',
									organizationPreview: 'hidden',
									organizationAvatarBox: 'h-4 w-4',
									organizationSwitcherTriggerIcon: 'h-3 w-3 text-sidebar-foreground/60',
								},
							}}
						/>
					</div>

					<div className={cn(iconBtn, 'rounded-md p-0')}>
						<UserButton
							appearance={{
								elements: {
									rootBox: 'flex h-8 w-8 items-center justify-center',
									avatarBox: 'h-6 w-6 rounded-full',
									userButtonTrigger:
										'flex h-8 w-8 items-center justify-center rounded-md',
								},
							}}
						/>
					</div>
				</div>
			</div>

			{/* Expandable panel */}
			<div
				className={cn(
					'flex flex-1 flex-col min-w-0 overflow-hidden',
					'transition-opacity duration-200',
					!isOpen && 'pointer-events-none opacity-0',
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
					<span className="text-[11px] font-medium tracking-wider uppercase text-sidebar-foreground/40">
						Chats
					</span>

					<button
						onClick={onNewChat}
						aria-label="New chat"
						className={cn(
							'flex items-center gap-1.5 rounded-md px-2 py-1 cursor-pointer',
							'text-[11px] font-medium text-primary',
							'hover:bg-primary-subtle transition-colors duration-100',
						)}
					>
						<MessageSquarePlus className="h-3.5 w-3.5" />
						<span>New</span>
					</button>
				</div>

				{/* Search */}
				<div className="px-2 pb-2 shrink-0">
					<div className="relative flex items-center">
						<Search className="absolute left-2.5 h-3 w-3 text-sidebar-foreground/35 pointer-events-none shrink-0" />
						<input
							type="search"
							placeholder="Search…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							aria-label="Search conversations"
							className={cn(
								'w-full h-7 rounded-md pl-7 pr-2 text-[12px]',
								'bg-sidebar-accent border border-sidebar-border',
								'text-sidebar-foreground placeholder:text-sidebar-foreground/30',
								'outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30',
								'transition-colors duration-100',
							)}
						/>
					</div>
				</div>

				{/* Conversation list */}
				<div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
					{groups.length === 0 ? (
						<p className="px-2 py-6 text-[12px] text-sidebar-foreground/30 text-center">
							{search ? 'No results' : 'No conversations yet'}
						</p>
					) : (
						<div className="space-y-3">
							{groups.map((group) => (
								<div key={group.label}>
									<div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/25">
										{group.label}
									</div>

									<div className="space-y-px">
										{group.chats.map((chat, i) => {
											const isActive = pathname === `/chat/${chat.id}`;
											const isLastInGroup = i === group.chats.length - 1;
											const isHovered = hoveredId === chat.id;

											return (
												<Link
													key={chat.id}
													href={`/chat/${chat.id}?model=${chat.model_name}`}
													onMouseEnter={() => setHoveredId(chat.id)}
													onMouseLeave={() =>
														setHoveredId((p) => (p === chat.id ? null : p))
													}
													title={chat.title || 'Untitled Chat'}
													className={cn(
														'relative group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] min-w-0',
														'transition-colors duration-100',
														isActive
															? 'bg-sidebar-accent text-sidebar-foreground font-medium'
															: 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
													)}
												>
													{isActive && (
														<span className="absolute left-0 h-4 w-0.5 rounded-r-full bg-primary" />
													)}
													<span className="line-clamp-1 flex-1 text-left relative">
														{chat.title || 'Untitled Chat'}
													</span>

													<RowMenuWrapper
														chatId={chat.id}
														chatTitle={chat.title || ''}
														isActive={isActive}
														isLastInGroup={isLastInGroup}
														isHovered={isHovered}
													/>
												</Link>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;

const RowMenuWrapper = ({
	chatId,
	chatTitle,
	isActive,
	isLastInGroup,
	isHovered,
}: {
	chatId: string;
	chatTitle: string;
	isActive: boolean;
	isLastInGroup: boolean;
	isHovered: boolean;
}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const shouldShow = isActive || isHovered || menuOpen;

	return (
		<div
			className={cn(
				'shrink-0 w-5 h-5 flex items-center justify-center',
				'opacity-0 transition-opacity duration-100',
				shouldShow && 'opacity-100',
			)}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<ConversationActionsMenu
				conversationId={chatId}
				currentTitle={chatTitle}
				placement={isLastInGroup ? 'top' : 'bottom'}
				className={cn(
					'h-5 w-5 flex items-center justify-center rounded',
					'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-border',
				)}
				onOpenChange={setMenuOpen}
			/>
		</div>
	);
};
