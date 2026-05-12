'use client';

import Logo from '@/src/components/ui/logo';
import { ThemeToggle } from '@/src/components/ui/themeToggle';
import { cn } from '@/src/lib/utils';
import { useChatSidebarStore } from '@/src/stores/chat/chatSidebarStore';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
	MessageSquarePlus,
	PanelLeft,
	Search,
	Settings,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConversationActionsMenu from '../../chat/components/conversationActionsMenu';
import { getConversations } from '../../chat/lib/chatHistory';
import { Conversation } from '../../chat/types/chatHistory';
import { Button } from '@/src/components/ui/button';

const SIDEBAR_ICON_SIZE = 'h-4.5! w-4.5!';
const SIDEBAR_ACTION_ICON_SIZE = 'h-3.5! w-3.5!';
const SIDEBAR_INPUT_ICON_SIZE = 'h-3! w-3!';

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
				const convs = await getConversations();
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
				'flex h-screen shrink-0 flex-row bg-sidebar',
				'transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
				isOpen ? 'w-70' : 'w-16',
				className,
			)}
			style={style}
		>
			<div className="flex w-16 flex-col items-center justify-between bg-sidebar px-2 py-3 border-r border-sidebar-border shrink-0">
				<div className="flex flex-col items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-glow-sm overflow-hidden">
						<Logo imageStyles="w-5 h-5 object-contain" />
					</div>

					<button
						onClick={toggle}
						aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
						aria-expanded={isOpen}
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer',
							'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent',
							'transition-colors duration-150',
						)}
					>
						<PanelLeft className={SIDEBAR_ICON_SIZE} />
					</button>

					<button
						onClick={onNewChat}
						aria-label="New chat"
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer',
							'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent',
							'transition-colors duration-150',
						)}
					>
						<MessageSquarePlus className={SIDEBAR_ICON_SIZE} />
					</button>
				</div>

				<div className="flex flex-col items-center gap-3 pb-1">
					{onOpenSettings && (
						<Button
							onClick={onOpenSettings}
							aria-label="Open settings"
							className={cn(
								'bg-transparent flex h-10 w-10 items-center justify-center rounded-lg',
								'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent',
								'transition-colors duration-150',
							)}
						>
							<Settings className={SIDEBAR_ICON_SIZE} />
						</Button>
					)}

					<ThemeToggle className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent" />

					<OrganizationSwitcher
						afterSelectOrganizationUrl="/"
						appearance={{
							elements: {
								rootBox: 'w-8 h-8',
								organizationSwitcherTrigger:
									'w-8 h-8 rounded-full border border-sidebar-border bg-sidebar-accent flex items-center justify-center',
								organizationPreview: 'hidden',
								organizationAvatarBox: SIDEBAR_ICON_SIZE,
								organizationSwitcherTriggerIcon: SIDEBAR_ICON_SIZE,
							},
						}}
					/>

					<UserButton
						appearance={{
							elements: {
								avatarBox: 'w-8 h-8 rounded-full',
							},
						}}
					/>
				</div>
			</div>

			<div
				className={cn(
					'flex flex-1 flex-col min-w-0 overflow-hidden',
					'transition-opacity duration-200',
					!isOpen && 'pointer-events-none opacity-0',
				)}
			>
				<div className="flex items-center justify-between px-3 pt-4 pb-2 shrink-0">
					<span className="text-xs font-semibold tracking-widest uppercase text-sidebar-foreground/40 pl-1">
						Chats
					</span>

					<button
						onClick={onNewChat}
						aria-label="New chat"
						className={cn(
							'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
							'text-xs font-medium text-primary',
							'bg-primary/10 border border-primary/20',
							'hover:bg-primary/15 hover:shadow-glow-sm',
							'transition-all duration-150',
						)}
					>
						<MessageSquarePlus className={SIDEBAR_ACTION_ICON_SIZE} />
						<span>New chat</span>
					</button>
				</div>

				<div className="relative px-3 pb-3 shrink-0">
					<Search
						className={cn(
							'absolute left-6 top-4 -translate-y-1/2 text-sidebar-foreground/40 pointer-events-none',
							SIDEBAR_INPUT_ICON_SIZE,
						)}
					/>

					<input
						type="search"
						placeholder="Search chats…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						aria-label="Search conversations"
						className={cn(
							'w-full h-8 rounded-lg pl-8 pr-3 text-xs',
							'bg-sidebar-accent border border-sidebar-border',
							'text-sidebar-foreground placeholder:text-sidebar-foreground/35',
							'outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30',
							'transition-colors duration-150',
						)}
					/>
				</div>

				<div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
					{groups.length === 0 ? (
						<p className="px-3 py-4 text-xs text-sidebar-foreground/35 text-center">
							{search ? 'No results found' : 'No conversations yet'}
						</p>
					) : (
						<motion.div
							initial="hidden"
							animate="visible"
							variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
							className="space-y-4"
						>
							{groups.map((group) => (
								<div key={group.label}>
									<div className="mb-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
										{group.label}
									</div>

									<div className="space-y-0.5">
										{group.chats.map((chat, i) => {
											const isActive = pathname === `/chat/${chat.id}`;
											const isLastInGroup = i === group.chats.length - 1;
											const isHovered = hoveredId === chat.id;

											return (
												<motion.div
													key={chat.id}
													variants={{
														hidden: { opacity: 0, x: -6 },
														visible: { opacity: 1, x: 0 },
													}}
													transition={{
														duration: 0.2,
														ease: [0.25, 0.46, 0.45, 0.94],
													}}
												>
													<Link
														href={`/chat/${chat.id}`}
														onMouseEnter={() => setHoveredId(chat.id)}
														onMouseLeave={() =>
															setHoveredId((p) => (p === chat.id ? null : p))
														}
														title={chat.title || 'Untitled Chat'}
														className={cn(
															'group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs min-w-0',
															'transition-colors duration-150',
															isActive
																? 'bg-sidebar-accent text-sidebar-foreground'
																: 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
														)}
													>
														<span className="line-clamp-1 flex-1 text-left">
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
												</motion.div>
											);
										})}
									</div>
								</div>
							))}
						</motion.div>
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
			className="shrink-0 w-6 h-6 flex items-center justify-center"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<motion.div
				initial={false}
				animate={{
					opacity: shouldShow ? 1 : 0,
					x: shouldShow ? 0 : 4,
					pointerEvents: shouldShow ? 'auto' : 'none',
				}}
				transition={{ duration: 0.12 }}
				className="w-6 h-6"
			>
				<ConversationActionsMenu
					conversationId={chatId}
					currentTitle={chatTitle}
					placement={isLastInGroup ? 'top' : 'bottom'}
					className={cn(
						'h-6 w-6 flex items-center justify-center rounded-md',
						'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-border',
					)}
					onOpenChange={setMenuOpen}
				/>
			</motion.div>
		</div>
	);
};
