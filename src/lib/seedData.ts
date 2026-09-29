import type { RecordItem, Address, ContactPerson, Note, RecordType, RecordStatus } from './types.js';

const businessPrefixes = [
	'Apex', 'Omni', 'Sterling', 'Pinnacle', 'Vanguard', 'Heritage', 'Nexus', 'Cascade',
	'Meridian', 'Summit', 'Keystone', 'Atlas', 'Paramount', 'Beacon', 'Zenith', 'Acme',
	'Global', 'Metro', 'Pacific', 'Atlantic', 'Frontier', 'Synergy', 'Precision', 'Quantum',
	'Enterprise', 'Benchmark', 'Venture', 'Integrity', 'Tri-State', 'National', 'Continental', 'Liberty'
];

const businessSuffixes = [
	'Solutions', 'Enterprises', 'Technologies', 'Consulting Group', 'Industries', 'Systems',
	'Logistics', 'Holdings', 'Manufacturing', 'Supply Co.', 'Associates', 'Communications',
	'Design Works', 'Paper & Packaging', 'Printing Corp', 'Capital Partners', 'Precision Machining',
	'Hardware Specialists', 'Networks', 'Data Dynamics', 'Import/Export', 'Legal Partners'
];

const categories = [
	'Technology & IT', 'Manufacturing', 'Consulting', 'Legal Services', 'Accounting & Tax',
	'Logistics & Freight', 'Office Supply', 'Architecture & Engineering', 'Commercial Printing',
	'Healthcare & Medical', 'Telecommunications', 'Financial Services', 'Real Estate Commercial',
	'Advertising & Media', 'Industrial Distribution'
];

const firstNames = [
	'Arthur', 'Eleanor', 'Franklin', 'Dorothy', 'Walter', 'Beatrice', 'Harold', 'Mildred',
	'Raymond', 'Clara', 'Eugene', 'Florence', 'Harvey', 'Irene', 'Stanley', 'Louise',
	'Russell', 'Martha', 'Douglas', 'Evelyn', 'Gerald', 'Gladys', 'Vernon', 'Hazel',
	'Norman', 'Edith', 'Clifford', 'Bernice', 'Lester', 'Marion', 'Warren', 'Loretta',
	'David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Jessica', 'William', 'Elizabeth'
];

const lastNames = [
	'Pendleton', 'Kaufman', 'Montgomery', 'Harrington', 'Thorne', 'Vanderbilt', 'Sinclair',
	'Prescott', 'Sterling', 'Wellington', 'Fairchild', 'Blackwood', 'Whitmore', 'Caldwell',
	'Ellington', 'MacKenzie', 'Bradford', 'Winslow', 'Mercer', 'Dunbar', 'Holloway',
	'Gallagher', 'Bancroft', 'Cheney', 'Hampton', 'Kingsley', 'Radcliffe', 'Stanhope',
	'Thurston', 'Underwood', 'Vance', 'Wakefield', 'Yates', 'Zimmerman', 'Armstrong'
];

const streets = [
	'Market St', 'Industrial Pkwy', 'Commerce Ave', 'Grand Blvd', 'Federal Way',
	'Main Street', 'Exchange Place', 'Tech Center Way', 'Corporate Dr', 'Foundry Lane',
	'Wharf Rd', 'Railroad Ave', 'Lincoln Expressway', 'State Route 10', 'Merchants Row'
];

const cities = [
	{ city: 'Boston', state: 'MA', zip: '02108' },
	{ city: 'Chicago', state: 'IL', zip: '60604' },
	{ city: 'Cleveland', state: 'OH', zip: '44114' },
	{ city: 'Philadelphia', state: 'PA', zip: '19103' },
	{ city: 'Pittsburgh', state: 'PA', zip: '15222' },
	{ city: 'Detroit', state: 'MI', zip: '48226' },
	{ city: 'Minneapolis', state: 'MN', zip: '55402' },
	{ city: 'Seattle', state: 'WA', zip: '98104' },
	{ city: 'Denver', state: 'CO', zip: '80202' },
	{ city: 'St. Louis', state: 'MO', zip: '63101' },
	{ city: 'Atlanta', state: 'GA', zip: '30303' },
	{ city: 'Dallas', state: 'TX', zip: '75201' },
	{ city: 'San Jose', state: 'CA', zip: '95113' },
	{ city: 'Portland', state: 'OR', zip: '97204' },
	{ city: 'Baltimore', state: 'MD', zip: '21202' }
];

