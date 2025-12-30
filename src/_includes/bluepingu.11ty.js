var { URL } = require('url');
const fs = require('fs').promises;
var absolutify = require('absolutify');
const cheerio = require('cheerio');

const template = './tmp/werkstadt-2031.html';
const templateUrl = 'https://werkstadt-2031.bluepingu.de/';

/* https://stackoverflow.com/a/36555927 */
function replaceAll(str, find, replace) {
	var $r = "";
	while ($r != str) {
		$r = str;
		str = str.replace(find, replace);
	}
	return str;
}

/* This function loads html-code from the the "templateUrl"
 * cleans it up and uses it as a template for the generated html-code.
 * The original inner-content gets replaced by "data.content". */
module.exports = async function(data) {
	var html = '';

	var stats;
	// Check if the template file already exists.
	// We do this to not make a server-request every-time we build the site.
	try {
		stats = await fs.stat(template);
	} catch(e) {}
	if (stats && stats.isFile()) {
		console.warn(`Template file already exists: ${template}`);
		html = await fs.readFile(template, 'utf-8');
	} else {
		console.warn(`File "${template}" not found. Loading from URL: ${templateUrl}`);
		const response = await fetch(templateUrl);
		html = await response.text();
		
		// ensure tmp directory exists
		try {
			await fs.mkdir('./tmp');
		} catch(e) {}

		// save html file so we don't have to load it every time.
		await fs.writeFile(template, html);
	}

	// make all relative link absolute
	const templateUrlBase = (new URL(templateUrl)).origin
	let parsed = absolutify(html, templateUrlBase);

	// remove unnecessary links to reduce loading time
	[
		`<link rel="profile" href="https://gmpg.org/xfn/11">`,
		`<link rel="alternate" type="application/rss+xml" title="Werkstatt Fürth 2031 » Feed" href="https://werkstadt-2031.bluepingu.de/feed/">`,
		`<link rel="alternate" type="application/rss+xml" title="Werkstatt Fürth 2031 » Kommentar‑Feed" href="https://werkstadt-2031.bluepingu.de/comments/feed/">`,
		`<link rel="alternate" type="application/rss+xml" title="Werkstadt Fürth 2031 – Werkstadt Fürth 2031 – Nachfragen.Umdenken.Mitwirken.-Kommentar‑Feed" href="https://werkstadt-2031.bluepingu.de/beispiel-seite/feed/">`,
		`<link rel="icon" href="https://werkstadt-2031.bluepingu.de/wp-content/uploads/sites/12/2025/02/cropped-Bluepingu_Logo_2024_farbe_quadrat-32x32.png" sizes="32x32" />`,
		`<link rel="icon" href="https://werkstadt-2031.bluepingu.de/wp-content/uploads/sites/12/2025/02/cropped-Bluepingu_Logo_2024_farbe_quadrat-192x192.png" sizes="192x192" />`,
		`<link rel="apple-touch-icon" href="https://werkstadt-2031.bluepingu.de/wp-content/uploads/sites/12/2025/02/cropped-Bluepingu_Logo_2024_farbe_quadrat-180x180.png" />`,
		`<link rel="https://api.w.org/" href="https://werkstadt-2031.bluepingu.de/wp-json/" />`,
		`<link rel="alternate" title="JSON" type="application/json" href="https://werkstadt-2031.bluepingu.de/wp-json/wp/v2/pages/2" />`,
		`<link rel="EditURI" type="application/rsd+xml" title="RSD" href="https://werkstadt-2031.bluepingu.de/xmlrpc.php?rsd" />`,
		`<link rel="canonical" href="https://werkstadt-2031.bluepingu.de/" />`,
		`<link rel='shortlink' href='https://werkstadt-2031.bluepingu.de/' />`,
		`<figure class="wp-block-image alignleft size-full is-resized"><img decoding="async" src="https://umbau.werkstatt-fuerth-2031.bluepingu.de/wp-content/uploads/sites/12/2025/02/Bluepingu_Logo_2024_sw_svg.svg" alt="" class="wp-image-66" style="width:75px;height:auto"></figure>`,
	].forEach(scriptTag => {
		parsed = replaceAll(parsed, scriptTag, `<!-- content removed -->`);
	});

	const $ = cheerio.load(parsed);

	// cleanup
	[
		'link#animate-css-css',
		'link#ct-page-title-styles-css',
		'link#ct-stackable-styles-css',
		'link#ics-calendar-css',
		'link#parent-style-css',
		'link#ct-page-title-styles-css',
		'link#ct-stackable-styles-css',
		'link#ics-calendar-css',
		
		'script#real-cookie-banner-banner-js',
		'script#real-cookie-banner-blocker-js',
		'script#real-cookie-banner-vendor-real-cookie-banner-banner-js',
		'script#jquery-core-js',
		'script#jquery-migrate-js',
		'script#ct-scripts-js',
		'script#real-cookie-banner-banner-js-before',
		
		'noscript',
		'style.stk-block-styles',
		'style#ugb-style-css-inline-css',
		'style#ugb-style-css-nodep-inline-css',
		'#ic-calendar-js',
		'#ics-calendar-js',
		'.wp-block-column',
		'#ics-calendar-js-after',
		'#ct-scripts-js-extra',
		'#core-block-supports-inline-css',
		'script[type="speculationrules"]',
		'script[data-skip-lazy-load="js-extra"]',
		'link[rel="alternate"]',
		'link[rel="preload"]',
	].forEach(selector => {
		$(selector).remove();
	})

	// replace content with the content of the template
	$('.entry-content').html(data.content);
	
	const cleanHtml = $.html();

	return `${cleanHtml}`;
}