import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/src/constants/api.constants';

const SERVER_URL = API_ENDPOINTS.SERVER_URL;

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const body = await request.json();
		const { id } = await context.params;

		const backendResponse = await fetch(
			`${SERVER_URL}${API_ENDPOINTS.CHAT.HISTORY}/${id}/messages`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				cache: 'no-store',
			},
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					error: data?.detail || data?.error || 'Failed to save message',
				},
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json(data, { status: backendResponse.status });
	} catch (error) {
		console.error('Proxy add message error:', error);

		return NextResponse.json(
			{ error: 'Internal proxy server error' },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const body = await request.json();
		const { id } = await context.params;

		// body should contain: { message_id: string, file_id: string }
		const backendResponse = await fetch(
			`${SERVER_URL}${API_ENDPOINTS.CHAT.HISTORY}/${id}/messages`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				cache: 'no-store',
			},
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					error:
						data?.detail ||
						data?.error ||
						'Failed to delete attached file from message',
				},
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json(data, { status: backendResponse.status });
	} catch (error) {
		console.error('Proxy delete attached file error:', error);

		return NextResponse.json(
			{ error: 'Internal proxy server error' },
			{ status: 500 },
		);
	}
}
