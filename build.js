const { createClient } = require('contentful');
const handlebars = require('handlebars');
const format = require('date-fns/format');
const fs = require('fs-extra');
const showdown = require('showdown');

const converter = new showdown.Converter();
const DIST = './dist';

function getProcessedPresent(present) {
  const htmlNotes = converter.makeHtml(present.fields.notes);
  return {
    ...present.fields,
    notes: htmlNotes,
    date: format(new Date(present.sys.updatedAt), 'dd/MM/yyyy'),
  };
}

const client = createClient({
  accessToken: process.env.CONTENTFUL_TOKEN,
  space: process.env.CONTENTFUL_SPACE,
});

(async () => {
  const { items: presents } = await client.getEntries({
    content_type: 'present',
  });

  const indexTemplate = handlebars.compile(await fs.readFile('presents.handlebars', 'utf8'));
  await fs.writeFile(`${DIST}/index.html`, indexTemplate({
    presents: presents.map(getProcessedPresent),
  }));
})();
