<script lang="ts">
	import type { RecordItem, Address, ContactPerson } from '$lib/types.js';
	import BookFlipper from './BookFlipper.svelte';

	interface Props {
		record: RecordItem;
		currentIndex?: number;
		totalCount?: number;
		onNavigate?: (newIndex: number) => void;
		onUpdate: (updated: RecordItem) => Promise<void>;
		onDelete: (id: string) => Promise<void>;
		onAddNote: (recordId: string, author: string, content: string) => Promise<void>;
		onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
	}

	let {
		record,
		currentIndex = 0,
		totalCount = 0,
		onNavigate,
		onUpdate,
		onDelete,
		onAddNote,
		onSaveStatusChange
	}: Props = $props();

	// Local mutable state copy
	let editRecord = $state<RecordItem>(JSON.parse(JSON.stringify(record)));
	let activeTab = $state<'addresses' | 'contacts' | 'notes' | 'system'>('addresses');
	let isSaving = $state(false);
	let showDeleteModal = $state(false);
	let isDeleting = $state(false);

	// New Note Form
	let newNoteAuthor = $state('Staff');
	let newNoteContent = $state('');
	let isAddingNote = $state(false);
	let noteFeedback = $state<string | null>(null);

	// Sync local state when incoming record changes
	$effect(() => {
		editRecord = JSON.parse(JSON.stringify(record));
		noteFeedback = null;
		showDeleteModal = false;
	});

	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	function triggerAutoSave() {
		if (saveTimer) clearTimeout(saveTimer);
		onSaveStatusChange?.('saving');
		saveTimer = setTimeout(async () => {
			try {
				isSaving = true;
				await onUpdate(editRecord);
				onSaveStatusChange?.('saved');
			} catch (err) {
				console.error('Auto-save error:', err);
				onSaveStatusChange?.('error');
			} finally {
				isSaving = false;
			}
		}, 600);
	}

	function saveImmediately() {
		if (saveTimer) clearTimeout(saveTimer);
		onSaveStatusChange?.('saving');
		isSaving = true;
		onUpdate(editRecord)
			.then(() => onSaveStatusChange?.('saved'))
			.catch((err) => {
				console.error('Save error:', err);
				onSaveStatusChange?.('error');
			})
			.finally(() => {
				isSaving = false;
			});
	}

	async function confirmDelete() {
		isDeleting = true;
		try {
			await onDelete(editRecord.id);
			showDeleteModal = false;
		} catch (err) {
			console.error('Failed to delete record:', err);
		} finally {
			isDeleting = false;
		}
	}

	async function handleCreateNote(e: Event) {
		e.preventDefault();
		if (!newNoteContent.trim()) return;
		isAddingNote = true;
		try {
			await onAddNote(editRecord.id, newNoteAuthor, newNoteContent.trim());
			newNoteContent = '';
			noteFeedback = 'Note appended to history.';
			setTimeout(() => {
				noteFeedback = null;
			}, 3000);
		} catch (err) {
			console.error('Failed to add note:', err);
		} finally {
			isAddingNote = false;
		}
	}

	function addAddress() {
		const newAddr: Address = {
			id: `ADDR-${Date.now()}`,
			street: '',
			city: '',
			state: '',
			zip: '',
			country: 'USA',
			type: 'primary'
		};
		editRecord.addresses = [...editRecord.addresses, newAddr];
		triggerAutoSave();
	}

	function removeAddress(index: number) {
		editRecord.addresses = editRecord.addresses.filter((_, i) => i !== index);
		triggerAutoSave();
	}

	function addContact() {
		const newContact: ContactPerson = {
			id: `CON-${Date.now()}`,
			firstName: '',
			lastName: '',
			title: '',
			email: '',
			phone: '',
			isPrimary: editRecord.contacts.length === 0
		};
		editRecord.contacts = [...editRecord.contacts, newContact];
		triggerAutoSave();
	}

	function removeContact(index: number) {
		editRecord.contacts = editRecord.contacts.filter((_, i) => i !== index);
		triggerAutoSave();
	}

	function formatDate(iso: string) {
		try {
			const d = new Date(iso);
			return d.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit'
			});
		} catch {
			return iso;
		}
	}
