export interface Conversation {
	id: string;
	title: string;
	user_id: string | null;
	org_id: string | null;
	created_at: string;
	updated_at: string;
	messages?: HistoryMessage[];
}

export interface HistoryMessage {
	id: string;
	conversation_id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	model_name?: string | null;
	reasoning_content?: string | null;
	usage?: {
		input_tokens?: number | null;
		output_tokens?: number | null;
		total_tokens?: number | null;
	} | null;
	created_at: string;
}
