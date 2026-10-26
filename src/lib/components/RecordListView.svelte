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

<div class="fm-list-view flex-1 flex flex-col overflow-hidden bg-slate-50 p-2 sm:p-4 min-w-0">
	<!-- Desktop/Tablet View: Contemporary Spreadsheet Table -->
	<div class="hidden md:flex flex-col flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
		<div class="overflow-auto flex-1">
			<table class="fm-table">
				<thead class="sticky top-0 z-10 select-none bg-slate-50 border-b border-slate-200">
					<tr>
						<th onclick={() => onSort?.('accountNumber')} class="hover:text-indigo-600 transition-colors">
							Account # {sortBy === 'accountNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
						</th>
						<th>Type</th>
						<th onclick={() => onSort?.('name')} class="hover:text-indigo-600 transition-colors">
							Name / Organization {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
						</th>
						<th>Category</th>
						<th>Location (City, ST)</th>
						<th>Telephone</th>
						<th onclick={() => onSort?.('status')} class="hover:text-indigo-600 transition-colors">
							Status {sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
						</th>
						<th class="text-center">Notes</th>
						<th onclick={() => onSort?.('lastAccessedAt')} class="hover:text-indigo-600 transition-colors">
							Last Accessed {sortBy === 'lastAccessedAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
						</th>
					</tr>
				</thead>
				<tbody>
					{#if records.length === 0}
						<tr>
							<td colspan="9" class="text-center py-16 text-slate-400 italic">
								No records match the current filter or search criteria.
							</td>
						</tr>
					{:else}
						{#each records as rec (rec.id)}
							<tr
								class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors {rec.id === selectedId ? 'bg-indigo-50/80 text-indigo-950 font-medium' : ''}"
								onclick={() => onSelectRecord(rec)}
							>
								<td class="font-mono text-xs font-semibold text-slate-600">{rec.accountNumber}</td>
								<td>
									<span class="fm-badge {rec.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
										{rec.recordType === 'business' ? 'BUS' : 'IND'}
									</span>
								</td>
								<td class="font-bold text-xs text-slate-900">{rec.name}</td>
								<td class="text-xs text-slate-600">{rec.category}</td>
								<td class="text-xs text-slate-600">
									{rec.addresses && rec.addresses.length > 0
										? `${rec.addresses[0].city}, ${rec.addresses[0].state}`
										: '—'}
								</td>
								<td class="font-mono text-xs text-slate-600">{rec.phone}</td>
								<td>
									<span class="fm-badge fm-badge-{rec.status}">
										{rec.status}
									</span>
								</td>
								<td class="text-center text-xs font-mono font-semibold text-slate-500">{rec.notes.length}</td>
								<td class="text-xs font-mono text-slate-500">{formatTime(rec.lastAccessedAt)}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Desktop Bottom Status Bar -->
		<div class="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs flex items-center justify-between select-none">
			<span class="font-medium text-slate-600">
				Found: <strong class="text-slate-900 font-bold">{records.length}</strong> records
			</span>
			<span class="text-slate-400 text-[11px]">
				Click any row to inspect and edit details in Form View
			</span>
		</div>
	</div>

	<!-- Mobile View: Contemporary Touch-Friendly Contact Cards -->
	<div class="md:hidden flex-1 overflow-y-auto space-y-2.5">
		{#if records.length === 0}
			<div class="text-center py-12 text-slate-400 italic text-xs bg-white rounded-xl border border-slate-200 p-6">
				No records match the current filter or search criteria.
			</div>
		{:else}
			{#each records as rec (rec.id)}
				<div
					class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs active:bg-indigo-50/60 cursor-pointer transition-all {rec.id === selectedId ? 'ring-2 ring-indigo-500 border-transparent' : ''}"
					onclick={() => onSelectRecord(rec)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectRecord(rec)}
					role="button"
					tabindex="0"
				>
					<div class="flex items-center justify-between mb-2">
						<span class="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
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

					<div class="font-bold text-sm text-slate-900 mb-1">
						{rec.name}
					</div>

					<div class="text-xs text-slate-500 mb-2.5">
						{rec.category}
					</div>

					<div class="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-100">
						<div class="text-slate-600 font-mono">
							📞 {rec.phone}
						</div>
						<div class="text-slate-600 text-right">
							📍 {rec.addresses && rec.addresses.length > 0 ? `${rec.addresses[0].city}, ${rec.addresses[0].state}` : '—'}
						</div>
						<div class="text-slate-400">
							📝 {rec.notes.length} notes
						</div>
						<div class="text-slate-400 text-right font-mono">
							🕒 {formatTime(rec.lastAccessedAt)}
						</div>
					</div>
				</div>
			{/each}

			<div class="px-3 py-2 text-center text-xs text-slate-500">
				Showing {records.length} records
			</div>
		{/if}
	</div>
</div>
