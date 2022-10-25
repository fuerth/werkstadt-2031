<script>
	import WerkstadtNavigationButton from './NavigationButton.svelte';
	import { categoriesStore, selectedMainCategoryStore } from '../stores.js';
</script>

<nav>
	{#if $categoriesStore.length}
		<ul>
		{#each $categoriesStore as mainCat}
			<WerkstadtNavigationButton 
				type="main"
				id={mainCat.id} 
				count={mainCat.count} 
				name={mainCat.name} 
				selected={$selectedMainCategoryStore === mainCat.id}
			></WerkstadtNavigationButton>
		{/each}
		</ul>
	{:else}
		<div></div>
	{/if}
</nav>

<style>
	nav {
		display: block;
		min-width: 9.5rem;
		padding: 0.5em;
		background-color: var(--background-color);
		z-index: 2;
		height: max-content;
	}

	nav ul {
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		list-style-type: none;
		margin: 0;
		padding: 0;
	}
</style>