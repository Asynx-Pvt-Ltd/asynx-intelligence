import { Message } from '../../types/chatTypes';
import { StructuredView } from '../../types/structureAnswer.types';

interface ChatMessageItemProps {
	isUser: boolean;
	message: Message;
	isStreamingAssistant: boolean;
	structured: StructuredView | null;
	assistantText: string | null;
	isLoading: boolean;
	isLast: boolean;
}

const ChatMessageItem = ({
	isUser,
	message,
	isStreamingAssistant,
	structured,
	assistantText,
	isLoading,
	isLast,
}: ChatMessageItemProps) => {
	return (
		<>
			{isUser ? (
				<div className="text-sm sm:text-[15px]">{message.content}</div>
			) : isStreamingAssistant ? (
				<div className="text-xs sm:text-sm text-muted-foreground">
					Thinking...
				</div>
			) : !structured || assistantText !== null ? (
				<div className="text-sm sm:text-base md:text-[15px] lg:text-[16px] leading-relaxed">
					{assistantText ??
						message.content ??
						(isLoading && isLast ? 'Thinking...' : '')}
				</div>
			) : (
				<div className="space-y-4">
					{structured.title && (
						<h2 className="text-base sm:text-lg font-semibold text-foreground">
							{structured.title}
						</h2>
					)}

					{structured.overview && (
						<p className="text-sm sm:text-base md:text-[15px] lg:text-[16px] text-muted-foreground whitespace-pre-line leading-relaxed">
							{structured.overview}
						</p>
					)}

					{structured.sections &&
						structured.sections
							.filter((s) => s.heading.toLowerCase() !== 'overview')
							.map((section) => (
								<section key={section.heading} className="space-y-1">
									<h3 className="text-xs sm:text-sm font-medium text-foreground">
										{section.heading}
									</h3>
									<p className="text-sm sm:text-base md:text-[15px] lg:text-[16px] text-muted-foreground whitespace-pre-line leading-relaxed">
										{section.body}
									</p>
								</section>
							))}

					{structured.bullets && structured.bullets.length > 0 && (
						<ul className="list-disc pl-5 space-y-1 text-sm sm:text-base md:text-[15px] lg:text-[16px] text-muted-foreground">
							{structured.bullets.map((b, i) => (
								<li key={i}>{b}</li>
							))}
						</ul>
					)}
				</div>
			)}
		</>
	);
};

export default ChatMessageItem;
