'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useChatStore } from '@/src/stores/chat/chatStore';
import {
	createConversation,
	updateConversation,
} from '@/src/features/chat/lib/chatHistory';
import ChatInput from './chatInput';
import type { UploadingFile } from '../../documents/components/documentUploader';
import { uploadRagDocumentWithProgress } from '../../documents/lib/ragClient';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import Logo from '@/src/components/ui/logo';
import { Sparkles, FileText, BarChart2, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ChatSubmitPayload = {
	prompt: string;
	files: UploadingFile[];
};

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
			router.push(`/chat/${conversationId}`);
		} catch {
			/* no-op */
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10">
			{/* Hero */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
				className="flex flex-col items-center gap-5 text-center"
			>
				<div className="relative">
					<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-glow">
						<Logo imageStyles="w-12 h-12 object-contain" />
					</div>
					<span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-glow-sm pulse-ring">
						<Sparkles className="h-3 w-3 text-white" />
					</span>
				</div>

				<div className="space-y-2">
					<h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
						Enterprise AI Assistant
					</h1>
					<p className="text-base text-muted-foreground max-w-sm">
						Analyze documents, synthesize knowledge, and accelerate your
						workflow.
					</p>
				</div>
			</motion.div>

			{/* Input */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.4,
					delay: 0.1,
					ease: [0.25, 0.46, 0.45, 0.94],
				}}
				className="w-full"
			>
				<ChatInput
					onSubmit={handleCreateConversation}
					onFilesSelected={handleFilesSelected}
					isSubmitting={isSubmitting}
					placeholder="Ask anything…"
					defaultValue={defaultPrompt}
				/>
			</motion.div>

			{/* Suggested prompts */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className="flex flex-wrap justify-center gap-2"
			>
				{SUGGESTED_PROMPTS.map((item, i) => {
					const Icon = item.icon;
					return (
						<motion.button
							key={item.label}
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.3,
								delay: 0.25 + i * 0.06,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
							onClick={() => setDefaultPrompt(item.prompt)}
							disabled={isSubmitting}
							className={cn(
								'group flex items-center gap-2 rounded-xl px-3.5 py-2.5 cursor-pointer',
								'border border-border bg-card/50 backdrop-blur-sm',
								'text-sm text-muted-foreground',
								'hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
								'transition-all duration-200 shadow-sm hover:shadow-glow-sm',
								'disabled:pointer-events-none disabled:opacity-50',
							)}
						>
							<Icon className="h-3.5 w-3.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
							<span>{item.label}</span>
						</motion.button>
					);
				})}
			</motion.div>
		</div>
	);
};

export default StarterChatInput;
