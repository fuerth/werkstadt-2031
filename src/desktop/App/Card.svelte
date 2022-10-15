<script>
	// inputs
	export let ID = null;
	export let categories = null;
	export let length = null;
	export let classes = null;
	export let gender = null;
	export let age = null;
	export let location = null;
	export let text = '';

	let title;
	
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

<div class="wsf-card 
	{classes.join(' ')}" 
	{title} 
	data-id={ID} 
	data-length={length} 
	data-categories={categories.join(',')}
>{text}</div>

<style>
	.wsf-card {
		display: flex;
		width: 13rem;
		height: fit-content;
		align-items: center;
		min-height: 13rem;
		background-color: var(--card-color-1);
		color: var(--text-main);
		padding: 1rem;

		line-height: initial;
		word-break: break-word;
		hyphens: auto;

		box-shadow: 0px 2px 4px rgb(0 0 0 / 30%);
		/*
		transform: rotate(-4deg);
		transition: transform 0.15s linear;
		*/
	}

	.wsf-card {
		font-family: "Square Peg", monospace;
		font-size: 2rem;
	}
	.wsf-card.xxs {
		font-family: "Shadows Into Light Two", monospace;
		font-size: 2rem;
		text-align: center;
	}
	.wsf-card.xs {
		background:var(--card-color-2);
		font-size: 2.2rem;
		text-align: center;
	}
	.wsf-card.s {
		font-family: "Reenie Beanie", monospace;
		font-size: 1.5rem;
	}
	.wsf-card.m {
		background:var(--card-color-3);
		font-size: 1.6rem;
	}
	.wsf-card.l {
		font-size: 1.25rem;
	}
	.wsf-card.xl {
		font-family: "Reenie Beanie", monospace;
		width: 33.5rem;
		font-size: 1.5rem;
		transform: rotate(0deg);
	}
	.wsf-card.xxl {
		width: 33.5rem;
		min-height: 33.5rem;
		transform: rotate(0deg);
	}

	/* postit glue shadow */
	.wsf-card.postit::before {
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
	.wsf-card.postit.xl {
	  border-bottom-right-radius: 60px 5px;
	}
	.wsf-card.postit.xl::after {
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
	.wsf-card.wsf-cardboard::after {
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
	.wsf-card[data-gender="m"]::after {
		content: '♂';
		position: absolute;
		bottom: 0;
		right: 0.5rem;
		font-size: 1rem;
	}
	.wsf-card[data-gender="w"]::after {
		content: '♀';
		position: absolute;
		bottom: 0;
		right: 0.5rem;
		font-size: 1rem;
	}
	*/

	.wsf-card:hover {
		transform: rotate(0deg);
		transform: scale(1.15);
		transition: transform 0.1s ease-in-out;
		box-shadow: 0px 2px 24px rgb(0 0 0 / 60%);
		z-index: 999;
	}
  </style>