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
	class="fm-sidebar {isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col h-full bg-white border-r border-slate-200 overflow-y-auto select-none"
>
	<!-- Sidebar Titlebar -->
	<div class="p-4 flex items-center justify-between border-b border-slate-100">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
				🗂
			</div>
			<div>
				<div class="font-bold text-xs tracking-tight text-slate-900">FILEFAKER FAUX</div>
				<div class="text-[10px] text-slate-500">Contact Management</div>
			</div>
		</div>
		<button
			type="button"
			class="md:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors text-xs"
			onclick={onCloseMobile}
			aria-label="Close menu"
		>
			✕
		</button>
	</div>

	<!-- Navigation Section -->
	<div class="p-3 border-b border-slate-100 space-y-1">
		<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
			Views & Layouts
		</span>
		<button
			type="button"
			class="w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-all {currentView === 'home' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
			onclick={() => { onSelectView('home'); onCloseMobile(); }}
		>
			<span class="text-sm">🏠</span> Homepage & Search
		</button>
		<button
			type="button"
			class="w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-all {currentView === 'form' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
			onclick={() => { onSelectView('form'); onCloseMobile(); }}
		>
			<span class="text-sm">📄</span> Form Detail View
		</button>
		<button
			type="button"
			class="w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-all {currentView === 'list' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
			onclick={() => { onSelectView('list'); onCloseMobile(); }}
		>
			<span class="text-sm">📑</span> Spreadsheet List View
		</button>
	</div>

	<!-- Quick Filter Shortcuts -->
	<div class="p-3 border-b border-slate-100 space-y-1 text-xs">
		<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
			Quick Directory Filters
		</span>
		<button
			type="button"
			class="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xl flex items-center justify-between text-slate-700 transition-colors"
			onclick={() => { onFilterType('all'); onFilterStatus('all'); onSelectView('list'); onCloseMobile(); }}
		>
			<span class="flex items-center gap-2 font-medium"><span>📁</span> All Records</span>
			<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 font-mono">{records.length}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xl flex items-center justify-between text-slate-700 transition-colors"
			onclick={() => { onFilterType('business'); onSelectView('list'); onCloseMobile(); }}
		>
			<span class="flex items-center gap-2 font-medium"><span>🏢</span> Businesses</span>
			<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">{businessCount}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xl flex items-center justify-between text-slate-700 transition-colors"
			onclick={() => { onFilterType('individual'); onSelectView('list'); onCloseMobile(); }}
		>
			<span class="flex items-center gap-2 font-medium"><span>👤</span> Individuals</span>
			<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">{individualCount}</span>
		</button>
		<button
			type="button"
			class="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xl flex items-center justify-between text-slate-700 transition-colors"
			onclick={() => { onFilterStatus('active'); onSelectView('list'); onCloseMobile(); }}
		>
			<span class="flex items-center gap-2 font-medium"><span>🟢</span> Active Status</span>
			<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">{activeCount}</span>
		</button>
	</div>

	<!-- Recently Accessed Jump List -->
	<div class="p-3 border-b border-slate-100 flex-1 overflow-y-auto">
		<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
			Recent Records
		</span>
		{#if recentRecords.length === 0}
			<p class="text-[11px] text-slate-400 italic px-2">No recent history.</p>
		{:else}
			<div class="space-y-1">
				{#each recentRecords.slice(0, 6) as rec (rec.id)}
					<button
						type="button"
						class="w-full text-left p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all block text-xs group"
						onclick={() => { onSelectRecord(rec); onCloseMobile(); }}
					>
						<div class="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
							{rec.name}
						</div>
						<div class="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
							<span>{rec.accountNumber}</span>
							<span class="uppercase font-semibold {rec.recordType === 'business' ? 'text-blue-600' : 'text-purple-600'}">
								{rec.recordType === 'business' ? 'BUS' : 'IND'}
							</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Action Footer -->
	<div class="p-3 bg-slate-50/70 border-t border-slate-100 space-y-2 select-none">
		<button
			type="button"
			class="fm-btn-primary w-full font-semibold text-xs py-2 rounded-xl shadow-xs hover:shadow-sm transition-all"
			onclick={() => { onNewRecord(); onCloseMobile(); }}
		>
			✚ New Contact Record
		</button>
		<button
			type="button"
			class="fm-btn w-full text-[11px] py-1.5 text-slate-600 hover:text-slate-900 rounded-xl"
			onclick={() => { onResetDb(); onCloseMobile(); }}
		>
			🔄 Re-seed Database
		</button>
	</div>
</aside>
