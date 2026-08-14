const ChatInputHeader = ({ title }: { title: string }) => {
	return (
		<div className="p-5 text-center">
			<h1 className="text-4xl">{title}</h1>
		</div>
	);
};

export default ChatInputHeader;
