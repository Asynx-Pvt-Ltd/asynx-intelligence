import { cn } from '@/src/lib/utils';
import { Message } from '../../types/chatTypes';
import { structureAnswer } from '../../utils/structureAnswer';
import AssisstantMessageBubble from './assisstantMessageBubble';
import ChatMessageItem from './chatMessageItem';
import UploadFileChip from './uploadFileChip';
import UserMessageBubble from './userMessageBubble';
import { Dispatch, SetStateAction } from 'react';
import { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { deleteRagDocuments } from '@/src/features/documents/lib/ragClient';
import { deleteAttachedFileFromMessage } from '../../lib/chatHistory';

interface ChatMessageListProps {
	messages: Message[];
	isLoading: boolean;
	streamingIndex: number | null;
	setMessage: Dispatch<SetStateAction<Message[]>>;
	vectorIndex: string | undefined;
	conversationId: string;
}

const ChatMessageList = ({
	messages,
	isLoading,
	streamingIndex,
	setMessage,
	vectorIndex,
	conversationId,
}: ChatMessageListProps) => {
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
								(ath) => ath.file_id !== file.file_id,
							),
						}
					: msg,
			),
		);

		if (!file.document_ids || !vectorIndex) return;
		try {
			await Promise.all([
				deleteAttachedFileFromMessage({
					conversationId: conversationId,
					fileId: file.file_id,
					messageId: messageId,
				}),
				deleteRagDocuments({
					document_ids: file.document_ids,
					vector_index: vectorIndex,
				}),
			]);
		} catch (error) {
			console.log(error);
		}
	};
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
						className={cn('flex w-full mb-5')}
					>
						<div
							className={cn(
								'relative inline-block rounded-2xl px-4 py-3 text-chat-text-primary',
								isUser ? 'bg-chat-user' : 'bg-chat-assistant',
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
							<div>
								<ChatMessageItem
									assistantText={assistantText}
									isLast={isLast}
									isLoading={isLoading}
									isStreamingAssistant={isStreamingAssistant}
									isUser={isUser}
									message={message}
									structured={structured}
								/>
								<UploadFileChip
									message={message}
									index={index}
									onRemoveFile={removeUploadedFile}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
};

export default ChatMessageList;
