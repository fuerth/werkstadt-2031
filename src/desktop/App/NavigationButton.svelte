<script>
	export let type = "main";
	export let id;
	export let count;
	export let name;
	export let selected = true;

	import { selectedMainCategoryStore, selectedSubCategoryStore } from '../stores.js';

	function onClick() {
		if (type === "main") {
			selectedMainCategoryStore.set(id);
		} else {
			selectedSubCategoryStore.set(id);
		}
	}
</script>

<li id="{ id }" 
	class="btn { type }" 
	class:selected
	data-count="{ count }"
	on:click={onClick}
>
	<h2>{ name }</h2>
	<div class="sub-item-count">{ count }</div>
</li>

<style>
.btn {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 0.5em;
	padding-right: 1em;
	border-radius: 0.25rem;
	color: var(--werkstadt-background);
	cursor: pointer;

	transition: all .25s ease-in-out;

	opacity: 0.6;
}
.btn.main {
	margin-right: 2em;
	background: var(--werkstadt-green);
}
.btn.sub {
	background: var(--werkstadt-orange);
}
.btn:hover,
.btn.selected {
	opacity: 1;
}
.btn.main.selected,
.btn.main:hover  {
	opacity: 1;
	margin-right: 0em;
	padding-right: 3em;
}
.btn h2 {
	font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	font-size: 1rem;
	font-weight: bold;
	text-transform: capitalize; 
	margin: 0;
	padding: 0.4rem;
}
.btn .sub-item-count {
	display: flex;
	align-items: center;
	padding: 0.4rem;
	
	background-color: var(--card-color-1);
	color: var(--text-main);
	border-radius: 0rem;
	box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.2);
}
</style>