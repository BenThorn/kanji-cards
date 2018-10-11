const parseJSON = (xhr, content) => {
  //parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);
  console.dir(obj);

  if(obj) {
    
  }
};


const handleResponse = (xhr, parseResponse) => {
  const content = document.querySelector('#content');
  
  switch(xhr.status) {
    case 200: //if success
      content.innerHTML = `<b>Success</b>`;
      break;
    case 201: //if created
      content.innerHTML = `<b>Create</b>`;
      break;
    case 204: //if updated
      content.innerHTML = '<b>Updated (No Content)</b>';
      break;
    case 400: //if bad request
      content.innerHTML = `<b>Bad Request</b>`;
      break;
    case 404: //if not found
      content.innerHTML = `<b>Resource Not Found</b>`;
      break;
    default: //any other status
      content.innerHTML = `Error code not implemented by client.`;
      break;
  }
  if(parseResponse && xhr.status !== 204) {
    parseJSON(xhr, content);
  }
};

const parseResults = (xhr, searchResults) => {
  const obj = JSON.parse(xhr.response);
  console.dir(obj);
  searchResults.innerHTML = "";

  if(obj) {
    const resultData = obj.data;
    if (resultData.length === 0){

    } else {
      let result;

      for(let i = 0; i < resultData.length; i++){
        result = {
          kanji: resultData[i].japanese[0].word,
          kana: resultData[i].japanese[0].reading,
          english: resultData[i].senses[0].english_definitions
        }
        const resultDiv = document.createElement('div');
        const kanji = document.createElement('div');
        kanji.id = "kanji";
        kanji.textContent = result.kanji;
        const kana = document.createElement('div');
        kana.id = "kana";
        kana.textContent = result.kana;
        const eng = document.createElement('div');
        eng.id = "english";
        let engDefs = "";
        if(result.english.length > 1){
          for (let i = 0; i < result.english.length; i++) {
            if (i !== result.english.length - 1){
              engDefs += result.english[i] + ", ";
            } else {
              engDefs += result.english[i];
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

const handleSearch = (xhr) => {
  const searchResults = document.querySelector("#searchResults");

  if (xhr.status === 200) {
    parseResults(xhr, searchResults);
  }
  
};

const requestUpdate = (e, userForm) => {
  const url = userForm.querySelector('#urlField').value;
  const method = userForm.querySelector('#methodSelect').value;
  
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');
  if(method == 'get') {
    xhr.onload = () => handleResponse(xhr, true);
  } else {
    xhr.onload = () => handleResponse(xhr, false);
  }

  xhr.send();

  e.preventDefault();
  return false;
};

const requestAdd = (e, nameForm) => {
  const url = '/addUser';
  const method = 'post';
  const nameField = nameForm.querySelector("#nameField");
  const ageField = nameForm.querySelector("#ageField");

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleResponse(xhr, true);

  const formData = `name=${nameField.value}&age=${ageField.value}`;
  
  xhr.send(formData);

  e.preventDefault();
  return false;
};

const requestSearch = (e, searchForm) => {
  const term = document.querySelector("#searchField").value;
  const url = `/search?${term}`;
  const method = 'get';

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleSearch(xhr);

  xhr.send();
  
  e.preventDefault();
  return false;
};

const init = () => {
  const searchForm = document.querySelector("#searchForm");

  const searchRequest = (e) => requestSearch(e, searchForm);

  searchForm.addEventListener('submit', searchRequest);
};

window.onload = init;