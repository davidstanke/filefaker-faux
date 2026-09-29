<script lang="ts">
	import type { RecordItem, RecordType, RecordStatus } from '$lib/types.js';

	interface Props {
		isOpen: boolean;
		currentView: 'home' | 'form' | 'list';
		records: RecordItem[];
		recentRecords: RecordItem[];
		onSelectView: (view: 'home' | 'form' | 'list') => void;
		onSelectRecord: (record: RecordItem) => void;
		onFilterType: (type: RecordType | 'all') => void;
		onFilterStatus: (status: RecordStatus | 'all') => void;
		onNewRecord: () => void;
		onResetDb: () => void;
		onCloseMobile: () => void;
	}

	let {
		isOpen,
		currentView,
		records,
		recentRecords,
		onSelectView,
		onSelectRecord,
		onFilterType,
		onFilterStatus,
		onNewRecord,
		onResetDb,
		onCloseMobile
	}: Props = $props();

	let businessCount = $derived(records.filter((r) => r.recordType === 'business').length);
	let individualCount = $derived(records.filter((r) => r.recordType === 'individual').length);
	let activeCount = $derived(records.filter((r) => r.status === 'active').length);
</script>

<!-- Mobile backdrop -->
{#if isOpen}
	<div
		class="fm-sidebar-backdrop md:hidden"
		onclick={onCloseMobile}
		onkeydown={(e) => e.key === 'Escape' && onCloseMobile()}
		role="presentation"
	></div>
{/if}

<aside
	class="fm-sidebar {isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col h-full overflow-y-auto"
>
	<!-- Sidebar Titlebar -->
	<div class="bg-[#000080] text-white p-2.5 flex items-center justify-between border-b border-black select-none">
		<div class="flex items-center gap-2">
			<span class="text-base">🗂</span>
			<span class="font-bold text-xs tracking-wider">FILEFAKER FAUX</span>
		</div>
		<button
			type="button"
			class="md:hidden text-white hover:text-gray-200 text-xs px-1.5 py-0.5 border border-gray-400"
			onclick={onCloseMobile}
			aria-label="Close menu"
		>
			✕
		</button>
	</div>

	<!-- Navigation Section -->
	<div class="p-3 border-b border-gray-400 space-y-1">
		<span class="text-[10px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
			Views & Layouts
		</span>
		<button
			type="button"
			class="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-sm flex items-center gap-2 {currentView === 'home' ? 'bg-[#000080] text-white' : 'hover:bg-gray-200 text-gray-800'}"
			onclick={() => { onSelectView('home'); onCloseMobile(); }}
		>
			<span>🏠</span> Homepage & Search
		</button>
		<button
			type="button"
			class="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-sm flex items-center gap-2 {currentView === 'form' ? 'bg-[#000080] text-white' : 'hover:bg-gray-200 text-gray-800'}"
			onclick={() => { onSelectView('form'); onCloseMobile(); }}
		>
			<span>📄</span> Form Detail View
		</button>
		<button
			type="button"
			class="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-sm flex items-center gap-2 {currentView === 'list' ? 'bg-[#000080] text-white' : 'hover:bg-gray-200 text-gray-800'}"
			onclick={() => { onSelectView('list'); onCloseMobile(); }}
		>
			<span>📑</span> Spreadsheet List View
		</button>
	</div>

	<!-- Quick Filter Shortcuts -->
	<div class="p-3 border-b border-gray-400 space-y-1 text-xs">
		<span class="text-[10px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
			Quick Directory Filters
		</span>
		<button
			type="button"
			class="w-full text-left px-2 py-1 hover:bg-gray-200 rounded-sm flex items-center justify-between text-gray-700"
			onclick={() => { onFilterType('all'); onFilterStatus('all'); onSelectView('list'); onCloseMobile(); }}
		>
			<span>📁 All Records</span>
			<span class="font-mono text-[11px] font-bold">{records.length}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-2 py-1 hover:bg-gray-200 rounded-sm flex items-center justify-between text-gray-700"
			onclick={() => { onFilterType('business'); onSelectView('list'); onCloseMobile(); }}
		>
			<span>🏢 Businesses</span>
			<span class="font-mono text-[11px] text-blue-900 font-bold">{businessCount}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-2 py-1 hover:bg-gray-200 rounded-sm flex items-center justify-between text-gray-700"
			onclick={() => { onFilterType('individual'); onSelectView('list'); onCloseMobile(); }}
		>
			<span>👤 Individuals</span>
			<span class="font-mono text-[11px] text-teal-800 font-bold">{individualCount}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-2 py-1 hover:bg-gray-200 rounded-sm flex items-center justify-between text-gray-700"
			onclick={() => { onFilterStatus('active'); onSelectView('list'); onCloseMobile(); }}
		>
			<span>🟢 Active Status</span>
			<span class="font-mono text-[11px] text-green-800 font-bold">{activeCount}</span>
		</button>
	</div>

	<!-- Recently Accessed Jump List -->
	<div class="p-3 border-b border-gray-400 flex-1 overflow-y-auto">
		<span class="text-[10px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
			Recent Records
		</span>
		{#if recentRecords.length === 0}
			<p class="text-[11px] text-gray-500 italic">No recent history.</p>
		{:else}
			<div class="space-y-1">
				{#each recentRecords.slice(0, 6) as rec (rec.id)}
					<button
						type="button"
						class="w-full text-left p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-300 transition-colors block text-xs"
						onclick={() => { onSelectRecord(rec); onCloseMobile(); }}
					>
						<div class="font-bold text-gray-900 truncate">{rec.name}</div>
						<div class="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-0.5">
							<span>{rec.accountNumber}</span>
							<span class="uppercase">{rec.recordType === 'business' ? 'BUS' : 'IND'}</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Action Footer -->
	<div class="p-3 bg-[#d4d0c8] space-y-2 select-none">
		<button
			type="button"
			class="fm-btn w-full font-bold bg-[#c0dec0] text-xs py-1.5 shadow-sm"
			onclick={() => { onNewRecord(); onCloseMobile(); }}
		>
			✚ New Contact Record
		</button>
		<button
			type="button"
			class="fm-btn w-full text-[11px] py-1 text-gray-700"
			onclick={() => { onResetDb(); onCloseMobile(); }}
		>
			🔄 Re-seed Database
		</button>
	</div>
</aside>
