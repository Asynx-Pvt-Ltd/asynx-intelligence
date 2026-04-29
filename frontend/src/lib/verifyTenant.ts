import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function requireTenantAuth() {
	const { userId, orgId } = await auth();

	if (!userId) {
		return {
			error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		};
	}

	if (!orgId) {
		return {
			error: NextResponse.json(
				{ error: 'No active organization selected' },
				{ status: 400 },
			),
		};
	}

	return { userId, orgId };
}
