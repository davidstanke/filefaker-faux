<script lang="ts">
	import '$lib/styles/filemaker.css';
	let { children } = $props();
</script>

<div class="min-h-screen w-full bg-[#d4d0c8] text-black flex flex-col font-sans antialiased selection:bg-[#000080] selection:text-white">
	{@render children()}
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		min-height: 100vh;
		background-color: #d4d0c8;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}
</style>
