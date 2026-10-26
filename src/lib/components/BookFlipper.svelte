<script lang="ts">
	interface Props {
		currentIndex: number; // 0-based
		totalCount: number;
		mode?: 'Browse' | 'Find';
		onNavigate?: (newIndex: number) => void;
	}

	let {
		currentIndex = 0,
		totalCount = 0,
		mode = 'Browse',
		onNavigate
	}: Props = $props();

	let displayNum = $derived(totalCount > 0 ? currentIndex + 1 : 0);
	let inputVal = $state('');

	$effect(() => {
		inputVal = String(displayNum);
	});

	function handleInputCommit() {
		const target = parseInt(inputVal, 10);
		if (!isNaN(target) && target >= 1 && target <= totalCount) {
			onNavigate?.(target - 1);
		} else {
			inputVal = String(displayNum);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleInputCommit();
		}
	}

	function prev() {
		if (currentIndex > 0) {
			onNavigate?.(currentIndex - 1);
		}
	}

	function next() {
		if (currentIndex < totalCount - 1) {
			onNavigate?.(currentIndex + 1);
		}
	}
</script>

<aside class="fm-flipper-container select-none flex flex-col items-center p-3 bg-white border-r border-slate-200 w-20 shrink-0">
	<!-- Mode Badge -->
	<div class="fm-mode-pill px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
		{mode}
	</div>

	<!-- Contemporary Book Flip Navigator -->
	<div class="fm-book-wrapper w-14 h-14 bg-white border border-slate-200 rounded-xl shadow-xs relative flex flex-col overflow-hidden" title="Click top page for Previous, bottom page for Next">
		<button
			type="button"
			class="fm-book-half fm-book-top flex-1 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
			onclick={prev}
			disabled={currentIndex <= 0}
			title="Previous Record"
			aria-label="Previous Record"
		>
			<span class="fm-arrow-up text-[10px] font-bold">▲</span>
		</button>

		<div class="fm-book-center-divider h-[1px] bg-slate-200 w-full"></div>

		<button
			type="button"
			class="fm-book-half fm-book-bottom flex-1 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
			onclick={next}
			disabled={currentIndex >= totalCount - 1}
			title="Next Record"
			aria-label="Next Record"
		>
			<span class="fm-arrow-down text-[10px] font-bold">▼</span>
		</button>

		<!-- Visual Book Spine and Tab -->
		<div class="fm-book-spine absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 pointer-events-none"></div>
		<div class="fm-book-tab absolute right-0 top-2.5 w-1.5 h-3 bg-amber-500 rounded-l-sm pointer-events-none"></div>
	</div>

	<!-- Record Number Box -->
	<div class="flex flex-col items-center mt-3 w-full">
		<span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Record</span>
		<input
			type="text"
			bind:value={inputVal}
			onblur={handleInputCommit}
			onkeydown={handleKeydown}
			class="fm-input text-center text-xs font-bold w-12 py-1 mt-1 rounded-lg border-slate-200 bg-slate-50 text-slate-900"
			title="Type a record number and press Enter"
		/>
		<div class="text-[11px] text-slate-500 font-medium mt-1">
			of <span class="font-bold text-slate-800">{totalCount}</span>
		</div>
	</div>

	<!-- Slider Scrubber -->
	{#if totalCount > 1}
		<div class="mt-3 w-14 flex flex-col items-center">
			<input
				type="range"
				min="0"
				max={Math.max(0, totalCount - 1)}
				value={currentIndex}
				oninput={(e) => onNavigate?.(parseInt(e.currentTarget.value, 10))}
				class="fm-slider w-12 accent-indigo-600"
				title="Slide to browse records"
			/>
		</div>
	{/if}

	<!-- Database Status Text -->
	<div class="mt-auto pb-1 text-[10px] text-slate-400 text-center font-medium">
		<div class="flex items-center justify-center gap-1">
			<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
			<span>Sorted</span>
		</div>
	</div>
</aside>

<style>
	.fm-slider {
		cursor: pointer;
		height: 4px;
	}
</style>
