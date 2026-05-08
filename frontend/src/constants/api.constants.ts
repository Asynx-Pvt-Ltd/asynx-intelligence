export const API_ENDPOINTS = {
	NEXT_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
	SERVER_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
	CHAT: {
		STREAM: '/chat/stream',
		RESPONSE: '/chat/response',
		HISTORY: '/chat/history',
		MESSAGES: '/messages',
	},

	RAG: {
		UPLOAD: '/rag/upload',
		DELETE: `/rag/delete`,
	},
} as const;
