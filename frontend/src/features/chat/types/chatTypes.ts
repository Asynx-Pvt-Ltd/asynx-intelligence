import { AttachedFile } from '@/src/features/documents/types/documentTypes';
import { UploadingFile } from '../../documents/components/documentUploader';

export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
	role: MessageRole;
	content: string;
	attached_files?: AttachedFile[];
}

export interface ChatRequest {
	messages: Message[];
	conversation_id: string;
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

export interface ChatSubmitPayload {
	prompt: string;
	files: UploadingFile[];
}

export interface StreamTokenChunk {
	token: string;
	reasoning: string;
}

export interface StreamResult {
	fullContent: string;
	fullReasoning: string;
}
