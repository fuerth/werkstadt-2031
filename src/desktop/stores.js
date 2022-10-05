import { derived, writable, readable } from 'svelte/store';

async function fetchJson(url) {
	const result = await fetch(url);
	const json = await result.json()
	return json;
}

export const categoriesStore = readable([], set => {
	fetchJson('./categories.json').then(set);
});

export const cardsStore = readable([], set => {
	fetchJson('./entries.json').then(set);
});

export const selectedMainCategoryStore = writable();
export const selectedSubCategoryStore = writable();