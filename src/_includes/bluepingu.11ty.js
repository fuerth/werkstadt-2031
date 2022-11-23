var { URL } = require('url');
const fs = require('fs').promises;
var absolutify = require('absolutify');
const cheerio = require('cheerio');

const template = './tmp/werkstadt-2031.html';
const templateUrl = 'https://fuerth.bluepingu.de/werkstadt-2031/';

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

	// sadly absolutify breaks the glyphicons. Lets fix this!
	parsed = replaceAll(parsed, `xlink:href="${templateUrlBase}/#`, 'xlink:href="#');

	// remove unnecessary js to reduce loading time
	[
		'<script src="https://cdn.bluepingu.de/jquery/3.6.0/jquery-3.6.0.min.js"></script>',
		'<script src="https://fuerth.bluepingu.de/typo3conf/ext/def_cookieconsent/Resources/Public/JavaScript/cookieconsent.js?1620639799"></script>',
		'<script src="https://fuerth.bluepingu.de/typo3conf/ext/powermail/Resources/Public/JavaScript/Powermail/Form.min.js?1628678410"></script>',
		'<script src="https://cdn.bluepingu.de/parsley/2.9.2/parsley.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/smoothscroll/2.2.0/jquery.smoothscroll.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/zebrapin/2.0.0/zebrapin.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/tooltipster/4.2.8/tooltipster.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/fancybox/3.5.7/jquery.fancybox.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/masterslider/2.81.9/masterslider.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/swiper/6.7.0/swiper-bundle.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/plyr/3.6.3/plyr.min.js"></script>',
		'<script src="https://cdn.bluepingu.de/bulma-calendar/6.0.8/bulma-calendar.min.js"></script>',
		'<script src="https://fuerth.bluepingu.de/typo3conf/ext/def_package/Resources/Public/JavaScript/jquery.minimal.js?1656596780"></script>',
		'<script src="https://fuerth.bluepingu.de/typo3conf/ext/def_package/Resources/Public/JavaScript/jquery.www.js?1650970500"></script>',
		'<script src="https://fuerth.bluepingu.de/typo3conf/ext/def_package/Resources/Public/JavaScript/jquery.forms.js?1643020119"></script>',
	].forEach(scriptTag => {
		parsed = parsed.replace(scriptTag, `<!-- ${scriptTag} -->`);
	});

	const $ = cheerio.load(parsed);

	// remove the cookie popup (not needed here)
	$('#def-cookieconsent-consent-popup').remove();
	$('.page-title-link.def-cookieconsent-popup-toggle').parent().parent().remove();

	// replace content with the content of the template
	$('#content .container').html(data.content);
	
	const cleanHtml = $.html();

	return `${cleanHtml}`;
}