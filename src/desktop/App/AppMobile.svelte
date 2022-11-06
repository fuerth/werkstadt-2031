<script>
	import WerkstadtFooter from './Footer.svelte';
	import WerkstadtCards from './Cards.svelte';

	import { categoriesStore, selectedMainCategoryStore, selectedSubCategoryStore } from '../stores.js';
</script>

<div class="accordion-container">
	<ul class="accordion level-1">
		{#each $categoriesStore as mainCat}
		<li class="accordion-item" id="{mainCat.id}" data-count="{mainCat.count}">
			<details>
				<summary>
					<h2>{mainCat.name}</h2>
					<div class="sub-item-count">{mainCat.count}</div>
				</summary>
				<article class="accordion-content">
					<ul class="accordion level-2">
						{#each mainCat.sub as subCat}
						<li class="accordion-item" id="{subCat.id}" data-count="{subCat.count}">
							<details>
								<summary>
									<h2>{subCat.name}</h2>
									<div class="sub-item-count">{subCat.count}</div>
								</summary>
								<article class="accordion-content">
									<WerkstadtCards 
										mainCategory={mainCat.id}
										subCategory={subCat.id}/>
								</article>
							</details>
						</li>
						{/each}<!-- end subCat -->
					</ul>
				</article>
			</details>
		</li>
		{/each}<!-- end mainCat-->
	</ul>
	<WerkstadtFooter />
</div>

<style>
	.accordion-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		color: var(--text-main);
	}

	ul.accordion {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	ul.accordion.level-1 > .accordion-item summary {
		background-color: var(--werkstadt-green);
		color: var(--werkstadt-background);
	}
	ul.accordion.level-2 > .accordion-item summary {
		background-color: var(--werkstadt-orange);
		color: var(--werkstadt-darkblue);
	}

	li.accordion-item {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: fit-content;

		background-color: var(--werkstadt-background);
	}

	li.accordion-item summary {
		display: flex;
		flex-direction: row;
		gap: 1rem;

		padding: 0.5rem;

		color: var(--text-main);
		border-top: 1px solid var(--werkstadt-background);
		border-bottom: 1px solid var(--werkstadt-background);
		cursor: pointer;
	}

	li.accordion-item summary h2 {
		display: block;
		padding: 0;
		margin: 0;
		
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-size: 1.25rem;
	}

	.accordion-content {
		background-color: var(--werkstadt-background);
	}

	.accordion-item > details > summary > h2::before {
		content: "❱";
		padding: 0.5rem;
		font-size: 1rem;
		display: inline-block;
		color: inherit;
	}
	.accordion-item > details[open] > summary > h2::before {
		transform: rotate(90deg);
	}

	ul.accordion.level-1 > .accordion-item > details[open] > summary,
	ul.accordion.level-2 > .accordion-item > details[open] > summary {
		position: -webkit-sticky;
		position: sticky;
		top: 0px;
		z-index: 110;
	}
	/*
	ul.accordion.level-2 > .accordion-item > details[open] > summary {
		top: 3rem;
	}
	*/
</style>