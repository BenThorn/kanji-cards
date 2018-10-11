const http = require('http');
const url = require('url');
const query = require('querystring');
const getJSON = require('get-json');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
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
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

const jishoApiCall = (request, response, parsedUrl) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const url = 'https://jisho.org/api/v1/search/words?keyword=' + parsedUrl.query;
  let object = {};

  getJSON(url, (error, res) => {
    if(!error){
      const object = {
        data: res.data
      }
      response.write(JSON.stringify(object));
      response.end();
    } else {
      console.log(error);
    }
  });
  
};

const handleGet = (request, response, parsedUrl) => {
  switch (request.method) {
    case 'GET':
      if (parsedUrl.pathname === '/') {
        htmlHandler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        htmlHandler.getCSS(request, response);
      } else if (parsedUrl.pathname === '/bundle.js') {
        htmlHandler.getJS(request, response);
      } else if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsers(request, response);
      } else if (parsedUrl.pathname === '/search') {
        jishoApiCall(request, response, parsedUrl);
      } else {
        jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsersMeta(request, response);
      } else {
        jsonHandler.notFoundMeta(request, response);
      }
      break;
    default:
      jsonHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  // const params = query.parse(parsedUrl.query);
  // const acceptedTypes = request.headers.accept.split(',');

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};


http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
