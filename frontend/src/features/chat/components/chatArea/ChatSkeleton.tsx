export const ChatSkeleton = () => {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-8">
			{[80, 60, 90, 50].map((w, i) => (
				<div
					key={i}
					className="h-12 rounded-2xl shimmer"
					style={{
						width: `${w}%`,
						alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
					}}
				/>
			))}
		</div>
	);
};
