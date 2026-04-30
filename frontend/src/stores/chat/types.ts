export interface PendingPromptState {
	pendingPrompt: string;
	setPendingPrompt: (prompt: string) => void;
	clearPendingPrompt: () => void;
}
