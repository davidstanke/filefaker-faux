<script lang="ts">
	import type { RecordType, RecordStatus } from '$lib/types.js';

	interface Props {
		currentView: 'home' | 'form' | 'list';
		recordCount: number;
		searchQuery: string;
		saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
		selectedType?: RecordType | 'all';
		selectedStatus?: RecordStatus | 'all';
		isFilterPanelOpen?: boolean;
		onToggleSidebar?: () => void;
		onSelectView?: (view: 'home' | 'form' | 'list') => void;
		onSearchChange?: (q: string) => void;
		onToggleFilterPanel?: () => void;
		onNewRecord?: () => void;
		onResetDb?: () => void;
	}

	let {
		currentView,
		recordCount,
		searchQuery,
		saveStatus = 'saved',
		isFilterPanelOpen = false,
		onToggleSidebar,
		onSelectView,
		onSearchChange,
		onToggleFilterPanel,
		onNewRecord,
		onResetDb
	}: Props = $props();
</script>

<header class="fm-header flex flex-col bg-white border-b border-slate-200 select-none sticky top-0 z-40 shadow-xs">
	<!-- Top Modern Title Strip -->
	<div class="fm-titlebar bg-white px-3 md:px-5 py-2.5 flex items-center justify-between border-b border-slate-100">
		<div class="flex items-center gap-3">
			<!-- Mobile Hamburger -->
			<button
				type="button"
				class="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
				onclick={(e) => { e.stopPropagation(); onToggleSidebar?.(); }}
				aria-label="Toggle navigation menu"
			>
				<span class="text-base">☰</span>
			</button>

			<div class="flex items-center gap-2.5">
				<div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
					🗂
				</div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-sm text-slate-900 tracking-tight">
						FileFaker Faux 4.0
					</span>
					<span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
						BUSINESS_CONTACTS.FP3
					</span>
				</div>
			</div>
		</div>

		<!-- Auto-Save Status Badge & Global Tools -->
		<div class="flex items-center gap-2.5">
			{#if saveStatus === 'saving'}
				<span class="fm-save-status fm-save-saving">
					<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
					<span>Saving...</span>
				</span>
			{:else if saveStatus === 'saved'}
				<span class="fm-save-status fm-save-saved">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
					<span>Auto-saved</span>
				</span>
			{:else if saveStatus === 'error'}
				<span class="fm-save-status fm-save-error">
					<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
					<span>Error saving</span>
				</span>
			{/if}

			<button
				type="button"
				class="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
				onclick={() => onResetDb?.()}
				title="Reset to original 100 sample records"
			>
				<span>🔄</span> Re-seed DB
			</button>
		</div>
	</div>

	<!-- Main Responsive Interactive Navigation Bar -->
	<div class="fm-menubar px-3 md:px-5 py-2 bg-slate-50/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2.5">
		<!-- Left: Segmented View Switcher -->
		<div class="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
			<button
				type="button"
				class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {currentView === 'home' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
				onclick={() => onSelectView?.('home')}
				title="Homepage & Recently Accessed"
			>
				<span>🏠</span> <span class="hidden sm:inline ml-1">Home</span>
			</button>
			<button
				type="button"
				class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {currentView === 'form' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
				onclick={() => onSelectView?.('form')}
				title="Form Detail View"
			>
				<span>📄</span> <span class="hidden sm:inline ml-1">Form View</span>
			</button>
			<button
				type="button"
				class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {currentView === 'list' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
				onclick={() => onSelectView?.('list')}
				title="Table / List View"
			>
				<span>📑</span> <span class="hidden sm:inline ml-1">List View</span>
			</button>
		</div>

		<!-- Center: Sticky Instant Search Input -->
		<div class="flex-1 max-w-md min-w-[200px] flex items-center gap-2">
			<div class="relative w-full">
				<input
					type="text"
					value={searchQuery}
					oninput={(e) => onSearchChange?.(e.currentTarget.value)}
					placeholder="Search name, phone, account, city..."
					class="fm-input w-full text-xs py-1.5 pl-8 pr-7 bg-white border border-slate-300 rounded-xl shadow-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
					aria-label="Quick search contacts"
				/>
				<span class="absolute left-2.5 top-2 text-xs text-slate-400 pointer-events-none">🔍</span>
				{#if searchQuery}
					<button
						type="button"
						class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-100"
						onclick={() => onSearchChange?.('')}
						aria-label="Clear search"
					>
						✕
					</button>
				{/if}
			</div>

			<!-- Filter Drawer Toggle Button -->
			<button
				type="button"
				class="fm-btn text-xs py-1.5 px-3 rounded-xl border border-slate-300 {isFilterPanelOpen ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold' : 'bg-white text-slate-700 hover:bg-slate-50'}"
				onclick={onToggleFilterPanel}
				title="Filter Options"
			>
				<span>⚡</span> <span class="hidden sm:inline ml-0.5">Filters</span>
			</button>
		</div>

		<!-- Right: Action Buttons -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="fm-btn-primary font-semibold text-xs py-1.5 px-3.5 rounded-xl shadow-xs hover:shadow-sm transition-all"
				onclick={onNewRecord}
			>
				✚ <span class="hidden sm:inline ml-0.5">New Record</span><span class="sm:hidden ml-0.5">New</span>
			</button>
		</div>
	</div>
</header>
