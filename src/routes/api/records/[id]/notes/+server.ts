import { json, type RequestHandler } from '@sveltejs/kit';
import { addNote } from '$lib/server/db.js';

export const POST: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return json({ error: 'Record ID is required' }, { status: 400 });
	}

	try {
		const { author, content } = await request.json();
		if (!content || !content.trim()) {
			return json({ error: 'Note content is required' }, { status: 400 });
		}

		const newNote = await addNote(id, {
			author: author || 'Staff',
			content: content.trim()
		});

		if (!newNote) {
			return json({ error: 'Record not found' }, { status: 404 });
		}

		return json(newNote, { status: 201 });
	} catch (err) {
		console.error('Error adding note:', err);
		return json({ error: 'Failed to add note' }, { status: 500 });
	}
};
