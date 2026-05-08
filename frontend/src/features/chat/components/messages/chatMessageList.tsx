import { cn } from '@/src/lib/utils';
import { Message } from '../../types/chatTypes';
import { structureAnswer } from '../../utils/structureAnswer';
import AssisstantMessageBubble from './assisstantMessageBubble';
import ChatMessageItem from './chatMessageItem';
import UploadFileChip from './uploadFileChip';
import UserMessageBubble from './userMessageBubble';

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
								<UploadFileChip message={message} />
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
};

export default ChatMessageList;
