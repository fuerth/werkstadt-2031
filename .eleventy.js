module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('./src/app/app.css');
    eleventyConfig.addPassthroughCopy('./src/app/app.js');

    eleventyConfig.addNunjucksFilter("filterByCategorie", function(entries, mainCat, subCat) {
        const cat = [mainCat, subCat].filter(Boolean).join('.');
        return entries.filter(entry => {
            return entry.categories.includes(cat);
        });
    });

    return {
        dir: {
            input: 'src',
            output: 'public'
        }
    };

}