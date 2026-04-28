export const API_ENDPOINTS = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
	CHAT: {
		STREAM: '/api/chat/stream',
		RESPONSE: '/api/chat/response',
	},

	RAG: {
		UPLOAD: '/api/rag/upload',
		DELETE_FILE: `/api/rag/delete`,
	},
} as const;
