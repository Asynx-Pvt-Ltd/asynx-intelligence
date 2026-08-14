'use client';

import Logo from '@/src/components/ui/logo';
import {
	createConversation,
	updateConversation,
} from '@/src/features/chat/lib/chatHistory';
import { cn } from '@/src/lib/utils';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import { BarChart2, FileText, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { uploadRagDocumentWithProgress } from '../../../documents/lib/ragClient';
import { ChatSubmitPayload } from '../../types/chatTypes';
import ChatInput from './chatInput';
import { ChatModel } from '../../types/chatModels';

const SUGGESTED_PROMPTS = [
	{
		icon: FileText,
		label: 'Summarize a document',
		prompt: 'Summarize the key points from the document I uploaded',
	},
	{
		icon: BarChart2,
		label: 'Analyze data',
		prompt: 'Analyze the trends and patterns in this dataset',
	},
	{
		icon: MessageSquare,
		label: 'Draft a response',
		prompt: 'Help me draft a professional response to this email',
	},
];

const StarterChatInput = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [defaultPrompt, setDefaultPrompt] = useState('');
	const [selectedModel, setSelectedModel] = useState<ChatModel>('gpt-5-mini');
	const addFile = useUploadStore((s) => s.addFile);
	const updateFile = useUploadStore((s) => s.updateFile);
	const setPendingPrompt = useChatStore((state) => state.setPendingPrompt);
	const bumpConversationsDirty = useChatStore(
		(state) => state.bumpConversationsDirty,
	);

	const handleFilesSelected = async (selectedFiles: File[]) => {
		if (!selectedFiles.length) return;
		let conversationId: string | null = null;
		try {
			const conversation = await createConversation({
				title: 'Draft conversation',
				is_draft: true,
			});
			conversationId = conversation.id;
		} catch {
			return;
		}

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
						conversation_id: conversationId!,
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
			router.push(`/chat/${conversationId}?model=${selectedModel}`);
		} catch {
			/* no-op */
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
			{/* Hero */}
			<div className="flex flex-col items-center gap-4 text-center animate-fade-up">
				<Logo
					className="border border-border w-12 h-12 rounded-2xl p-2 bg-card shadow-sm"
					imageStyles="w-full h-full object-contain"
				/>

				<div className="space-y-1.5">
					<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
						Aria
					</h1>
					<p className="text-sm text-muted-foreground max-w-xs">
						Your intelligent work assistant. Ask anything, analyze documents, and get answers instantly.
					</p>
				</div>
			</div>

			{/* Input */}
			<div className="w-full animate-fade-up" style={{ animationDelay: '60ms' }}>
				<ChatInput
					onSubmit={handleCreateConversation}
					onFilesSelected={handleFilesSelected}
					selectedModel={selectedModel}
					onModelChange={setSelectedModel}
					isSubmitting={isSubmitting}
					placeholder="Ask anything…"
					defaultValue={defaultPrompt}
				/>
			</div>

			{/* Suggested prompts */}
			<div
				className="flex flex-wrap justify-center gap-1.5 animate-fade-up"
				style={{ animationDelay: '120ms' }}
			>
				{SUGGESTED_PROMPTS.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.label}
							onClick={() => setDefaultPrompt(item.prompt)}
							disabled={isSubmitting}
							className={cn(
								'flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer',
								'border border-border bg-card',
								'text-[13px] text-muted-foreground',
								'hover:border-primary/30 hover:bg-primary-subtle hover:text-foreground',
								'transition-colors duration-150',
								'disabled:pointer-events-none disabled:opacity-50',
							)}
						>
							<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
							<span>{item.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default StarterChatInput;
