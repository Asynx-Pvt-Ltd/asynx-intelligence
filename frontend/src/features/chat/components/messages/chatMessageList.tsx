'use client';

import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';
import { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { deleteRagDocuments } from '@/src/features/documents/lib/ragClient';
import { deleteAttachedFileFromMessage } from '../../lib/chatHistory';
import { Message } from '../../types/chatTypes';
import { structureAnswer } from '../../utils/structureAnswer';
import AssisstantMessageBubble from './assisstantMessageBubble';
import UserMessageBubble from './userMessageBubble';
import UploadFileChip from './uploadFileChip';
import MarkdownRenderer from '@/src/components/chat/MarkdownRenderer';
import ThinkingIndicator from '@/src/components/chat/ThinkingIndicator';

interface ChatMessageListProps {
	messages: Message[];
	isLoading: boolean;
	streamingIndex: number | null;
	setMessage: Dispatch<SetStateAction<Message[]>>;
	vectorIndex: string | undefined;
	conversationId: string;
}

const msgVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0 },
};

const containerVariants = {
	visible: {
		transition: { staggerChildren: 0.04 },
	},
};

export default function ChatMessageList({
	messages,
	isLoading,
	streamingIndex,
	setMessage,
	vectorIndex,
	conversationId,
}: ChatMessageListProps) {
	const removeUploadedFile = async ({
		file,
		index,
		messageId,
	}: {
		file: AttachedFile;
		index: number;
		messageId: string;
	}) => {
		setMessage((prev) =>
			prev.map((msg, idx) =>
				idx === index
					? {
							...msg,
							attached_files: msg.attached_files?.filter(
								(f) => f.file_id !== file.file_id,
							),
						}
					: msg,
			),
		);

		if (!file.document_ids || !vectorIndex) return;
		try {
			await Promise.all([
				deleteAttachedFileFromMessage({
					conversationId,
					fileId: file.file_id,
					messageId,
				}),
				deleteRagDocuments({
					document_ids: file.document_ids,
					vector_index: vectorIndex,
				}),
			]);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="flex flex-col gap-4"
		>
			<AnimatePresence initial={false}>
				{messages.map((message, index) => {
					const isUser = message.role === 'user';
					const isStreamingAssistant = !isUser && index === streamingIndex;

					const structured =
						!isUser && message.content
							? structureAnswer(message.content)
							: null;
					const isGeneralText =
						!isUser && structured?.type === 'general' && structured.rawText;

					return (
						<motion.div
							key={`${message.role}-${index}`}
							variants={msgVariants}
							transition={{
								duration: 0.25,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
							layout
							className={cn(
								'group flex w-full',
								isUser ? 'justify-end' : 'justify-start',
							)}
						>
							{/* Assistant avatar */}
							{!isUser && (
								<div className="mr-3 mt-1 shrink-0 self-start">
									<AssisstantMessageBubble />
								</div>
							)}

							{/* Bubble */}
							<div
								className={cn(
									'relative max-w-[75%] rounded-2xl',
									isUser
										? [
												'rounded-tr-sm',
												'bg-primary/15 border border-primary/20',
												'px-4 py-3',
												'text-foreground',
											]
										: [
												'rounded-tl-sm',
												'glass',
												'px-4 py-3',
												'text-foreground/90',
											],
								)}
							>
								{/* Content */}
								{isUser ? (
									<div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
										{message.content}
									</div>
								) : isStreamingAssistant && !message.content ? (
									<ThinkingIndicator />
								) : isGeneralText ? (
									<MarkdownRenderer
										content={structured!.rawText!}
										isStreaming={isStreamingAssistant}
									/>
								) : structured ? (
									<StructuredContent
										structured={structured}
										isStreaming={isStreamingAssistant}
									/>
								) : (
									<MarkdownRenderer
										content={message.content}
										isStreaming={isStreamingAssistant}
									/>
								)}

								{/* File attachments */}
								<UploadFileChip
									message={message}
									index={index}
									onRemoveFile={removeUploadedFile}
								/>

								{/* Timestamp (hover only) */}
								<MessageTimestamp
									createdAt={
										(message as unknown as { created_at?: string }).created_at
									}
								/>
							</div>

							{/* User avatar */}
							{isUser && (
								<div className="ml-3 mt-1 shrink-0 self-start">
									<UserMessageBubble />
								</div>
							)}
						</motion.div>
					);
				})}
			</AnimatePresence>
		</motion.div>
	);
}

/* ── Structured content renderer ──────────────────────────────── */
function StructuredContent({
	structured,
	isStreaming,
}: {
	structured: NonNullable<ReturnType<typeof structureAnswer>>;
	isStreaming: boolean;
}) {
	return (
		<div className="space-y-4 text-[15px]">
			{structured.title && (
				<h2 className="text-base sm:text-xl text-foreground">
					{structured.title}
				</h2>
			)}
			{structured.overview && (
				<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
					{structured.overview}
				</p>
			)}
			{structured.sections
				?.filter((s) => s.heading.toLowerCase() !== 'overview')
				.map((section) => (
					<section key={section.heading} className="space-y-1.5">
						<h3 className="text-[16px] text-foreground">{section.heading}</h3>
						<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
							{section.body}
						</p>
					</section>
				))}
			{structured.bullets && structured.bullets.length > 0 && (
				<ul className="space-y-1 pl-5 list-disc marker:text-primary/50">
					{structured.bullets.map((b, i) => (
						<li key={i} className="text-muted-foreground leading-relaxed">
							{b}
						</li>
					))}
				</ul>
			)}
			{isStreaming && (
				<span className="cursor-blink ml-0.5 inline-block" aria-hidden />
			)}
		</div>
	);
}

/* ── Hover timestamp ──────────────────────────────────────────── */
function MessageTimestamp({ createdAt }: { createdAt?: string }) {
	if (!createdAt) return null;
	const formatted = new Date(createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
	return (
		<span
			className={cn(
				'absolute -bottom-5 right-1',
				'whitespace-nowrap text-[10px] text-muted-foreground/50',
				'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
				'pointer-events-none select-none',
			)}
		>
			{formatted}
		</span>
	);
}
