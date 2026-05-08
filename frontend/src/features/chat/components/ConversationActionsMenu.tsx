'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
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
}

export default function ConversationActionsMenu({
	conversationId,
	currentTitle = '',
	onTitleUpdated,
	onDeleted,
	className,
}: ConversationActionsMenuProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [newTitle, setNewTitle] = useState(currentTitle);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const bumpConversationsDirty = useChatStore((s) => s.bumpConversationsDirty);

	const handleRenameClick = () => {
		setIsMenuOpen(false);
		setIsRenameDialogOpen(true);
		setNewTitle(currentTitle);
		setError(null);
	};

	const handleDeleteClick = () => {
		setIsMenuOpen(false);
		setIsDeleteDialogOpen(true);
		setError(null);
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

	return (
		<div className="relative">
			{/* Three-dot button */}
			<Button
				variant="ghost"
				size="icon-sm"
				className={cn(
					'p-1 rounded-md hover:bg-accent transition-colors',
					...(className || ''),
				)}
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				aria-label="Conversation actions"
			>
				<MoreVertical className="h-4 w-4 text-muted-foreground" />
			</Button>

			{/* Dropdown menu */}
			{isMenuOpen && (
				<div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-background shadow-lg z-50">
					<div className="p-1">
						<button
							className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
							onClick={handleRenameClick}
						>
							<Pencil className="h-4 w-4" />
							Rename conversation
						</button>
						<button
							className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
							onClick={handleDeleteClick}
						>
							<Trash2 className="h-4 w-4" />
							Delete conversation
						</button>
					</div>
				</div>
			)}

			{/* Rename dialog */}
			{isRenameDialogOpen && (
				<div className="fixed inset-36 z-50 flex items-center justify-center">
					<div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="text-lg font-semibold mb-4">Rename conversation</h3>
						<input
							type="text"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mb-4"
							placeholder="Enter new title"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleRenameSubmit();
								if (e.key === 'Escape') setIsRenameDialogOpen(false);
							}}
						/>
						{error && <p className="text-sm text-destructive mb-4">{error}</p>}
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsRenameDialogOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={handleRenameSubmit}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									'Save'
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete confirmation dialog */}
			{isDeleteDialogOpen && (
				<div className="fixed inset-36 z-50 flex items-center justify-center">
					<div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="text-lg font-semibold mb-2">Delete conversation</h3>
						<p className="text-sm text-muted-foreground mb-6">
							Are you sure you want to delete this conversation? This action
							cannot be undone.
						</p>
						{error && <p className="text-sm text-destructive mb-4">{error}</p>}
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsDeleteDialogOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleDeleteConfirm}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									'Delete'
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Close menu when clicking outside */}
			{isMenuOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsMenuOpen(false)}
				/>
			)}
		</div>
	);
}
