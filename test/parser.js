"use strict";

var fs = require('fs');
var HTTP = require('http');

var Parser = require('../index.js');

var expect = require('chai').expect;

var IN_DIR = __dirname + '/input';
var OUT_DIR = __dirname + '/output';

describe('Parser', function() {
  var testParseForFile = function(name, ext, options, done) {
    if (typeof done === 'undefined') {
      done = options;
      options = {};
    }
    let parser = new Parser(options);
    let xml = fs.readFileSync(IN_DIR + '/' + name + '.' + ext, 'utf8');
    parser.parseString(xml, function(err, parsed) {
      if (err) console.log(err)
      expect(err).to.equal(null);
      if (process.env.WRITE_GOLDEN) {
        fs.writeFileSync(OUT_DIR + '/' + name + '.json', JSON.stringify({feed: parsed}, null, 2));
      } else {
        var expected = fs.readFileSync(OUT_DIR + '/' + name + '.json', 'utf8')
        expected = JSON.parse(expected);
        expect({feed: parsed}).to.deep.equal(expected);
      }
      done();
    })
  }

  it('should parse Reddit', (done) => {
    testParseForFile('reddit', 'rss', done);
  })

  it('should parse sciencemag.org (RSS 1.0)', (done) => {
    testParseForFile('rss-1', 'rss', done);
  })

  it('should parse craigslist (RSS 1.0)', (done) => {
    testParseForFile('craigslist', 'rss', done);
  })

  it('should parse atom', (done) => {
    testParseForFile('reddit-atom', 'rss', done);
  })

  it('should parse atom feed', (done) => {
    testParseForFile('gulp-atom', 'atom', done);
  })

  it('should parse reddits new feed', (done) => {
    testParseForFile('reddit-home', 'rss', done);
  })

  it('should parse with missing fields', (done) => {
    testParseForFile('missing-fields', 'atom', done)
  })

  it('should parse with incomplete fields', (done) => {
    testParseForFile('incomplete-fields', 'atom', done)
  })

  it('should parse heise', (done) => {
    testParseForFile('heise', 'atom', done);
  })

  it('should parse heraldsun', (done) => {
    testParseForFile('heraldsun', 'rss', done);
  });

  it('should parse UOL Noticias', (done) => {
    testParseForFile('uolNoticias', 'rss', { defaultRSS: 2.0 }, done);
  });

  it('should NOT parse UOL Noticias, if no default RSS is provided', (done) => {
    function willFail() {
      testParseForFile('uolNoticias', 'rss', done);
    }
    expect(willFail).to.throw;
    done();
  });

  it('should parse Instant Article', (done) => {
    testParseForFile('instant-article', 'rss', done);
  });

  it('should parse Feedburner', (done) => {
    testParseForFile('feedburner', 'atom', done);
  });

  it('should parse podcasts', (done) => {
    testParseForFile('narro', 'rss', done);
  });

  it('should parse multiple links', (done) => {
    testParseForFile('many-links', 'rss', done);
  });

  it('should parse itunes with empty href', (done) => {
    testParseForFile('itunes-href', 'rss', done);
  });

  it('should pass xml2js options', (done) => {
    testParseForFile('xml2js-options', 'rss', {xml2js: {emptyTag: 'EMPTY'}}, done);
  });

  it('should throw error for unrecognized', (done) => {
    let parser = new Parser();
    let xml = fs.readFileSync(__dirname + '/input/unrecognized.rss', 'utf8');
    parser.parseString(xml, function(err, parsed) {
      expect(err.message).to.contain('Feed not recognized as RSS');
      done();
    });
  });

  it('should omit iTunes image if none available during decoration', (done) => {
    const rssFeedWithMissingImage = __dirname + '/input/itunes-missing-image.rss';
    const xml = fs.readFileSync(rssFeedWithMissingImage, 'utf8');
    let parser = new Parser();
    parser.parseString(xml, function(err, parsed) {
      expect(err).to.be.null;
      expect(parsed).to.not.have.deep.property('feed.itunes.image');
      done();
    });
  });

  it('should parse custom fields', (done) => {
    var options = {
      customFields: {
        feed: ['language', 'copyright', 'nested-field'],
        item: ['subtitle']
      }
    };
    testParseForFile('customfields', 'rss', options, done);
  });

  it('should parse Atom feed custom fields', (done) => {
    var options = {
      customFields: {
        feed: ['totalViews'],
        item: ['media:group']
      }
    };
    testParseForFile('atom-customfields', 'atom', options, done);
  });

  it('should parse sibling custom fields', (done) => {
    var options = {
      customFields: {
        item: [['media:content', 'media:content', {keepArray: true}]]
      }
    };
    testParseForFile('guardian', 'rss', options, done);
  });


  it('should parse itunes categories', (done) => {
    testParseForFile('itunes-category', 'rss', done);
  });

  it('should parse itunes keywords', (done) => {
    testParseForFile('itunes-keywords', 'rss', done);
  });

  it('should parse itunes keywords as array', (done) => {
    testParseForFile('itunes-keywords-array', 'rss', done);
  });



  it('should parse Jira\'s feed', (done) => {
    testParseForFile('jira-feed', 'atom', done);
  });

  it('async/await example should work', async () => {
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

    // console.log(feed.title); // Instant Article Test

    feed.items.forEach(item => {
      // My first Instant Article: https://example.com/my-first-article
      // console.log(`${item.title}: ${item.link}`);
      expect(`${item.title}: ${item.link}`).to.equal(
        'My first Instant Article: https://example.com/my-first-article'
      );
    });

    expect(feed).deep.to.equal({
      "items": [
        {
          "creator": "johannes",
          "date": "2016-05-04T06:53:45Z",
          "dc:date": "2016-05-04T06:53:45Z",
          "isoDate": "2016-05-04T06:53:45.000Z",
          "title": "My first Instant Article",
          "link": "https://example.com/my-first-article",
          "content:encoded": "<b>Lorem</b> ipsum",
          "dc:creator": "johannes",
          "content": "Lorem ipsum",
          "contentSnippet": "Lorem ipsum",
          "guid": "eb4a43a9-0e30-446a-b92e-de65966d5a1a"
        }
      ],
      "title": "Instant Article Test",
      "description": "1, 2, 1, 2… check the mic!",
      "link": "https://example.com",
    }); 
  });

  it('custom fields example should work', async () => {
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

    // console.log(feed.thing); // Instant Article Test 2
    expect(feed.thing).to.equal(
      'Instant Article Test 2'
    );

    feed.items.forEach(item => {
      // My second Instant Article: https://example.com/my-second-article
      // console.log(`${item.customName}: ${item.link}`); 
      expect(`${item.customName}: ${item.link}`).to.equal(
        'My second Instant Article: https://example.com/my-second-article'
      );
    });
    expect(feed).deep.to.equal({
      "thing": "Instant Article Test 2",
      "items": [
        {
          "title": "My second Instant Article",
          "customName": "My second Instant Article",
          "link": "https://example.com/my-second-article",
        }
      ]
    }); 
  });
})
