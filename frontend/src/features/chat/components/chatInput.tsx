'use client';

import { ArrowUp } from 'lucide-react';
import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { cn } from '@/src/lib/utils';

import { useUploadStore } from '@/src/stores/document/uploadStore';
import {
	DocumentUploader,
	type UploadingFile,
} from '../../documents/components/documentUploader';
import UploadFileList from '../../documents/components/uploadFileList';
import { deleteRagDocuments } from '../../documents/lib/ragClient';

type ChatSubmitPayload = {
	prompt: string;
	files: UploadingFile[];
};

interface ChatInputProps {
	onSubmit: (payload: ChatSubmitPayload) => Promise<void> | void;
	onFilesSelected: (files: File[]) => void;
	placeholder?: string;
	disabled?: boolean;
	isSubmitting?: boolean;
	defaultValue?: string;
	className?: string;
}

const ChatInput = ({
	onSubmit,
	placeholder = 'Ask anything...',
	onFilesSelected,
	disabled = false,
	isSubmitting = false,
	defaultValue = '',
	className,
}: ChatInputProps) => {
	const [prompt, setPrompt] = useState(defaultValue);
	const { files, removeFile } = useUploadStore((s) => s);

	const trimmed = prompt.trim();

	const hasUploadingFile = useMemo(
		() => files.some((file) => file.status === 'uploading'),
		[files],
	);
	const hasErroredFile = useMemo(
		() => files.some((file) => file.status === 'error'),
		[files],
	);

	const removeFileContext = async (file: UploadingFile) => {
		removeFile(file.id);
		if (!file.documentIds || !file.vectorIndex) return;
		try {
			await deleteRagDocuments({
				vector_index: file.vectorIndex,
				document_ids: file.documentIds,
			});
		} catch (error) {
			console.log(error);
		}
	};

	const isDisabled =
		disabled || isSubmitting || hasUploadingFile || hasErroredFile || !trimmed;

	const handleSubmit = async (e?: FormEvent) => {
		e?.preventDefault();
		if (isDisabled) return;

		const value = trimmed;
		setPrompt('');

		try {
			await onSubmit({ prompt: value, files });
		} catch (error) {
			setPrompt(value);
			throw error;
		}
	};

	const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			await handleSubmit();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div
				className={cn(
					'w-full rounded-[28px] bg-chat-input shadow-sm px-3 py-2',
					className,
				)}
			>
				{files.length > 0 && (
					<div className="mb-2">
						<UploadFileList
							files={files}
							onRemoveFile={removeFileContext}
							disabled={disabled}
						/>
					</div>
				)}

				<div className="flex h-10 items-center gap-2">
					<DocumentUploader
						files={files}
						onFilesSelected={onFilesSelected}
						onRemoveFile={removeFileContext}
						disabled={disabled || isSubmitting}
						multiple
						className="flex h-10 w-10 items-center justify-center rounded-full"
					/>
					<Textarea
						id="prompt"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled || isSubmitting}
						rows={1}
						className={cn(
							'flex-1 min-h-5 resize-none border-0 bg-transparent px-0 py-0 text-sm',
							'leading-[1.2] focus-visible:ring-0 focus-visible:ring-offset-0',
						)}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={isDisabled}
						className="h-10 w-10 rounded-full"
					>
						<ArrowUp className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</form>
	);
};

export default ChatInput;
