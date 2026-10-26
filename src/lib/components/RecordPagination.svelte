<script lang="ts">
	interface Props {
		currentIndex: number;
		totalCount: number;
		onNavigate: (index: number) => void;
	}

	let { currentIndex, totalCount, onNavigate }: Props = $props();

	let displayNum = $derived(totalCount > 0 ? currentIndex + 1 : 0);
	let inputVal = $state('');

	$effect(() => {
		inputVal = String(displayNum);
	});

	function handlePrev() {
		if (currentIndex > 0) {
			onNavigate(currentIndex - 1);
		}
	}

	function handleNext() {
		if (currentIndex < totalCount - 1) {
			onNavigate(currentIndex + 1);
		}
	}

	function handleFirst() {
		if (totalCount > 0) {
			onNavigate(0);
		}
	}

	function handleLast() {
		if (totalCount > 0) {
			onNavigate(totalCount - 1);
		}
	}

	function handleInputCommit() {
		const parsed = parseInt(inputVal, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= totalCount) {
			onNavigate(parsed - 1);
		} else {
			inputVal = String(displayNum);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleInputCommit();
		}
	}

	// Global shortcut handling when modifier keys are pressed
	function handleWindowKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
			return;
		}

		if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
			e.preventDefault();
			handlePrev();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
			e.preventDefault();
			handleNext();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs flex items-center gap-1.5 select-none flex-wrap text-xs">
	<!-- First & Prev -->
	<button
		type="button"
		class="fm-btn px-2 py-1 text-xs rounded-lg text-slate-600 hover:text-slate-900"
		onclick={handleFirst}
		disabled={currentIndex <= 0 || totalCount === 0}
		title="First Record (Ctrl+Home)"
	>
		|◀
	</button>
	<button
		type="button"
		class="fm-btn px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:text-slate-900"
		onclick={handlePrev}
		disabled={currentIndex <= 0 || totalCount === 0}
		title="Previous Record (Cmd/Ctrl+Left)"
	>
		◀ Prev
	</button>

	<!-- Record Number Input -->
	<div class="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg">
		<span class="text-slate-500 font-medium text-[11px]">Record</span>
		<input
			type="text"
			bind:value={inputVal}
			onblur={handleInputCommit}
			onkeydown={handleKeydown}
			class="w-10 text-center font-bold text-xs font-mono border-none outline-none p-0 bg-transparent text-slate-900"
			aria-label="Current record number"
		/>
		<span class="text-slate-400 font-medium text-[11px]">of {totalCount}</span>
	</div>

	<!-- Next & Last -->
	<button
		type="button"
		class="fm-btn px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:text-slate-900"
		onclick={handleNext}
		disabled={currentIndex >= totalCount - 1 || totalCount === 0}
		title="Next Record (Cmd/Ctrl+Right)"
	>
		Next ▶
	</button>
	<button
		type="button"
		class="fm-btn px-2 py-1 text-xs rounded-lg text-slate-600 hover:text-slate-900"
		onclick={handleLast}
		disabled={currentIndex >= totalCount - 1 || totalCount === 0}
		title="Last Record (Ctrl+End)"
	>
		▶|
	</button>
</div>
