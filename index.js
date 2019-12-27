const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const dbb = require('./resources/js/queries');
var fs = require('fs');
app.use(bodyParser.json());              // Add support for JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Add support for URL encoded bodies
var pug = require('pug');
var pg=require('pg-promise')();

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)


// set the view engine to ejs
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/')); // This line is necessary for us to use relative paths and access our resources directory

if(process.env.ENVIRONMENT == 'PROD')
{
  var db=ph(process.env.DATABASE_URL)
}
else
{
  const dbConfig={
  	host: process.env.DB_HOST || 'localhost',
  	port: process.env.DB_PORT || 5432,  //probably 5432 for you
  	database: process.env.DB_NAME || 'api',   //enter in your username password for pg
  	user: process.env.DB_USER || 'me',
  	password:process.env.DB_PASSWORD || 'Dukey7725$$@@'
  };
  var db=pg(dbConfig);
}

app.listen(process.env.PORT || 3000);
console.log('3000 is the magic port');

///////////////////////////////////////////////////////////////////////////////
// routes
app.post('/users', dbb.createUser)
app.post('/order', dbb.updateInventory)
app.post('/settings', dbb.updatePassword)


app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/views/login.html', __dirname + '/resources/css/signin.css')
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
		var sql= "SELECT * FROM USERS WHERE user_name = $2 AND user_password = $3;";
  	db.any(sql, [user_name, user_password])
  			.then(function(results){
						console.log(results.length);
							if (results.length > 0) {
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

app.get('/inventory', function(req,res) {
  var query = "select * from inventory where ingredient_quantity > 10;";
  var query1 = "select * from inventory where ingredient_quantity <= 10";
  db.task('get-everything', task => {
    return task.batch([
      task.any(query),
      task.any(query1)
    ]);
  })
  .then(data => {
    res.render('inventory.pug', {
      my_title: "Inventory Page",
      inventory_item_Full: data[0],
      inventory_item_AlmostEmpty: data[1]

    })
  })
  .catch(error => {
    console.log("error");
    res.render('inventory.pug', {
      my_title: "Inventory Page",
      inventory_item_Full: "",
      inventory_item_AlmostEmpty: ""
    })
  })
});

app.get('/order_forms', (req, res) => {
  var query = "select * from inventory where ingredient_quantity > 10;";
  var query1 = "select * from inventory where ingredient_quantity <= 10";
  db.task('get-everything', task => {
    return task.batch([
      task.any(query),
      task.any(query1)
    ]);
  })
  .then(data => {
    res.render('order_forms.pug', {
      my_title: "Inventory Page",
      inventory_item_Full: data[0],
      inventory_item_AlmostEmpty: data[1]

    })
  })
  .catch(error => {
    console.log("error");
    res.render('order_forms.pug', {
      my_title: "Inventory Page",
      inventory_item_Full: "",
      inventory_item_AlmostEmpty: ""
    })
  })
  console.log("in order forms");
})

app.post('/reg', function(request, response) {
 console.log("redirect");
 response.redirect('/views/registerv2.html');
 response.end();
});

app.get('/register', (request, response) => {
  console.log("in register");
  response.sendFile(__dirname + '/views/registerv2.html')
})


app.get('/home', function(request, response) {
	response.sendFile(__dirname + '/views/home.html')
});

app.post('/home', function (req, res) {
  console.log(req.body.todo + " is added to top of the list.");
  res.redirect('/');
});


app.get('/setting', function(request, response) {
	response.sendFile(__dirname + '/views/settings.html')
});
