// src/features/chat/lib/chatHistoryApi.ts
import { API_ENDPOINTS } from '@/src/constants/api.constants';
import type { Message } from '@/src/features/chat/types/chatTypes';
import { Conversation, HistoryMessage } from '../types/chatHistory';

const API_BASE = API_ENDPOINTS.BASE_URL;

export async function getConversation(
	conversationId: string,
): Promise<Conversation> {
	const res = await fetch(`${API_BASE}/chat/history/${conversationId}`, {
		method: 'GET',
		cache: 'no-store',
	});

	if (!res.ok) {
		throw new Error('Failed to fetch conversation');
	}

	return res.json();
}

export async function createConversation(payload?: {
	title?: string;
	user_id?: string;
	org_id?: string;
}) {
	const res = await fetch(`${API_BASE}/chat/history`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
	});

	if (!res.ok) {
		throw new Error('Failed to create conversation');
	}

	return res.json();
}

export async function addConversationMessage(
	conversationId: string,
	payload: {
		role: 'user' | 'assistant' | 'system';
		content: string;
		model_name?: string;
		reasoning_content?: string;
		usage?: {
			input_tokens?: number | null;
			output_tokens?: number | null;
			total_tokens?: number | null;
		} | null;
	},
) {
	const res = await fetch(
		`${API_BASE}/chat/history/${conversationId}/messages`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				conversation_id: conversationId,
				...payload,
			}),
		},
	);

	if (!res.ok) {
		throw new Error('Failed to save message');
	}

	return res.json();
}

export function mapHistoryToUiMessages(messages: HistoryMessage[]): Message[] {
	return messages.map((message) => ({
		role: message.role,
		content: message.content,
		reasoning_content: message.reasoning_content ?? undefined,
		model_name: message.model_name ?? undefined,
		usage: message.usage ?? undefined,
	}));
}
