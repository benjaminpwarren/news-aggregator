self.addEventListener('message', function(e){

  request(e.data.url, e.data.callbackId);

});

function response(e, callbackId){
  var data = {
    'response': e.target.response,
    'callbackId': callbackId
  };

  self.postMessage(data);
}

function request(url, callbackId) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function(e){response(e,callbackId)};
  xhr.send();
}