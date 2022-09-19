(async () => {
	let ENTRIES = [];
	let SELECTED_MAIN_CAT = null;
	let SELECTED_SUB_CAT = null;

	async function loadEntries() {
		const result = await fetch('./entries.json');
		ENTRIES = await result.json();
		console.log(ENTRIES);
	}

	function genTitle(entry) {
		const text = `"${entry.text}"`;
		const gender = entry.gender === 'm' ? 'Mann' : (entry.gender === 'w' ? 'Frau' : null);
		const age = entry.age ? `(${entry.age} Jahre)` : '';
		const location = entry.location ? `aus ${entry.location}` : '';
		return [text, [gender, age, location].filter(Boolean).join(' ')].join('\n');
	}

	function showEntries(mainCat, subCat) {
		const cat = [mainCat, subCat].filter(Boolean).join('.');
		const $cardsList = document.getElementById('cardsList');
		
		// empty the list
		$cardsList.innerHTML = '';

		const entries = ENTRIES.filter(entry => {
			return entry.categories.reduce((acc, value) => acc || value.startsWith(cat), false);
		});

		// add all cards to the list
		for (let entry of entries) {
			const $card = document.createElement('li');
			$card.classList.add('card');
			//$card.dataset.length = entry.text.length;
			$card.dataset.gender = entry.gender;
			$card.dataset.age = entry.age;
			$card.dataset.location = entry.location;
			$card.textContent = entry.text;
			$card.title = genTitle(entry);
			entry.classes.forEach(className => $card.classList.add(className));
			$cardsList.appendChild($card);
		};

		const $cardsScrollContainer = document.getElementById('cardsScrollContainer');
		$cardsScrollContainer.scrollTop = 0;
	}

	function removeSelected(classSelector = '') {
		const $selectedElements = document.getElementsByClassName([classSelector, 'selected'].filter(Boolean).join(' '));
		Array.from($selectedElements).forEach((element) => {
			console.log('[removeSelected]', element);
			element.classList.remove('selected');
		});
	}
	
	function hideAllHeaders() {
		const $subCatHeaders = document.getElementsByClassName('subCatHeader');
		Array.from($subCatHeaders).forEach((element) => {
			element.classList.add('hidden');
		});
	}
	
	function showMainCat(id) {
		const $elements = document.querySelectorAll(`header[data-main-cat="${id}"]`);
		Array.from($elements).forEach((element) => {
			element.classList.remove('hidden');
		});
	}
	
	function showFirstSubCat(id) {
		const $mainHeaderElements = document.querySelectorAll(`header[data-main-cat="${id}"]`)[0];
		const $subCatElements = $mainHeaderElements.querySelectorAll('.btn.sub');
		$subCatElements[0].classList.add('selected');
		return $subCatElements[0].id;
	}
	
	function markBtnAsSelected($elem, classSelector) {
		removeSelected(classSelector);
		$elem.classList.add('selected');
	}
	
	function addMainClickHandlers() {
		const $btns = document.getElementsByClassName('btn main');
		Array.prototype.forEach.call($btns, element => {
			element.addEventListener('click', (event) => {
				console.log(element);
				markBtnAsSelected(element, 'main');
	
				SELECTED_MAIN_CAT = element.getAttribute('id');
				hideAllHeaders();
				showMainCat(SELECTED_MAIN_CAT);
				const SELECTED_SUB_CAT = showFirstSubCat(SELECTED_MAIN_CAT);

				showEntries(SELECTED_MAIN_CAT, SELECTED_SUB_CAT);
			});
		});
	}
	
	function addSubClickHandlers() {
		const $btns = document.getElementsByClassName('btn sub');
		Array.prototype.forEach.call($btns, element => {
			element.addEventListener('click', (event) => {
				console.log(element);
				markBtnAsSelected(element, 'sub');
				SELECTED_SUB_CAT = element.getAttribute('id');
				showEntries(SELECTED_MAIN_CAT, SELECTED_SUB_CAT);
			});
		});
	}
	
	await loadEntries();
	
	removeSelected();
	hideAllHeaders();
	addMainClickHandlers();
	addSubClickHandlers();

	SELECTED_MAIN_CAT = 'gesellschaft';
	SELECTED_SUB_CAT = 'familie';

	markBtnAsSelected(document.getElementById(SELECTED_MAIN_CAT), 'main');
	markBtnAsSelected(document.getElementById(SELECTED_SUB_CAT), 'sub');
	showMainCat(SELECTED_MAIN_CAT);
	showEntries(SELECTED_MAIN_CAT, SELECTED_SUB_CAT);
})();