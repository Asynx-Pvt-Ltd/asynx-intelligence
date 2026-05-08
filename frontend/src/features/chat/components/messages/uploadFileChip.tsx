import { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { FileText } from 'lucide-react';
import { Message } from '../../types/chatTypes';

const UploadFileChip = ({ message }: { message: Message }) => {
	return (
		<>
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
							</div>
						),
					)}
				</div>
			)}
		</>
	);
};

export default UploadFileChip;
