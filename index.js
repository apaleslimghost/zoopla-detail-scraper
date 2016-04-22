var fetch = require('node-fetch');
var cheerio = require('cheerio');
var toMarkdown = require('to-markdown');

var isPropertyId = thing => /^\d+$/.test(thing);
var isZooplaUrl = thing => /^http:\/\/www.zoopla.co.uk\/for-sale\/details\/\d+/.test(thing);

var toZooplaUrl = thing => {
	if(isZooplaUrl(thing)) {
		return thing;
	}

	if(isPropertyId(thing)) {
		return `http://www.zoopla.co.uk/for-sale/details/${thing}`;
	}

	throw new Error(`can't turn ${thing} into a zoopla url`);
}

module.exports = id => Promise.resolve(id)
.then(toZooplaUrl)
.then(fetch)
.then(r => r.text())
.then(cheerio.load)
.then($ => ({
	blurb: $('.listing-details-h1').text().trim(),
	price: $('.listing-details-price').text().trim(),
	address: $('.listing-details-address [itemprop=streetAddress]').text().trim(),
	postcode: $('meta[property="og:postal-code"]').attr('content'),
	images: $('meta[property="og:image"]').map((i,a) => $(a).attr('content')).toArray(),
	description: toMarkdown($('#interested-1').nextAll().map((i,a) => $.html(a)).toArray().join(''), {converters: [
		{filter: ['span', 'div'], replacement: html => html}
	]}),
	floorplan: $('.floorplan-img').attr('src'),
	agent: {
		name: $('#listings-agent [itemprop=name]').text(),
		phone: $('.agent_phone [itemprop=telephone]').text(),
	},
	location: {
		lat: $('meta[property="og:latitude"]').attr('content'),
		lon: $('meta[property="og:longitude"]').attr('content'),
	}
}));

module.exports.toZooplaUrl = toZooplaUrl;
