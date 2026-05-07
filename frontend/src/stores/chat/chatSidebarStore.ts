import { create } from 'zustand';
import { ChatSidebarStoreProps } from './types';

export const useChatSidebarStore = create<ChatSidebarStoreProps>((set) => ({
	isOpen: true,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
