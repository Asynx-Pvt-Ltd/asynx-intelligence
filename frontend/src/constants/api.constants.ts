export const API_ENDPOINTS = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
	CHAT: {
		STREAM: '/chat/stream',
		RESPONSE: '/chat/response',
		HISTORY: '/chat/history',
	},

	RAG: {
		UPLOAD: '/rag/upload',
		DELETE_FILE: `/rag/delete`,
	},
} as const;
