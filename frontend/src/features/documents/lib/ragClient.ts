import { API_ENDPOINTS } from '@/src/constants/api.constants';
import type {
	RagDeletePayload,
	RagDeleteResponse,
	RagUploadPayload,
	RagUploadResponse,
	UploadRagDocumentWithProgressPayload,
} from '../types/documentTypes';

const NEXT_URL = API_ENDPOINTS.NEXT_URL;

export async function uploadRagDocument({
	file,
	conversation_id,
	chunk_size = 1000,
	chunk_overlap = 200,
	parser_strategy = 'speed',
}: RagUploadPayload): Promise<RagUploadResponse> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('chunk_size', String(chunk_size));
	formData.append('chunk_overlap', String(chunk_overlap));
	formData.append('parser_strategy', parser_strategy);
	if (conversation_id) {
		formData.append('conversation_id', conversation_id);
	}

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

export function uploadRagDocumentWithProgress({
	file,
	conversation_id,
	chunk_size = 1000,
	chunk_overlap = 200,
	parser_strategy = 'speed',
	onProgress,
}: UploadRagDocumentWithProgressPayload): Promise<RagUploadResponse> {
	return new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('chunk_size', String(chunk_size));
		formData.append('chunk_overlap', String(chunk_overlap));
		formData.append('parser_strategy', parser_strategy);
		if (conversation_id) {
			formData.append('conversation_id', conversation_id);
		}

		const url = `${NEXT_URL}${API_ENDPOINTS.RAG.UPLOAD}`;
		const xhr = new XMLHttpRequest();

		xhr.open('POST', url, true);

		xhr.upload.addEventListener('progress', (event) => {
			if (!event.lengthComputable) return;

			const progress = Math.round((event.loaded / event.total) * 100);
			onProgress?.(progress);
		});

		xhr.onload = () => {
			try {
				const data = JSON.parse(xhr.responseText) as RagUploadResponse & {
					error?: string;
				};

				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(data);
					return;
				}

				reject(new Error(data?.error || 'Failed to upload document'));
			} catch {
				reject(new Error('Invalid upload response'));
			}
		};

		xhr.onerror = () => {
			reject(new Error('Network error while uploading document'));
		};

		xhr.onabort = () => {
			reject(new Error('Upload aborted'));
		};

		xhr.send(formData);
	});
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
