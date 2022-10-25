<script>
	import { derived } from 'svelte/store';

	import WerkstadtNavigationButton from './NavigationButton.svelte';
	import { categoriesStore, selectedMainCategoryStore, selectedSubCategoryStore } from '../stores.js';

	let subCatsStore = derived([categoriesStore, selectedMainCategoryStore], ([categories, selectedMainCategory], set) => {
		if (categories.length && selectedMainCategory) {
			const mainCat = categories.find(cat => cat.id === selectedMainCategory);
			if (mainCat) {
				set(mainCat.sub);
			}
		}
	});
</script>

<nav>
	{#if $subCatsStore}
	<ul>
		{#each $subCatsStore as subCat}
			<WerkstadtNavigationButton 
				type="sub"
				id={subCat.id} 
				count={subCat.count} 
				name={subCat.name} 
				selected={$selectedSubCategoryStore === subCat.id}
			></WerkstadtNavigationButton>
		{/each}
	</ul>
	{:else}
		<div></div>
	{/if}
</nav>

<style>
	nav {
		display: flex;
		padding: 0.5rem 0;
	}

	nav ul {
		list-style: none;
		margin: 0;
		padding: 0;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5em;
	}
</style>