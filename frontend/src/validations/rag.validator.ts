import { z } from 'zod';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const ragUploadSchema = z
	.object({
		file: z
			.instanceof(File, { message: 'A PDF file is required.' })
			.refine((file) => file.size > 0, {
				message: 'Uploaded file is empty.',
			})
			.refine((file) => file.type === 'application/pdf', {
				message: 'Only PDF files are allowed.',
			})
			.refine((file) => file.name.toLowerCase().endsWith('.pdf'), {
				message: 'File must have a .pdf extension.',
			})
			.refine((file) => file.size <= MAX_FILE_SIZE, {
				message: 'File size must be 25MB or less.',
			}),

		org_id: z.string({ message: 'organization id is required' }).min(1),
		user_id: z.string({ message: 'user id is required' }).min(1),
		conversation_id: z.string().optional(),

		chunk_size: z.coerce
			.number({
				message: 'chunk_size must be a number.',
			})
			.int('chunk_size must be an integer.')
			.min(100, 'chunk_size must be at least 100.')
			.max(5000, 'chunk_size must be at most 5000.'),

		chunk_overlap: z.coerce
			.number({
				message: 'chunk_overlap must be a number.',
			})
			.int('chunk_overlap must be an integer.')
			.min(0, 'chunk_overlap cannot be negative.')
			.max(2000, 'chunk_overlap is too large.'),

		parser_strategy: z.enum(['quality', 'speed'], {
			message: 'parser_strategy must be either quality or speed.',
		}),
	})
	.refine((data) => data.chunk_overlap < data.chunk_size, {
		message: 'chunk_overlap must be smaller than chunk_size.',
		path: ['chunk_overlap'],
	});

export const ragDeleteSchema = z.object({
	vector_index: z
		.string({ message: 'vector_index is required.' })
		.trim()
		.min(1, 'vector_index is required.')
		.max(100, 'vector_index is too long.')
		.regex(/^[a-zA-Z0-9_-]+$/, {
			message:
				'vector_index can only contain letters, numbers, underscores, and hyphens.',
		}),

	document_ids: z
		.array(
			z
				.string({ message: 'Each document id must be a string.' })
				.trim()
				.min(1, 'Document id cannot be empty.'),
		)
		.min(1, 'At least one document id is required.'),
});
