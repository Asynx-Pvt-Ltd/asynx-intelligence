export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
	role: MessageRole;
	content: string;
}

export interface ChatRequest {
	messages: Message[];
	model_name?: string;
	vector_index?: string | null;
	k?: number;
	kwargs?: Record<string, any>;
}

export interface ChatResponse {
	content: string;
	model_name: string;
	usage?: Record<string, any> | null;
	reasoning_content?: string | null;
}

export interface StreamTokenChunk {
	token: string;
}
