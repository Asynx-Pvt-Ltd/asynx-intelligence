import { z } from 'zod';

export const chatRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['system', 'user', 'assistant']),
				content: z.string().min(1),
			}),
		)
		.min(1),
	model_name: z.string().default('gpt-5-mini'),
	conversation_id: z.string({ message: 'Conversation id is required' }).min(1),
	k: z.number().int().min(1).max(20).default(10),
	kwargs: z.record(z.string(), z.unknown()).default({}),
});
