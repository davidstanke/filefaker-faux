import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSeedRecords } from '../src/lib/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'records.json');

export function seed() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	const records = generateSeedRecords();
	fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
	console.log(`Successfully seeded ${records.length} records into ${DATA_FILE}`);
}

seed();