</script>

<div class="fm-form-view flex-1 flex overflow-hidden min-w-0 bg-slate-50">
	<!-- Left Side: Iconic BookFlipper Navigator (Collapses on small mobile screens) -->
	{#if totalCount > 0}
		<div class="hidden sm:flex">
			<BookFlipper
				{currentIndex}
				{totalCount}
				mode="Browse"
				{onNavigate}
			/>
		</div>
	{/if}

	<!-- Right Side: Scrollable Form Body -->
	<div class="flex-1 flex flex-col overflow-y-auto min-w-0">
		<!-- Top Record Identification Bar -->
		<div class="bg-white border-b border-slate-200 p-3 md:px-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-xs">
					📇
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span class="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-full">
							{editRecord.accountNumber}
						</span>
						<span class="fm-badge {editRecord.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
							{editRecord.recordType === 'business' ? 'Corporate Business' : 'Individual Client'}
						</span>
						<span class="fm-badge fm-badge-{editRecord.status}">
							{editRecord.status}
						</span>
					</div>
					<h2 class="text-base md:text-lg font-bold text-slate-900 leading-tight m-0 mt-1">
						{editRecord.name || 'Untitled Record'}
					</h2>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					class="fm-btn-primary text-xs font-semibold py-1.5 px-3.5 rounded-xl shadow-xs hover:shadow-sm"
					onclick={saveImmediately}
					disabled={isSaving}
				>
					{isSaving ? 'Saving...' : '💾 Save Now'}
				</button>
				<button
					type="button"
					class="fm-btn text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-200 py-1.5 px-3 rounded-xl"
					onclick={() => showDeleteModal = true}
				>
					🗑 Delete
				</button>
			</div>
		</div>

		<!-- Form Body Container -->
		<div class="p-3 md:p-6 space-y-5 max-w-7xl mx-auto w-full">
			<!-- Core Info Card -->
			<div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
				<div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
					General Account Information (Auto-Saved)
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<!-- Name -->
					<div class="sm:col-span-2">
						<label for="rec-name" class="block text-xs font-semibold text-slate-700 mb-1">
							{editRecord.recordType === 'business' ? 'Company / Organization Name' : 'Full Name'} *
						</label>
						<input
							id="rec-name"
							type="text"
							bind:value={editRecord.name}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full font-bold text-sm rounded-xl"
							required
						/>
					</div>

					<!-- Record Type -->
					<div>
						<label for="rec-type" class="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
						<select
							id="rec-type"
							bind:value={editRecord.recordType}
							onchange={saveImmediately}
							class="fm-select w-full rounded-xl"
						>
							<option value="business">Business Organization</option>
							<option value="individual">Individual Client</option>
						</select>
					</div>

					<!-- Category -->
					<div>
						<label for="rec-cat" class="block text-xs font-semibold text-slate-700 mb-1">Industry / Category</label>
						<input
							id="rec-cat"
							type="text"
							bind:value={editRecord.category}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full rounded-xl"
						/>
					</div>

					<!-- Status -->
					<div>
						<label for="rec-status" class="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
						<select
							id="rec-status"
							bind:value={editRecord.status}
							onchange={saveImmediately}
							class="fm-select w-full rounded-xl"
						>
							<option value="active">Active</option>
							<option value="lead">Lead / Prospect</option>
							<option value="inactive">Inactive</option>
							<option value="archived">Archived</option>
						</select>
					</div>

					<!-- Department or Title -->
					<div>
						{#if editRecord.recordType === 'business'}
							<label for="rec-dept" class="block text-xs font-semibold text-slate-700 mb-1">Department</label>
							<input
								id="rec-dept"
								type="text"
								bind:value={editRecord.department}
								oninput={triggerAutoSave}
								onblur={saveImmediately}
								class="fm-input w-full rounded-xl"
							/>
						{:else}
							<label for="rec-title" class="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
							<input
								id="rec-title"
								type="text"
								bind:value={editRecord.title}
								oninput={triggerAutoSave}
								onblur={saveImmediately}
								class="fm-input w-full rounded-xl"
							/>
						{/if}
					</div>

					<!-- Primary Phone -->
					<div>
						<label for="rec-phone" class="block text-xs font-semibold text-slate-700 mb-1">Primary Telephone</label>
						<input
							id="rec-phone"
							type="text"
							bind:value={editRecord.phone}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full font-mono rounded-xl"
						/>
					</div>

					<!-- Primary Email -->
					<div>
						<label for="rec-email" class="block text-xs font-semibold text-slate-700 mb-1">Primary Email</label>
						<input
							id="rec-email"
							type="email"
							bind:value={editRecord.email}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full font-mono text-xs rounded-xl"
						/>
					</div>

					<!-- Website or Fax -->
					<div>
						{#if editRecord.recordType === 'business'}
							<label for="rec-website" class="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
							<input
								id="rec-website"
								type="text"
								bind:value={editRecord.website}
								oninput={triggerAutoSave}
								onblur={saveImmediately}
								class="fm-input w-full font-mono text-xs rounded-xl"
							/>
						{:else}
							<label for="rec-fax" class="block text-xs font-semibold text-slate-700 mb-1">Fax Number</label>
							<input
								id="rec-fax"
								type="text"
								bind:value={editRecord.fax}
								oninput={triggerAutoSave}
								onblur={saveImmediately}
								class="fm-input w-full font-mono text-xs rounded-xl"
							/>
						{/if}
					</div>

					<!-- Description -->
					<div class="sm:col-span-2 lg:col-span-3">
						<label for="rec-desc" class="block text-xs font-semibold text-slate-700 mb-1">Account Description & Notes Summary</label>
						<textarea
							id="rec-desc"
							bind:value={editRecord.description}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							rows="2"
							class="fm-textarea w-full text-xs rounded-xl"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Tabbed Subpanels -->
			<div class="space-y-3">
				<!-- Segmented Tab Navigation -->
				<div class="bg-slate-200/70 p-1 rounded-xl inline-flex flex-wrap gap-1 border border-slate-200/80">
					<button
						type="button"
						class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {activeTab === 'addresses' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => activeTab = 'addresses'}
					>
						📍 Physical Addresses ({editRecord.addresses.length})
					</button>
					<button
						type="button"
						class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {activeTab === 'contacts' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => activeTab = 'contacts'}
					>
						👥 Personnel / Contacts ({editRecord.contacts.length})
					</button>
					<button
						type="button"
						class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {activeTab === 'notes' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => activeTab = 'notes'}
					>
						📝 Timestamped Notes History ({editRecord.notes.length})
					</button>
					<button
						type="button"
						class="text-xs py-1.5 px-3 rounded-lg font-medium transition-all {activeTab === 'system' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => activeTab = 'system'}
					>
						⚙️ System Audit
					</button>
				</div>

				<!-- Tab Panel Content Container -->
				<div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
					<!-- Tab 1: Addresses -->
					{#if activeTab === 'addresses'}
						<div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
							<div>
								<span class="text-xs font-bold text-slate-800">Locations & Shipping Destinations</span>
								<p class="text-[11px] text-slate-400 m-0">Manage office locations, warehouses, and billing addresses</p>
							</div>
							<button type="button" class="fm-btn text-xs rounded-xl" onclick={addAddress}>
								✚ Add Address
							</button>
						</div>

						{#if editRecord.addresses.length === 0}
							<div class="text-xs text-slate-400 italic py-6 text-center">
								No address locations logged for this contact.
							</div>
						{:else}
							<div class="space-y-3">
								{#each editRecord.addresses as addr, idx (addr.id || idx)}
									<div class="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
										<div class="flex items-center justify-between mb-3">
											<div class="flex items-center gap-2">
												<span class="font-bold text-xs text-indigo-700">Location #{idx + 1}</span>
												<select
													bind:value={addr.type}
													onchange={saveImmediately}
													class="fm-select text-xs py-1 rounded-lg"
												>
													<option value="primary">Primary Location</option>
													<option value="billing">Billing Office</option>
													<option value="shipping">Shipping Warehouse</option>
													<option value="branch">Branch Office</option>
												</select>
											</div>
											<button
												type="button"
												class="fm-btn text-xs text-rose-700 hover:bg-rose-50 border-rose-200 px-2 py-1 rounded-lg"
												onclick={() => removeAddress(idx)}
											>
												✕ Remove
											</button>
										</div>

										<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
											<div class="sm:col-span-2 md:col-span-3">
												<label class="block text-[11px] font-medium text-slate-600">
													Street Address
													<input
														type="text"
														bind:value={addr.street}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Suite / Dock
													<input
														type="text"
														bind:value={addr.suite}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													City
													<input
														type="text"
														bind:value={addr.city}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													State / Province
													<input
														type="text"
														bind:value={addr.state}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Postal Code
													<input
														type="text"
														bind:value={addr.zip}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs font-mono mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Country
													<input
														type="text"
														bind:value={addr.country}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

					<!-- Tab 2: Contacts -->
					{:else if activeTab === 'contacts'}
						<div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
							<div>
								<span class="text-xs font-bold text-slate-800">Associated Persons & Key Personnel</span>
								<p class="text-[11px] text-slate-400 m-0">Directory of representatives and contacts</p>
							</div>
							<button type="button" class="fm-btn text-xs rounded-xl" onclick={addContact}>
								✚ Add Contact Person
							</button>
						</div>

						{#if editRecord.contacts.length === 0}
							<div class="text-xs text-slate-400 italic py-6 text-center">
								No individual personnel attached to this record.
							</div>
						{:else}
							<div class="space-y-3">
								{#each editRecord.contacts as c, idx (c.id || idx)}
									<div class="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
										<div class="flex items-center justify-between mb-3">
											<label class="flex items-center gap-2 text-xs cursor-pointer">
												<input
													type="checkbox"
													bind:checked={c.isPrimary}
													onchange={saveImmediately}
													class="rounded accent-indigo-600"
												/>
												<span class="font-bold text-slate-800">Primary Contact</span>
											</label>
											<button
												type="button"
												class="fm-btn text-xs text-rose-700 hover:bg-rose-50 border-rose-200 px-2 py-1 rounded-lg"
												onclick={() => removeContact(idx)}
											>
												✕ Remove
											</button>
										</div>

										<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													First Name
													<input
														type="text"
														bind:value={c.firstName}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Last Name
													<input
														type="text"
														bind:value={c.lastName}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Title / Role
													<input
														type="text"
														bind:value={c.title}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Email Address
													<input
														type="email"
														bind:value={c.email}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs font-mono mt-1 rounded-lg"
													/>
												</label>
											</div>
											<div>
												<label class="block text-[11px] font-medium text-slate-600">
													Direct Phone
													<input
														type="text"
														bind:value={c.phone}
														oninput={triggerAutoSave}
														onblur={saveImmediately}
														class="fm-input w-full text-xs font-mono mt-1 rounded-lg"
													/>
												</label>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

					<!-- Tab 3: Notes History -->
					{:else if activeTab === 'notes'}
						<!-- Append Note Composer -->
						<form onsubmit={handleCreateNote} class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-4">
							<div class="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
								<span class="flex items-center gap-1.5 text-indigo-900">
									<span>✍</span> Append New Timestamped Note
								</span>
								{#if noteFeedback}
									<span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
										{noteFeedback}
									</span>
								{/if}
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
								<div>
									<label class="block text-[11px] font-medium text-slate-600">
										Author / Logged By
										<input
											type="text"
											bind:value={newNoteAuthor}
											class="fm-input w-full text-xs mt-1 rounded-lg"
											required
										/>
									</label>
								</div>
								<div class="sm:col-span-3">
									<label class="block text-[11px] font-medium text-slate-600">
										Note Content *
										<input
											type="text"
											bind:value={newNoteContent}
											placeholder="Enter memo, telephone conversation notes, order details..."
											class="fm-input w-full text-xs mt-1 rounded-lg"
											required
										/>
									</label>
								</div>
							</div>

							<div class="flex justify-end">
								<button
									type="submit"
									class="fm-btn-primary font-semibold text-xs py-1.5 px-3.5 rounded-xl shadow-xs hover:shadow-sm"
									disabled={isAddingNote || !newNoteContent.trim()}
								>
									{isAddingNote ? 'Appending...' : '✚ Append Note'}
								</button>
							</div>
						</form>

						<!-- Chronological Notes Log -->
						{#if editRecord.notes.length === 0}
							<div class="text-xs text-slate-400 italic py-6 text-center">
								No historical notes logged for this contact record yet.
							</div>
						{:else}
							<div class="space-y-2.5">
								{#each [...editRecord.notes].reverse() as note (note.id)}
									<div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
										<div class="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200/80 pb-1.5 mb-2 text-[11px]">
											<div class="flex items-center gap-2">
												<div class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
													{note.author.slice(0, 1).toUpperCase()}
												</div>
												<span class="font-bold text-slate-800">{note.author}</span>
											</div>
											<span class="font-mono text-slate-400 text-[10px]">{formatDate(note.timestamp)}</span>
										</div>
										<div class="text-xs text-slate-700 leading-relaxed select-text pl-7">
											{note.content}
										</div>
									</div>
								{/each}
							</div>
						{/if}

					<!-- Tab 4: System Audit -->
					{:else if activeTab === 'system'}
						<div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<span class="font-semibold text-slate-500 block text-[11px]">Internal Record ID</span>
									<span class="font-mono text-slate-900 font-semibold">{editRecord.id}</span>
								</div>
								<div>
									<span class="font-semibold text-slate-500 block text-[11px]">Account Reference Number</span>
									<span class="font-mono text-slate-900 font-semibold">{editRecord.accountNumber}</span>
								</div>
								<div>
									<span class="font-semibold text-slate-500 block text-[11px]">Created At</span>
									<span class="font-mono text-slate-900">{formatDate(editRecord.createdAt)}</span>
								</div>
								<div>
									<span class="font-semibold text-slate-500 block text-[11px]">Last Updated</span>
									<span class="font-mono text-slate-900">{formatDate(editRecord.updatedAt)}</span>
								</div>
								<div class="sm:col-span-2">
									<span class="font-semibold text-slate-500 block text-[11px]">Last Accessed By User</span>
									<span class="font-mono text-slate-900">{formatDate(editRecord.lastAccessedAt)}</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Contemporary Delete Confirmation Dialog -->
	{#if showDeleteModal}
		<div
			class="fm-modal-backdrop"
			onclick={() => showDeleteModal = false}
			onkeydown={(e) => e.key === 'Escape' && (showDeleteModal = false)}
			role="presentation"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="fm-modal-window w-full max-w-md mx-4"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-dialog-title"
				tabindex="-1"
			>
				<div class="p-4 border-b border-slate-100 flex items-center justify-between">
					<span id="delete-dialog-title" class="font-bold text-slate-900 text-sm">Confirm Record Deletion</span>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-xs"
						onclick={() => showDeleteModal = false}
						aria-label="Close dialog"
					>
						✕
					</button>
				</div>
				<div class="p-5 space-y-3 bg-white">
					<p class="text-xs text-slate-700 m-0 leading-relaxed">
						Are you sure you want to permanently delete record <strong class="text-slate-900">{editRecord.accountNumber}</strong> ({editRecord.name})?
					</p>
					<p class="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 m-0">
						⚠️ This action cannot be undone. Associated addresses, contacts, and notes will be permanently removed.
					</p>
					<div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
						<button
							type="button"
							class="fm-btn text-xs rounded-xl"
							onclick={() => showDeleteModal = false}
						>
							Cancel
						</button>
						<button
							type="button"
							class="fm-btn text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white border-rose-600 rounded-xl"
							onclick={confirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Permanently Delete'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
