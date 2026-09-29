import { json, type RequestHandler } from '@sveltejs/kit';
import { getRecentRecords } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ url }) => {
	const limitParam = url.searchParams.get('limit');
	const limit = limitParam ? parseInt(limitParam, 10) : 8;
	const records = await getRecentRecords(limit);
	return json(records);
};
