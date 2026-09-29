import { json, type RequestHandler } from '@sveltejs/kit';
import { getAllRecords, createRecord } from '$lib/server/db.js';
import type { RecordFilters, RecordType, RecordStatus } from '$lib/types.js';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('query') || undefined;
	const recordType = (url.searchParams.get('recordType') as RecordType | 'all') || undefined;
	const status = (url.searchParams.get('status') as RecordStatus | 'all') || undefined;
	const state = url.searchParams.get('state') || undefined;
	const sortBy = (url.searchParams.get('sortBy') as RecordFilters['sortBy']) || undefined;
	const sortOrder = (url.searchParams.get('sortOrder') as RecordFilters['sortOrder']) || undefined;

	const filters: RecordFilters = {
		query,
		recordType,
		status,
		state,
		sortBy,
		sortOrder
	};

	const records = await getAllRecords(filters);
	return json(records);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		if (!body.name || !body.recordType) {
			return json({ error: 'Name and recordType are required fields.' }, { status: 400 });
		}
		const newRecord = await createRecord(body);
		return json(newRecord, { status: 201 });
	} catch (err) {
		console.error('Error creating record:', err);
		return json({ error: 'Failed to create record' }, { status: 500 });
	}
};
