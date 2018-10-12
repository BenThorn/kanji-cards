const http = require('http');
const url = require('url');
const query = require('querystring');
const getJSON = require('get-json');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Handles post requests, eithr addDeck or addCard
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addDeck') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      jsonHandler.addDeck(request, res, bodyParams);
    });
  } else if (parsedUrl.pathname === '/addCard') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      jsonHandler.addCard(request, res, bodyParams);
    });
  }
};

// Calls the external Jisho API, which returns an array of results
const jishoApiCall = (request, response, parsedUrl) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${parsedUrl.query}`;

  getJSON(jishoUrl, (error, res) => {
    if (!error) {
      const object = {
        data: res.data,
      };
      response.writeHead(200, headers);
      response.write(JSON.stringify(object));
      response.end();
    } else {
      console.log(error);
    }
  });
};

// Get requests for HTML/CSS, search, decks, or cards(from decks)
const handleGet = (request, response, parsedUrl) => {
  switch (request.method) {
    case 'GET':
      switch (parsedUrl.pathname) {
        case '/':
          htmlHandler.getIndex(request, response);
          break;
        case '/style.css':
          htmlHandler.getCSS(request, response);
          break;
        case '/bundle.js':
          htmlHandler.getJS(request, response);
          break;
        case '/search':
          jishoApiCall(request, response, parsedUrl);
          break;
        case '/getDecks':
          jsonHandler.getDecks(request, response);
          break;
        case '/getCards':
          jsonHandler.getCards(request, response, parsedUrl.query);
          break;
        default:
          jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getDecks') {
        jsonHandler.getDecksMeta(request, response);
      } else {
        jsonHandler.notFoundMeta(request, response);
      }
      break;
    default:
      jsonHandler.notFound(request, response);
  }
};

// Points the request to POST or GET/HEAD
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};


http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
