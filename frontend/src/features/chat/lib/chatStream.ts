import type {
	ChatRequest,
	StreamResult,
	StreamTokenChunk,
} from '@/src/features/chat/types/chatTypes';

export async function streamChatResponse(
	payload: ChatRequest,
	onChunk?: (chunk: { token?: string; reasoning?: string }) => void,
): Promise<StreamResult> {
	const response = await fetch('/api/chat/stream', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || 'Failed to stream chat response');
	}

	if (!response.body) {
		throw new Error('No response body');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	let fullContent = '';
	let fullReasoning = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			const events = buffer.split('\n\n');
			buffer = events.pop() ?? '';

			for (const event of events) {
				const lines = event.split('\n');

				for (const line of lines) {
					const trimmed = line.trim();

					if (!trimmed.startsWith('data:')) continue;

					const data = trimmed.slice(5).trim();

					if (data === '[DONE]') {
						return { fullContent, fullReasoning };
					}

					const parsed = JSON.parse(data) as StreamTokenChunk;

					if (parsed.token) {
						fullContent += parsed.token;
						onChunk?.({ token: parsed.token });
					}
					if (parsed.reasoning) {
						fullReasoning += parsed.reasoning;
						onChunk?.({ reasoning: parsed.reasoning });
					}
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
	return { fullContent, fullReasoning };
}
