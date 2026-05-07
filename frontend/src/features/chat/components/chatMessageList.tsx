import { Message } from '../types/chatTypes';
import { AttachedFile } from '../../documents/types/documentTypes';
import { FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import UserMessageBubble from './userMessageBubble';
import AssisstantMessageBubble from './assisstantMessageBubble';

interface ChatMessageListProps {
	messages: Message[];
	isLoading: boolean;
}

const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
	return (
		<>
			{messages.map((message, index) => {
				const isUser = message.role === 'user';
				return (
					<div
						key={`${message.role}-${index}`}
						className={cn(
							'relative max-w-[80%] rounded-2xl px-4 py-3 text-chat-text-primary',
							isUser ? 'ml-auto bg-chat-user' : ' bg-chat-assistant',
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
						<div>{message.content || (isLoading ? 'Thinking...' : '')}</div>

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
				);
			})}
		</>
	);
};

export default ChatMessageList;
