'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/src/stores/chat/chatStore';
import {
	createConversation,
	updateConversation,
} from '@/src/features/chat/lib/chatHistory';
import ChatInputHeader from './chatInputHeader';
import ChatInput from './chatInput';
import type { UploadingFile } from '../../documents/components/documentUploader';
import { uploadRagDocumentWithProgress } from '../../documents/lib/ragClient';
import { useUploadStore } from '@/src/stores/document/uploadStore';

type ChatSubmitPayload = {
	prompt: string;
	files: UploadingFile[];
};

const StarterChatInput = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const addFile = useUploadStore((s) => s.addFile);
	const updateFile = useUploadStore((s) => s.updateFile);

	const setPendingPrompt = useChatStore((state) => state.setPendingPrompt);
	const bumpConversationsDirty = useChatStore(
		(state) => state.bumpConversationsDirty,
	);

	const handleFilesSelected = async (selectedFiles: File[]) => {
		if (!selectedFiles.length) return;
		let conversationId = null;
		try {
			const conversation = await createConversation({
				title: 'Draft conversation',
				is_draft: true,
			});
			conversationId = conversation.id;
		} catch (error) {
			console.error('Failed to create draft conversation:', error);
			return;
		}

		await Promise.all(
			selectedFiles.map(async (file) => {
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
						conversation_id: conversationId!,
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
			}),
		);
	};

	const handleCreateConversation = async ({
		prompt,
		files,
	}: ChatSubmitPayload) => {
		try {
			setIsSubmitting(true);

			const uploadedFiles = files.filter(
				(f) => f.status === 'uploaded' && f.conversationId,
			);

			let conversationId: string;

			if (uploadedFiles.length > 0) {
				conversationId = uploadedFiles[0].conversationId!;
				await updateConversation(conversationId, {
					title: prompt.slice(0, 60),
					is_draft: false,
				});
			} else {
				const conversation = await createConversation({
					title: prompt.slice(0, 60),
					is_draft: false,
				});
				conversationId = conversation.id;
			}

			bumpConversationsDirty();
			setPendingPrompt(prompt);
			router.push(`/chat/${conversationId}`);
		} catch (error) {
			console.error('Failed to create conversation:', error);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="sm:w-3xl w-lg p-4">
			<ChatInputHeader title="Enterprise AI Chatbot" />
			<ChatInput
				onSubmit={handleCreateConversation}
				onFilesSelected={handleFilesSelected}
				isSubmitting={isSubmitting}
				className="max-w-3xl"
			/>
		</div>
	);
};

export default StarterChatInput;
