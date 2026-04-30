export interface PendingPromptState {
	pendingPrompt: string;
	setPendingPrompt: (prompt: string) => void;
	clearPendingPrompt: () => void;
}

export interface ChatSidebarStore {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}
