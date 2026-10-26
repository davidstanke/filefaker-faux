<script lang="ts">
	import type { PageData } from './$types.js';
	import type { RecordItem, RecordFilters, RecordType, RecordStatus } from '$lib/types.js';
	import FileMakerHeader from '$lib/components/FileMakerHeader.svelte';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import RecordPagination from '$lib/components/RecordPagination.svelte';
	import RecentShelf from '$lib/components/RecentShelf.svelte';
	import RecordFormView from '$lib/components/RecordFormView.svelte';
	import RecordListView from '$lib/components/RecordListView.svelte';
	import NewRecordModal from '$lib/components/NewRecordModal.svelte';

	let { data }: { data: PageData } = $props();

	// Reactive local state
	let records = $state<RecordItem[]>([]);
	let recentRecords = $state<RecordItem[]>([]);
	let currentView = $state<'home' | 'form' | 'list'>('home');
	let currentIndex = $state(0);
	let isNewModalOpen = $state(false);
	let isSidebarOpen = $state(false);
	let isFilterPanelOpen = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('saved');

	// Filters
	let searchQuery = $state('');
	let selectedType = $state<RecordType | 'all'>('all');
	let selectedStatus = $state<RecordStatus | 'all'>('all');
	let selectedState = $state('');
	let sortBy = $state<RecordFilters['sortBy']>('lastAccessedAt');
	let sortOrder = $state<RecordFilters['sortOrder']>('desc');

	// Populate from page data
	$effect(() => {
		records = data.records;
		recentRecords = data.recentRecords;
		if (data.filters.query) searchQuery = data.filters.query;
		if (data.filters.recordType) selectedType = data.filters.recordType;
		if (data.filters.status) selectedStatus = data.filters.status;
	});

	// Client-side quick filter
	let filteredRecords = $derived.by(() => {
		let list = [...records];
		if (selectedType !== 'all') {
			list = list.filter((r) => r.recordType === selectedType);
		}
		if (selectedStatus !== 'all') {
			list = list.filter((r) => r.status === selectedStatus);
		}
		if (selectedState.trim()) {
			const st = selectedState.trim().toLowerCase();
			list = list.filter((r) => r.addresses.some((a) => a.state.toLowerCase() === st));
		}
		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			list = list.filter(
				(r) =>
					r.name.toLowerCase().includes(q) ||
					r.accountNumber.toLowerCase().includes(q) ||
					r.category.toLowerCase().includes(q) ||
					r.phone.toLowerCase().includes(q) ||
					r.email.toLowerCase().includes(q) ||
					r.addresses.some((a) => a.city.toLowerCase().includes(q) || a.state.toLowerCase().includes(q)) ||
					r.notes.some((n) => n.content.toLowerCase().includes(q) || n.author.toLowerCase().includes(q))
			);
		}

		// Sort
		list.sort((a, b) => {
			let valA: string | number = '';
			let valB: string | number = '';
			switch (sortBy) {
				case 'name':
					valA = a.name.toLowerCase();
					valB = b.name.toLowerCase();
					break;
				case 'accountNumber':
					valA = a.accountNumber.toLowerCase();
					valB = b.accountNumber.toLowerCase();
					break;
				case 'status':
					valA = a.status;
					valB = b.status;
					break;
				case 'createdAt':
					valA = new Date(a.createdAt).getTime();
					valB = new Date(b.createdAt).getTime();
					break;
				case 'lastAccessedAt':
				default:
					valA = new Date(a.lastAccessedAt).getTime();
					valB = new Date(b.lastAccessedAt).getTime();
					break;
			}
			if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		return list;
	});

	// Current record for Form View
	let currentRecord = $derived(records.length > 0 && currentIndex < filteredRecords.length ? filteredRecords[currentIndex] : null);

	// Keep currentIndex within bounds
	$effect(() => {
		if (currentIndex >= filteredRecords.length && filteredRecords.length > 0) {
			currentIndex = filteredRecords.length - 1;
		}
	});

	async function selectRecord(rec: RecordItem) {
		const idx = filteredRecords.findIndex((r) => r.id === rec.id);
		if (idx !== -1) {
			currentIndex = idx;
		}
		currentView = 'form';

		// Notify backend that record was accessed
		try {
			const res = await fetch(`/api/records/${rec.id}?markAccessed=true`);
			if (res.ok) {
				const updatedRec = await res.json();
				const allIdx = records.findIndex((r) => r.id === rec.id);
				if (allIdx !== -1) {
					records[allIdx] = updatedRec;
				}
				const recentRes = await fetch('/api/records/recent?limit=8');
				if (recentRes.ok) {
					recentRecords = await recentRes.json();
				}
			}
		} catch (err) {
			console.error('Failed to update record access timestamp:', err);
		}
	}

	function handleSort(field: NonNullable<RecordFilters['sortBy']>) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'asc';
		}
	}

	async function handleUpdateRecord(updated: RecordItem) {
		const res = await fetch(`/api/records/${updated.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updated)
		});

		if (!res.ok) throw new Error('Update failed');
		const saved = await res.json();

		const idx = records.findIndex((r) => r.id === saved.id);
		if (idx !== -1) {
			records[idx] = saved;
		}

		// Refresh recents
		const recentRes = await fetch('/api/records/recent?limit=8');
		if (recentRes.ok) {
			recentRecords = await recentRes.json();
		}
	}

	async function handleDeleteRecord(id: string) {
		const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
		if (!res.ok) throw new Error('Delete failed');

		records = records.filter((r) => r.id !== id);
		recentRecords = recentRecords.filter((r) => r.id !== id);

		if (currentIndex >= filteredRecords.length && filteredRecords.length > 0) {
			currentIndex = filteredRecords.length - 1;
		}
	}

	async function handleAddNote(recordId: string, author: string, content: string) {
		const res = await fetch(`/api/records/${recordId}/notes`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ author, content })
		});

		if (!res.ok) throw new Error('Failed to add note');
		const newNote = await res.json();

		const rec = records.find((r) => r.id === recordId);
		if (rec) {
			rec.notes = [...rec.notes, newNote];
			rec.updatedAt = new Date().toISOString();
			rec.lastAccessedAt = rec.updatedAt;
		}

		const recentRes = await fetch('/api/records/recent?limit=8');
		if (recentRes.ok) {
			recentRecords = await recentRes.json();
		}
	}

	async function handleCreateRecord(recordData: Partial<RecordItem>, initialNote?: string) {
		const res = await fetch('/api/records', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(recordData)
		});

		if (!res.ok) throw new Error('Creation failed');
		const created: RecordItem = await res.json();

		if (initialNote && initialNote.trim()) {
			await fetch(`/api/records/${created.id}/notes`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ author: 'Staff', content: initialNote.trim() })
			});
			const freshRes = await fetch(`/api/records/${created.id}`);
			if (freshRes.ok) {
				const fresh = await freshRes.json();
				records = [fresh, ...records];
				await selectRecord(fresh);
				return;
			}
		}

		records = [created, ...records];
		await selectRecord(created);
	}

	async function handleResetDatabase() {
		if (confirm('Reset database back to the pristine 100 mock records? Any custom edits will be restored.')) {
			try {
				const res = await fetch('/api/reset', { method: 'POST' });
				if (res.ok) {
					window.location.reload();
				}
			} catch (err) {
				console.error('Reset failed:', err);
			}
		}
	}
</script>

<svelte:head>
	<title>FileFaker Faux — Business Contacts Database</title>
</svelte:head>

<div class="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
	<!-- Top Sticky App Bar -->
	<FileMakerHeader
		{currentView}
		recordCount={records.length}
		searchQuery={searchQuery}
		{saveStatus}
		{isFilterPanelOpen}
		onToggleSidebar={() => isSidebarOpen = !isSidebarOpen}
		onSelectView={(v) => currentView = v}
		onSearchChange={(q) => searchQuery = q}
		onToggleFilterPanel={() => isFilterPanelOpen = !isFilterPanelOpen}
		onNewRecord={() => isNewModalOpen = true}
		onResetDb={handleResetDatabase}
	/>

	<!-- Collapsible Quick Filter Drawer / Bar -->
	{#if isFilterPanelOpen}
		<div class="bg-white border-b border-slate-200 p-3.5 px-5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs select-none">
			<div class="flex flex-wrap items-center gap-3 flex-1">
				<div class="flex items-center gap-2">
					<label for="filter-type" class="font-semibold text-slate-700">Type:</label>
					<select id="filter-type" bind:value={selectedType} class="fm-select text-xs py-1 rounded-lg">
						<option value="all">All (Bus & Ind)</option>
						<option value="business">Businesses Only</option>
						<option value="individual">Individuals Only</option>
					</select>
				</div>

				<div class="flex items-center gap-2">
					<label for="filter-status" class="font-semibold text-slate-700">Status:</label>
					<select id="filter-status" bind:value={selectedStatus} class="fm-select text-xs py-1 rounded-lg">
						<option value="all">All Statuses</option>
						<option value="active">Active</option>
						<option value="lead">Lead</option>
						<option value="inactive">Inactive</option>
						<option value="archived">Archived</option>
					</select>
				</div>

				<div class="flex items-center gap-2">
					<label for="filter-state" class="font-semibold text-slate-700">State:</label>
					<input
						id="filter-state"
						type="text"
						bind:value={selectedState}
						placeholder="e.g. MA, IL, CA"
						class="fm-input text-xs w-24 py-1 uppercase rounded-lg"
					/>
				</div>
			</div>

			<div class="flex items-center gap-2.5">
				<span class="text-indigo-900 font-semibold">
					{filteredRecords.length} of {records.length} records matching
				</span>
				{#if selectedType !== 'all' || selectedStatus !== 'all' || selectedState || searchQuery}
					<button
						type="button"
						class="fm-btn text-xs py-1 px-2.5 rounded-lg text-slate-600 hover:text-slate-900"
						onclick={() => {
							selectedType = 'all';
							selectedStatus = 'all';
							selectedState = '';
							searchQuery = '';
						}}
					>
						Reset
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- App Workspace Container (Sidebar + Content) -->
	<div class="flex flex-1 overflow-hidden relative">
		<!-- Modern Collapsible Sidebar -->
		<AppSidebar
			isOpen={isSidebarOpen}
			{currentView}
			{records}
			{recentRecords}
			onSelectView={(v) => currentView = v}
			onSelectRecord={selectRecord}
			onFilterType={(t) => { selectedType = t; currentView = 'list'; }}
			onFilterStatus={(s) => { selectedStatus = s; currentView = 'list'; }}
			onNewRecord={() => isNewModalOpen = true}
			onResetDb={handleResetDatabase}
			onCloseMobile={() => isSidebarOpen = false}
		/>

		<!-- Center Main Content -->
		<main class="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50">
			<!-- Secondary Sub-bar: Modern Record Pagination (visible in Form and List views) -->
			{#if currentView !== 'home'}
				<div class="bg-white px-3 sm:px-5 py-2 border-b border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
					<RecordPagination
						currentIndex={currentIndex}
						totalCount={filteredRecords.length}
						onNavigate={(newIdx) => currentIndex = newIdx}
					/>
					<div class="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-2">
						<span class="w-2 h-2 rounded-full {currentView === 'form' ? 'bg-indigo-500' : 'bg-emerald-500'}"></span>
						<span>{currentView === 'form' ? 'Viewing Form Record Detail' : 'Spreadsheet Directory Mode'}</span>
					</div>
				</div>
			{/if}

			<!-- VIEW 1: HOMEPAGE -->
			{#if currentView === 'home'}
				<div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
					<!-- Hero Welcome Banner -->
					<div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
						<div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
							<div class="flex items-start gap-3.5">
								<div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-xs">
									🗂
								</div>
								<div>
									<h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 m-0">
										FileFaker Faux Contact Manager
									</h1>
									<p class="text-xs sm:text-sm text-slate-500 mt-1 m-0">
										Relational database modernized with a contemporary light interface and responsive workflow.
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2.5">
								<button
									type="button"
									class="fm-btn-primary font-semibold text-xs py-2 px-4 rounded-xl shadow-xs hover:shadow-sm transition-all"
									onclick={() => isNewModalOpen = true}
								>
									✚ New Record
								</button>
								<button
									type="button"
									class="fm-btn text-xs py-2 px-3.5 rounded-xl font-medium"
									onclick={() => currentView = 'list'}
								>
									📑 Open Directory ({records.length})
								</button>
							</div>
						</div>

						<!-- Homepage Quick Search -->
						<div class="mb-6">
							<div class="relative max-w-xl">
								<input
									id="home-search"
									type="text"
									value={searchQuery}
									oninput={(e) => searchQuery = e.currentTarget.value}
									placeholder="Search records by name, phone, account, city, notes..."
									class="fm-input w-full text-sm py-2.5 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium transition-all"
								/>
								<span class="absolute left-3.5 top-3 text-sm text-slate-400 pointer-events-none">🔍</span>
								{#if searchQuery}
									<button
										type="button"
										class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
										onclick={() => searchQuery = ''}
										aria-label="Clear search"
									>
										✕
									</button>
								{/if}
							</div>

							{#if searchQuery.trim()}
								<div class="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
									<span class="font-semibold text-indigo-950 flex items-center gap-2">
										<span>🔎</span> Matching Search Results ({filteredRecords.length} found)
									</span>
									<button
										type="button"
										class="fm-btn-primary text-xs py-1.5 px-3 rounded-lg"
										onclick={() => currentView = 'list'}
									>
										View Results in List View →
									</button>
								</div>
							{/if}
						</div>

						<!-- Database KPI Summary Cards -->
						<div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
							<div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
								<span class="text-slate-500 block text-xs font-medium">Total Database Records</span>
								<strong class="text-2xl font-bold text-indigo-700 mt-1 block">{records.length}</strong>
							</div>
							<div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
								<span class="text-slate-500 block text-xs font-medium">Active Accounts</span>
								<strong class="text-2xl font-bold text-emerald-700 mt-1 block">
									{records.filter(r => r.recordType === 'business' && r.status === 'active').length}
								</strong>
							</div>
							<div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
								<span class="text-slate-500 block text-xs font-medium">Individual Clients</span>
								<strong class="text-2xl font-bold text-purple-700 mt-1 block">
									{records.filter(r => r.recordType === 'individual').length}
								</strong>
							</div>
							<div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
								<span class="text-slate-500 block text-xs font-medium">Cold Leads / Inactive</span>
								<strong class="text-2xl font-bold text-amber-700 mt-1 block">
									{records.filter(r => r.status === 'lead' || r.status === 'inactive').length}
								</strong>
							</div>
						</div>
					</div>

					<!-- Recently Accessed Records Shelf -->
					<RecentShelf
						{recentRecords}
						onSelectRecord={selectRecord}
					/>
				</div>

			<!-- VIEW 2: FORM VIEW -->
			{:else if currentView === 'form'}
				{#if currentRecord}
					<RecordFormView
						record={currentRecord}
						currentIndex={currentIndex}
						totalCount={filteredRecords.length}
						onNavigate={(newIdx) => currentIndex = newIdx}
						onUpdate={handleUpdateRecord}
						onDelete={handleDeleteRecord}
						onAddNote={handleAddNote}
						onSaveStatusChange={(s) => saveStatus = s}
					/>
				{:else}
					<div class="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
						<div class="text-4xl mb-2">📄</div>
						<div class="font-bold text-sm text-slate-700">No record selected or database is empty.</div>
						<button type="button" class="fm-btn mt-3 text-xs rounded-xl" onclick={() => currentView = 'home'}>
							Return to Homepage
						</button>
					</div>
				{/if}

			<!-- VIEW 3: LIST VIEW -->
			{:else if currentView === 'list'}
				<RecordListView
					records={filteredRecords}
					selectedId={currentRecord?.id}
					onSelectRecord={selectRecord}
					sortBy={sortBy}
					sortOrder={sortOrder}
					onSort={handleSort}
				/>
			{/if}
		</main>
	</div>

	<!-- Modal for Creating New Records -->
	<NewRecordModal
		isOpen={isNewModalOpen}
		onClose={() => isNewModalOpen = false}
		onCreate={handleCreateRecord}
	/>
</div>
