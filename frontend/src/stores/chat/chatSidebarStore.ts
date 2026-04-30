import { create } from 'zustand';
import { ChatSidebarStore } from './types';

export const useChatSidebarStore = create<ChatSidebarStore>((set) => ({
	isOpen: true,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
