<script lang="ts">
	import type { RecordItem } from '$lib/types.js';

	interface Props {
		recentRecords: RecordItem[];
		onSelectRecord: (record: RecordItem) => void;
	}

	let { recentRecords = [], onSelectRecord }: Props = $props();

	function formatTimeAgo(isoString: string): string {
		try {
			const date = new Date(isoString);
			const diffMs = Date.now() - date.getTime();
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMins / 60);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMins < 1) return 'Just now';
			if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
			if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
			if (diffDays === 1) return 'Yesterday';
			if (diffDays < 30) return `${diffDays} days ago`;
			return date.toLocaleDateString();
		} catch {
			return isoString;
		}
	}
</script>

<div class="fm-recent-shelf bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
	<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
				🕒
			</div>
			<div>
				<h2 class="text-sm font-bold tracking-tight text-slate-900 m-0">
					Recently-Accessed Records
				</h2>
				<p class="text-[11px] text-slate-500 m-0">Jump directly back into your recent workspace records</p>
			</div>
		</div>
		<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 font-mono">
			{recentRecords.length} active sessions
		</span>
	</div>

	{#if recentRecords.length === 0}
		<div class="text-center py-8 text-slate-400 italic text-xs">
			No records have been accessed yet. Select a record to begin browsing.
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
			{#each recentRecords as rec (rec.id)}
				<button
					type="button"
					class="fm-recent-card text-left bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col group"
					onclick={() => onSelectRecord(rec)}
				>
					<div class="flex items-center justify-between mb-2">
						<span class="fm-badge {rec.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
							{rec.recordType}
						</span>
						<span class="fm-badge fm-badge-{rec.status}">
							{rec.status}
						</span>
					</div>

					<div class="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate" title={rec.name}>
						{rec.name}
					</div>

					<div class="text-xs text-slate-500 font-mono mt-1">
						{rec.accountNumber} • <span class="font-sans text-slate-600">{rec.category}</span>
					</div>

					{#if rec.addresses && rec.addresses.length > 0}
						<div class="text-xs text-slate-500 truncate mt-1 flex items-center gap-1">
							<span class="text-slate-400">📍</span>
							<span>{rec.addresses[0].city}, {rec.addresses[0].state}</span>
						</div>
					{/if}

					<div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
						<span>Accessed:</span>
						<span class="font-medium text-slate-600">{formatTimeAgo(rec.lastAccessedAt)}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
