import ThinkingIndicator from '@/src/components/chat/ThinkingIndicator';

export default function ChatThinkingState() {
	return (
		<div className="flex items-start gap-3 px-4 py-3">
			<div className="h-8 w-8 rounded-full shrink-0 shimmer" />
			<div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
				<ThinkingIndicator />
			</div>
		</div>
	);
}
