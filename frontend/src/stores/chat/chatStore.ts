import { create } from 'zustand';
import { PendingPromptState } from './types';

export const useChatStore = create<PendingPromptState>((set) => ({
	pendingPrompt: '',
	setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
	clearPendingPrompt: () => set({ pendingPrompt: '' }),
}));
