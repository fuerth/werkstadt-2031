<script>
	import MediaQuery from "./MediaQuery.svelte";

	import AppDesktop from './AppDesktop.svelte';
	import AppMobile from './AppMobile.svelte';

	import { categoriesStore } from '../stores.js';
</script>

{#if $categoriesStore.length}
<MediaQuery query="(min-width: 800px)" let:matches>
	{#if matches}
	<AppDesktop />
	{/if}
</MediaQuery>
<MediaQuery query="(max-width: 800px)" let:matches>
	{#if matches}
	<AppMobile />
	{/if}
</MediaQuery>
{:else}
<div>lade Daten...</div>
{/if}


<style>
	:root {
		--werkstadt-background: #faf9f7;
		--werkstadt-black: #333;
		
		--werkstadt-purple: #71387d;
		--werkstadt-lightblue: #acc6e1;
		--werkstadt-blue: #1059a5;
		--werkstadt-darkblue: #6D81A7;
		--werkstadt-yellow: #fde5c9;
		--werkstadt-orange: #F9B664;
		--werkstadt-green: #6BBDA5;

		--text-main: var(--werkstadt-black);
		--background-color: var(--werkstadt-background);
		--background-borders: #999;
		--background-level-1: #CCC;
		--background-level-2: #EEE;
		--card-color-1: #FFFF99;
		--card-color-2: #D9EAD3;
		--card-color-3: #D0E0E3;
	}

	* {
		box-sizing: border-box;
	}
</style>
