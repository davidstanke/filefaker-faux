import { json, type RequestHandler } from '@sveltejs/kit';
import { getRecordById, updateRecord, deleteRecord } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;
	if (!id) {
		return json({ error: 'Record ID is required' }, { status: 400 });
	}

	const markAccessed = url.searchParams.get('markAccessed') !== 'false';
	const record = await getRecordById(id, markAccessed);

	if (!record) {
		return json({ error: 'Record not found' }, { status: 404 });
	}

	return json(record);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return json({ error: 'Record ID is required' }, { status: 400 });
	}

	try {
		const updates = await request.json();
		const updated = await updateRecord(id, updates);
		if (!updated) {
			return json({ error: 'Record not found' }, { status: 404 });
		}
		return json(updated);
	} catch (err) {
		console.error('Error updating record:', err);
		return json({ error: 'Failed to update record' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) {
		return json({ error: 'Record ID is required' }, { status: 400 });
	}

	const success = await deleteRecord(id);
	if (!success) {
		return json({ error: 'Record not found' }, { status: 404 });
	}

	return json({ success: true, message: `Record ${id} deleted` });
};
