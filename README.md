<h1 align="center">
  <img src="logo.svg" width="100" alt="icon" draggable="false"><br>
  RSS to JS parser
  <br>
  <br>
</h1>

[![Version][npm-image]][npm-link]
[![Build Status][build-image]][build-link]
[![Downloads][downloads-image]][npm-link]

[downloads-image]: https://img.shields.io/npm/dm/rss-to-js.svg
[npm-image]: https://img.shields.io/npm/v/rss-to-js.svg
[npm-link]: https://npmjs.org/package/rss-to-js
[build-image]: https://travis-ci.org/johannessanders/rss-to-js.svg?branch=master
[build-link]: https://travis-ci.org/johannessanders/rss-to-js

A small library for turning RSS XML feeds into JavaScript objects.

## Installation
```bash
npm install --save rss-to-js
```

## Usage
You can parse RSS from an XML string (`parser.parseString`).

### NodeJS
Here's an example in NodeJS using Promises with async/await:

```js
const rssParser = new Parser();
const feed = await rssParser.parseString(`
  <?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
    <channel>
      <title>Instant Article Test</title>
      <link>https://example.com</link>
      <description>1, 2, 1, 2… check the mic!</description>
      <item>
        <title>My first Instant Article</title>
        <link>https://example.com/my-first-article</link>
        <description>Lorem ipsum</description>
        <content:encoded>&lt;b&gt;Lorem&lt;/b&gt; ipsum</content:encoded>
        <guid>eb4a43a9-0e30-446a-b92e-de65966d5a1a</guid>
        <dc:creator>johannes</dc:creator>
        <dc:date>2016-05-04T06:53:45Z</dc:date>
      </item>
    </channel>
  </rss>
`);

console.log(feed.title); // Instant Article Test

feed.items.forEach(item => {
  // My first Instant Article: https://example.com/my-first-article
  console.log(`${item.title}: ${item.link}`);
});
```

## Output

Check out the full output format in [test/output/reddit.json](test/output/reddit.json)

```yaml
feedUrl: 'https://www.reddit.com/.rss'
title: 'reddit: the front page of the internet'
description: ""
link: 'https://www.reddit.com/'
items:
    - title: 'The water is too deep, so he improvises'
      link: 'https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/'
      pubDate: 'Thu, 12 Nov 2015 21:16:39 +0000'
      creator: "John Doe"
      content: '<a href="http://example.com">this is a link</a> &amp; <b>this is bold text</b>'
      contentSnippet: 'this is a link & this is bold text'
      guid: 'https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/'
      categories:
          - funny
      isoDate: '2015-11-12T21:16:39.000Z'
```

##### Notes:
* The `contentSnippet` field strips out HTML tags and unescapes HTML entities
* The `dc:` prefix will be removed from all fields
* Both `dc:date` and `pubDate` will be available in ISO 8601 format as `isoDate`
* If `author` is specified, but not `dc:creator`, `creator` will be set to `author` ([see article](http://www.lowter.com/blogs/2008/2/9/rss-dccreator-author))
* Atom's `updated` becomes `lastBuildDate` for consistency

## XML Options

### Custom Fields
If your RSS feed contains fields that aren't currently returned, you can access them using the `customFields` option.

```js
const rssParser = new Parser({
  customFields: {
    feed: ['thing'],
    item: [
      ['title', 'customName'],
    ]
  }
});

const feed = await rssParser.parseString(`
  <?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
    <channel>
      <thing>Instant Article Test 2</thing>
      <item>
        <title>My second Instant Article</title>
        <link>https://example.com/my-second-article</link>
      </item>
    </channel>
  </rss>
`);

console.log(feed.thing); // Instant Article Test 2

feed.items.forEach(item => {
  // My second Instant Article: https://example.com/my-second-article
  // console.log(`${item.customName}: ${item.link}`); 
  expect(`${item.customName}: ${item.link}`).to.equal(
    'My second Instant Article: https://example.com/my-second-article'
  );
});
```

To rename fields, you can pass in an array with two items, in the format `[fromField, toField]`:

```js
const parser = new Parser({
  customFields: {
    item: [
      ['dc:coAuthor', 'coAuthor'],
    ]
  }
})
```

To pass additional flags, provide an object as the third array item. Currently there is one such flag:

* `keepArray`: `true` to return *all* values for fields that can have multiple entries. Default: return the first item only.

```js
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', {keepArray: true}],
    ]
  }
})
```

### Default RSS version
If your RSS Feed doesn't contain a `<rss>` tag with a `version` attribute,
you can pass a `defaultRSS` option for the Parser to use:
```js
const parser = new Parser({
  defaultRSS: 2.0
});
```


### xml2js passthrough
`rss-to-js` uses [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
to parse XML. You can pass [these options](https://github.com/Leonidas-from-XIV/node-xml2js#options)
to `new xml2js.Parser()` by specifying `options.xml2js`:

```js
const parser = new Parser({
  xml2js: {
    emptyTag: '--EMPTY--',
  }
});
```

## Contributing
Contributions are welcome! If you are adding a feature or fixing a bug, please be sure to add a [test case](https://github.com/johannessanders/rss-to-js/tree/master/test/input)

### Running Tests
The tests run the RSS parser for several sample RSS feeds in `test/input` and outputs the resulting JSON into `test/output`. If there are any changes to the output files the tests will fail.

To check if your changes affect the output of any test cases, run

`npm test`

To update the output files with your changes, run

`WRITE_GOLDEN=true npm test`

### Publishing Releases
```bash
npm run build
git commit -a -m "Build distribution"
npm version minor # or major/patch
npm publish
git push --follow-tags
```

## Author(s)

- [Johannes Sanders](https://johannes.space) developer @[Blip](https://blip.agency)