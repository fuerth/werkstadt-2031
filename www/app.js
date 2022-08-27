window.onload = () => {
	/**
	 * adopt size to content
	 */
	const cards = document.getElementsByClassName('card');
	Array.from(cards).forEach((card) => {
		let textLength = card.textContent.length;
		if (textLength <= 40) {
			card.classList.add('xxs');
		} else if (textLength <= 75) {
			card.classList.add('xs');
		} else if (textLength <= 100) {
			card.classList.add('s');
		} else if (textLength <= 200) {
			card.classList.add('m');
		} else if (textLength <= 350) {
			card.classList.add('l');
		} else if (textLength <= 450) {
			card.classList.add('xl');
		} else {
			card.classList.add('xxl');
			card.classList.add('postit');
		}
		const title = `${card.textContent} (${card.textContent.length}) [${Array.from(card.classList).join(', ')}]`
		card.setAttribute('title', title );
	});

	/**
	 * Expand accordion on click
	 */
	const accordionItems  = document.getElementsByClassName('accordion-item');
	Array.from(accordionItems).forEach((item) => {
		const count = parseInt(item.dataset.count);
		console.log(`count: ${count}`);
		if (!count) {
			item.classList.add('disabled');
			return;
		}

		const header = item.querySelector('header');
		header.onclick = () => {
			item.classList.toggle('open');
		};
	});
}