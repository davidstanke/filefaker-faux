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

<aside class="fm-flipper-container select-none">
	<!-- Mode Badge -->
	<div class="fm-mode-pill">
		{mode}
	</div>

	<!-- Classic FileMaker Book Flip Widget -->
	<div class="fm-book-wrapper" title="Click top page for Previous, bottom page for Next">
		<button
			type="button"
			class="fm-book-half fm-book-top"
			onclick={prev}
			disabled={currentIndex <= 0}
			title="Previous Record"
			aria-label="Previous Record"
		>
			<span class="fm-arrow-up">▲</span>
		</button>

		<div class="fm-book-center-divider"></div>

		<button
			type="button"
			class="fm-book-half fm-book-bottom"
			onclick={next}
			disabled={currentIndex >= totalCount - 1}
			title="Next Record"
			aria-label="Next Record"
		>
			<span class="fm-arrow-down">▼</span>
		</button>

		<!-- Visual Book Spine and Tab -->
		<div class="fm-book-spine"></div>
		<div class="fm-book-tab"></div>
	</div>

	<!-- Record Number Box -->
	<div class="flex flex-col items-center mt-2 w-full">
		<span class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Record:</span>
		<input
			type="text"
			bind:value={inputVal}
			onblur={handleInputCommit}
			onkeydown={handleKeydown}
			class="fm-input text-center text-xs font-bold w-12 py-0.5 mt-0.5"
			title="Type a record number and press Enter"
		/>
		<div class="text-[11px] text-gray-700 font-medium mt-1">
			of <span class="font-bold">{totalCount}</span>
		</div>
	</div>

	<!-- Classic FileMaker Slider Scrubber -->
	{#if totalCount > 1}
		<div class="mt-3 w-14 flex flex-col items-center">
			<input
				type="range"
				min="0"
				max={Math.max(0, totalCount - 1)}
				value={currentIndex}
				oninput={(e) => onNavigate?.(parseInt(e.currentTarget.value, 10))}
				class="fm-slider w-12"
				title="Slide to browse records"
			/>
		</div>
	{/if}

	<!-- Database Status Text -->
	<div class="mt-auto pb-2 text-[10px] text-gray-500 text-center font-mono">
		<div>Sorted</div>
		<div class="mt-1">Indexed</div>
	</div>
</aside>

<style>
	.fm-flipper-container {
		width: 76px;
		background: #d4d0c8;
		border-right: 2px solid var(--win-darker);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 4px;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.fm-mode-pill {
		font-size: 10px;
		font-weight: bold;
		text-transform: uppercase;
		background: #b4af9f;
		border-top: 1px solid #ffffff;
		border-left: 1px solid #ffffff;
		border-right: 1px solid #706b60;
		border-bottom: 1px solid #706b60;
		padding: 2px 6px;
		border-radius: 2px;
		margin-bottom: 8px;
		letter-spacing: 0.5px;
	}

	.fm-book-wrapper {
		width: 52px;
		height: 52px;
		background: #fbf9f4;
		border: 1px solid #404040;
		box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35);
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.fm-book-spine {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 6px;
		background: #395270;
		border-right: 1px solid #203040;
		pointer-events: none;
	}

	.fm-book-tab {
		position: absolute;
		right: 0;
		top: 10px;
		width: 5px;
		height: 12px;
		background: #d2322d;
		border-radius: 2px 0 0 2px;
		pointer-events: none;
	}

	.fm-book-half {
		flex: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-left: 6px;
		color: #2b4560;
		font-size: 11px;
	}

	.fm-book-half:hover:not(:disabled) {
		background: #ece8dc;
	}

	.fm-book-half:active:not(:disabled) {
		background: #d4cfbe;
	}

	.fm-book-half:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.fm-book-center-divider {
		height: 1px;
		background: #c8c4b8;
		margin-left: 6px;
	}

	.fm-arrow-up, .fm-arrow-down {
		font-size: 9px;
	}

	.fm-slider {
		-webkit-appearance: none;
		appearance: none;
		height: 5px;
		background: #a09d94;
		outline: none;
		border: 1px solid #555;
	}

	.fm-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 10px;
		height: 14px;
		background: #d4d0c8;
		border-top: 1px solid #fff;
		border-left: 1px solid #fff;
		border-right: 1px solid #404040;
		border-bottom: 1px solid #404040;
		cursor: pointer;
	}
</style>
