<script lang="ts">
	import type { RecordItem, RecordFilters } from '$lib/types.js';

	interface Props {
		records: RecordItem[];
		selectedId?: string;
		onSelectRecord: (record: RecordItem) => void;
		sortBy?: RecordFilters['sortBy'];
		sortOrder?: RecordFilters['sortOrder'];
		onSort?: (field: NonNullable<RecordFilters['sortBy']>) => void;
	}

	let {
		records = [],
		selectedId,
		onSelectRecord,
		sortBy = 'lastAccessedAt',
		sortOrder = 'desc',
		onSort
	}: Props = $props();

	function formatTime(iso: string) {
		try {
			const d = new Date(iso);
			return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
		} catch {
			return iso;
		}
	}
</script>

<div class="fm-list-view flex-1 flex flex-col overflow-hidden bg-white min-w-0">
	<!-- Desktop/Tablet View: Full Spreadsheet Table (hidden on mobile < 768px) -->
	<div class="hidden md:block overflow-auto flex-1">
		<table class="fm-table">
			<thead class="sticky top-0 z-10 select-none">
				<tr>
					<th onclick={() => onSort?.('accountNumber')}>
						Account # {sortBy === 'accountNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>
					<th>Type</th>
					<th onclick={() => onSort?.('name')}>
						Name / Organization {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>
					<th>Category</th>
					<th>Location (City, ST)</th>
					<th>Telephone</th>
					<th onclick={() => onSort?.('status')}>
						Status {sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>
					<th>Notes</th>
					<th onclick={() => onSort?.('lastAccessedAt')}>
						Last Accessed {sortBy === 'lastAccessedAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>
				</tr>
			</thead>
			<tbody>
				{#if records.length === 0}
					<tr>
						<td colspan="9" class="text-center py-12 text-gray-500 italic">
							No records match the current filter or search criteria.
						</td>
					</tr>
				{:else}
					{#each records as rec (rec.id)}
						<tr
							class="{rec.id === selectedId ? 'selected' : ''}"
							onclick={() => onSelectRecord(rec)}
						>
							<td class="font-mono text-xs font-semibold">{rec.accountNumber}</td>
							<td>
								<span class="fm-badge {rec.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
									{rec.recordType === 'business' ? 'BUS' : 'IND'}
								</span>
							</td>
							<td class="font-bold text-xs">{rec.name}</td>
							<td class="text-xs text-gray-700">{rec.category}</td>
							<td class="text-xs">
								{rec.addresses && rec.addresses.length > 0
									? `${rec.addresses[0].city}, ${rec.addresses[0].state}`
									: '—'}
							</td>
							<td class="font-mono text-xs">{rec.phone}</td>
							<td>
								<span class="fm-badge fm-badge-{rec.status}">
									{rec.status}
								</span>
							</td>
							<td class="text-center text-xs font-mono font-bold">{rec.notes.length}</td>
							<td class="text-xs font-mono text-gray-600">{formatTime(rec.lastAccessedAt)}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Mobile View: Adaptive Touch-Friendly Contact Cards (visible on mobile < 768px) -->
	<div class="md:hidden flex-1 overflow-y-auto p-3 space-y-2 bg-[#eae7de]">
		{#if records.length === 0}
			<div class="text-center py-12 text-gray-500 italic text-xs">
				No records match the current filter or search criteria.
			</div>
		{:else}
			{#each records as rec (rec.id)}
				<div
					class="fm-bevel-outset p-3 bg-white active:bg-blue-50 cursor-pointer transition-colors {rec.id === selectedId ? 'ring-2 ring-[#000080]' : ''}"
					onclick={() => onSelectRecord(rec)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectRecord(rec)}
					role="button"
					tabindex="0"
				>
					<div class="flex items-center justify-between mb-1.5">
						<span class="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 border border-gray-300 rounded-sm">
							{rec.accountNumber}
						</span>
						<div class="flex items-center gap-1.5">
							<span class="fm-badge {rec.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
								{rec.recordType === 'business' ? 'BUS' : 'IND'}
							</span>
							<span class="fm-badge fm-badge-{rec.status}">
								{rec.status}
							</span>
						</div>
					</div>

					<div class="font-bold text-sm text-[#000080] mb-1">
						{rec.name}
					</div>

					<div class="text-xs text-gray-600 mb-2">
						{rec.category}
					</div>

					<div class="grid grid-cols-2 gap-1 text-[11px] pt-1.5 border-t border-gray-200">
						<div class="text-gray-700 font-mono">
							📞 {rec.phone}
						</div>
						<div class="text-gray-700 text-right">
							📍 {rec.addresses && rec.addresses.length > 0 ? `${rec.addresses[0].city}, ${rec.addresses[0].state}` : '—'}
						</div>
						<div class="text-gray-500">
							📝 {rec.notes.length} notes
						</div>
						<div class="text-gray-500 text-right font-mono">
							🕒 {formatTime(rec.lastAccessedAt)}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Bottom Status Bar -->
	<div class="fm-bevel-outset px-3 py-1.5 bg-[#d4d0c8] text-xs flex items-center justify-between border-t border-gray-400 select-none">
		<span class="font-medium text-gray-700">
			Found: <strong class="text-black">{records.length}</strong> records
		</span>
		<span class="text-gray-500 text-[11px] hidden sm:inline">
			Click any record to inspect and edit in Form View
		</span>
	</div>
</div>

<style>
	.fm-list-view {
		min-width: 0;
	}
</style>
