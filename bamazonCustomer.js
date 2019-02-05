//Require NPM Packages
var mysql = require('mysql');
var inquirer = require('inquirer');

//Connect to SQL server
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3000,
    user: 'root',
    password: 'imakeHappiness1983',
    database: 'bamazon_bd'
});

//Counter for total number of products
var numberOfProductTypes = 0;

//Connect to bamazon_db
connection.connect(function(err) {
    if (err) throw err;
    //Get products
    getProducts().then(function (result) {
        //List Products
        result.forEach(function(item) {
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Price: ' + item.price);
        });
    })
        //Enter the store
    }).then(function() {
        return enterStore();
    });

//Function to enter store
function enterStore() {
    inquirer.prompt([{
        name: 'entrance',
        message: 'Would you like to shop with us today?',
        type: 'list',
        choices: ['Yes', 'No']
    }]).then(function(answer) {
        //If yes, go to customer shopping menu
        if (answer.entrance === 'Yes') {
            menu();
        } else {
            //If no, exit CLI
            console.log('Please come back soon! --BAMAZON');
            connection.destroy();
            return;
        }
    });
}

//Function for menu options
function menu() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the Item Number of the product you would like to purchase.',
        type: 'input',
        //Validator to ensure product number is a number and it exists
        validate: function(value) {
            if ((isNaN(value) === false) && (value <= numberOfProductTypes)) {
                return true;
            } else {
                console.log('\nPlease enter a valid ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How many would you like?',
        type: 'input',
        //Validator to ensure it is number
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
        //Promise to pull data from SQL
    }]).then(function(answer) {
        return new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM products WHERE ?', { item_id: answer.item }, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
            //If selected quanitity is valid, save to a local object, else console log error
        }).then(function(result) {
            var savedData = {};

            if (parseInt(answer.quantity) <= parseInt(result[0].quantity)) {
                savedData.answer = answer;
                savedData.result = result;
            } else if (parseInt(answer.quantity) > parseInt(result[0].quantity)) {
                console.log('Insufficient quantity!');
            } else {
                console.log('An error occurred, exiting BAMAZON, your order is not complete.');
            }
            
            return savedData;
            //Update SQL DB and console log messages for completion
        }).then(function(savedData) {
            if (savedData.answer) {
                var updatedQuantity = parseInt(savedData.result[0].quantity) - parseInt(savedData.answer.quantity);
                var itemId = savedData.answer.item;
                var totalCost = parseInt(savedData.result[0].price) * parseInt(savedData.answer.quantity);
                connection.query('UPDATE products SET ? WHERE ?', [{
                    quantity: updatedQuantity
                }, {
                    item_id: itemId
                }], function(err, res) {
                    if (err) throw err;
                    console.log('Your order total is :$' + totalCost + '. Thank you for shopping with BAMAZON!');
                    connection.destroy();
                });
            } else {
                //Recursion to re-enter store
                enterStore();
            }
            //Catch errors
        }).catch(function(err) {
            console.log(err);
            connection.destroy();
        });
        //Catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}