const noteAuthors = [
	'J. Miller (Sales)', 'T. Henderson (Accts)', 'R. Davis (Ops)', 'M. Sterling (Executive)',
	'K. Vance (Support)', 'B. Kowalski (Billing)', 'A. Gomez (Logistics)', 'S. Vance (Account Mgr)'
];

const historicalNoteSnippets = [
	'Initial contact established via phone inquiry regarding inventory database software.',
	'Mailed physical software documentation binder and 3.5" installation floppy disks.',
	'Follow-up call with purchasing dept. Requested formal quotation with net-30 terms.',
	'Contract signed for 5-seat multi-user license. Database workstation setup scheduled.',
	'Received fax with updated office billing address and tax exemption certificate.',
	'Quarterly account review completed. Client reported satisfaction with backup routines.',
	'Inquired about network file sharing compatibility across local AppleTalk / Ethernet bridge.',
	'Annual maintenance agreement renewed through next fiscal calendar.',
	'Client reported modem dial-up connection timeout during overnight batch export. Resolved.',
	'Sent holiday gift basket and updated product catalog to principal contact.',
	'Account contact updated following reorganization of internal finance team.',
	'Requested duplicate copy of previous year annual statement for tax audit preparation.',
	'Upgraded license server. Validated record integrity across network file shares.',
	'Called to discuss custom reporting layout for monthly accounts receivable aging.',
	'Payment received via certified company check. Applied to open balance.'
];

function getRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPhone(areaCode: number): string {
	const mid = getRandomInt(200, 899);
	const line = getRandomInt(1000, 9999);
	return `(${areaCode}) ${mid}-${line}`;
}

