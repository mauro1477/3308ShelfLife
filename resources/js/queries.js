var dt = require('./my_modules.js');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'me',
  host: 'localhost',


  database: 'api',
  password: 'Dukey7725$$@@',
  port: 5432,
})

var timedata = [];
var chartData = [];
var i=0;
var get;
var sum;
var salesdata;
var result;
var totalsalesdata;


const createUser = (request, response) => {
  const Restaurant_Id = 1;
  const {User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2} = request.body//Make sure these name match to the html page
  pool.query('INSERT INTO users(Restaurant_Id, User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2 ) VALUES($1, $2, $3, $4, $5, $6, $7)', [Restaurant_Id, User_Name, User_Password, Restaurant_Name, Phone, Address_line_1, Address_line_2 ], (error, results) => {
    if (error) {
      throw error
    }
    response.redirect('/home');
  })
}

const updatePassword = (request, response) => {
  const username = request.body.User_Name;
  const newPassword = request.body.User_Password_New;
  const currentPassword = request.body.User_Password;
  console.log("Username", username);
  console.log("New Password", newPassword);
  console.log("Current Password", currentPassword);
  pool.query(
    'UPDATE users SET user_password = $3 WHERE user_name = $1 and user_password = $2',
    [username, currentPassword, newPassword],
    (error, results) => {
      console.log(username);
      console.log(currentPassword);
      console.log(newPassword);
      if (error) {
        throw error
      }
      response.status(201).send(`User password modified with username: ${username}`)
      response.redirect('/setting')
    }
  )
}


const updateInventory = (request, response) => {//settings
  console.log("updateInventory");
  var YYYYMMDD = dt.myDate()
  var user_id_node = request.body.user_id_html
  const ingredient_id_node = request.body.ingredient_id_html;
  var ingredient_quantity_node = request.body.ingredient_quantity_html;
  var ingredient_quantity_holder = ingredient_quantity_node;
  pool.query('select ingredient_cost from inventory where ingredient_id = $1',//get the ingredient cost from database
   [ingredient_id_node], (error, results) =>{
    var ingredient_cost_holder = results.rows[0].ingredient_cost;
    pool.query('select ingredient_quantity from inventory where ingredient_id = $1',//get the ingredient quantity from  datebase
    [ingredient_id_node], (error, results) =>{
      ingredient_quantity_node = parseInt(ingredient_quantity_node)+ parseInt(results.rows[0].ingredient_quantity);// turn both variables to INT, then update into database
      pool.query(
        'UPDATE inventory SET ingredient_quantity = $2 WHERE ingredient_id = $1',
        [ingredient_id_node, ingredient_quantity_node],
        (error, results) => {
        // console.log("user_id_node: " + user_id_node);
        // console.log("YYYYMMDD: " + YYYYMMDD);
        // console.log("ingredient_quantity_holder: " + ingredient_quantity_holder);
        // console.log("ingredient_cost_holder: " + ingredient_cost_holder);
          pool.query('INSERT INTO order_form(user_id, dateholder, quantity, cost ) VALUES($1, $2, $3, $4);',[user_id_node, YYYYMMDD, ingredient_quantity_holder, ingredient_cost_holder],
                      (error, results) => {
            if (error) {
              throw error
            }
            response.redirect('/inventory');
          })
        }
      )
    })
  })
}


module.exports = {
  createUser,
  updateInventory,
  //get_Ingredient_quantity,
  updatePassword,
}
