'use client';

import { UserAvatar } from '@clerk/nextjs';
import { cn } from '@/src/lib/utils';

interface UserMessageProps {
	content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
	return (
		<div className="flex items-end justify-end gap-2.5 py-3 group animate-fade-up">
			<div
				className={cn(
					'max-w-[75%] rounded-2xl rounded-br-sm',
					'bg-muted border border-border',
					'px-4 py-3',
				)}
			>
				<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
					{content}
				</p>
			</div>

			<div className="shrink-0 self-end pb-0.5">
				<UserAvatar
					appearance={{
						elements: {
							avatarBox: 'w-7 h-7 rounded-full',
						},
					}}
				/>
			</div>
		</div>
	);
}
