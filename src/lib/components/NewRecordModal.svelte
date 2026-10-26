<script lang="ts">
	import type { RecordItem, RecordType, RecordStatus } from '$lib/types.js';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onCreate: (newRecordData: Partial<RecordItem>, initialNote?: string) => Promise<void>;
	}

	let { isOpen, onClose, onCreate }: Props = $props();

	let recordType = $state<RecordType>('business');
	let name = $state('');
	let category = $state('Technology & IT');
	let status = $state<RecordStatus>('active');
	let email = $state('');
	let phone = $state('');
	let city = $state('Boston');
	let stateField = $state('MA');
	let street = $state('');
	let zip = $state('02108');
	let description = $state('');
	let initialNote = $state('Record created in FileFaker Faux.');
	let isSubmitting = $state(false);
	let errorMsg = $state<string | null>(null);

	function resetForm() {
		name = '';
		category = 'Technology & IT';
		status = 'active';
		email = '';
		phone = '';
		city = 'Boston';
		stateField = 'MA';
		street = '';
		zip = '02108';
		description = '';
		initialNote = 'Record created in FileFaker Faux.';
		errorMsg = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim()) {
			errorMsg = 'Name is required.';
			return;
		}

		isSubmitting = true;
		errorMsg = null;

		try {
			const recordData: Partial<RecordItem> = {
				recordType,
				name: name.trim(),
				category,
				status,
				email: email.trim(),
				phone: phone.trim(),
				description: description.trim(),
				addresses: [
					{
						id: `ADDR-${Date.now()}`,
						street: street.trim() || '100 Main St',
						city: city.trim() || 'Boston',
						state: stateField.trim() || 'MA',
						zip: zip.trim() || '02108',
						country: 'USA',
						type: 'primary'
					}
				],
				contacts: [],
				notes: []
			};

			await onCreate(recordData, initialNote.trim());
			resetForm();
			onClose();
		} catch (err) {
			console.error('Error creating record:', err);
			errorMsg = 'Failed to create record. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if isOpen}
	<div
		class="fm-modal-backdrop"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="presentation"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="fm-modal-window w-full max-w-lg mx-4 bg-white"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
		>
			<!-- Modal Title Bar -->
			<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
						✚
					</div>
					<div>
						<h3 id="modal-title" class="font-bold text-slate-900 text-sm m-0">New Contact Record</h3>
						<p class="text-[11px] text-slate-400 m-0">Create a new relational entry in the database</p>
					</div>
				</div>
				<button
					type="button"
					class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors text-xs"
					onclick={onClose}
					aria-label="Close dialog"
				>
					✕
				</button>
			</div>

			<form onsubmit={handleSubmit} class="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
				{#if errorMsg}
					<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
						{errorMsg}
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="new-type" class="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
						<select id="new-type" bind:value={recordType} class="fm-select w-full rounded-xl">
							<option value="business">Business Organization</option>
							<option value="individual">Individual Client</option>
						</select>
					</div>

					<div>
						<label for="new-status" class="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
						<select id="new-status" bind:value={status} class="fm-select w-full rounded-xl">
							<option value="active">Active</option>
							<option value="lead">Lead</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
				</div>

				<div>
					<label for="new-name" class="block text-xs font-semibold text-slate-700 mb-1">
						{recordType === 'business' ? 'Company Name' : 'Full Name'} *
					</label>
					<input
						id="new-name"
						type="text"
						bind:value={name}
						placeholder={recordType === 'business' ? 'e.g. Acme Automation Works Inc' : 'e.g. Arthur Pendleton'}
						class="fm-input w-full font-bold rounded-xl"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="new-cat" class="block text-xs font-semibold text-slate-700 mb-1">Category</label>
						<input id="new-cat" type="text" bind:value={category} class="fm-input w-full text-xs rounded-xl" />
					</div>
					<div>
						<label for="new-phone" class="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
						<input id="new-phone" type="text" bind:value={phone} placeholder="(617) 555-9080" class="fm-input w-full text-xs font-mono rounded-xl" />
					</div>
				</div>

				<div>
					<label for="new-email" class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
					<input id="new-email" type="email" bind:value={email} placeholder="contact@domain.com" class="fm-input w-full text-xs font-mono rounded-xl" />
				</div>

				<!-- Address Block -->
				<div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
					<span class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Primary Location Address</span>
					<div class="grid grid-cols-4 gap-2">
						<div class="col-span-4">
							<input type="text" bind:value={street} placeholder="Street Address" class="fm-input w-full text-xs rounded-lg" />
						</div>
						<div class="col-span-2">
							<input type="text" bind:value={city} placeholder="City" class="fm-input w-full text-xs rounded-lg" />
						</div>
						<div>
							<input type="text" bind:value={stateField} placeholder="State" class="fm-input w-full text-xs rounded-lg" />
						</div>
						<div>
							<input type="text" bind:value={zip} placeholder="ZIP" class="fm-input w-full text-xs font-mono rounded-lg" />
						</div>
					</div>
				</div>

				<div>
					<label for="new-note" class="block text-xs font-semibold text-slate-700 mb-1">Initial History Note</label>
					<input id="new-note" type="text" bind:value={initialNote} class="fm-input w-full text-xs rounded-xl" />
				</div>

				<!-- Dialog Buttons -->
				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
					<button type="button" class="fm-btn text-xs rounded-xl" onclick={onClose}>
						Cancel
					</button>
					<button
						type="submit"
						class="fm-btn-primary font-semibold text-xs py-2 px-4 rounded-xl shadow-xs hover:shadow-sm"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creating...' : 'Create Record'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
