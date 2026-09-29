import type { PageServerLoad } from './$types.js';
import { getAllRecords, getRecentRecords } from '$lib/server/db.js';
import type { RecordFilters, RecordType, RecordStatus } from '$lib/types.js';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') || undefined;
	const recordType = (url.searchParams.get('recordType') as RecordType | 'all') || undefined;
	const status = (url.searchParams.get('status') as RecordStatus | 'all') || undefined;
	const state = url.searchParams.get('state') || undefined;
	const sortBy = (url.searchParams.get('sortBy') as RecordFilters['sortBy']) || 'lastAccessedAt';
	const sortOrder = (url.searchParams.get('sortOrder') as RecordFilters['sortOrder']) || 'desc';

	const filters: RecordFilters = {
		query,
		recordType,
		status,
		state,
		sortBy,
		sortOrder
	};

	const [records, recentRecords] = await Promise.all([
		getAllRecords(filters),
		getRecentRecords(8)
	]);

	return {
		records,
		recentRecords,
		filters
	};
};
