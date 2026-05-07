'use client';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Plus } from 'lucide-react';
import {
	useId,
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
} from 'react';

export type UploadingFile = {
	id: string;
	file: File;
	progress: number;
	status: 'uploading' | 'uploaded' | 'error';
	fileId: string;
	fileName: string;
	error?: string;
	vectorIndex?: string;
	documentIds?: string[];
	conversationId?: string;
	fileUrl?: string;
};

export type DocumentUploaderProps = {
	files: UploadingFile[];
	onFilesSelected: (files: File[]) => void;
	onRemoveFile?: (id: string) => void;
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	className?: string;
};

export function DocumentUploader({
	onFilesSelected,
	accept = '.pdf,application/pdf',
	multiple = true,
	disabled = false,
	className,
}: DocumentUploaderProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFiles = (fileList: FileList | null) => {
		if (!fileList || disabled) return;

		const nextFiles = Array.from(fileList);
		if (nextFiles.length === 0) return;

		onFilesSelected(nextFiles);
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		handleFiles(event.target.files);
		event.target.value = '';
	};

	const openFilePicker = () => {
		if (disabled) return;
		inputRef.current?.click();
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
		handleFiles(event.dataTransfer.files);
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		if (!disabled) setIsDragging(true);
	};

	const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
	};

	return (
		<div
			className={cn('flex flex-col gap-2', className)}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
		>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				onChange={handleInputChange}
				className="sr-only"
				aria-hidden="true"
				tabIndex={-1}
			/>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					title="Add files"
					size="icon"
					disabled={disabled}
					onClick={openFilePicker}
					aria-label="Attach file"
					className={cn(
						'h-9 w-9 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
						isDragging && 'border-primary bg-muted text-foreground',
					)}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
