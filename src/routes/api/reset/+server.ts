import { json, type RequestHandler } from '@sveltejs/kit';
import { resetDatabase } from '$lib/server/db.js';

export const POST: RequestHandler = async () => {
	try {
		const seeds = await resetDatabase();
		return json({ success: true, count: seeds.length, message: 'Database reset to initial 100 mock records' });
	} catch (err) {
		console.error('Error resetting database:', err);
		return json({ error: 'Failed to reset database' }, { status: 500 });
	}
};
