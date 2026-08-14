'use client';

import { ComposerPrimitive } from '@assistant-ui/react';
import { ArrowUp, Square } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { cn } from '@/src/lib/utils';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import {
	DocumentUploader,
	type UploadingFile,
} from '@/src/features/documents/components/documentUploader';
import UploadFileList from '@/src/features/documents/components/uploadFileList';
import { deleteRagDocuments } from '@/src/features/documents/lib/ragClient';
import { uploadRagDocumentWithProgress } from '@/src/features/documents/lib/ragClient';
import type { ChatModel } from '../../types/chatModels';
import ModelSelector from '@/src/components/chat/ModelSelector';

interface AsynxComposerProps {
	selectedModel: ChatModel;
	onModelChange: Dispatch<SetStateAction<ChatModel>> | ((m: ChatModel) => void);
	conversationId: string;
	disabled?: boolean;
	isLoading?: boolean;
	placeholder?: string;
}

export default function AsynxComposer({
	selectedModel,
	onModelChange,
	conversationId,
	disabled = false,
	isLoading = false,
	placeholder = 'Ask a follow-up…',
}: AsynxComposerProps) {
	const { files, addFile, updateFile, removeFile } = useUploadStore();

	const handleFilesSelected = async (selectedFiles: File[]) => {
		if (!selectedFiles.length) return;

		await Promise.all(
			selectedFiles.map(async (file) => {
				const tempId = crypto.randomUUID();

				addFile({
					id: tempId,
					file,
					progress: 0,
					status: 'uploading',
					fileId: '',
					fileName: '',
				});

				try {
					const response = await uploadRagDocumentWithProgress({
						file,
						conversation_id: conversationId,
						chunk_size: 1000,
						chunk_overlap: 200,
						parser_strategy: 'speed',
						onProgress: (progress) =>
							updateFile(tempId, { progress, status: 'uploading' }),
					});

					updateFile(tempId, {
						progress: 100,
						status: 'uploaded',
						error: undefined,
						vectorIndex: response.vector_index,
						documentIds: response.document_ids,
						conversationId: response.conversation_id,
						fileId: response.file_id,
						fileName: response.file_name,
					});
				} catch (error) {
					updateFile(tempId, {
						progress: 0,
						status: 'error',
						error: error instanceof Error ? error.message : 'Upload failed',
					});
				}
			}),
		);
	};

	const handleRemoveFile = async (file: UploadingFile) => {
		removeFile(file.id);
		if (!file.documentIds || !file.vectorIndex) return;
		try {
			await deleteRagDocuments({
				vector_index: file.vectorIndex,
				document_ids: file.documentIds,
			});
		} catch {
			/* ignore cleanup failure */
		}
	};

	return (
		<ComposerPrimitive.Root className="w-full">
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
					<div className="px-2 pt-3">
						<UploadFileList
							files={files}
							onRemoveFile={handleRemoveFile}
							disabled={disabled}
						/>
					</div>
				)}

				<div className="flex items-end gap-2 px-4 pt-3 pb-2">
					<ComposerPrimitive.Input
						placeholder={placeholder}
						disabled={disabled || isLoading}
						rows={1}
						className={cn(
							'flex-1 resize-none bg-transparent text-sm leading-6',
							'text-foreground placeholder:text-muted-foreground/50',
							'border-0 outline-none focus:ring-0 focus:outline-none',
							'max-h-[120px] overflow-y-auto scrollbar-thin',
							'disabled:cursor-not-allowed disabled:opacity-50',
							'[field-sizing:content]',
						)}
					/>
				</div>

				<div className="flex items-center justify-between px-3 pb-2.5">
					<div className="flex items-center gap-1">
						<DocumentUploader
							files={files}
							onFilesSelected={handleFilesSelected}
							onRemoveFile={handleRemoveFile}
							disabled={disabled || isLoading}
							multiple
							className="contents"
						/>
					</div>

					<div className="flex items-center gap-2">
						<ModelSelector
							value={selectedModel}
							onChange={onModelChange}
							disabled={disabled || isLoading}
						/>

						<span className="hidden select-none text-[11px] text-muted-foreground/35 sm:inline">
							↵ send
						</span>

						{isLoading ? (
							<ComposerPrimitive.Cancel asChild>
								<button
									type="button"
									aria-label="Stop generating"
									className={cn(
										'flex h-8 w-8 items-center justify-center rounded-lg',
										'bg-primary text-primary-foreground',
										'transition-opacity hover:opacity-90',
									)}
								>
									<Square className="h-3.5 w-3.5 fill-current" />
								</button>
							</ComposerPrimitive.Cancel>
						) : (
							<ComposerPrimitive.Send asChild>
								<button
									type="submit"
									aria-label="Send message"
									disabled={disabled}
									className={cn(
										'flex h-8 w-8 items-center justify-center rounded-lg',
										'transition-all duration-150',
										'bg-primary text-primary-foreground',
										'hover:opacity-90',
										'disabled:bg-muted disabled:text-muted-foreground/40 disabled:cursor-not-allowed',
									)}
								>
									<ArrowUp className="h-4 w-4" />
								</button>
							</ComposerPrimitive.Send>
						)}
					</div>
				</div>
			</div>
		</ComposerPrimitive.Root>
	);
}
