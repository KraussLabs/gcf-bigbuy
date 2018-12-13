
const mysql = require('mysql');
const request = require("request");
const http = require("https");
var EventEmitter = require("events").EventEmitter;


/**
 * TODO(developer): specify SQL connection details
 */
const connectionName = process.env.INSTANCE_CONNECTION_NAME ;
const dbUser = process.env.SQL_USER ;
const dbPassword = process.env.SQL_PASSWORD ;
const dbName = process.env.SQL_NAME ;
const bigbuytoken = process.env.BBKEY; 

const mysqlConfig = {
  connectionLimit: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName
};
if (process.env.NODE_ENV === 'production') {
  mysqlConfig.socketPath = `/cloudsql/${connectionName}`;
}

let payload = new EventEmitter();

exports.getDataFromBB = () => {

//bbrequests('https://api.bigbuy.eu/', 'rest/catalog/productsstock', 'json', payload);
bbrequests('https://api.bigbuy.eu/', 'rest/catalog/productsstockavailable', 'json', payload);

payload.on('update', function () {
    console.log("Object updated")
    let mydata = sqlify(payload.data);
    console.log("starting the database functions");
    writeToDB(mydata);

});

};


const writeToDB = (datatowrite) => {

let mysqlPool;  

  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig);
  }
// delete the initial contents of the table by dropping it and creating a new one with the same specs:

    mysqlPool.query('DROP TABLE inventory ', (err, results) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Dropped table succesfully');
      mysqlPool.query(' CREATE TABLE inventory \n (bigbuy_id INT(15), quantity INT(15), minHandlingDays INT(15), maxHandlingDays INT(15), sku TEXT, PRIMARY KEY (bigbuy_id)) ENGINE=INNODB;', (err, results) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Created new table succesfully');
           mysqlPool.query('INSERT INTO inventory(bigbuy_id, quantity, minHandlingDays, maxHandlingDays, sku)'+  
           '\n VALUES ('+datatowrite+' ;' , (err, results) => {
            if(err){
            console.log("error while inserting the blob");
            console.error(err);
            } else {
            console.log('sql job started');
            };
           });
      };
    }); 
};
});
};


const bbrequests = (environment, path, format, saveBodyTo) => {

let options = { method: 'GET',
  url: environment+path+"."+format,
  headers: 
   { 'Postman-Token': 'ce12b485-aa27-435d-8679-db85780c1fb1',
     'cache-control': 'no-cache',
     
     Authorization: bigbuytoken } };

request(options, function (error, response, data) {
  if (error) throw new Error(error);
  saveBodyTo.data = data;
  saveBodyTo.emit('update');
})
}

const sqlify = (messedUpData) => {
 // transforms the dirty bb payload into an array of json objects 
 
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
  //console.log("cleaned your json request. Here's the first element: " + cleanData);
  
  return cleanData;

};



