import { UploadingFile } from '@/src/features/documents/components/documentUploader';

export interface UploadState {
	files: UploadingFile[];
	setFiles: (files: UploadingFile[]) => void;
	addFile: (file: UploadingFile) => void;
	updateFile: (id: string, partial: Partial<UploadingFile>) => void;
	removeFile: (id: string) => void;
	clearFiles: () => void;
}
