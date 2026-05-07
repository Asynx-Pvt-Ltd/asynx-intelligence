import { Message } from '../types/chatTypes';
import { AttachedFile } from '../../documents/types/documentTypes';
import { FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import UserMessageBubble from './userMessageBubble';
import AssisstantMessageBubble from './assisstantMessageBubble';
import { structureAnswer } from '../utils/structureAnswer';

interface ChatMessageListProps {
	messages: Message[];
	isLoading: boolean;
	streamingIndex: number | null;
}

const ChatMessageList = ({
	messages,
	isLoading,
	streamingIndex,
}: ChatMessageListProps) => {
	return (
		<>
			{messages.map((message, index) => {
				const isUser = message.role === 'user';
				const isStreamingAssistant = !isUser && index === streamingIndex;

				const structured =
					!isUser && message.content ? structureAnswer(message.content) : null;

				const isLast = index === messages.length - 1;

				let assistantText: string | null = null;
				if (!isUser && structured) {
					if (structured.type === 'general' && structured.rawText) {
						assistantText = structured.rawText;
					}
				}

				return (
					<div
						key={`${message.role}-${index}`}
						className={cn(
							'relative max-w-[80%] rounded-2xl px-4 py-3 text-chat-text-primary',
							isUser ? 'ml-auto bg-chat-user' : 'bg-chat-assistant',
						)}
					>
						{isUser ? (
							<div className="absolute -left-3 -top-3">
								<UserMessageBubble />
							</div>
						) : (
							<div className="absolute -left-3 -top-3">
								<AssisstantMessageBubble />
							</div>
						)}

						<div className="space-y-2">
							{isUser ? (
								// USER: always show raw text
								<div>{message.content}</div>
							) : isStreamingAssistant ? (
								// ASSISTANT WHILE STREAMING: do NOT show JSON, just a placeholder
								<div className="text-sm text-muted-foreground">Thinking...</div>
							) : !structured || assistantText !== null ? (
								// ASSISTANT AFTER STREAM: show plain text (rawText or content)
								<div>
									{assistantText ??
										message.content ??
										(isLoading && isLast ? 'Thinking...' : '')}
								</div>
							) : (
								// ASSISTANT EXPLANATION: structured view (only after stream)
								<div className="space-y-3">
									{structured.title && (
										<h2 className="text-sm font-semibold text-foreground">
											{structured.title}
										</h2>
									)}

									{structured.overview && (
										<p className="text-sm text-muted-foreground whitespace-pre-line">
											{structured.overview}
										</p>
									)}

									{structured.sections &&
										structured.sections
											.filter((s) => s.heading.toLowerCase() !== 'overview')
											.map((section) => (
												<section key={section.heading} className="space-y-1">
													<h3 className="text-xs font-medium text-foreground">
														{section.heading}
													</h3>
													<p className="text-sm text-muted-foreground whitespace-pre-line">
														{section.body}
													</p>
												</section>
											))}

									{structured.bullets && structured.bullets.length > 0 && (
										<ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
											{structured.bullets.map((b, i) => (
												<li key={i}>{b}</li>
											))}
										</ul>
									)}
								</div>
							)}

							{/* attached files unchanged */}
							{message.attached_files && message.attached_files.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1">
									{message.attached_files.map(
										(file: AttachedFile, fileIndex: number) => (
											<div
												key={`${file.file_id}-${fileIndex}`}
												className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-2 py-1 text-xs"
											>
												<FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
												<span className="max-w-32 truncate font-medium">
													{file.file_name}
												</span>
												{file.document_ids && file.document_ids.length > 0 && (
													<span className="text-muted-foreground">
														({file.document_ids.length})
													</span>
												)}
											</div>
										),
									)}
								</div>
							)}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default ChatMessageList;
