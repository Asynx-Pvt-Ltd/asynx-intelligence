import { create } from 'zustand';
import { ChatStoreProps } from './types';

export const useChatStore = create<ChatStoreProps>((set) => ({
	pendingPrompt: '',
	setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
	clearPendingPrompt: () => set({ pendingPrompt: '' }),
	conversationsDirty: 0,
	bumpConversationsDirty: () =>
		set((state) => ({ conversationsDirty: state.conversationsDirty + 1 })),
}));