export function generateSeedRecords(): RecordItem[] {
	const records: RecordItem[] = [];
	const baseNow = new Date('2026-09-29T16:00:00Z').getTime();

	for (let i = 1; i <= 100; i++) {
		const isBusiness = i <= 65;
		const id = `REC-${String(1000 + i)}`;
		const accountNumber = `ACC-${getRandomInt(10000, 99999)}`;
		const type: RecordType = isBusiness ? 'business' : 'individual';
		const statusList: RecordStatus[] = ['active', 'active', 'active', 'lead', 'inactive', 'archived'];
		const status: RecordStatus = getRandom(statusList);
		const category = getRandom(categories);

		let name = '';
		let title: string | undefined = undefined;
		let department: string | undefined = undefined;
		let website: string | undefined = undefined;

		const cityObj = getRandom(cities);
		const areaCode = getRandomInt(201, 899);
		const phone = formatPhone(areaCode);
		const fax = Math.random() > 0.3 ? formatPhone(areaCode) : undefined;

		if (isBusiness) {
			const prefix = getRandom(businessPrefixes);
			const suffix = getRandom(businessSuffixes);
			name = `${prefix} ${suffix}`;
			department = getRandom(['Commercial Accounts', 'Corporate HQ', 'Operations', 'Client Services']);
			const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
			website = `https://www.${slug}.com`;
		} else {
			const firstName = getRandom(firstNames);
			const lastName = getRandom(lastNames);
			name = `${firstName} ${lastName}`;
			title = getRandom([
				'Independent Consultant', 'Senior Attorney', 'Consulting Engineer',
				'Managing Director', 'Private Investor', 'Senior Architect', 'Certified Public Accountant'
			]);
		}

		const emailName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
		const email = `${emailName}@${isBusiness ? name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : 'mailservice.net'}`;

		const createdYear = getRandomInt(1994, 2024);
		const createdMonth = getRandomInt(1, 12);
		const createdDay = getRandomInt(1, 28);
		const createdAt = new Date(Date.UTC(createdYear, createdMonth - 1, createdDay, 10, 0, 0)).toISOString();

		const addresses: Address[] = [
			{
				id: `ADDR-${i}-1`,
				street: `${getRandomInt(10, 999)} ${getRandom(streets)}`,
				suite: Math.random() > 0.4 ? `Suite ${getRandomInt(100, 900)}` : undefined,
				city: cityObj.city,
				state: cityObj.state,
				zip: cityObj.zip,
				country: 'USA',
				type: 'primary'
			}
		];

		if (isBusiness && Math.random() > 0.4) {
			const altCity = getRandom(cities);
			addresses.push({
				id: `ADDR-${i}-2`,
				street: `${getRandomInt(10, 999)} ${getRandom(streets)}`,
				suite: `Dock ${getRandomInt(1, 12)}`,
				city: altCity.city,
				state: altCity.state,
				zip: altCity.zip,
				country: 'USA',
				type: 'shipping'
			});
		}

		const contacts: ContactPerson[] = [];
		if (isBusiness) {
			const numContacts = getRandomInt(1, 3);
			for (let c = 0; c < numContacts; c++) {
				const cFirst = getRandom(firstNames);
				const cLast = getRandom(lastNames);
				contacts.push({
					id: `CON-${i}-${c + 1}`,
					firstName: cFirst,
					lastName: cLast,
					title: getRandom([
						'Purchasing Manager', 'Accounts Payable Specialist', 'VP of Operations',
						'Office Administrator', 'Chief Information Officer', 'Comptroller'
					]),
					email: `${cFirst.toLowerCase()}.${cLast.toLowerCase()}@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
					phone: formatPhone(areaCode),
					isPrimary: c === 0
				});
			}
		} else {
			if (Math.random() > 0.5) {
				const aFirst = getRandom(firstNames);
				contacts.push({
					id: `CON-${i}-1`,
					firstName: aFirst,
					lastName: getRandom(lastNames),
					title: 'Executive Assistant / Contact',
					email: `${aFirst.toLowerCase()}@assistantmail.com`,
					phone: formatPhone(areaCode),
					isPrimary: false
				});
			}
		}

		const numNotes = getRandomInt(2, 6);
		const notes: Note[] = [];
		let noteYear = createdYear;

		for (let n = 0; n < numNotes; n++) {
			noteYear = Math.min(2026, noteYear + getRandomInt(1, 5));
			const noteMonth = getRandomInt(1, 12);
			const noteDay = getRandomInt(1, 28);
			const noteHour = getRandomInt(8, 17);
			const noteMin = getRandomInt(0, 59);
			const noteDate = new Date(Date.UTC(noteYear, noteMonth - 1, noteDay, noteHour, noteMin, 0));

			notes.push({
				id: `NOTE-${i}-${n + 1}`,
				author: getRandom(noteAuthors),
				timestamp: noteDate.toISOString(),
				content: getRandom(historicalNoteSnippets)
			});
		}

		notes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

		const description = isBusiness
			? `Commercial account established ${createdYear}. Primary partner for ${category.toLowerCase()} services in the ${cityObj.city} metropolitan area.`
			: `Key individual contact specialized in ${category.toLowerCase()}. Associated with regional business network since ${createdYear}.`;

		let lastAccessedOffsetMs: number;
		if (i <= 10) {
			lastAccessedOffsetMs = i * 45 * 60 * 1000;
		} else if (i <= 25) {
			lastAccessedOffsetMs = (i * 6) * 60 * 60 * 1000;
		} else {
			lastAccessedOffsetMs = (i * 3) * 24 * 60 * 60 * 1000;
		}
		const lastAccessedAt = new Date(baseNow - lastAccessedOffsetMs).toISOString();
		const updatedAt = notes.length > 0 ? notes[notes.length - 1].timestamp : createdAt;

		records.push({
			id,
			recordType: type,
			accountNumber,
			status,
			category,
			name,
			department,
			title,
			email,
			phone,
			fax,
			website,
			description,
			addresses,
			contacts,
			notes,
			createdAt,
			updatedAt,
			lastAccessedAt
		});
	}

	return records;
}
