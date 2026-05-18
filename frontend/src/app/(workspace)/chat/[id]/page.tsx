import ChatScreen from '@/src/features/chat/components/chatScreen';
import { ChatModel } from '@/src/features/chat/types/chatModels';

type PageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ model: ChatModel }>;
};

export default async function ChatPage({ params, searchParams }: PageProps) {
	const { id } = await params;
	const { model } = await searchParams;

	return (
		<div className="h-full">
			<ChatScreen chatId={id} model={model} />
		</div>
	);
}
