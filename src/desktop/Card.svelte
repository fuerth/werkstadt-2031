<script>
	// inputs
	export let gender = null;
	export let age = null;
	export let location = null;
	export let text = '';

	let title;
	let classes;
	
	$: {
		// tooltip on hover	
		const titleText = `"${text}"`;
		const titleGender = gender === 'm' ? 'Mann' : (gender === 'w' ? 'Frau' : null);
		const titleAge = age ? `(${age} Jahre)` : '';
		const titleLocation = location ? `aus ${location}` : '';
		title = [titleText, [titleGender, titleAge, titleLocation].filter(Boolean).join(' ')].join('\n');
	
		// classes
		const textLength = text.length;
		if (textLength <= 40) {
			classes = ['xxs', 'postit'];
		} else if (textLength <= 75) {
			classes = ['xs', 'postit'];
		} else if (textLength <= 100) {
			classes = ['s', 'postit'];
		} else if (textLength <= 200) {
			classes = ['m', 'postit'];
		} else if (textLength <= 270) {
			classes = ['l', 'postit'];
		} else if (textLength <= 450) {
			classes = ['xl', 'postit'];
		} else {
			classes = ['xxl', 'cardboard'];
		}
	}
</script>

<div class="card {classes.join(' ')}" {title}>{text}</div>

<style>
	.card {
		display: flex;
		width: 15rem;
		height: fit-content;
		align-items: center;
		min-height: 15rem;
		background-color: var(--card-color-1);
		padding: 1rem;

		word-break: break-word;
		hyphens: auto;

		box-shadow: 0px 2px 4px rgb(0 0 0 / 30%);
		/*
		transform: rotate(-4deg);
		transition: transform 0.15s linear;
		*/
	}

	.card {
		font-family: "Square Peg", monospace;
		font-size: 2rem;
	}
	.card.xxs {
		font-family: "Shadows Into Light Two", monospace;
		font-size: 2rem;
		text-align: center;
	}
	.card.xs {
		background:var(--card-color-2);
		font-size: 2.2rem;
		text-align: center;
	}
	.card.s {
		font-family: "Reenie Beanie", monospace;
		font-size: 2rem;
	}
	.card.m {
		background:var(--card-color-3);
		font-size: 1.6rem;
	}
	.card.l {
		font-size: 1.25rem;
	}
	.card.xl {
		font-family: "Reenie Beanie", monospace;
		width: 33.5rem;
		font-size: 1.5rem;
		transform: rotate(0deg);
	}
	.card.xxl {
		width: 33.5rem;
		min-height: 33.5rem;
		transform: rotate(0deg);
	}

	/* postit glue shadow */
	.card.postit::before {
		content: "";
		background-color: rgba(0, 0, 0, 0.025);
		position: absolute;
		width: 100%;
		height: 3rem;
		top: 0;
		left: 0;
		border: 0;
		z-index: -1;
	}
  
	/* Eselsohr */
	.card.postit.xl {
	  border-bottom-right-radius: 60px 5px;
	}
	.card.postit.xl::after {
		content: "";
		position: absolute;
		bottom: 0;
		right: -4px;
		width: 100%;
		height: 140px;
		background-image: linear-gradient(
			173deg,
			rgba(0, 0, 0, 0) 92%,
			rgba(0, 0, 0, 0.4) 100%
		);
		border-bottom-right-radius: 5rem 0.25rem;
		transform: rotate(2deg);
		z-index: -1;
		filter: blur(2px);
	}

	/* pin */
	.card.cardboard::after {
		content: "pin";
		color: transparent;
		position: absolute;
		top: 0px;
		left: 49%;
		width: 2rem;
		height: 2rem;

		background-image: url("/pin.svg");
		background-repeat: no-repeat;
		background-position: center;
		background-size: 2rem 2rem;
	}

	/* gener markers */ /*
	.card[data-gender="m"]::after {
		content: '♂';
		position: absolute;
		bottom: 0;
		right: 0.5rem;
		font-size: 1rem;
	}
	.card[data-gender="w"]::after {
		content: '♀';
		position: absolute;
		bottom: 0;
		right: 0.5rem;
		font-size: 1rem;
	}
	*/

	.card:hover {
		transform: rotate(0deg);
		transform: scale(1.05);
		box-shadow: 0px 2px 24px rgb(0 0 0 / 60%);
		z-index: 100;
	}
  </style>