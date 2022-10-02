var { URL } = require('url');
const fs = require('fs').promises;
var absolutify = require('absolutify');
const cheerio = require('cheerio');

const template = './tmp/werkstadt-2031.html';
const templateUrl = 'https://fuerth.bluepingu.de/werkstadt-2031/';

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
	parsed = parsed.replaceAll(`xlink:href="${templateUrlBase}/#`, 'xlink:href="#');

	const $ = cheerio.load(parsed);

	// remove the cookie popup (not needed here)
	$('#def-cookieconsent-consent-popup').remove();

	// replace content with the content of the template
	$('#content .container').html(data.content);
	
	const cleanHtml = $.html();

	return `${cleanHtml}`;
}