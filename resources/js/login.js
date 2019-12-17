var express= require('express'),
app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var http= require('http');
var fs= require('fs');

//const bodyParser = require('body-parser'); // Add the body-parser tool has been added
app.use(bodyParser.json());              // Add support for JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));
app.use(express.static('public'));

var pg=require('pg-promise')();


const dbConfig={
	host: 'localhost',
	port: 5432,  //probably 5432 for you
	database: 'shelflife',   //enter in your username password for pg
	user: 'maurovargas',
	password:'Dukey7725$$@@'
};
var db=pg(dbConfig);


app.get('/login', function(req, res) {
    //res.sendFile('views/login.html', ,{root: __dirname })
    res.sendFile('/Users/maurovargas/Documents/CSCI3308_FinalProject_ShelfLife_Deliverables-master/Shelf_life/views/login.html','/Documents/CSCI3308_FinalProject_ShelfLife_Deliverables-master/shelf_life/resources/css/signin.css')
		console.log('app.get');
		console.log(req.action);
});

app.post('/auth', function(request, response) {
  console.log('/auth');
	var username = request.body.em;
	var password = request.body.pw;
	console.log(username);
	console.log(password);
	//var popup= require('popups');
	if (username && password) {
		var sql= "SELECT * FROM USERS WHERE user_Name = $1 AND user_Password = $2;";
		var queryAddUser = "SELECT * from user;";
  	db.any(queryAddUser, [username, password])
  			.then(function(results){
						console.log(results.length);
							if (results.length > 0) {
									console.log(queryAddUser);
									//request.session.loggedin = true;
									//request.session.username = username;
									response.redirect('/home');
						} else {
								response.redirect('/login');
				}
				response.end();
				})
				.catch(function(err){
 				console.log("error",err);
 				})
} else {
	response.redirect('/login');
	response.end();
  }
});

const createUser = (request, response) => {
  const { name, email } = request.body

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${result.insertId}`)
  })
}

app.post('/reg', function(request, response) {
 console.log("redirect");
 response.redirect('/register');
 response.end();
});

app.get('/register', function(request, response) {
  console.log("in register");
	response.sendFile('/Users/maurovargas/Documents/CSCI3308_FinalProject_ShelfLife_Deliverables-master/Shelf_life/views/register.html')
});

app.get('/home', function(request, response) {
	response.sendFile('/Users/maurovargas/Documents/CSCI3308_FinalProject_ShelfLife_Deliverables-master/Shelf_life/views/home.html')
});

app.listen(3000);
console.log('3000 is the magic port');
