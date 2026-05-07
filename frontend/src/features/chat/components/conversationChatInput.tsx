'use client';

import { useState } from 'react';
import ChatInput from './chatInput';
import type { UploadingFile } from '../../documents/components/documentUploader';
import { uploadRagDocumentWithProgress } from '../../documents/lib/ragClient';
import { useUploadStore } from '@/src/stores/document/uploadStore';

interface ConversationChatInputProps {
	onSendMessage: (value: string) => Promise<void>;
	disabled?: boolean;
	conversationId: string;
}

type ChatSubmitPayload = {
	prompt: string;
	files: UploadingFile[];
};

const ConversationChatInput = ({
	onSendMessage,
	disabled = false,
	conversationId,
}: ConversationChatInputProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const addFile = useUploadStore((s) => s.addFile);
	const updateFile = useUploadStore((s) => s.updateFile);

	const handleSubmit = async (value: string) => {
		try {
			setIsSubmitting(true);
			await onSendMessage(value);
		} catch (error) {
			console.error('Failed to send message:', error);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChatSubmit = async ({ prompt }: ChatSubmitPayload) => {
		await handleSubmit(prompt);
	};

	const handleFilesSelected = async (selectedFiles: File[]) => {
		if (!selectedFiles.length) return;

		// Upload files sequentially to ensure they all use the same conversation ID
		for (const file of selectedFiles) {
			const tempId = crypto.randomUUID();

			const optimisticFile: UploadingFile = {
				id: tempId,
				file,
				progress: 0,
				status: 'uploading',
				fileId: '',
				fileName: '',
			};

			addFile(optimisticFile);

			try {
				const response = await uploadRagDocumentWithProgress({
					file,
					conversation_id: conversationId,
					chunk_size: 1000,
					chunk_overlap: 200,
					parser_strategy: 'speed',
					onProgress: (progress) => {
						updateFile(tempId, { progress, status: 'uploading' });
					},
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
				const message =
					error instanceof Error ? error.message : 'Failed to upload file';

				updateFile(tempId, {
					progress: 0,
					status: 'error',
					error: message,
				});
			}
		}
	};

	return (
		<ChatInput
			onSubmit={handleChatSubmit}
			onFilesSelected={handleFilesSelected}
			isSubmitting={isSubmitting}
			disabled={disabled}
			placeholder="Ask a follow-up"
		/>
	);
};

export default ConversationChatInput;
