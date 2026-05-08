import { API_ENDPOINTS } from '@/src/constants/api.constants';
import type { Message } from '@/src/features/chat/types/chatTypes';
import { Conversation, HistoryMessage } from '../types/chatHistory';
import { AttachedFile } from '@/src/features/documents/types/documentTypes';

const API_BASE = API_ENDPOINTS.NEXT_URL;

export async function getConversations(): Promise<Conversation[]> {
	const url = `${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}`;

	const res = await fetch(url, {
		method: 'GET',
		cache: 'no-store',
	});

	if (!res.ok) {
		throw new Error('Failed to fetch conversations');
	}

	return res.json();
}

export async function getConversation(
	conversationId: string,
): Promise<Conversation> {
	const res = await fetch(
		`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}/${conversationId}`,
		{
			method: 'GET',
			cache: 'no-store',
		},
	);

	if (!res.ok) {
		throw new Error('Failed to fetch conversation');
	}

	return res.json();
}

export async function createConversation(payload: {
	title: string;
	is_draft?: boolean;
}) {
	const res = await fetch(`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
	});

	if (!res.ok) {
		throw new Error('Failed to create conversation');
	}

	return res.json();
}

export async function updateConversation(
	conversationId: string,
	payload: {
		title?: string;
		is_draft?: boolean;
		vector_index?: string;
		document_ids?: string[];
	},
) {
	const res = await fetch(
		`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}/${conversationId}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		},
	);

	if (!res.ok) {
		throw new Error('Failed to update conversation');
	}

	return res.json();
}

export async function addConversationMessage(
	conversationId: string,
	payload: {
		role: 'user' | 'assistant' | 'system';
		content: string;
		attached_files?: AttachedFile[];
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
		`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}/${conversationId}/messages`,
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

export async function deleteConversation(conversationId: string) {
	const res = await fetch(
		`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}/${conversationId}`,
		{
			method: 'DELETE',
			cache: 'no-store',
		},
	);

	if (!res.ok) {
		throw new Error('Failed to delete conversation');
	}

	return res.json();
}

export async function deleteAttachedFileFromMessage({
	conversationId,
	messageId,
	fileId,
}: {
	conversationId: string;
	messageId: string;
	fileId: string;
}) {
	const res = await fetch(
		`${API_BASE}${API_ENDPOINTS.CHAT.HISTORY}/${conversationId}${API_ENDPOINTS.CHAT.MESSAGES}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message_id: messageId,
				file_id: fileId,
			}),
			cache: 'no-store',
		},
	);

	if (!res.ok) {
		throw new Error('Failed to delete uploaded file');
	}

	return res.json();
}

export function mapHistoryToUiMessages(messages: HistoryMessage[]): Message[] {
	return messages.map((message) => ({
		id: message.id,
		role: message.role,
		content: message.content,
		attached_files: message.attached_files,
		reasoning_content: message.reasoning_content ?? undefined,
		model_name: message.model_name ?? undefined,
		usage: message.usage ?? undefined,
	}));
}
