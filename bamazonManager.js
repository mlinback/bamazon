//Require NPM packages
var mysql = require('mysql');
var inquirer = require('inquirer');

//Connection to Server
var connection = mysql.createConnection({
    host: "localhost",
    port: 3000,
    user: "root",
    password: "imakeHappiness1983",
    database: "bamazon_db"
})

// Set counter for total number of products
var numberOfProductTypes = 0;

//Connect to DB
connection.connect(function(err) {
    //Throw error if it errors
    if (err) throw err;
    //Promise that selects all data from the table
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
            console.log('Welcome Manager!')
        });
    }).then(function(result) {
        //Increment number of products
        result.forEach(function(item) {
            numberOfProductTypes++;
        });

        return enterManagerApp();
        //Catch errors
    }).catch(function(err) {
        console.log(err);
    });
});

//Enter the manager prompt system
function enterManagerApp() {
    inquirer.prompt([{
        name: 'entrance',
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']
    }]).then(function(answer) {
        switch (answer.entrance) {
            case 'View Products for Sale':
                itemsForSale();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case 'EXIT':
                console.log('Adios manager!');
                connection.destroy();
                return;
                break;
            default:
                enterManagerApp();
                break
        };
    });
}

// Logs all items
function logItems(result) {
    result.forEach(function(item) {
        numberOfProductTypes++;
        console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Department: ' + item.department_name + ' || Price: ' + item.price + ' || Stock: ' + item.stock_quantity);
    });
}

//Grabs items for sale
function itemsForSale() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        logItems(result);
    }).then(function() {
        enterManagerApp();
        //Catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

//Grabs items with an inventory below 5
function lowInventory() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        logItems(result);
    }).then(function() {
        enterManagerApp();
        //Catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

//Function to add inventory to SQL DB
function addInventory() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the Item Number of the product you would like to add stock to.',
        type: 'input',
        validate: function(value) {
            //Validator to ensure the product number is a number and it exists
            if ((isNaN(value) === false) && (value <= numberOfProductTypes)) {
                return true;
            } else {
                console.log('\nPlease enter a valid item ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How much stock would you like to add?',
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
    }]).then(function(answer) {
        return new Promise(function(resolve, reject) {
            connection.query('SELECT quantity FROM products WHERE ?', { item_id: answer.item }, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function(result) {
            var updatedQuantity = parseInt(result[0].quantity) + parseInt(answer.quantity);
            var itemId = answer.item
            connection.query('UPDATE products SET ? WHERE ?', [{
                quantity: updatedQuantity
            }, {
                item_id: itemId
            }], function(err, res) {
                if (err) throw err;
                console.log('The total stock has been updated to: ' + updatedQuantity + '.');
                enterManagerApp();
            });
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

//Function to add a new product the DB
function addProduct() {
    return inquirer.prompt([{
        name: 'product',
        message: 'Enter the name of the product you would like to add.',
        type: 'input',
        //Validator to ensure it is not left blank
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid name.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'department',
        message: 'Enter the name of the department where the product is located.',
        type: 'input',
        //Validator to ensure it is not left blank
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid department name.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'price',
        message: 'Enter the price of the product.',
        type: 'input',
        //Validator to ensure it is a valid number
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid price.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'Enter initial quantity.',
        type: 'input',
        validate: function(value) {
            //Validator to ensure it is a valid number
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
    }]).then(function(answer) {
        //Promise to update DB
        return new Promise(function(resolve, reject) {
            connection.query('INSERT INTO products SET ?', [{
                product: answer.product,
                department: answer.department,
                price: answer.price,
                quantity: answer.quantity
            }], function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
            //Console log message
        }).then(function() {
            console.log('The product has been added to the inventory.');
            enterManagerApp();
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