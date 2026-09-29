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

	let activeMenu = $state<string | null>(null);

	function toggleMenu(menu: string) {
		activeMenu = activeMenu === menu ? null : menu;
	}

	function closeMenu() {
		activeMenu = null;
	}
</script>

<svelte:window onclick={() => closeMenu()} />

<header class="fm-header flex flex-col bg-[#d4d0c8] border-b-2 border-gray-400 select-none sticky top-0 z-40 shadow-sm">
	<!-- Top Vintage Title Strip & Menu -->
	<div class="bg-[#000080] text-white px-2 py-1 flex items-center justify-between text-xs">
		<div class="flex items-center gap-2">
			<!-- Mobile Hamburger -->
			<button
				type="button"
				class="md:hidden text-white hover:text-gray-200 px-1.5 py-0.5 border border-gray-400 text-xs font-bold"
				onclick={(e) => { e.stopPropagation(); onToggleSidebar?.(); }}
				aria-label="Toggle navigation menu"
			>
				☰
			</button>
			<span class="font-bold flex items-center gap-1 text-[11px] md:text-xs tracking-wider">
				<span>🗂</span> FileFaker Faux 4.0 — [BUSINESS_CONTACTS.FP3]
			</span>
		</div>

		<!-- Auto-Save Status Badge & Global Tools -->
		<div class="flex items-center gap-2">
			{#if saveStatus === 'saving'}
				<span class="fm-save-status fm-save-saving">
					<span>⏳</span> Saving...
				</span>
			{:else if saveStatus === 'saved'}
				<span class="fm-save-status fm-save-saved">
					<span>✓</span> Saved
				</span>
			{:else if saveStatus === 'error'}
				<span class="fm-save-status fm-save-error">
					<span>⚠️</span> Error saving
				</span>
			{/if}

			<button
				type="button"
				class="hidden md:inline-block text-[11px] text-gray-200 hover:text-white underline cursor-pointer"
				onclick={() => onResetDb?.()}
			>
				Re-seed DB
			</button>
		</div>
	</div>

	<!-- Main Responsive Interactive Bar -->
	<div class="px-2 py-1.5 bg-[#dfdbd3] border-b border-gray-300 flex flex-wrap items-center justify-between gap-2">
		<!-- Left: View Mode Switcher -->
		<div class="flex items-center gap-1">
			<button
				type="button"
				class="fm-btn text-xs py-1 px-2.5 {currentView === 'home' ? 'active font-bold' : ''}"
				onclick={() => onSelectView?.('home')}
				title="Homepage & Overview"
			>
				<span>🏠</span> <span class="hidden sm:inline">Home</span>
			</button>
			<button
				type="button"
				class="fm-btn text-xs py-1 px-2.5 {currentView === 'form' ? 'active font-bold' : ''}"
				onclick={() => onSelectView?.('form')}
				title="Form Detail View"
			>
				<span>📄</span> <span class="hidden sm:inline">Form View</span>
			</button>
			<button
				type="button"
				class="fm-btn text-xs py-1 px-2.5 {currentView === 'list' ? 'active font-bold' : ''}"
				onclick={() => onSelectView?.('list')}
				title="Spreadsheet List View"
			>
				<span>📑</span> <span class="hidden sm:inline">List View</span>
			</button>
		</div>

		<!-- Center: Sticky Instant Search Input -->
		<div class="flex-1 max-w-md min-w-[200px] flex items-center gap-1">
			<div class="relative w-full">
				<input
					type="text"
					value={searchQuery}
					oninput={(e) => onSearchChange?.(e.currentTarget.value)}
					placeholder="Search name, phone, account, city..."
					class="fm-input w-full text-xs py-1 pl-7 pr-6 font-medium shadow-inner"
					aria-label="Quick search contacts"
				/>
				<span class="absolute left-2 top-1.5 text-xs text-gray-400 pointer-events-none">🔍</span>
				{#if searchQuery}
					<button
						type="button"
						class="absolute right-2 top-1 text-gray-500 hover:text-black text-xs font-bold"
						onclick={() => onSearchChange?.('')}
						aria-label="Clear search"
					>
						✕
					</button>
				{/if}
			</div>

			<!-- Filter Toggle Button -->
			<button
				type="button"
				class="fm-btn text-xs py-1 px-2 {isFilterPanelOpen ? 'active' : ''}"
				onclick={onToggleFilterPanel}
				title="Filter Options"
			>
				<span>⚡</span> <span class="hidden sm:inline">Filters</span>
			</button>
		</div>

		<!-- Right: Action Buttons -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="fm-btn font-bold bg-[#c0dec0] text-xs py-1 px-3 shadow-sm hover:brightness-105"
				onclick={onNewRecord}
			>
				✚ <span class="hidden sm:inline">New Record</span><span class="sm:hidden">New</span>
			</button>
		</div>
	</div>
</header>
