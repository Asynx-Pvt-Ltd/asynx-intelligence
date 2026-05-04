import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { ragDeleteSchema } from '@/src/validations/rag.validator';
import z from 'zod';

const API_BASE = API_ENDPOINTS.SERVER_URL;

export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();

		const parsed = ragDeleteSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					fields: z.treeifyError(parsed.error),
				},
				{ status: 400 },
			);
		}

		const url = `${API_BASE}${API_ENDPOINTS.RAG.DELETE}`;

		const backendResponse = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(parsed.data),
			cache: 'no-store',
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					error: data?.detail || data?.error || 'Failed to delete document(s)',
				},
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json(data, { status: backendResponse.status });
	} catch (error) {
		console.error('RAG delete proxy error:', error);

		return NextResponse.json(
			{ error: 'Internal proxy server error' },
			{ status: 500 },
		);
	}
}
