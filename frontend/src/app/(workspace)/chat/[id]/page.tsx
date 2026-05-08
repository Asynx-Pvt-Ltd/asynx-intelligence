import ChatScreen from '@/src/features/chat/components/chatScreen';

export default async function ChatPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<div className="h-full p-4 flex flex-col">
			<div className="flex-1 bg-chat-screen rounded-lg overflow-hidden">
				<ChatScreen chatId={id} />
			</div>
		</div>
	);
}
