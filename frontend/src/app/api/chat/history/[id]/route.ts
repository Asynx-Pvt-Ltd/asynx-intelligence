import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { requireTenantAuth } from '@/src/lib/verifyTenant';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = API_ENDPOINTS.SERVER_URL;

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_: NextRequest, context: RouteContext) {
	const { error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const { id } = await context.params;

	const upstream = await fetch(
		`${BACKEND_URL}${API_ENDPOINTS.CHAT.HISTORY}/${id}`,
		{
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			cache: 'no-store',
		},
	);

	const text = await upstream.text();

	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'application/json',
		},
	});
}

export async function PATCH(req: NextRequest, context: RouteContext) {
	const { error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const { id } = await context.params;
	const json = await req.json().catch(() => ({}));

	const payload = {
		...json,
	};

	const upstream = await fetch(
		`${BACKEND_URL}${API_ENDPOINTS.CHAT.HISTORY}/${id}`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(payload),
			cache: 'no-store',
		},
	);

	const text = await upstream.text();

	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'application/json',
		},
	});
}

export async function DELETE(_: NextRequest, context: RouteContext) {
	const { error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const { id } = await context.params;

	const upstream = await fetch(
		`${BACKEND_URL}${API_ENDPOINTS.CHAT.HISTORY}/${id}`,
		{
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
			},
			cache: 'no-store',
		},
	);

	const text = await upstream.text();

	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'application/json',
		},
	});
}
