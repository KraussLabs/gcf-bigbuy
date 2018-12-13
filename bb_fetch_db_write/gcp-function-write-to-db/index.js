/**
 * Get Products
 */
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

//bbrequests('https://api.bigbuy.eu/', 'rest/catalog/attributegroups', 'json', payload);
bbrequests('https://api.bigbuy.eu/', 'rest/catalog/products', 'json', payload);

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

    mysqlPool.query('DROP TABLE products ', (err, results) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Dropped table succesfully');
      mysqlPool.query(' CREATE TABLE products \n ( manufacturer INT(15), bigbuy_id INT(15) NOT NULL, sku TEXT(20) NOT NULL, ean13 TEXT(20) NOT NULL, weight DOUBLE(10,3), height DOUBLE(10,3), width DOUBLE(10,3), depth DOUBLE(10,3), dateUpd TEXT, category INT(10), categories TINYTEXT, dateUpdDescription TEXT, dateUpdImages TEXT, dateUpdStock TEXT, wholesalePrice DOUBLE(10,3), retailPrice DOUBLE(10,3), dateAdd TEXT, video TINYTEXT,  active TINYINT, images TINYTEXT, attributes TINYTEXT, tags TINYTEXT, taxRate INT(10), taxId INT(10), dateUpdProperties TEXT, dateUpdCategories TEXT, inShopsPrice DOUBLE(10,3), PRIMARY KEY (bigbuy_id)) ENGINE=INNODB;', (err, results) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Created new table succesfully');
           mysqlPool.query('INSERT INTO products(manufacturer,bigbuy_id,sku,ean13,weight,height,width,depth,dateUpd,category,categories,dateUpdDescription,dateUpdImages,dateUpdStock,wholesalePrice,retailPrice,dateAdd,video,active,images,attributes,tags,taxRate,taxId,dateUpdProperties,dateUpdCategories,inShopsPrice)'+  
           '\n VALUES '+datatowrite+' ;' , (err, results) => {
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
 
  messedUpData = messedUpData.replace("[", "(");
  messedUpData = messedUpData.replace("]", ")");
  messedUpData = messedUpData.replace(/},{/g, "), (");
  messedUpData = messedUpData.replace("{", "");
  messedUpData = messedUpData.replace("}", "");
  messedUpData = messedUpData.replace(/"manufacturer"/g,'');
  messedUpData = messedUpData.replace(/"id"/g,'');
  messedUpData = messedUpData.replace(/"sku"/g,'');
  messedUpData = messedUpData.replace(/"ean13"/g,'');
  messedUpData = messedUpData.replace(/"weight"/g,'');
  messedUpData = messedUpData.replace(/"height"/g,'');
  messedUpData = messedUpData.replace(/"width"/g,'');
  messedUpData = messedUpData.replace(/"depth"/g,'');
  messedUpData = messedUpData.replace(/"dateUpd"/g,'');
  messedUpData = messedUpData.replace(/"category"/g,'');
  messedUpData = messedUpData.replace(/"categories"/g,'');
  messedUpData = messedUpData.replace(/"dateUpdDescription"/g,'');
  messedUpData = messedUpData.replace(/"dateUpdImages"/g,'');
  messedUpData = messedUpData.replace(/"dateUpdStock"/g,'');
  messedUpData = messedUpData.replace(/"wholesalePrice"/g,'');
  messedUpData = messedUpData.replace(/"retailPrice"/g,'');
  messedUpData = messedUpData.replace(/"dateAdd"/g,'');
  messedUpData = messedUpData.replace(/"video"/g,'');
  messedUpData = messedUpData.replace(/"active"/g,'');
  messedUpData = messedUpData.replace(/"images"/g,'');
  messedUpData = messedUpData.replace(/"attributes"/g,'');
  messedUpData = messedUpData.replace(/"tags"/g,'');
  messedUpData = messedUpData.replace(/"taxRate"/g,'');
  messedUpData = messedUpData.replace(/"taxId"/g,'');
  messedUpData = messedUpData.replace(/"dateUpdProperties"/g,'');
  messedUpData = messedUpData.replace(/"dateUpdCategories"/g,'');
  messedUpData = messedUpData.replace(/"inShopsPrice"/g,'');
  messedUpData = messedUpData.replace(/:/g,'');
  messedUpData = messedUpData.replace(/"null"/g,'null');

  cleanData = messedUpData;
  //console.log("cleaned your json request. Here's the first element: " + cleanData);
  
  return cleanData;

};



