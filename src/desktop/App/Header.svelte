<header>
	<section class="minSize">Die<br>großen<br>Themen</section>
	<section class="grow">
		<h2>Was bewegt die Fürther:innen?</h2>
		<div class="subtitle">Ideen, Wünsche und Aregungen für eine lebenswertes Fürth 2031</div>
	</section>
</header>

<style>
	header {
		display: flex;
		flex-grow: 0;
		flex-direction: row;
		margin: 0.5rem 0.5rem 0 0.5rem;
		gap: 1rem;
		font-family: "Open Sans", sans-serif;
		background-color: var(--werkstadt-background);
		z-index: 3;
	}
	header .minSize {
		min-width: 9.5rem;
		border-top-right-radius: 0rem;
		border-bottom-right-radius: 0rem;
		border: 3px solid var(--werkstadt-darkblue);
		background-color: var(--werkstadt-background);
		color: var(--werkstadt-darkblue);
	}
	header .grow {
		flex: 1;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	header .grow h2 {
		margin: 0;
		margin-top: 0.25em;
		padding: 0;
	}
	header .grow .subtitle {
		font-size: 1.25rem;
	}

	header section {
		background-color: var(--werkstadt-darkblue);
		color: var(--werkstadt-background);
		border-radius: 1rem;
		font-size: 1.75rem;
		font-weight: bold;
		padding: 1rem;
	}
</style>