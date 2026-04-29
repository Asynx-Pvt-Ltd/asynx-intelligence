import { API_ENDPOINTS } from '@/src/constants/api.constants';
import { requireTenantAuth } from '@/src/lib/verifyTenant';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = API_ENDPOINTS.BASE_URL;

export async function GET(req: NextRequest) {
	const { userId, orgId, error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const searchParams = new URL(req.url).searchParams;
	const skip = searchParams.get('skip') ?? '0';
	const limit = searchParams.get('limit') ?? '100';

	const upstreamUrl = new URL(`${BACKEND_URL}${API_ENDPOINTS.CHAT.HISTORY}`);
	upstreamUrl.searchParams.set('user_id', userId);
	upstreamUrl.searchParams.set('org_id', orgId);
	upstreamUrl.searchParams.set('skip', skip);
	upstreamUrl.searchParams.set('limit', limit);

	const upstream = await fetch(upstreamUrl.toString(), {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
		cache: 'no-store',
	});

	const text = await upstream.text();

	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'application/json',
		},
	});
}

export async function POST(req: NextRequest) {
	const { userId, orgId, error } = await requireTenantAuth();

	if (error) {
		return error;
	}

	const json = await req.json().catch(() => ({}));

	const payload = {
		title: json?.title ?? 'New Chat',
		user_id: userId,
		org_id: orgId,
	};

	const upstream = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.HISTORY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
		cache: 'no-store',
	});

	const text = await upstream.text();

	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'application/json',
		},
	});
}
