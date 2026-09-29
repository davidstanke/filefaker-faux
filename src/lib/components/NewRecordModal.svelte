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
			class="fm-modal-window fm-bevel-outset p-0"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
		>
			<!-- Modal Title Bar -->
			<div class="fm-modal-titlebar">
				<span id="modal-title" class="font-bold">New Contact Record</span>
				<button class="fm-title-btn" onclick={onClose} aria-label="Close dialog">✕</button>
			</div>

			<form onsubmit={handleSubmit} class="p-4 bg-[#d4d0c8] space-y-3">
				{#if errorMsg}
					<div class="p-2 bg-red-100 border border-red-400 text-red-800 text-xs font-bold">
						{errorMsg}
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="new-type" class="block text-xs font-bold text-gray-700 mb-0.5">Record Type</label>
						<select id="new-type" bind:value={recordType} class="fm-select w-full">
							<option value="business">Business Organization</option>
							<option value="individual">Individual Client</option>
						</select>
					</div>

					<div>
						<label for="new-status" class="block text-xs font-bold text-gray-700 mb-0.5">Initial Status</label>
						<select id="new-status" bind:value={status} class="fm-select w-full">
							<option value="active">Active</option>
							<option value="lead">Lead</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
				</div>

				<div>
					<label for="new-name" class="block text-xs font-bold text-gray-700 mb-0.5">
						{recordType === 'business' ? 'Company Name' : 'Full Name'} *
					</label>
					<input
						id="new-name"
						type="text"
						bind:value={name}
						placeholder={recordType === 'business' ? 'e.g. Apex Industrial Solutions' : 'e.g. Arthur Pendleton'}
						class="fm-input w-full font-bold"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="new-cat" class="block text-xs font-bold text-gray-700 mb-0.5">Category</label>
						<input id="new-cat" type="text" bind:value={category} class="fm-input w-full text-xs" />
					</div>
					<div>
						<label for="new-phone" class="block text-xs font-bold text-gray-700 mb-0.5">Phone Number</label>
						<input id="new-phone" type="text" bind:value={phone} placeholder="(555) 123-4567" class="fm-input w-full text-xs" />
					</div>
				</div>

				<div>
					<label for="new-email" class="block text-xs font-bold text-gray-700 mb-0.5">Email Address</label>
					<input id="new-email" type="email" bind:value={email} placeholder="contact@domain.com" class="fm-input w-full text-xs" />
				</div>

				<!-- Address Block -->
				<div class="fm-bevel-inset p-2 bg-white">
					<span class="block text-[11px] font-bold text-gray-700 mb-1">Primary Address</span>
					<div class="grid grid-cols-4 gap-2">
						<div class="col-span-4">
							<input type="text" bind:value={street} placeholder="Street Address" class="fm-input w-full text-xs" />
						</div>
						<div class="col-span-2">
							<input type="text" bind:value={city} placeholder="City" class="fm-input w-full text-xs" />
						</div>
						<div>
							<input type="text" bind:value={stateField} placeholder="State" class="fm-input w-full text-xs" />
						</div>
						<div>
							<input type="text" bind:value={zip} placeholder="ZIP" class="fm-input w-full text-xs" />
						</div>
					</div>
				</div>

				<div>
					<label for="new-note" class="block text-xs font-bold text-gray-700 mb-0.5">Initial History Note</label>
					<input id="new-note" type="text" bind:value={initialNote} class="fm-input w-full text-xs" />
				</div>

				<!-- Dialog Buttons -->
				<div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-400">
					<button type="button" class="fm-btn text-xs" onclick={onClose}>
						Cancel
					</button>
					<button
						type="submit"
						class="fm-btn font-bold bg-[#c0dec0] text-xs"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creating...' : 'Create Record'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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
		width: 520px;
		max-width: 95vw;
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
