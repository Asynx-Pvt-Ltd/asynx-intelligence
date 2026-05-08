'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
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
import { updateConversation, deleteConversation } from '../lib/chatHistory';
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
			{/* Three-dot dropdown */}
			<DropdownMenu onOpenChange={onOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							'h-7 w-7 p-0 rounded-full hover:bg-accent transition-colors',
							className,
						)}
						aria-label="Conversation actions"
					>
						<MoreVertical className="h-4 w-4 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side={side} className="w-48">
					<DropdownMenuItem
						className="flex items-center gap-2"
						onClick={handleRenameClick}
					>
						<Pencil className="h-4 w-4" />
						<span>Rename conversation</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="flex items-center gap-2 text-destructive focus:text-destructive"
						onClick={handleDeleteClick}
					>
						<Trash2 className="h-4 w-4" />
						<span>Delete conversation</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Rename dialog */}
			<AlertDialog
				open={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Rename conversation</AlertDialogTitle>
						<AlertDialogDescription>
							Choose a new title for this conversation.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="mt-2 space-y-2">
						<Input
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="Enter new title"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									void handleRenameSubmit();
								}
							}}
						/>
						{error && <p className="text-sm text-destructive">{error}</p>}
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isSubmitting}
							onClick={(e) => {
								e.preventDefault();
								void handleRenameSubmit();
							}}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete conversation</AlertDialogTitle>
						<AlertDialogDescription className="text-red-400">
							Are you sure you want to delete this conversation? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					{error && <p className="mb-2 text-sm text-destructive">{error}</p>}

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
								'Delete'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
