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
        if (!hasText || !hasCategories) {
            console.warn('invalid entry found: ', entry);
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
    } else if (textLength <= 330) {
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

(async () => {
    const fileName = "./data/werkstadt_2031.csv";
    const columns = await getColumns(fileName);
    const data = await genDataFromCSV(fileName, columns);

    const cleanData = cleanupEntries(data);
    const enrichedEntries = enrichEntries(cleanData);
    await fs.writeFile('./src/_data/entries.json', JSON.stringify(enrichedEntries, null, 2));

    const categories = getCategoriesFromData(cleanData);
    await fs.writeFile('./src/_data/categories.json', JSON.stringify(categories, null, 2));
})()
