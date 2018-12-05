
//const mysql = require('mysql');
const request = require("request");
const http = require("https");
//const bigbuy = require("./bigbuy.js");
var EventEmitter = require("events").EventEmitter;


/**
 * TODO(developer): specify SQL connection details
 */
const connectionName = process.env.INSTANCE_CONNECTION_NAME;
const dbUser = process.env.SQL_USER ;
const dbPassword = process.env.SQL_PASSWORD ;
const dbName = process.env.SQL_NAME ;

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

// bigbuy API request details

//node version
//const getDataFromBB = () => {
// GCF versions
exports.getDataFromBB = () => {


bbrequests('https://api.bigbuy.eu/', 'rest/catalog/products', 'json', payload);

payload.on('update', function () {
    console.log("got all these responses: ")
    console.log(payload.data); 
});

};

//getDataFromBB();

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
/*

let mysqlPool;


exports.mysqlDemo = (req, res) => {
  // Initialize the pool lazily, in case SQL access isn't needed for this
  // GCF instance. Doing so minimizes the number of active SQL connections,
  // which helps keep your GCF instances under SQL connection limits.
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig);
  }

  const messageToStore = req.query.message;

  mysqlPool.query('INSERT INTO messages(title,timestamp, status) VALUES ("'+messageToStore+'", now(), 2)', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('Message stored succesfully: ' + messageToStore);
    }
  });

  // Close any SQL resources that were declared inside this function.
  // Keep any declared in global scope (e.g. mysqlPool) for later reuse.
} */

const bbrequests = (environment, path, format, saveBodyTo) => {

//exports.bbrequests = (environment, path, format, saveBodyTo) => {

let options = { method: 'GET',
  url: environment+path+"."+format,
  headers: 
   { 'Postman-Token': 'ce12b485-aa27-435d-8679-db85780c1fb1',
     'cache-control': 'no-cache',
     /// TODO - change this code to get an env variable that is the BigBuy token
     Authorization: 'Bearer NjBlOGY3MmY1ZGQwOWYzN2Y4NzJkNDI3MTcwMjA0ZGU1NWFkZTAyYTlkYWIxMDdiODljOGI4NTE4MDEwZmViZA' } };

request(options, function (error, response, data) {
  if (error) throw new Error(error);
  
  saveBodyTo.data = data;
  saveBodyTo.emit('update');
})
};


