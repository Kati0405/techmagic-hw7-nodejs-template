const http = require('http');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface(process.stdin, process.stdout);

const runApp = (res) => {
  rl.question(
    'Please, write in the path to your html template: ',
    (htmlPath) => {
      rl.question(
        'Please, write in the path to you file with json data: ',
        async (jsonPath) => {
          try {
            const readFile = promisify(fs.readFile);
            let htmlFile = await readFile(htmlPath, 'utf-8');
            const jsonFile = await readFile(jsonPath, 'utf-8');
            const parsedData = JSON.parse(jsonFile);
            const regex = /\{\{(\w+(\.\w+)*)\}\}/g;
            const html = htmlFile.replace(regex, (match, key) => {
              const keys = key.split('.');
              let value = parsedData;
              for (const k of keys) {
                value = value[k];
              }
              return value.toString();
            });
            res.writeHead(200, { 'Content-type': 'text/html' });
            res.end(html);
            console.log('Check the output in the browser');
          } catch (err) {
            console.log('Opps, something went wrong', err);
            runApp(res);
          }
        }
      );
    }
  );
};

const server = http.createServer((req, res) => {
  if (req.url === '/style.css') {
    const cssFilePath = './style.css';
    const cssStream = fs.createReadStream(cssFilePath, 'utf-8');
    res.writeHead(200, { 'Content-type': 'text/css' });
    cssStream.pipe(res);
  } else {
    runApp(res);
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

server.on('close', () => {
  rl.close();
});
