module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('./src/pin.svg');
    eleventyConfig.addPassthroughCopy('./src/style.css');
    eleventyConfig.addPassthroughCopy('./src/app/app.css');
    eleventyConfig.addPassthroughCopy('./src/app/app.js');
    eleventyConfig.addPassthroughCopy('./src/fonts');
    eleventyConfig.addPassthroughCopy({ './src/_data/categories.json': 'desktop/categories.json' });
    eleventyConfig.addPassthroughCopy({ './src/_data/entries.json': 'desktop/entries.json' });
    eleventyConfig.addPassthroughCopy({ './src/_data/statistics.json': 'desktop/statistics.json' });

    eleventyConfig.addNunjucksFilter("filterByCategorie", function(entries, mainCat, subCat = null) {
        const cat = [mainCat, subCat].filter(Boolean).join('.');
        return entries.filter(entry => {
            return entry.categories.reduce((includes, value) => 
                includes || value.startsWith(cat)
            , false);
        });
    });

    return {
        dir: {
            input: 'src',
            output: 'results'
        }
    };

}