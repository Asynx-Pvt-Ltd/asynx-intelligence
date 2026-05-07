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

	const isDisabled =
		disabled || isSubmitting || hasUploadingFile || hasErroredFile || !trimmed;

	const handleSubmit = async (e?: FormEvent) => {
		e?.preventDefault();

		if (isDisabled) return;

		const value = trimmed;
		setPrompt('');

		try {
			await onSubmit({
				prompt: value,
				files,
			});
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
		<form
			onSubmit={handleSubmit}
			className={cn(
				'h-full w-full bg-chat-input rounded-[28px] border shadow-sm',
				className,
			)}
		>
			<div>
				{files.length > 0 ? (
					<UploadFileList
						files={files}
						onRemoveFile={removeFile}
						disabled={disabled}
					/>
				) : null}

				<Textarea
					id="prompt"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled || isSubmitting}
					className={cn(
						'min-h-20 resize-none border-0 bg-transparent px-5 py-3  text-lg! shadow-none focus-visible:ring-0',
						'placeholder:text-muted-foreground/80 placeholder:text-lg',
					)}
				/>

				<div className="flex items-center justify-between px-4 pb-4">
					<DocumentUploader
						files={files}
						onFilesSelected={onFilesSelected}
						onRemoveFile={removeFile}
						disabled={disabled || isSubmitting}
						multiple={true}
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
