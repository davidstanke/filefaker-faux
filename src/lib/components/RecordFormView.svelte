<script lang="ts">
	import type { RecordItem, Address, ContactPerson, AddressType } from '$lib/types.js';

	interface Props {
		record: RecordItem;
		onUpdate: (updated: RecordItem) => Promise<void>;
		onDelete: (id: string) => Promise<void>;
		onAddNote: (recordId: string, author: string, content: string) => Promise<void>;
		onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
	}

	let { record, onUpdate, onDelete, onAddNote, onSaveStatusChange }: Props = $props();

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

<div class="fm-form-view flex-1 flex flex-col bg-[#eae7de] overflow-y-auto min-w-0">
	<!-- Top Record Identification Bar -->
	<div class="bg-[#dcd8cf] border-b border-gray-400 p-3 md:px-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
		<div class="flex items-center gap-3">
			<span class="text-xl">📇</span>
			<div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-xs font-bold text-gray-700 bg-white px-1.5 py-0.5 border border-gray-400 rounded-sm">
						{editRecord.accountNumber}
					</span>
					<span class="fm-badge {editRecord.recordType === 'business' ? 'fm-badge-business' : 'fm-badge-individual'}">
						{editRecord.recordType === 'business' ? 'Corporate Business' : 'Individual Client'}
					</span>
					<span class="fm-badge fm-badge-{editRecord.status}">
						{editRecord.status}
					</span>
				</div>
				<h2 class="text-base md:text-lg font-bold text-[#000080] leading-tight m-0 mt-0.5">
					{editRecord.name || 'Untitled Record'}
				</h2>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="fm-btn text-xs font-bold py-1 px-3 bg-[#c0dec0]"
				onclick={saveImmediately}
				disabled={isSaving}
			>
				{isSaving ? 'Saving...' : '💾 Save Now'}
			</button>
			<button
				type="button"
				class="fm-btn text-xs text-red-800 hover:bg-red-100 py-1 px-2.5"
				onclick={() => showDeleteModal = true}
			>
				🗑 Delete
			</button>
		</div>
	</div>

	<!-- Form Body Container -->
	<div class="p-3 md:p-6 space-y-4 max-w-7xl mx-auto w-full">
		<!-- Core Info Card -->
		<div class="fm-bevel-outset p-4 bg-[#f8f6f0]">
			<div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">
				General Account Information (Auto-Saved)
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				<!-- Name -->
				<div class="sm:col-span-2">
					<label for="rec-name" class="block text-xs font-bold text-gray-700 mb-0.5">
						{editRecord.recordType === 'business' ? 'Company / Organization Name' : 'Full Name'} *
					</label>
					<input
						id="rec-name"
						type="text"
						bind:value={editRecord.name}
						oninput={triggerAutoSave}
						onblur={saveImmediately}
						class="fm-input w-full font-bold text-sm"
						required
					/>
				</div>

				<!-- Record Type -->
				<div>
					<label for="rec-type" class="block text-xs font-bold text-gray-700 mb-0.5">Record Type</label>
					<select
						id="rec-type"
						bind:value={editRecord.recordType}
						onchange={saveImmediately}
						class="fm-select w-full"
					>
						<option value="business">Business Organization</option>
						<option value="individual">Individual Client</option>
					</select>
				</div>

				<!-- Category -->
				<div>
					<label for="rec-cat" class="block text-xs font-bold text-gray-700 mb-0.5">Industry / Category</label>
					<input
						id="rec-cat"
						type="text"
						bind:value={editRecord.category}
						oninput={triggerAutoSave}
						onblur={saveImmediately}
						class="fm-input w-full"
					/>
				</div>

				<!-- Status -->
				<div>
					<label for="rec-status" class="block text-xs font-bold text-gray-700 mb-0.5">Account Status</label>
					<select
						id="rec-status"
						bind:value={editRecord.status}
						onchange={saveImmediately}
						class="fm-select w-full"
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
						<label for="rec-dept" class="block text-xs font-bold text-gray-700 mb-0.5">Department</label>
						<input
							id="rec-dept"
							type="text"
							bind:value={editRecord.department}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full"
						/>
					{:else}
						<label for="rec-title" class="block text-xs font-bold text-gray-700 mb-0.5">Job Title</label>
						<input
							id="rec-title"
							type="text"
							bind:value={editRecord.title}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full"
						/>
					{/if}
				</div>

				<!-- Primary Phone -->
				<div>
					<label for="rec-phone" class="block text-xs font-bold text-gray-700 mb-0.5">Primary Telephone</label>
					<input
						id="rec-phone"
						type="text"
						bind:value={editRecord.phone}
						oninput={triggerAutoSave}
						onblur={saveImmediately}
						class="fm-input w-full font-mono"
					/>
				</div>

				<!-- Primary Email -->
				<div>
					<label for="rec-email" class="block text-xs font-bold text-gray-700 mb-0.5">Primary Email</label>
					<input
						id="rec-email"
						type="email"
						bind:value={editRecord.email}
						oninput={triggerAutoSave}
						onblur={saveImmediately}
						class="fm-input w-full font-mono text-xs"
					/>
				</div>

				<!-- Website or Fax -->
				<div>
					{#if editRecord.recordType === 'business'}
						<label for="rec-website" class="block text-xs font-bold text-gray-700 mb-0.5">Website URL</label>
						<input
							id="rec-website"
							type="text"
							bind:value={editRecord.website}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full font-mono text-xs"
						/>
					{:else}
						<label for="rec-fax" class="block text-xs font-bold text-gray-700 mb-0.5">Fax Number</label>
						<input
							id="rec-fax"
							type="text"
							bind:value={editRecord.fax}
							oninput={triggerAutoSave}
							onblur={saveImmediately}
							class="fm-input w-full font-mono text-xs"
						/>
					{/if}
				</div>

				<!-- Description -->
				<div class="sm:col-span-2 lg:col-span-3">
					<label for="rec-desc" class="block text-xs font-bold text-gray-700 mb-0.5">Account Description & Notes Summary</label>
					<textarea
						id="rec-desc"
						bind:value={editRecord.description}
						oninput={triggerAutoSave}
						onblur={saveImmediately}
						rows="2"
						class="fm-textarea w-full text-xs"
					></textarea>
				</div>
			</div>
		</div>

		<!-- Tabbed Subpanels -->
		<div>
			<!-- Sticky Tab Navigation -->
			<div class="flex items-center border-b-2 border-gray-400 overflow-x-auto select-none bg-[#eae7de] pt-1">
				<button
					type="button"
					class="fm-tab {activeTab === 'addresses' ? 'active' : ''} text-xs py-1.5 px-3 whitespace-nowrap"
					onclick={() => activeTab = 'addresses'}
				>
					📍 Physical Addresses ({editRecord.addresses.length})
				</button>
				<button
					type="button"
					class="fm-tab {activeTab === 'contacts' ? 'active' : ''} text-xs py-1.5 px-3 whitespace-nowrap"
					onclick={() => activeTab = 'contacts'}
				>
					👥 Personnel / Contacts ({editRecord.contacts.length})
				</button>
				<button
					type="button"
					class="fm-tab {activeTab === 'notes' ? 'active' : ''} text-xs py-1.5 px-3 whitespace-nowrap"
					onclick={() => activeTab = 'notes'}
				>
					📝 Notes Log ({editRecord.notes.length})
				</button>
				<button
					type="button"
					class="fm-tab {activeTab === 'system' ? 'active' : ''} text-xs py-1.5 px-3 whitespace-nowrap"
					onclick={() => activeTab = 'system'}
				>
					⚙️ System Audit
				</button>
			</div>

			<!-- Tab Panel Content Container -->
			<div class="fm-bevel-outset p-4 bg-[#f8f6f0] border-t-0">
				<!-- Tab 1: Addresses -->
				{#if activeTab === 'addresses'}
					<div class="flex items-center justify-between mb-3 border-b border-gray-300 pb-2">
						<span class="text-xs font-bold text-gray-800">Locations & Shipping Destinations</span>
						<button type="button" class="fm-btn text-xs" onclick={addAddress}>
							✚ Add Address
						</button>
					</div>

					{#if editRecord.addresses.length === 0}
						<div class="text-xs text-gray-500 italic py-4 text-center">
							No address locations logged for this contact.
						</div>
					{:else}
						<div class="space-y-3">
							{#each editRecord.addresses as addr, idx (addr.id || idx)}
								<div class="fm-bevel-outset p-3 bg-white">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center gap-2">
											<span class="font-bold text-xs text-blue-900">Location #{idx + 1}</span>
											<select
												bind:value={addr.type}
												onchange={saveImmediately}
												class="fm-select text-[11px] py-0.5"
											>
												<option value="primary">Primary Location</option>
												<option value="billing">Billing Office</option>
												<option value="shipping">Shipping Warehouse</option>
												<option value="branch">Branch Office</option>
											</select>
										</div>
										<button
											type="button"
											class="fm-btn text-xs text-red-700 px-2 py-0.5"
											onclick={() => removeAddress(idx)}
										>
											✕ Remove
										</button>
									</div>

									<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
										<div class="sm:col-span-2 md:col-span-3">
											<label class="block text-[11px] text-gray-600">
												Street Address
												<input
													type="text"
													bind:value={addr.street}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Suite / Dock
												<input
													type="text"
													bind:value={addr.suite}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												City
												<input
													type="text"
													bind:value={addr.city}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												State / Province
												<input
													type="text"
													bind:value={addr.state}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Postal Code
												<input
													type="text"
													bind:value={addr.zip}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs font-mono mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Country
												<input
													type="text"
													bind:value={addr.country}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
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
					<div class="flex items-center justify-between mb-3 border-b border-gray-300 pb-2">
						<span class="text-xs font-bold text-gray-800">Associated Persons & Key Personnel</span>
						<button type="button" class="fm-btn text-xs" onclick={addContact}>
							✚ Add Contact Person
						</button>
					</div>

					{#if editRecord.contacts.length === 0}
						<div class="text-xs text-gray-500 italic py-4 text-center">
							No individual personnel attached to this record.
						</div>
					{:else}
						<div class="space-y-3">
							{#each editRecord.contacts as c, idx (c.id || idx)}
								<div class="fm-bevel-outset p-3 bg-white">
									<div class="flex items-center justify-between mb-2">
										<label class="flex items-center gap-1 text-xs cursor-pointer">
											<input
												type="checkbox"
												bind:checked={c.isPrimary}
												onchange={saveImmediately}
											/>
											<span class="font-bold text-gray-800">Primary Contact</span>
										</label>
										<button
											type="button"
											class="fm-btn text-xs text-red-700 px-2 py-0.5"
											onclick={() => removeContact(idx)}
										>
											✕ Remove
										</button>
									</div>

									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
										<div>
											<label class="block text-[11px] text-gray-600">
												First Name
												<input
													type="text"
													bind:value={c.firstName}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Last Name
												<input
													type="text"
													bind:value={c.lastName}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Title / Role
												<input
													type="text"
													bind:value={c.title}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Email Address
												<input
													type="email"
													bind:value={c.email}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs font-mono mt-0.5"
												/>
											</label>
										</div>
										<div>
											<label class="block text-[11px] text-gray-600">
												Direct Phone
												<input
													type="text"
													bind:value={c.phone}
													oninput={triggerAutoSave}
													onblur={saveImmediately}
													class="fm-input w-full text-xs font-mono mt-0.5"
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
					<!-- Append Note Form -->
					<form onsubmit={handleCreateNote} class="fm-bevel-outset p-3 bg-[#fdfcee] mb-4">
						<div class="text-xs font-bold text-gray-800 mb-2 flex items-center justify-between">
							<span class="flex items-center gap-1.5">
								<span>✍</span> Append New Timestamped Note
							</span>
							{#if noteFeedback}
								<span class="text-[11px] text-green-800 font-bold">{noteFeedback}</span>
							{/if}
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
							<div>
								<label class="block text-[11px] text-gray-600">
									Author / Logged By
									<input
										type="text"
										bind:value={newNoteAuthor}
										class="fm-input w-full text-xs mt-0.5"
										required
									/>
								</label>
							</div>
							<div class="sm:col-span-3">
								<label class="block text-[11px] text-gray-600">
									Note Content *
									<input
										type="text"
										bind:value={newNoteContent}
										placeholder="Enter memo, telephone conversation notes, order details..."
										class="fm-input w-full text-xs mt-0.5"
										required
									/>
								</label>
							</div>
						</div>

						<div class="flex justify-end">
							<button
								type="submit"
								class="fm-btn font-bold bg-[#c0dec0] text-xs py-1 px-3"
								disabled={isAddingNote || !newNoteContent.trim()}
							>
								{isAddingNote ? 'Appending...' : '✚ Append Note'}
							</button>
						</div>
					</form>

					<!-- Chronological Notes Log -->
					{#if editRecord.notes.length === 0}
						<div class="text-xs text-gray-500 italic py-6 text-center">
							No historical notes logged for this contact record yet.
						</div>
					{:else}
						<div class="space-y-2">
							{#each [...editRecord.notes].reverse() as note (note.id)}
								<div class="fm-bevel-inset p-3 bg-white">
									<div class="flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 pb-1 mb-1.5 text-[11px]">
										<span class="font-bold text-blue-900">{note.author}</span>
										<span class="font-mono text-gray-500">{formatDate(note.timestamp)}</span>
									</div>
									<div class="text-xs text-gray-800 font-sans leading-relaxed select-text">
										{note.content}
									</div>
								</div>
							{/each}
						</div>
					{/if}

				<!-- Tab 4: System Audit -->
				{:else if activeTab === 'system'}
					<div class="fm-bevel-inset p-4 bg-white space-y-3 text-xs">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<span class="font-bold text-gray-600 block text-[11px]">Internal Record ID</span>
								<span class="font-mono text-gray-900">{editRecord.id}</span>
							</div>
							<div>
								<span class="font-bold text-gray-600 block text-[11px]">Account Reference Number</span>
								<span class="font-mono text-gray-900">{editRecord.accountNumber}</span>
							</div>
							<div>
								<span class="font-bold text-gray-600 block text-[11px]">Created At</span>
								<span class="font-mono text-gray-900">{formatDate(editRecord.createdAt)}</span>
							</div>
							<div>
								<span class="font-bold text-gray-600 block text-[11px]">Last Updated</span>
								<span class="font-mono text-gray-900">{formatDate(editRecord.updatedAt)}</span>
							</div>
							<div class="sm:col-span-2">
								<span class="font-bold text-gray-600 block text-[11px]">Last Accessed By User</span>
								<span class="font-mono text-gray-900">{formatDate(editRecord.lastAccessedAt)}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Styled Delete Confirmation Dialog -->
	{#if showDeleteModal}
		<div
			class="fm-modal-backdrop"
			onclick={() => showDeleteModal = false}
			onkeydown={(e) => e.key === 'Escape' && (showDeleteModal = false)}
			role="presentation"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="fm-modal-window fm-bevel-outset p-0"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-dialog-title"
				tabindex="-1"
			>
				<div class="fm-modal-titlebar">
					<span id="delete-dialog-title" class="font-bold">Confirm Deletion</span>
					<button
						type="button"
						class="fm-title-btn"
						onclick={() => showDeleteModal = false}
						aria-label="Close dialog"
					>
						✕
					</button>
				</div>
				<div class="p-4 bg-[#d4d0c8] space-y-3">
					<p class="text-xs text-gray-800 m-0">
						Are you sure you want to permanently delete record <strong>{editRecord.accountNumber}</strong> ({editRecord.name})?
					</p>
					<p class="text-[11px] text-red-700 italic m-0">
						This action cannot be undone. All associated contacts, address locations, and notes will be permanently removed.
					</p>
					<div class="flex justify-end gap-2 pt-2 border-t border-gray-400">
						<button
							type="button"
							class="fm-btn text-xs"
							onclick={() => showDeleteModal = false}
						>
							Cancel
						</button>
						<button
							type="button"
							class="fm-btn text-xs font-bold bg-[#ffc0c0] text-red-900"
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

<style>
	.fm-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.fm-modal-window {
		width: 440px;
		max-width: 90vw;
		background: var(--win-bg);
		box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
	}

	.fm-modal-titlebar {
		background: var(--win-title-blue);
		color: #ffffff;
		padding: 3px 6px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
	}

	.fm-title-btn {
		width: 17px;
		height: 15px;
		background: var(--win-gray);
		border-top: 1px solid var(--win-light);
		border-left: 1px solid var(--win-light);
		border-right: 1px solid var(--win-darker);
		border-bottom: 1px solid var(--win-darker);
		font-size: 10px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: #000;
	}
</style>
