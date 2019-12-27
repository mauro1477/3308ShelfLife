const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
var fs = require('fs');
var pug = require('pug');
var pg=require('pg-promise')();
const { Pool } = require('pg')
const pool = new Pool()
app.use(bodyParser.json());// Add support for JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Add support for URL encoded bodies
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)


// set the view engine to ejs
app.set('view engine', 'pug');
// This line is necessary for us to use relative paths and access our resources directory
// We need this shit to get resources aka imgs and node.js files
app.use(express.static(__dirname + '/'));


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

// app.post('/order', db.updateInventory)
// app.post('/settings', db.updatePassword)
//
//
//
// const updatePassword = (request, response) => {
//   const username = request.body.User_Name;
//   const newPassword = request.body.User_Password_New;
//   const currentPassword = request.body.User_Password;
//   console.log("Username", username);
//   console.log("New Password", newPassword);
//   console.log("Current Password", currentPassword);
//   pool.query(
//     'UPDATE users SET user_password = $3 WHERE user_name = $1 and user_password = $2',
//     [username, currentPassword, newPassword],
//     (error, results) => {
//       console.log(username);
//       console.log(currentPassword);
//       console.log(newPassword);
//       if (error) {
//         throw error
//       }
//       response.status(201).send(`User password modified with username: ${username}`)
//       response.redirect('/setting')
//     }
//   )
// }
// const updateInventory = (request, response) => {
//   console.log("updateInventory");
//   var YYYYMMDD = dt.myDate()
//   var user_id_node = request.body.user_id_html
//   const ingredient_id_node = request.body.ingredient_id_html;
//   var ingredient_quantity_node = request.body.ingredient_quantity_html;
//   var ingredient_quantity_holder = ingredient_quantity_node;
//   pool.query('select ingredient_cost from inventory where ingredient_id = $1',//get the ingredient cost from database
//    [ingredient_id_node], (error, results) =>{
//     var ingredient_cost_holder = results.rows[0].ingredient_cost;
//     pool.query('select ingredient_quantity from inventory where ingredient_id = $1',//get the ingredient quantity from  datebase
//     [ingredient_id_node], (error, results) =>{
//       ingredient_quantity_node = parseInt(ingredient_quantity_node)+ parseInt(results.rows[0].ingredient_quantity);// turn both variables to INT, then update into database
//       pool.query(
//         'UPDATE inventory SET ingredient_quantity = $2 WHERE ingredient_id = $1',
//         [ingredient_id_node, ingredient_quantity_node],
//         (error, results) => {
//         // console.log("user_id_node: " + user_id_node);
//         // console.log("YYYYMMDD: " + YYYYMMDD);
//         // console.log("ingredient_quantity_holder: " + ingredient_quantity_holder);
//         // console.log("ingredient_cost_holder: " + ingredient_cost_holder);
//           pool.query('INSERT INTO order_form(user_id, dateholder, quantity, cost ) VALUES($1, $2, $3, $4);',[user_id_node, YYYYMMDD, ingredient_quantity_holder, ingredient_cost_holder],
//                       (error, results) => {
//             if (error) {
//               throw error
//             }
//             response.redirect('/inventory');
//           })
//         }
//       )
//     })
//   })
// }
///////////////////////////////////////////////////////////////////////////////

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html', __dirname + '/resources/css/signin.css')
		console.log('app.get');
		console.log(req.action);
});

app.post('/users', function(request, response) {
  const Restaurant_Id = 1;
  const {User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2} = request.body//Make sure these name match to the html page
  pool.query('INSERT INTO users(Restaurant_Id, User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2 ) VALUES($1, $2, $3, $4, $5, $6, $7)', [Restaurant_Id, User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2 ], (error, results) => {
    if (error) {
      throw error
    }
    response.redirect('/home');
  }
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
