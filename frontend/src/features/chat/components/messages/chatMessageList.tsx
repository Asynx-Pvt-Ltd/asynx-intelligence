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
	setMessages: Dispatch<SetStateAction<Message[]>>;
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
	setMessages,
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
		setMessages((prev) =>
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
			className="mx-auto flex w-full max-w-3xl flex-col gap-4"
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
							{/* Bubble wrapper */}
							<div
								className={cn(
									'relative w-fit max-w-full rounded-2xl',
									// add some padding on the right/top so the avatar
									// doesn’t overlap the text
									'pt-6 pr-10',
									isUser
										? [
												'rounded-tr-sm',
												'border border-primary/20 bg-primary/15',
												'px-4 pb-3 text-foreground',
											]
										: [
												'rounded-tl-sm',
												'glass',
												'px-4 pb-3 text-foreground/90',
											],
								)}
							>
								{/* Avatar in top-right corner of this box */}
								<div className="absolute -top-4 -left-3 h-6 w-6">
									{isUser ? <UserMessageBubble /> : <AssisstantMessageBubble />}
								</div>

								{/* Content */}
								{isUser ? (
									<div className="whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">
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

								{/* Timestamp */}
								<MessageTimestamp
									createdAt={
										(message as unknown as { created_at?: string }).created_at
									}
								/>
							</div>
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
				<h2 className="text-base sm:text-xl font-semibold text-foreground">
					<LinkifiedText text={structured.title} />
				</h2>
			)}

			{structured.overview && (
				<p className="leading-relaxed whitespace-pre-line wrap-break-word dark:text-white/70">
					<LinkifiedText text={structured.overview} />
				</p>
			)}

			{structured.sections
				?.filter((s) => s.heading.toLowerCase() !== 'overview')
				.map((section) => {
					const { paragraph, bullets } = splitBodyIntoParagraphAndBullets(
						section.body,
					);

					return (
						<section key={section.heading} className="space-y-1.5">
							<h3 className="text-[16px] font-semibold text-foreground wrap-break-word">
								<LinkifiedText text={section.heading} />
							</h3>

							{paragraph && (
								<p className="leading-relaxed whitespace-pre-line wrap-break-word dark:text-white/70">
									<LinkifiedText text={paragraph} />
								</p>
							)}

							{bullets.length > 0 && (
								<ul className="space-y-1 pl-5 list-disc marker:text-primary/50">
									{bullets.map((b, i) => (
										<li
											key={i}
											className="leading-relaxed wrap-break-word dark:text-white/70"
										>
											<LinkifiedText text={b} />
										</li>
									))}
								</ul>
							)}
						</section>
					);
				})}

			{structured.bullets && structured.bullets.length > 0 && (
				<ul className="space-y-1 pl-5 list-disc marker:text-primary/50">
					{structured.bullets.map((b, i) => (
						<li
							key={i}
							className="leading-relaxed wrap-break-word text-muted-foreground"
						>
							<LinkifiedText text={b} />
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

function splitBodyIntoParagraphAndBullets(body: string) {
	const lines = body.split('\n').map((l) => l.trim());
	const bulletLines: string[] = [];
	const normalLines: string[] = [];

	for (const line of lines) {
		if (line.startsWith('- ')) {
			bulletLines.push(line.slice(2)); // remove "- "
		} else if (line) {
			normalLines.push(line);
		}
	}

	return {
		paragraph: normalLines.join(' '), // or join with "\n\n" if you want breaks
		bullets: bulletLines,
	};
}

function LinkifiedText({ text }: { text: string }) {
	const urlRegex = /((?:https?:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s])/gi;
	const parts = text.split(urlRegex);

	return (
		<>
			{parts.map((part, i) => {
				if (urlRegex.test(part)) {
					urlRegex.lastIndex = 0;
					const href = part.startsWith('http') ? part : `https://${part}`;

					return (
						<a
							key={i}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
						>
							{part}
						</a>
					);
				}

				urlRegex.lastIndex = 0;
				return <span key={i}>{part}</span>;
			})}
		</>
	);
}
