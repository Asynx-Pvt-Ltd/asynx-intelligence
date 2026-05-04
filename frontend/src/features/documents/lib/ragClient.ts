import { API_ENDPOINTS } from '@/src/constants/api.constants';
import type {
	RagDeletePayload,
	RagDeleteResponse,
	RagUploadPayload,
	RagUploadResponse,
} from '../types/documentTypes';

const NEXT_URL = API_ENDPOINTS.NEXT_URL;

export async function uploadRagDocument({
	file,
	vector_index,
	chunk_size = 1000,
	chunk_overlap = 200,
	parser_strategy = 'speed',
}: RagUploadPayload): Promise<RagUploadResponse> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('vector_index', vector_index);
	formData.append('chunk_size', String(chunk_size));
	formData.append('chunk_overlap', String(chunk_overlap));
	formData.append('parser_strategy', parser_strategy);

	const url = `${NEXT_URL}${API_ENDPOINTS.RAG.UPLOAD}`;
	const res = await fetch(url, {
		method: 'POST',
		body: formData,
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data?.error || 'Failed to upload document');
	}

	return data;
}

export async function deleteRagDocuments(
	payload: RagDeletePayload,
): Promise<RagDeleteResponse> {
	const url = `${NEXT_URL}${API_ENDPOINTS.RAG.DELETE}`;

	const res = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data?.error || 'Failed to delete documents');
	}

	return data;
}
