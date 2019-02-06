//Require NPM Packages
var mysql = require('mysql');
var inquirer = require('inquirer');

//Connect to SQL server
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'bamazon_db'
});

//Connect to bamazon_db
connection.connect(function(err) {
    if (err) throw err;
    //Get products
    getAllProducts().then(function (result) {
        //List Products
        result.forEach(function(item) {
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Price: ' + item.price);
        });
    }).then(function () {
        return whatWouldYouLike();
    });
});

function getAllProducts() {
    return new Promise(function (resolve, reject) {
        //Query for all items in table
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    });
}

function whatWouldYouLike() {
    return inquirer.prompt([{
        name: 'item_id',
        message: 'Enter the Item ID of the product you would like to buy?',
        type: 'input',
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid Item ID.');
                return false;
            }
        }
    }, {
        name: 'number',
        message: 'Enter the quantity you would like to buy?',
        type: 'input',
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
    }]).then(function (answer) {
        return new Promise(function (resolve, reject) {
            //Query items in products table for item_id is that was chosen
            connection.query("SELECT * FROM products WHERE item_id=?", answer.item_id, function (err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function (result) {
            //Insufficient quantity
            if (answer.number > result[0].stock_quantity) {
                return "I'm sorry, we do not have that many in stock.";
                //Sufficient quantity
            } else {
                var object = {};
                object.answer = answer;
                object.result = result;
                return object;
            }
        }).catch(function (err) {
            console.log(err);
            connection.destroy();
        }).then(function (object) {
            //Sufficient quantity
            if (object.answer) {
                var newQuantity = object.result[0].stock_quantity - object.answer.number;
                var product = object.answer.product_id;
                var totalCost = (object.result[0].price * object.answer.number).toFixed(2);
                //Updates quantity
                connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [newQuantity, product], function (err, res) {
                    if (err) reject(err);
                    console.log('Your order total is $' + totalCost);
                    //Destroy connection
                    connection.destroy();
                });
            } else {
                console.log(object);
                // destroy connection
                connection.destroy();
            }
        });
    });
};