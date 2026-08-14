'use client';

import {
	FormEvent,
	KeyboardEvent,
	useMemo,
	useRef,
	useState,
	useEffect,
	Dispatch,
	SetStateAction,
} from 'react';
import { ArrowUp, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import {
	DocumentUploader,
	type UploadingFile,
} from '../../../documents/components/documentUploader';
import UploadFileList from '../../../documents/components/uploadFileList';
import { deleteRagDocuments } from '../../../documents/lib/ragClient';
import { Textarea } from '@/src/components/ui/textarea';
import type { ChatModel } from '../../types/chatModels';
import ModelSelector from '@/src/components/chat/ModelSelector';

type ChatSubmitPayload = {
	prompt: string;
	files: UploadingFile[];
	model: ChatModel;
};

type SendState = 'idle' | 'sending' | 'done';

interface ChatInputProps {
	onSubmit: (payload: ChatSubmitPayload) => Promise<void> | void;
	onFilesSelected: (files: File[]) => void;
	selectedModel: ChatModel;
	onModelChange:
		| Dispatch<SetStateAction<ChatModel>>
		| ((nextModel: ChatModel) => void);
	placeholder?: string;
	disabled?: boolean;
	isSubmitting?: boolean;
	defaultValue?: string;
	className?: string;
}

const MAX_LINES = 5;
const LINE_HEIGHT = 24;
const MIN_HEIGHT = 40;

export default function ChatInput({
	onSubmit,
	onFilesSelected,
	selectedModel,
	onModelChange,
	placeholder = 'Ask anything…',
	disabled = false,
	isSubmitting = false,
	defaultValue = '',
	className,
}: ChatInputProps) {
	const [prompt, setPrompt] = useState(defaultValue);
	const [sendState, setSendState] = useState<SendState>('idle');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { files, removeFile } = useUploadStore((s) => s);

	const trimmed = prompt.trim();
	const charCount = trimmed.length;
	const showCount = charCount > 200;

	const hasUploadingFile = useMemo(
		() => files.some((f) => f.status === 'uploading'),
		[files],
	);

	const hasErroredFile = useMemo(
		() => files.some((f) => f.status === 'error'),
		[files],
	);

	const canSubmit =
		!disabled &&
		!isSubmitting &&
		!hasUploadingFile &&
		!hasErroredFile &&
		trimmed.length > 0;

	const resizeTextarea = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT + 16)}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [prompt]);

	useEffect(() => {
		if (defaultValue) {
			setPrompt(defaultValue);
		}
	}, [defaultValue]);

	const removeFileContext = async (file: UploadingFile) => {
		removeFile(file.id);

		if (!file.documentIds || !file.vectorIndex) return;

		try {
			await deleteRagDocuments({
				vector_index: file.vectorIndex,
				document_ids: file.documentIds,
			});
		} catch {
			// ignore cleanup failure
		}
	};

	const handleSubmit = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!canSubmit) return;

		const value = trimmed;
		setPrompt('');

		if (textareaRef.current) {
			textareaRef.current.style.height = `${MIN_HEIGHT}px`;
		}

		setSendState('sending');

		try {
			await onSubmit({
				prompt: value,
				files,
				model: selectedModel,
			});

			setSendState('done');
			setTimeout(() => setSendState('idle'), 1200);
		} catch {
			setPrompt(value);
			setSendState('idle');
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		const isMac = navigator.platform.includes('Mac');
		const modKey = isMac ? e.metaKey : e.ctrlKey;

		if (e.key === 'Enter' && !e.shiftKey && !modKey) {
			e.preventDefault();
			void handleSubmit();
		}

		if (e.key === 'Enter' && modKey) {
			e.preventDefault();
			void handleSubmit();
		}
	};

	const isSending = isSubmitting || sendState === 'sending';

	return (
		<form onSubmit={handleSubmit} className={cn('w-full', className)}>
			<div
				className={cn(
					'relative w-full rounded-xl',
					'bg-chat-input border border-chat-input-border',
					'shadow-float',
					'transition-[border-color] duration-150',
					'focus-within:border-primary/40',
				)}
			>
				{files.length > 0 && (
					<div className="px-1 pt-3 pb-0">
						<UploadFileList
							files={files}
							onRemoveFile={removeFileContext}
							disabled={disabled}
						/>
					</div>
				)}

				<div className="flex items-end gap-3 px-4 pt-3 pb-1">
					<Textarea
						ref={textareaRef}
						id="chat-prompt"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled || isSending}
						rows={1}
						aria-label="Chat message input"
						aria-multiline="true"
						style={{ minHeight: `${MIN_HEIGHT}px` }}
						className={cn(
							'flex-1 resize-none bg-transparent text-sm leading-6',
							'text-foreground placeholder:text-muted-foreground/50',
							'border-0 outline-none focus:ring-0 focus:outline-none',
							'py-2 scrollbar-thin',
							'disabled:cursor-not-allowed disabled:opacity-50',
							'transition-colors duration-150',
						)}
					/>
				</div>

				<div className="flex items-center justify-between px-3 pb-2.5 pt-0">
					<div className="flex items-center gap-1">
						<DocumentUploader
							files={files}
							onFilesSelected={onFilesSelected}
							onRemoveFile={removeFileContext}
							disabled={disabled || isSending}
							multiple
							className="contents"
						/>
					</div>

					<div className="flex items-center gap-2">
						<ModelSelector
							value={selectedModel}
							onChange={onModelChange}
							disabled={disabled || isSending}
						/>

						<AnimatePresence>
							{showCount && (
								<motion.span
									initial={{ opacity: 0, x: 4 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 4 }}
									className={cn(
										'text-[11px] tabular-nums',
										charCount > 3000
											? 'text-destructive'
											: 'text-muted-foreground/50',
									)}
								>
									{charCount.toLocaleString()}
								</motion.span>
							)}
						</AnimatePresence>

						<span className="hidden select-none text-[11px] text-muted-foreground/35 sm:inline">
							↵ to send
						</span>

						<motion.button
							type="submit"
							disabled={!canSubmit && sendState !== 'done'}
							aria-label={isSending ? 'Sending…' : 'Send message'}
							whileHover={canSubmit ? { scale: 1.06 } : undefined}
							whileTap={canSubmit ? { scale: 0.94 } : undefined}
							className={cn(
								'relative flex h-8 w-8 items-center justify-center rounded-xl',
								'transition-all duration-200',
								canSubmit || sendState === 'done'
									? ['bg-primary text-primary-foreground', 'hover:opacity-90']
									: ['bg-muted text-muted-foreground/40', 'cursor-not-allowed'],
							)}
						>
							<AnimatePresence mode="wait" initial={false}>
								{sendState === 'done' ? (
									<motion.div
										key="check"
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ duration: 0.15 }}
									>
										<Check className="h-4 w-4" />
									</motion.div>
								) : isSending ? (
									<motion.div
										key="loading"
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ duration: 0.15 }}
									>
										<Loader2 className="h-4 w-4 animate-spin" />
									</motion.div>
								) : (
									<motion.div
										key="arrow"
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ duration: 0.15 }}
									>
										<ArrowUp className="h-4 w-4" />
									</motion.div>
								)}
							</AnimatePresence>
						</motion.button>
					</div>
				</div>
			</div>
		</form>
	);
}
