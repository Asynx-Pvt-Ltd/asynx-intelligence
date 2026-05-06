import { Message } from '../types/chatTypes';
import { AttachedFile } from '../../documents/types/documentTypes';
import { FileText } from 'lucide-react';

interface ChatMessageListProps {
	messages: Message[];
	isLoading: boolean;
}

const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
	return (
		<>
			{messages.map((message, index) => (
				<div
					key={`${message.role}-${index}`}
					className={
						message.role === 'user'
							? 'ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground'
							: 'max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-foreground'
					}
				>
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
			))}
		</>
	);
};

export default ChatMessageList;
