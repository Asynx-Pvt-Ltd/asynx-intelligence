import { useEffect } from 'react';
import { useChatStore } from '@/src/stores/chat/chatStore';
import { useUploadStore } from '@/src/stores/document/uploadStore';
import type { ChatSubmitPayload } from '../../types/chatTypes';
import type { ChatModel } from '../../types/chatModels';

interface UsePendingPromptInitProps {
	isHydrating: boolean;
	selectedModel: ChatModel;
	sendMessage: (payload: ChatSubmitPayload) => Promise<void>;
	initializedRef: React.MutableRefObject<boolean>;
}

export const usePendingPromptInit = ({
	isHydrating,
	selectedModel,
	sendMessage,
	initializedRef,
}: UsePendingPromptInitProps) => {
	const { pendingPrompt, clearPendingPrompt } = useChatStore((state) => state);
	const { files } = useUploadStore((s) => s);

	useEffect(() => {
		if (initializedRef.current) return;
		if (!pendingPrompt || isHydrating) return;

		initializedRef.current = true;
		clearPendingPrompt();

		void sendMessage({
			prompt: pendingPrompt,
			files,
			model: selectedModel,
		});
	}, [
		pendingPrompt,
		isHydrating,
		clearPendingPrompt,
		files,
		selectedModel,
		sendMessage,
		initializedRef,
	]);
};
