<svelte:head>
	<link href="./fonts/fonts.css" rel="stylesheet">
</svelte:head>

<script>
	import WerkstadtCard from './Card.svelte';

	import { cardsStore } from '../stores.js';

	export let mainCategory;
	export let subCategory;

	$: cards = $cardsStore.filter(card => card.categories.includes(`${mainCategory}.${subCategory}`));
</script>

{#await cards}
<div>...waiting</div>
{:then number}
<ul id="cardsList" class="wsf-cards">
	{#each cards as card}
	<li>
		<WerkstadtCard {...card} />
	</li>
	{/each}
</ul>
{:catch error}
<div style="color: red">{error.message}</div>
{/await}

<style>
	ul.wsf-cards {
		justify-content: flex-start;
	}
	ul.wsf-cards {
		list-style: none;
		margin: 0;
		padding: 0;
		padding: 2rem;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		word-break: break-word;
		justify-content: center;
		gap: 2rem;

		background-color: var(--werkstadt-background);
	}

	li {
		position: relative;
	}

	li:nth-child(even) {
		transform: rotate(2deg);
		position: relative;
		top: 5px;
	}
	li:nth-child(3n) {
		transform: rotate(-2deg);
		position: relative;
		top: -5px;
	}
	li:nth-child(5n) {
		transform: rotate(1deg);
		position: relative;
		top: -10px;
	}

	li:nth-child(4n) {
		margin-right: 2rem;
	}
	li:nth-child(6n) {
		margin-right: 3rem;
	}
	li:nth-child(8n) {
		margin-left: 1rem;
	}
</style>
