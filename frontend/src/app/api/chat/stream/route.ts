import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { requireTenantAuth } from '@/src/lib/verifyTenant';
import { chatRequestSchema } from '@/src/validations/chat.validator';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const BACKEND_URL = API_ENDPOINTS.BASE_URL;

export async function POST(req: NextRequest) {
	const { error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const json = await req.json().catch(() => null);
	const validated = chatRequestSchema.safeParse(json);

	if (!validated.success) {
		return NextResponse.json(
			{ error: 'Invalid request', details: z.treeifyError(validated.error) },
			{ status: 400 },
		);
	}
	const { data } = validated;

	const payload = {
		...data,
	};

	const upstream = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.STREAM}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
		},
		body: JSON.stringify(payload),
		cache: 'no-store',
	});

	if (!upstream.ok || !upstream.body) {
		const errorText = await upstream.text();
		return new NextResponse(errorText || 'Upstream error', {
			status: upstream.status,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	return new NextResponse(upstream.body, {
		status: 200,
		headers: {
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
		},
	});
}
