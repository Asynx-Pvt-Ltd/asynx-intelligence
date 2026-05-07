export interface ChatStoreProps {
	pendingPrompt: string;
	setPendingPrompt: (prompt: string) => void;
	clearPendingPrompt: () => void;
	conversationsDirty: number;
	bumpConversationsDirty: () => void;
}

export interface ChatSidebarStoreProps {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}
