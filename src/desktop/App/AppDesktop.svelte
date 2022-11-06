<script>
	import { onDestroy } from 'svelte';
	import { derived } from 'svelte/store';

	import WerkstadtHeader from './Header.svelte';
	import WerkstadtCards from './Cards.svelte';
	import NavigationMain from './NavigationMain.svelte';
	import NavigationSub from './NavigationSub.svelte';
	import WerkstadtFooter from './Footer.svelte';

	import { categoriesStore, selectedMainCategoryStore, selectedSubCategoryStore } from '../stores.js';

	let cardsScrollContainer;

	const categoriesStoreUnsubscribe = categoriesStore.subscribe((categories) => {
		if (categories.length) {
			selectedMainCategoryStore.set(categories[0].id);
		}
	});

	const dataStoreUnsubscribe = derived([categoriesStore, selectedMainCategoryStore], ([categories, selectedMainCat], set) => {
		// select first sub-category
		const mainCat = categories.find(category => category.id === selectedMainCat);
		if (mainCat) {
			const subCatId = mainCat.sub[0].id;
			selectedSubCategoryStore.set(subCatId);
		}

		if (cardsScrollContainer) {
			cardsScrollContainer.scrollTo(0, 0);
		}
	}).subscribe(value => {
		console.log('dataStore', value);
	});

	onDestroy(() => {
		categoriesStoreUnsubscribe();
		dataStoreUnsubscribe();
	})
</script>

<div class="werkstadt-container">
	<WerkstadtHeader />
	<main>
		<aside>
			<NavigationMain />
			<WerkstadtFooter />
		</aside>
		<article>
			<header class="subCatHeader">
				<NavigationSub />
			</header>
			<section id="cardsScrollContainer" bind:this={cardsScrollContainer}>
				<WerkstadtCards 
					mainCategory={$selectedMainCategoryStore}
					subCategory={$selectedSubCategoryStore}/>
			</section>
		</article>
	</main>
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.werkstadt-container {
		background-color: var(--background-color);

		position: relative;
		height: 100%;
		width: 100%;
		max-height: 100vh;
		overflow: hidden;

		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	main {
		display: flex;
		flex-direction: row;
		overflow: hidden;
		flex-grow: 1;
		gap: 0.5rem;
	}

	aside {
		min-width: max-content;
		overflow-y: auto;

		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	header.subCatHeader {
		flex-grow: 0;
		height: fit-content;
	}

	article {
		position: relative;
		display: flex;
		gap: 0.5rem;
		overflow: hidden;
		flex-grow: 2;
		flex-direction: column;
		flex-wrap: nowrap;
		align-content: flex-start;
		justify-content: flex-start;
		align-items: stretch;
	}

	#cardsScrollContainer {
		position: relative;
		overflow-y: scroll;
		border: 1px solid gray;
		border-top-left-radius: 0.5rem;
	}
</style>
