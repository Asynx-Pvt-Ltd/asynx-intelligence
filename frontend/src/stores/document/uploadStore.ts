import { create } from 'zustand';
import { UploadState } from './types';

export const useUploadStore = create<UploadState>((set) => ({
	files: [],
	setFiles: (files) => set({ files }),
	addFile: (file) => set((state) => ({ files: [...state.files, file] })),
	updateFile: (id, partial) =>
		set((state) => ({
			files: state.files.map((f) => (f.id === id ? { ...f, ...partial } : f)),
		})),
	removeFile: (id) =>
		set((state) => ({
			files: state.files.filter((f) => f.id !== id),
		})),
	clearFiles: () => set({ files: [] }),
}));
