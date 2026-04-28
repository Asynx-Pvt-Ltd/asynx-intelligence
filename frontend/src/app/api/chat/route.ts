import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { chatRequestSchema } from '@/src/validations/chat.validator';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const BACKEND_URL = API_ENDPOINTS.BASE_URL;

export async function POST(req: NextRequest) {
	const { userId, orgId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!orgId) {
		return NextResponse.json(
			{ error: 'No active organization selected' },
			{ status: 400 },
		);
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
		vector_index: `tenant_${orgId}`,
	};

	const upstream = await fetch(`${BACKEND_URL}/chat/stream`, {
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
