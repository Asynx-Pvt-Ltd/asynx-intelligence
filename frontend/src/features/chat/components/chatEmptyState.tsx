import EmptyState from '@/src/components/chat/EmptyState';

interface ChatEmptyStateProps {
	onSelectPrompt: (prompt: string) => void;
}

export default function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
	return <EmptyState onSelectPrompt={onSelectPrompt} />;
}
