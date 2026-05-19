export const CHAT_MODELS = [
	{
		provider: 'OPENAI',
		options: [
			{ label: 'GPT-5 Mini', value: 'gpt-5-mini' },
			{ label: 'GPT-5.1', value: 'gpt-5.1' },
		],
	},
	{
		provider: 'ANTHROPIC',
		options: [
			// { label: 'Claude Opus 4.5', value: 'claude-opus-4.5' },
			{ label: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5' },
		],
	},
	// {
	// 	provider: 'xAI',
	// 	options: [{ label: 'Grok 4 Fast', value: 'grok-4-fast-non-reasoning' }],
	// },
] as const;

export type ChatModelGroup = (typeof CHAT_MODELS)[number];
export type ChatModelOption = ChatModelGroup['options'][number];
export type ChatModelId = ChatModelOption['value'];
export type ChatModelProvider = ChatModelGroup['provider'];

export const DEFAULT_CHAT_MODEL: ChatModelId = 'gpt-5-mini';

export const FLAT_CHAT_MODELS = CHAT_MODELS.flatMap((group) =>
	group.options.map((option) => ({
		provider: group.provider,
		...option,
	})),
);
