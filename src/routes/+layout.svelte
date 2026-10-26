<script lang="ts">
	import '$lib/styles/filemaker.css';
	let { children } = $props();
</script>

<div class="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
	{@render children()}
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		min-height: 100vh;
		background-color: #f8fafc;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}
</style>
