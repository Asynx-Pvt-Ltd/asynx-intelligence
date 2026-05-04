import ChatScreen from '@/src/features/chat/components/chatScreen';

export default async function ChatPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<div className="h-full">
			<ChatScreen chatId={id} />
		</div>
	);
}
