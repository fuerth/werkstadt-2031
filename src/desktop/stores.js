import { derived, writable, readable } from 'svelte/store';

async function fetchJson(url) {
	const result = await fetch(url);
	const json = await result.json()
	return json;
}

export const statisticsStore = readable([], set => {
	fetchJson('./desktop/statistics.json').then(set);
});

export const categoriesStore = readable([], set => {
	fetchJson('./desktop/categories.json').then(set);
});

export const cardsStore = readable([], set => {
	fetchJson('./desktop/entries.json').then(set);
});

export const selectedMainCategoryStore = writable();
export const selectedSubCategoryStore = writable();