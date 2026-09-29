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

<div class="fm-recent-shelf fm-bevel-outset p-4">
	<div class="flex items-center justify-between border-b border-gray-400 pb-2 mb-3">
		<div class="flex items-center gap-2">
			<span class="text-base">🕒</span>
			<h2 class="text-sm font-bold uppercase tracking-wider text-gray-900 m-0">
				Recently-Accessed Records
			</h2>
		</div>
		<span class="text-xs text-gray-600 font-mono">
			{recentRecords.length} active sessions
		</span>
	</div>

	{#if recentRecords.length === 0}
		<div class="text-center py-6 text-gray-500 italic text-xs">
			No records have been accessed yet. Select a record to begin browsing.
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
			{#each recentRecords as rec (rec.id)}
				<button
					type="button"
					class="fm-recent-card text-left transition-transform hover:-translate-y-0.5"
					onclick={() => onSelectRecord(rec)}
				>
					<div class="flex items-center justify-between mb-1.5">
						<span class="fm-badge {rec.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
							{rec.recordType}
						</span>
						<span class="fm-badge fm-badge-{rec.status}">
							{rec.status}
						</span>
					</div>

					<div class="font-bold text-sm text-blue-900 truncate" title={rec.name}>
						{rec.name}
					</div>

					<div class="text-xs text-gray-600 font-mono mt-0.5">
						{rec.accountNumber} • {rec.category}
					</div>

					{#if rec.addresses && rec.addresses.length > 0}
						<div class="text-xs text-gray-500 truncate mt-1">
							📍 {rec.addresses[0].city}, {rec.addresses[0].state}
						</div>
					{/if}

					<div class="mt-2 pt-1 border-t border-gray-300 flex items-center justify-between text-[11px] text-gray-500">
						<span>Accessed:</span>
						<span class="font-medium text-gray-700">{formatTimeAgo(rec.lastAccessedAt)}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.fm-recent-shelf {
		background: #ece9d8;
	}

	.fm-recent-card {
		width: 100%;
		background: #ffffff;
		border-top: 1px solid #ffffff;
		border-left: 1px solid #ffffff;
		border-right: 1px solid #808080;
		border-bottom: 1px solid #808080;
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
		padding: 8px 10px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.fm-recent-card:hover {
		background: #fbfbf8;
		border-right-color: #404040;
		border-bottom-color: #404040;
	}

	.fm-recent-card:active {
		border-top: 1px solid #808080;
		border-left: 1px solid #808080;
		border-right: 1px solid #ffffff;
		border-bottom: 1px solid #ffffff;
		background: #ece8dc;
	}
</style>
