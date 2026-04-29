import Navbar from './navbar';
import StarterChatInput from './starterChatInput';
import StarterChatWrapper from './starterChatWrapper';

export function Home() {
	return (
		<main className="min-h-screen space-y-5">
			<Navbar />
			<StarterChatWrapper>
				<StarterChatInput />
			</StarterChatWrapper>
		</main>
	);
}
