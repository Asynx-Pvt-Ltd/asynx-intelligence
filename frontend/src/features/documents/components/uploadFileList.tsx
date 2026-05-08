import CircularProgress from '@/src/components/ui/circularProgressBar';
import { cn } from '@/src/lib/utils';
import { FileText, X } from 'lucide-react';
import { DocumentUploaderProps } from './documentUploader';

type UploadFileListProps = {
	files: DocumentUploaderProps['files'];
	onRemoveFile: DocumentUploaderProps['onRemoveFile'];
	disabled: DocumentUploaderProps['disabled'];
};

const UploadFileList = ({
	files,
	onRemoveFile,
	disabled,
}: UploadFileListProps) => {
	return (
		<div className="p-3 flex flex-wrap gap-2">
			{files.map((item) => (
				<div
					key={item.id}
					className={cn(
						'inline-flex max-w-full items-center gap-2 rounded-full border bg-muted/60 px-3 py-1.5 text-sm',
						item.status === 'error' && 'border-destructive/40 bg-destructive/5',
					)}
				>
					<FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

					<span className="max-w-45 truncate text-sm font-medium">
						{item.file.name}
					</span>

					<CircularProgress progress={item.progress} status={item.status} />

					{onRemoveFile ? (
						<button
							type="button"
							onClick={() => onRemoveFile(item)}
							disabled={disabled}
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
							aria-label={`Remove ${item.file.name}`}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					) : null}
				</div>
			))}
		</div>
	);
};

export default UploadFileList;
