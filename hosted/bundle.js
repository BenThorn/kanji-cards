'use strict';

var parseJSON = function parseJSON(xhr, content) {
  //parse response (obj will be empty in a 204 updated)
  var obj = JSON.parse(xhr.response);
  console.dir(obj);

  if (obj) {}
};

var handleResponse = function handleResponse(xhr, parseResponse) {
  var content = document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      //if success
      content.innerHTML = '<b>Success</b>';
      break;
    case 201:
      //if created
      content.innerHTML = '<b>Create</b>';
      break;
    case 204:
      //if updated
      content.innerHTML = '<b>Updated (No Content)</b>';
      break;
    case 400:
      //if bad request
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404:
      //if not found
      content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default:
      //any other status
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }
  if (parseResponse && xhr.status !== 204) {
    parseJSON(xhr, content);
  }
};

var parseResults = function parseResults(xhr, searchResults) {
  var obj = JSON.parse(xhr.response);
  console.dir(obj);
  searchResults.innerHTML = "";

  if (obj) {
    var resultData = obj.data;
    if (resultData.length === 0) {} else {
      var result = void 0;

      for (var i = 0; i < resultData.length; i++) {
        result = {
          kanji: resultData[i].japanese[0].word,
          kana: resultData[i].japanese[0].reading,
          english: resultData[i].senses[0].english_definitions
        };
        var resultDiv = document.createElement('div');
        var kanji = document.createElement('div');
        kanji.id = "kanji";
        kanji.textContent = result.kanji;
        var kana = document.createElement('div');
        kana.id = "kana";
        kana.textContent = result.kana;
        var eng = document.createElement('div');
        eng.id = "english";
        var engDefs = "";
        if (result.english.length > 1) {
          for (var _i = 0; _i < result.english.length; _i++) {
            if (_i !== result.english.length - 1) {
              engDefs += result.english[_i] + ", ";
            } else {
              engDefs += result.english[_i];
            }
          }
        } else {
          engDefs = result.english[0];
        }

        eng.textContent = engDefs;

        resultDiv.appendChild(kanji);
        resultDiv.appendChild(kana);
        resultDiv.appendChild(eng);
        resultDiv.id = 'resultDiv';
        searchResults.appendChild(resultDiv);

        console.log(result);
      }
    }
  }
};

var handleSearch = function handleSearch(xhr) {
  var searchResults = document.querySelector("#searchResults");

  if (xhr.status === 200) {
    parseResults(xhr, searchResults);
  }
};

var requestUpdate = function requestUpdate(e, userForm) {
  var url = userForm.querySelector('#urlField').value;
  var method = userForm.querySelector('#methodSelect').value;

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');
  if (method == 'get') {
    xhr.onload = function () {
      return handleResponse(xhr, true);
    };
  } else {
    xhr.onload = function () {
      return handleResponse(xhr, false);
    };
  }

  xhr.send();

  e.preventDefault();
  return false;
};

var requestAdd = function requestAdd(e, nameForm) {
  var url = '/addUser';
  var method = 'post';
  var nameField = nameForm.querySelector("#nameField");
  var ageField = nameForm.querySelector("#ageField");

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleResponse(xhr, true);
  };

  var formData = 'name=' + nameField.value + '&age=' + ageField.value;

  xhr.send(formData);

  e.preventDefault();
  return false;
};

var requestSearch = function requestSearch(e, searchForm) {
  var term = document.querySelector("#searchField").value;
  var url = '/search?' + term;
  var method = 'get';

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleSearch(xhr);
  };

  xhr.send();

  e.preventDefault();
  return false;
};

var init = function init() {
  var searchForm = document.querySelector("#searchForm");

  var searchRequest = function searchRequest(e) {
    return requestSearch(e, searchForm);
  };

  searchForm.addEventListener('submit', searchRequest);
};

window.onload = init;
