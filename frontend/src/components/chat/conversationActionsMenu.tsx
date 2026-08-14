'use client';

import { useState } from 'react';
import {
	MoreVertical,
	Pencil,
	Trash2,
	Loader2,
	MessageSquareText,
	AlertTriangle,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
} from '@/src/components/ui/alert-dialog';
import { Input } from '@/src/components/ui/input';
import {
	updateConversation,
	deleteConversation,
} from '../../features/chat/lib/chatHistory';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { cn } from '@/src/lib/utils';

interface ConversationActionsMenuProps {
	conversationId: string;
	currentTitle?: string;
	onTitleUpdated?: (newTitle: string) => void;
	onDeleted?: () => void;
	className?: string;
	placement?: 'top' | 'bottom';
	onOpenChange?: (open: boolean) => void;
}

export default function ConversationActionsMenu({
	conversationId,
	currentTitle = '',
	onTitleUpdated,
	onDeleted,
	className,
	placement = 'bottom',
	onOpenChange,
}: ConversationActionsMenuProps) {
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [newTitle, setNewTitle] = useState(currentTitle);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const bumpConversationsDirty = useChatStore((s) => s.bumpConversationsDirty);

	const handleRenameClick = () => {
		setNewTitle(currentTitle);
		setError(null);
		setIsRenameDialogOpen(true);
	};

	const handleDeleteClick = () => {
		setError(null);
		setIsDeleteDialogOpen(true);
	};

	const handleRenameSubmit = async () => {
		if (!newTitle.trim()) {
			setError('Title cannot be empty');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await updateConversation(conversationId, { title: newTitle.trim() });
			onTitleUpdated?.(newTitle.trim());
			setIsRenameDialogOpen(false);
			bumpConversationsDirty();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to rename conversation',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await deleteConversation(conversationId);
			onDeleted?.();
			setIsDeleteDialogOpen(false);
			bumpConversationsDirty();

			if (window.location.pathname.includes(conversationId)) {
				router.push('/');
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to delete conversation',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const side = placement === 'top' ? 'top' : 'bottom';

	return (
		<>
			<DropdownMenu onOpenChange={onOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							'h-8 w-8 rounded-full border border-transparent text-muted-foreground transition-all duration-fast ease-out-expo',
							'hover:border-border hover:bg-accent/70 hover:text-foreground hover:shadow-sm',
							'dark:hover:bg-accent/80 dark:hover:shadow-xs',
							'data-[state=open]:border-primary-border data-[state=open]:bg-accent/80 data-[state=open]:text-foreground data-[state=open]:shadow-glow-sm',
							className,
						)}
						aria-label="Conversation actions"
					>
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align="end"
					side={side}
					sideOffset={8}
					className={cn(
						'w-fit min-w-0 rounded-lg border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-lg backdrop-blur-xl',
						'dark:border-white/8 dark:bg-popover/90 dark:shadow-float',
					)}
				>
					<DropdownMenuItem
						className={cn(
							'group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors',
							'hover:bg-accent focus:bg-accent data-[highlighted]:bg-accent',
						)}
						onClick={handleRenameClick}
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
							<Pencil className="h-4 w-4" />
						</span>
						<span className="flex flex-col">
							<span className="font-medium leading-none">Rename</span>
						</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						className={cn(
							'group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors',
							'text-destructive hover:bg-destructive/10 focus:bg-destructive/10 data-highlighted:bg-destructive/10',
						)}
						onClick={handleDeleteClick}
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive ring-1 ring-destructive/15">
							<Trash2 className="h-4 w-4" />
						</span>
						<span className="flex flex-col">
							<span className="font-medium leading-none">Delete</span>
						</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog
				open={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
			>
				<AlertDialogContent
					className={cn(
						'overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-0 text-card-foreground shadow-xl backdrop-blur-xl',
						'dark:border-white/8 dark:bg-card/92 dark:shadow-float',
					)}
				>
					<div className="border-b border-border/70 bg-muted/30 px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15">
								<MessageSquareText className="h-5 w-5" />
							</div>

							<AlertDialogHeader className="space-y-1 text-left">
								<AlertDialogTitle className="text-lg font-semibold text-foreground">
									Rename conversation
								</AlertDialogTitle>
								<AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
									Choose a clearer title so this conversation is easier to find
									later.
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
					</div>

					<div className="space-y-3 px-6 py-5">
						<div className="space-y-2">
							<label
								htmlFor="conversation-title"
								className="text-sm font-medium text-foreground"
							>
								New title
							</label>

							<Input
								id="conversation-title"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder="Enter new title"
								autoFocus
								className={cn(
									'h-11 rounded-xl border-border bg-background/80 text-foreground shadow-xs transition-all',
									'placeholder:text-muted-foreground/80',
									'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20',
									'dark:bg-input/80',
								)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										void handleRenameSubmit();
									}
								}}
							/>
						</div>

						{error && (
							<div className="rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
								{error}
							</div>
						)}
					</div>

					<AlertDialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-4">
						<AlertDialogCancel
							disabled={isSubmitting}
							className={cn(
								'rounded-xl border-border bg-background text-foreground shadow-xs transition-all',
								'hover:bg-accent hover:text-foreground',
								'dark:bg-secondary dark:hover:bg-accent',
							)}
						>
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={isSubmitting}
							onClick={(e) => {
								e.preventDefault();
								void handleRenameSubmit();
							}}
							className={cn(
								'rounded-xl bg-primary text-primary-foreground shadow-sm transition-all',
								'hover:bg-primary/90 hover:shadow-glow-sm',
								'disabled:opacity-70',
							)}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save changes'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent
					className={cn(
						'overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-0 text-card-foreground shadow-xl backdrop-blur-xl',
						'dark:border-white/8 dark:bg-card/92 dark:shadow-float',
					)}
				>
					<div className="border-b border-destructive/15 bg-destructive/6 px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/12 text-destructive ring-1 ring-destructive/20">
								<AlertTriangle className="h-5 w-5" />
							</div>

							<AlertDialogHeader className="space-y-1 text-left">
								<AlertDialogTitle className="text-lg font-semibold text-foreground">
									Delete conversation
								</AlertDialogTitle>
								<AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
									This will permanently remove this conversation and its
									messages. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
					</div>

					<div className="px-6 py-5">
						{currentTitle ? (
							<div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
								<p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
									Conversation
								</p>
								<p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
									{currentTitle}
								</p>
							</div>
						) : null}

						{error && (
							<div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
								{error}
							</div>
						)}
					</div>

					<AlertDialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-4">
						<AlertDialogCancel
							disabled={isSubmitting}
							className={cn(
								'rounded-xl border-border bg-background text-foreground shadow-xs transition-all',
								'hover:bg-accent hover:text-foreground',
								'dark:bg-secondary dark:hover:bg-accent',
							)}
						>
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							className={cn(
								'rounded-xl bg-destructive text-destructive-foreground shadow-sm transition-all',
								'hover:bg-destructive/90',
								'focus-visible:ring-2 focus-visible:ring-destructive/25',
								'disabled:opacity-70',
							)}
							disabled={isSubmitting}
							onClick={(e) => {
								e.preventDefault();
								void handleDeleteConfirm();
							}}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete conversation'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
