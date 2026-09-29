import fs from 'fs';
import path from 'path';
import type { RecordItem, RecordFilters, Note } from '$lib/types.js';
import { generateSeedRecords } from '$lib/seedData.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'records.json');

// In-memory cache synced with disk to optimize response time
let cachedRecords: RecordItem[] | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function ensureDataFile(): void {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	if (!fs.existsSync(DATA_FILE)) {
		const seeds = generateSeedRecords();
		fs.writeFileSync(DATA_FILE, JSON.stringify(seeds, null, 2), 'utf-8');
		cachedRecords = seeds;
	}
}

export function loadRecordsFromDisk(): RecordItem[] {
	ensureDataFile();
	if (cachedRecords) {
		return cachedRecords;
	}
	try {
		const content = fs.readFileSync(DATA_FILE, 'utf-8');
		cachedRecords = JSON.parse(content) as RecordItem[];
		return cachedRecords;
	} catch (err) {
		console.error('Failed reading records from disk:', err);
		const seeds = generateSeedRecords();
		cachedRecords = seeds;
		return seeds;
	}
}

async function persistRecordsToDisk(records: RecordItem[]): Promise<void> {
	cachedRecords = records;
	// Queue writes atomically to prevent file corruption
	writeQueue = writeQueue.then(async () => {
		try {
			ensureDataFile();
			const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
			await fs.promises.writeFile(tempFile, JSON.stringify(records, null, 2), 'utf-8');
			await fs.promises.rename(tempFile, DATA_FILE);
		} catch (err) {
			console.error('Failed persisting records to disk:', err);
		}
	});
	return writeQueue;
}

export async function getAllRecords(filters?: RecordFilters): Promise<RecordItem[]> {
	let records = [...loadRecordsFromDisk()];

	if (!filters) {
		return records;
	}

	const { query, recordType, status, state, sortBy = 'lastAccessedAt', sortOrder = 'desc' } = filters;

	if (recordType && recordType !== 'all') {
		records = records.filter((r) => r.recordType === recordType);
	}

	if (status && status !== 'all') {
		records = records.filter((r) => r.status === status);
	}

	if (state && state.trim()) {
		const st = state.trim().toLowerCase();
		records = records.filter((r) =>
			r.addresses.some((a) => a.state.toLowerCase() === st)
		);
	}

	if (query && query.trim()) {
		const q = query.trim().toLowerCase();
		records = records.filter((r) => {
			if (r.name.toLowerCase().includes(q)) return true;
			if (r.accountNumber.toLowerCase().includes(q)) return true;
			if (r.category.toLowerCase().includes(q)) return true;
			if (r.email.toLowerCase().includes(q)) return true;
			if (r.phone.toLowerCase().includes(q)) return true;
			if (r.description.toLowerCase().includes(q)) return true;
			if (r.department && r.department.toLowerCase().includes(q)) return true;
			if (r.title && r.title.toLowerCase().includes(q)) return true;
			if (
				r.addresses.some(
					(a) =>
						a.city.toLowerCase().includes(q) ||
						a.state.toLowerCase().includes(q) ||
						a.street.toLowerCase().includes(q) ||
						a.zip.toLowerCase().includes(q)
				)
			) {
				return true;
			}
			if (
				r.contacts.some(
					(c) =>
						c.firstName.toLowerCase().includes(q) ||
						c.lastName.toLowerCase().includes(q) ||
						c.title.toLowerCase().includes(q) ||
						c.email.toLowerCase().includes(q)
				)
			) {
				return true;
			}
			if (
				r.notes.some(
					(n) =>
						n.content.toLowerCase().includes(q) ||
						n.author.toLowerCase().includes(q)
				)
			) {
				return true;
			}
			return false;
		});
	}

	// Sorting
	records.sort((a, b) => {
		let valA: string | number = '';
		let valB: string | number = '';

		switch (sortBy) {
			case 'name':
				valA = a.name.toLowerCase();
				valB = b.name.toLowerCase();
				break;
			case 'accountNumber':
				valA = a.accountNumber.toLowerCase();
				valB = b.accountNumber.toLowerCase();
				break;
			case 'createdAt':
				valA = new Date(a.createdAt).getTime();
				valB = new Date(b.createdAt).getTime();
				break;
			case 'status':
				valA = a.status;
				valB = b.status;
				break;
			case 'lastAccessedAt':
			default:
				valA = new Date(a.lastAccessedAt).getTime();
				valB = new Date(b.lastAccessedAt).getTime();
				break;
		}

		if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
		if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});

	return records;
}

