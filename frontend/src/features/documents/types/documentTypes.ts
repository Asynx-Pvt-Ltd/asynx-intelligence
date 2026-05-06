export type ParserStrategy = 'quality' | 'speed';

export interface RagUploadPayload {
	file: File;
	conversation_id: string;
	chunk_size?: number;
	chunk_overlap?: number;
	parser_strategy?: ParserStrategy;
}

export interface UploadRagDocumentWithProgressPayload extends RagUploadPayload {
	onProgress?: (progress: number) => void;
}

export interface RagUploadResponse {
	vector_index: string;
	document_ids: string[];
	num_chunks: number;
	conversation_id: string;
	message: string;
	file_id: string;
	file_name: string;
}

export interface RagDeletePayload {
	vector_index: string;
	document_ids: string[];
}

export interface RagDeleteResponse {
	vector_index: string;
	deleted_ids: string[];
	message: string;
}

export interface AttachedFile {
	file_id: string;
	file_name: string;
	document_ids?: string[];
}
