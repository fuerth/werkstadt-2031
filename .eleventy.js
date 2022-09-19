module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('./src/app/app.css');
    eleventyConfig.addPassthroughCopy('./src/app/app.js');
    eleventyConfig.addPassthroughCopy('./src/style.css');
    eleventyConfig.addPassthroughCopy('./src/pin.svg');
    eleventyConfig.addPassthroughCopy('./src/desktop/desktop.css');
    eleventyConfig.addPassthroughCopy('./src/desktop/desktop.js');
    eleventyConfig.addPassthroughCopy('./src/desktop/csm_WSF_Logo_2204_rgb_Mittel_7e059889c0.png');
    eleventyConfig.addPassthroughCopy({ './src/_data/entries.json': 'desktop/entries.json' });

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
            output: 'public'
        }
    };

}