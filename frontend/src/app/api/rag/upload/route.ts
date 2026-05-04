import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { ragUploadSchema } from '@/src/validations/rag.validator';
import z from 'zod';
import { requireTenantAuth } from '@/src/lib/verifyTenant';

const API_BASE = API_ENDPOINTS.SERVER_URL;

export async function POST(request: NextRequest) {
	try {
		const { orgId, error } = await requireTenantAuth();

		if (error) {
			return error;
		}

		const formData = await request.formData();

		const parsed = ragUploadSchema.safeParse({
			file: formData.get('file'),
			vector_index: `org_${orgId}`,
			chunk_size: formData.get('chunk_size') ?? 1000,
			chunk_overlap: formData.get('chunk_overlap') ?? 200,
			parser_strategy: formData.get('parser_strategy') ?? 'speed',
		});

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					fields: z.treeifyError(parsed.error),
				},
				{ status: 400 },
			);
		}

		const { file, vector_index, chunk_size, chunk_overlap, parser_strategy } =
			parsed.data;

		const forwardFormData = new FormData();
		forwardFormData.append('file', file, file.name);
		forwardFormData.append('vector_index', vector_index);
		forwardFormData.append('chunk_size', String(chunk_size));
		forwardFormData.append('chunk_overlap', String(chunk_overlap));
		forwardFormData.append('parser_strategy', parser_strategy);

		const url = `${API_BASE}${API_ENDPOINTS.RAG.UPLOAD}`;

		const backendResponse = await fetch(url, {
			method: 'POST',
			body: forwardFormData,
			cache: 'no-store',
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					error: data?.detail || data?.error || 'Failed to upload document',
				},
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json(data, { status: backendResponse.status });
	} catch (error) {
		console.error('RAG upload proxy error:', error);

		return NextResponse.json(
			{ error: 'Internal proxy server error' },
			{ status: 500 },
		);
	}
}