export async function getRecentRecords(limit = 8): Promise<RecordItem[]> {
	const records = [...loadRecordsFromDisk()];
	records.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
	return records.slice(0, limit);
}

export async function getRecordById(id: string, markAccessed = false): Promise<RecordItem | null> {
	const records = loadRecordsFromDisk();
	const index = records.findIndex((r) => r.id === id);
	if (index === -1) {
		return null;
	}

	const record = { ...records[index] };
	if (markAccessed) {
		record.lastAccessedAt = new Date().toISOString();
		records[index] = record;
		await persistRecordsToDisk(records);
	}
	return record;
}

export async function createRecord(
	input: Omit<RecordItem, 'id' | 'accountNumber' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>
): Promise<RecordItem> {
	const records = loadRecordsFromDisk();

	// Generate unique ID and Account Number
	const maxIdNum = records.reduce((max, r) => {
		const match = r.id.match(/\d+/);
		const num = match ? parseInt(match[0], 10) : 1000;
		return num > max ? num : max;
	}, 1000);

	const newId = `REC-${maxIdNum + 1}`;
	const newAccountNum = `ACC-${Math.floor(10000 + Math.random() * 90000)}`;
	const now = new Date().toISOString();

	const newRecord: RecordItem = {
		...input,
		id: newId,
		accountNumber: newAccountNum,
		addresses: input.addresses || [],
		contacts: input.contacts || [],
		notes: input.notes || [],
		createdAt: now,
		updatedAt: now,
		lastAccessedAt: now
	};

	records.unshift(newRecord);
	await persistRecordsToDisk(records);
	return newRecord;
}

export async function updateRecord(
	id: string,
	updates: Partial<Omit<RecordItem, 'id' | 'accountNumber' | 'createdAt'>>
): Promise<RecordItem | null> {
	const records = loadRecordsFromDisk();
	const index = records.findIndex((r) => r.id === id);
	if (index === -1) {
		return null;
	}

	const now = new Date().toISOString();
	const updatedRecord: RecordItem = {
		...records[index],
		...updates,
		updatedAt: now,
		lastAccessedAt: now
	};

	records[index] = updatedRecord;
	await persistRecordsToDisk(records);
	return updatedRecord;
}

export async function deleteRecord(id: string): Promise<boolean> {
	const records = loadRecordsFromDisk();
	const index = records.findIndex((r) => r.id === id);
	if (index === -1) {
		return false;
	}

	records.splice(index, 1);
	await persistRecordsToDisk(records);
	return true;
}

export async function addNote(
	recordId: string,
	noteInput: { author: string; content: string }
): Promise<Note | null> {
	const records = loadRecordsFromDisk();
	const index = records.findIndex((r) => r.id === recordId);
	if (index === -1) {
		return null;
	}

	const now = new Date().toISOString();
	const newNote: Note = {
		id: `NOTE-${recordId}-${Date.now()}`,
		author: noteInput.author.trim() || 'Staff',
		timestamp: now,
		content: noteInput.content.trim()
	};

	const record = { ...records[index] };
	record.notes = [...record.notes, newNote];
	record.updatedAt = now;
	record.lastAccessedAt = now;

	records[index] = record;
	await persistRecordsToDisk(records);
	return newNote;
}

export async function resetDatabase(): Promise<RecordItem[]> {
	const seeds = generateSeedRecords();
	await persistRecordsToDisk(seeds);
	return seeds;
}
