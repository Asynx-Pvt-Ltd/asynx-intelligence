import { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { FileText, Trash2 } from 'lucide-react';
import { Message } from '../../types/chatTypes';
import { Button } from '@/src/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog';

const UploadFileChip = ({
	message,
	index,
	onRemoveFile,
}: {
	message: Message;
	index: number;
	onRemoveFile: ({
		file,
		index,
		messageId,
	}: {
		file: AttachedFile;
		index: number;
		messageId: string;
	}) => void;
}) => {
	if (!message.attached_files || message.attached_files.length === 0) {
		return null;
	}

	return (
		<div className="mt-2 flex flex-wrap gap-1">
			{message.attached_files.map((file: AttachedFile, fileIndex: number) => {
				return (
					<div
						key={`${file.file_id}-${fileIndex}`}
						className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-2 py-1 text-xs"
					>
						<FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
						<span className="font-medium max-w-40 truncate">
							{file.file_name}
						</span>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon-xs"
									className="rounded-full bg-destructive hover:brightness-125 text-white hover:bg-destructive hover:text-white"
								>
									<Trash2 className="h-1 w-1" />
								</Button>
							</AlertDialogTrigger>

							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete this file?</AlertDialogTitle>
									<AlertDialogDescription className="text-red-400">
										When you delete this file, the AI will lose access to its
										context for this conversation. This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive! text-destructive hover:bg-destructive/90"
										onClick={() =>
											onRemoveFile({
												file: file,
												index: index,
												messageId: message.id,
											})
										}
									>
										Delete file
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				);
			})}
		</div>
	);
};

export default UploadFileChip;
