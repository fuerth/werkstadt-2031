const fs = require('fs/promises')
const csvtojson = require("csvtojson");

async function getColumns(fileName) {
	const data = await csvtojson({
		noheader: true
	}).fromFile(fileName);
	const row1 = Object.values(data[0]);
	const row2 = Object.values(data[1]);
	return row1.map((v, i) => [v, row2[i]].filter(Boolean).join('.'));
}

async function genDataFromCSV(fileName, headers) {
	const data = await csvtojson({
		headers,
		flatKeys: true,
		ignoreEmpty: true
	}).fromFile(fileName);
	data.shift(); // remove first header row
	data.shift(); // remove second header row
	return data;
}

function cleanupEntries(data) {
	return data.map(entry => {
		const categories = [];
		Object.keys(entry).forEach(key => {
			if (key.includes('.') && entry[key] === 'x') {
				categories.push(key);
				delete entry[key];
			}
		});
		entry.categories = categories;
		return entry;
	}).filter(entry => {
		const hasText = entry.text && entry.text.length > 0;
		const hasCategories = entry.categories && entry.categories.length > 0;
		if (!hasText) {
			console.warn('invalid entry: missing text: ', JSON.stringify(entry, null, false));
			return false;
		}
		if (!hasCategories) {
			console.warn('invalid entry: missing categories: ', JSON.stringify(entry, null, false));
			return false;
		}
		return true;
	});
}

function getClassesByLength(textLength) {
	if (textLength <= 40) {
		return ['xxs', 'postit'];
	} else if (textLength <= 75) {
		return ['xs', 'postit'];
	} else if (textLength <= 100) {
		return ['s', 'postit'];
	} else if (textLength <= 200) {
		return ['m', 'postit'];
	} else if (textLength <= 270) {
		return ['l', 'postit'];
	} else if (textLength <= 450) {
		return ['xl', 'postit'];
	} else {
		return ['xxl', 'cardboard'];
	}
}

function enrichEntries(data) {
	return data.map(entry => {
		const length = entry?.text?.length || null;
		if (length) {
			entry['length'] = length;
			entry['classes'] = getClassesByLength(length);
		}
		return entry;
	});
}

function getEntryCount(data, mainCat, subCat) {
	let count = 0;
	data.forEach(entry => {
		entry.categories.forEach(cat => {
			if (mainCat && subCat) {
				if (cat === `${mainCat}.${subCat}`) {
					count++;
				} 
			} else if (mainCat) {
				if (cat.startsWith(`${mainCat}.`)) {
					count++;
				}
			}
		});
	});
	return count;
}

function getCategoriesFromData(data) {
	const mainCategories = new Map();
	data.forEach(entry => {
		entry.categories.forEach(c => {
			const [mainCat, subCat] = c.split('.');
			if (!mainCategories.has(mainCat)) {
				mainCategories.set(mainCat, new Set());
			}
			const m = mainCategories.get(mainCat);
			m.add(subCat);
		});
	})

	const categories = [];
	for (let mainCat of mainCategories.keys()) {
		const sub = [];
		const subCatSet = mainCategories.get(mainCat);
		for (let subCat of subCatSet.values()) {
			sub.push({
				id: subCat,
				name: subCat,
				count: getEntryCount(data, mainCat, subCat)
			})
		}

		categories.push({
			id: mainCat,
			name: mainCat,
			count: getEntryCount(data, mainCat),
			sub
		});
	}
	return categories;
}

function getStatisticsFromData(data){
	const genderMap = new Map();
	data.forEach(entry => {
		const gender = entry.gender;
		if (gender && gender !== "x") {
			genderValue = genderMap.get(gender) || 0;
			genderMap.set(gender, genderValue + 1);
		}
	});
	
	const ageMap = new Map();
	ageMap.set('bis 20', 0);
	ageMap.set('21-30', 0);
	ageMap.set('31-40', 0);
	ageMap.set('41-50', 0);
	ageMap.set('51-60', 0);
	ageMap.set('61-70', 0);
	ageMap.set('70+', 0);
	for (let entry of data) {
		const age = entry.age;
		if (!age || age === "x") {
			continue;
		}
		
		let group;
		if (age === 'bis 20' || age === 'unter 20' || age === '10-20' || (age <= 20) ) {
			group = 'bis 20';
		} else if (age === '21-30' || (age >= 21 && age <= 30) ) {
			group = '21-30';
		} else if (age === '31-40' || (age >= 31 && age <= 40) ) {
			group = '31-40';
		} else if (age === '41-50' || (age >= 41 && age <=50) ) {
			group = '41-50';
		} else if (age === '51-60' || (age >= 51 && age <= 60) ) {
			group = '51-60';
		} else if (age === '61-70' || (age >= 61 && age <= 70) ) {
			group = '61-70';
		} else if (age === '70+' || age >= 71 ) {
			group = '70+';
		} else {
			group = age;
		}

		groupValue = ageMap.get(group) || 0;
		ageMap.set(group, groupValue + 1);
	};
	
	const locationMap = new Map();
	data.forEach(entry => {
		const location = entry.location;
		if (location 
		&& location !== "-"
		&& location !== "x") {
			locationValue = locationMap.get(location) || 0;
			locationMap.set(location, locationValue + 1);
		}
	});

	return {
		gender: Array.from(genderMap.entries()).map(([key, value]) => ({key, value})),
		age: Array.from(ageMap.entries()).map(([key, value]) => ({key, value})),
		location: Array.from(locationMap.entries()).map(([key, value]) => ({key, value}))
	}
}

(async () => {
	const fileName = "./data/werkstadt_2031.csv";
	const columns = await getColumns(fileName);
	const data = await genDataFromCSV(fileName, columns);

	const cleanData = cleanupEntries(data);
	await fs.writeFile('./src/_data/_cleanData.json', JSON.stringify(cleanData, null, 2));

	const enrichedEntries = enrichEntries(cleanData);
	await fs.writeFile('./src/_data/entries.json', JSON.stringify(enrichedEntries, null, 2));

	const categories = getCategoriesFromData(cleanData);
	await fs.writeFile('./src/_data/categories.json', JSON.stringify(categories, null, 2));

	const statistics = getStatisticsFromData(cleanData);
	await fs.writeFile('./src/_data/statistics.json', JSON.stringify(statistics, null, 2));
})()
