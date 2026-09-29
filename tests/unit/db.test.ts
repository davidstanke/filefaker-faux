import { describe, it, expect, beforeEach } from 'vitest';
import { generateSeedRecords } from '../../src/lib/seedData.js';
import {
	getAllRecords,
	getRecentRecords,
	getRecordById,
	createRecord,
	updateRecord,
	deleteRecord,
	addNote
} from '../../src/lib/server/db.js';

describe('Seed Data Generator', () => {
	it('generates exactly 100 realistic records', () => {
		const records = generateSeedRecords();
		expect(records).toHaveLength(100);
	});

	it('produces 65 business records and 35 individual records', () => {
		const records = generateSeedRecords();
		const businesses = records.filter((r) => r.recordType === 'business');
		const individuals = records.filter((r) => r.recordType === 'individual');

		expect(businesses).toHaveLength(65);
		expect(individuals).toHaveLength(35);
	});

	it('ensures each record has valid IDs, account numbers, and contacts', () => {
		const records = generateSeedRecords();

		for (const record of records) {
			expect(record.id).toMatch(/^REC-\d+$/);
			expect(record.accountNumber).toMatch(/^ACC-\d+$/);
			expect(record.name).toBeTruthy();
			expect(record.email).toContain('@');
			expect(record.phone).toBeTruthy();
			expect(record.addresses.length).toBeGreaterThan(0);
			expect(record.addresses[0].city).toBeTruthy();
			expect(record.addresses[0].state).toBeTruthy();
			expect(record.addresses[0].zip).toBeTruthy();

			// Valid ISO date strings
			expect(new Date(record.createdAt).getTime()).not.toBeNaN();
			expect(new Date(record.updatedAt).getTime()).not.toBeNaN();
			expect(new Date(record.lastAccessedAt).getTime()).not.toBeNaN();

			// Timestamped notes check
			expect(record.notes.length).toBeGreaterThanOrEqual(2);
			for (const note of record.notes) {
				expect(note.id).toBeTruthy();
				expect(note.author).toBeTruthy();
				expect(note.content).toBeTruthy();
				expect(new Date(note.timestamp).getTime()).not.toBeNaN();
			}
		}
	});
});

describe('Database Storage & Query Service', () => {
	it('fetches all records and supports type filtering', async () => {
		const all = await getAllRecords();
		expect(all.length).toBeGreaterThanOrEqual(100);

		const businesses = await getAllRecords({ recordType: 'business' });
		expect(businesses.every((r) => r.recordType === 'business')).toBe(true);

		const individuals = await getAllRecords({ recordType: 'individual' });
		expect(individuals.every((r) => r.recordType === 'individual')).toBe(true);
	});

	it('filters records by status', async () => {
		const active = await getAllRecords({ status: 'active' });
		expect(active.length).toBeGreaterThan(0);
		expect(active.every((r) => r.status === 'active')).toBe(true);

		const leads = await getAllRecords({ status: 'lead' });
		expect(leads.every((r) => r.status === 'lead')).toBe(true);
	});

	it('filters records by state', async () => {
		const maRecords = await getAllRecords({ state: 'MA' });
		expect(maRecords.length).toBeGreaterThan(0);
		for (const r of maRecords) {
			expect(r.addresses.some((a) => a.state.toUpperCase() === 'MA')).toBe(true);
		}
	});

	it('performs multi-field search query matching', async () => {
		const all = await getAllRecords();
		const sample = all[0];

		// Query by exact name substring
		const searchName = sample.name.slice(0, 4);
		const resultsByName = await getAllRecords({ query: searchName });
		expect(resultsByName.some((r) => r.id === sample.id)).toBe(true);

		// Query by account number
		const resultsByAcc = await getAllRecords({ query: sample.accountNumber });
		expect(resultsByAcc.some((r) => r.id === sample.id)).toBe(true);

		// Query by note content if available
		if (sample.notes.length > 0) {
			const noteWord = sample.notes[0].content.split(' ')[0];
			const resultsByNote = await getAllRecords({ query: noteWord });
			expect(resultsByNote.length).toBeGreaterThan(0);
		}
	});

	it('sorts records ascending and descending', async () => {
		const sortedAsc = await getAllRecords({ sortBy: 'name', sortOrder: 'asc' });
		const sortedDesc = await getAllRecords({ sortBy: 'name', sortOrder: 'desc' });

		expect(sortedAsc.length).toBeGreaterThan(0);
		expect(sortedDesc.length).toBeGreaterThan(0);

		if (sortedAsc.length > 1) {
			expect(sortedAsc[0].name.toLowerCase() <= sortedAsc[1].name.toLowerCase()).toBe(true);
			expect(sortedDesc[0].name.toLowerCase() >= sortedDesc[1].name.toLowerCase()).toBe(true);
		}
	});

	it('retrieves recently accessed records in descending access order', async () => {
		const recent = await getRecentRecords(5);
		expect(recent.length).toBe(5);

		for (let i = 0; i < recent.length - 1; i++) {
			const t1 = new Date(recent[i].lastAccessedAt).getTime();
			const t2 = new Date(recent[i + 1].lastAccessedAt).getTime();
			expect(t1).toBeGreaterThanOrEqual(t2);
		}
	});

	it('handles complete CRUD lifecycle: create, read, update, add note, delete', async () => {
		// 1. Create
		const newRecord = await createRecord({
			recordType: 'business',
			name: 'Test FileFaker Dynamics LLC',
			category: 'Software Testing',
			status: 'active',
			email: 'testing@filefaker.local',
			phone: '(555) 000-1122',
			description: 'Test business record created by unit test suite.',
			addresses: [
				{
					id: 'ADDR-TEST-1',
					street: '123 Test St',
					city: 'Boston',
					state: 'MA',
					zip: '02108',
					country: 'USA',
					type: 'primary'
				}
			],
			contacts: [
				{
					id: 'CON-TEST-1',
					firstName: 'Alice',
					lastName: 'Tester',
					title: 'QA Lead',
					email: 'alice@filefaker.local',
					phone: '(555) 000-1133',
					isPrimary: true
				}
			],
			notes: []
		});

		expect(newRecord.id).toMatch(/^REC-\d+$/);
		expect(newRecord.accountNumber).toMatch(/^ACC-\d+$/);
		expect(newRecord.name).toBe('Test FileFaker Dynamics LLC');

		// 2. Read
		const fetched = await getRecordById(newRecord.id, true);
		expect(fetched).not.toBeNull();
		expect(fetched?.name).toBe('Test FileFaker Dynamics LLC');

		// 3. Update
		const updated = await updateRecord(newRecord.id, {
			description: 'Updated description for test record.'
		});
		expect(updated?.description).toBe('Updated description for test record.');

		// 4. Add Note
		const addedNote = await addNote(newRecord.id, {
			author: 'Test Auditor',
			content: 'Automated test note appended during lifecycle verification.'
		});
		expect(addedNote?.id).toBeTruthy();
		expect(addedNote?.author).toBe('Test Auditor');

		const fetchedWithNote = await getRecordById(newRecord.id);
		expect(fetchedWithNote?.notes.some((n) => n.content.includes('Automated test note'))).toBe(true);

		// 5. Delete
		const deleteSuccess = await deleteRecord(newRecord.id);
		expect(deleteSuccess).toBe(true);

		const postDelete = await getRecordById(newRecord.id);
		expect(postDelete).toBeNull();
	});
});
