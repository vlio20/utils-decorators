const {promises} = require('fs');

async function build() {
  const indexFile = await promises.readFile('_index.html', 'utf-8');
  const index = indexFile
    .replace('<!--', '')
    .replace('-->', '');

  promises.writeFile('./index.html', index);
}

build();
