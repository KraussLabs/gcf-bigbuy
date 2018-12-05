
const request = require("request");
const http = require("https");
var EventEmitter = require("events").EventEmitter;

const bbrequests = (environment, path, format, saveBodyTo) => {

//exports.bbrequests = (environment, path, format, saveBodyTo) => {

let options = { method: 'GET',
  url: environment+path+"."+format,
  headers: 
   { 'Postman-Token': 'ce12b485-aa27-435d-8679-db85780c1fb1',
     'cache-control': 'no-cache',
     json: true,
     /// TODO - change this code to get an env variable that is the BigBuy token
     Authorization: 'Bearer NjBlOGY3MmY1ZGQwOWYzN2Y4NzJkNDI3MTcwMjA0ZGU1NWFkZTAyYTlkYWIxMDdiODljOGI4NTE4MDEwZmViZA' } };

request(options, function (error, response, body) {
//  console.log(body);   
  saveBodyTo.data = body;
/*  saveBodyTo.data = saveBodyTo.data.replace("[", "{");
  saveBodyTo.data = saveBodyTo.data.replace("]", "}");
  saveBodyTo.data = saveBodyTo.data.replace(/},{/g, "}; {");
  saveBodyTo.data = saveBodyTo.data.split(";");
  console.log(saveBodyTo.data[3]);
  let myJson = JSON.parse(saveBodyTo.data[3]) */
  //console.log(myJson.id)
  saveBodyTo.emit('update');
})
};

const writeToDB = (data) => {
	
  data = arrayify(data);

  console.log(data)
};


let payload = new EventEmitter();

//bbrequests('https://api.bigbuy.eu/', 'rest/catalog/productsstockavailable', 'json', payload);
bbrequests('https://api.bigbuy.eu/', 'rest/catalog/productsstock', 'json', payload);
//    writeToDB(payload.data);

payload.on('update', function () {
    
    writeToDB(payload.data);

});

const arrayify = (messedUpData) => {
 // transforms the dirty bb payload into an array of json objects 
 
  messedUpData = messedUpData.replace(/"}/g, '")');
  messedUpData = messedUpData.replace(/{"/g, '(');
  messedUpData = messedUpData.replace(/:/g,'');
  messedUpData = messedUpData.replace(/\[{"/g, '');
  messedUpData = messedUpData.replace(/}"/g, '');
  messedUpData = messedUpData.replace(/"stocks"/g, '');
//  messedUpData = messedUpData.replace("]", ")");
//  messedUpData = messedUpData.replace(/},{/g, "), (");
//  messedUpData = messedUpData.replace("{", "");
 

// remove the string parts of it
  messedUpData = messedUpData.replace(/id"/g, '');
  messedUpData = messedUpData.replace(/quantity"/g, '');
  messedUpData = messedUpData.replace(/"minHandlingDays"/g, '');
  messedUpData = messedUpData.replace(/"maxHandlingDays"/g, '');
  messedUpData = messedUpData.replace(/"sku"/g, '');
  messedUpData = messedUpData.replace(/}/g, '');
  messedUpData = messedUpData.replace(/{/g, '');
  messedUpData = messedUpData.replace(/\[/g, '');
  messedUpData = messedUpData.replace(/]/g, '');
  messedUpData = messedUpData.replace(/\),\(/g, '},{');
  messedUpData = messedUpData.replace(/[(]/g, '');
  messedUpData = messedUpData.replace(/},{/g, '),(');


  messedUpData = messedUpData.replace(/"null"/g,'null');
  
  cleanData = messedUpData;
  console.log(cleanData);
  
  return cleanData;

};



