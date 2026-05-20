import { useParams } from '@/src/hooks/useParams';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { ChatModel } from '../../types/chatModels';

const MODEL_QUERY_KEY = 'model';

const getModelFromParams = (
	params: ReadonlyURLSearchParams,
	fallback: ChatModel,
): ChatModel => {
	const value = params.get(MODEL_QUERY_KEY) as ChatModel;
	return value ? value : fallback;
};

interface UseChatModelSyncProps {
	model: ChatModel;
}

export const useChatModelSync = ({ model }: UseChatModelSyncProps) => {
	const { params, pathname, router } = useParams();

	const [selectedModel, setSelectedModel] = useState<ChatModel>(() =>
		getModelFromParams(params, model),
	);

	const handleModelChange = useCallback(
		(nextModel: ChatModel) => {
			setSelectedModel(nextModel);

			const nextParams = new URLSearchParams(params.toString());
			nextParams.set(MODEL_QUERY_KEY, nextModel);

			router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
		},
		[params, pathname, router],
	);

	useEffect(() => {
		const modelFromUrl = getModelFromParams(params, model);
		setSelectedModel((prev) => (prev === modelFromUrl ? prev : modelFromUrl));
	}, [params, model]);

	return {
		selectedModel,
		handleModelChange,
	};
};
