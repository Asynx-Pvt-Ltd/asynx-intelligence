export type ParserStrategy = 'quality' | 'speed';

export interface RagUploadPayload {
	file: File;
	vector_index: string;
	chunk_size?: number;
	chunk_overlap?: number;
	parser_strategy?: ParserStrategy;
}

export interface RagUploadResponse {
	vector_index: string;
	document_ids: string[];
	num_chunks: number;
	message: string;
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
