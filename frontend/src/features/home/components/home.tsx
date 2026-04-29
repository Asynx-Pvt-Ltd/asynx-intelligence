import StarterChatInput from './starterChatInput';
import StarterChatWrapper from './starterChatWrapper';

export function Home() {
	return (
		<main className="min-h-screen space-y-5">
			<StarterChatWrapper>
				<StarterChatInput />
			</StarterChatWrapper>
		</main>
	);
}
