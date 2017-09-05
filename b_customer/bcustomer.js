var inquirer = require("inquirer"),
    mysql = require("mysql");
require("console.table");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect((error) => {

    if (error) {
        console.log(error);
    }
    console.log("Successfully connected!");
    console.log("----------------------------------");
    availableProducts();
});

function availableProducts() {

    connection.query("SELECT * FROM products", (error, res) => {

        if (error) {
            console.log(error)
        };
        console.table(res);
        promptUsers(res);
    });
}

function productUnits(product) {
    inquirer
        .prompt([{
            type: "input",
            name: "quantity",
            message: "How many would you like?",
            validate: function(val) {
                return val > 0;
            }
        }])
        .then(function(val) {
            var quantity = parseInt(val.quantity);

            if (quantity > product.stock_quantity) {
                console.log("\nInsufficient quantity!");
                availableProducts();
            } else {
                makePurchase(product, quantity);
            }
        });
}

function promptUsers(inventory) {
    inquirer
        .prompt([{
            type: "input",
            name: "choice",
            message: "Enter the ID of the product you would like to buy",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }])
        .then(function(val) {
            var selectedId = parseInt(val.choice);
            var product = checkInventory(selectedId, inventory);

            if (product) {
                productUnits(product);
            } else {
                console.log("\nSold out.");
                availableProducts();
            }
        });
}


function makePurchase(product, quantity) {
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantity, product.item_id],
        function(error, res) {
            console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
            availableProducts();
        }
    );
}

function checkInventory(selectedId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === selectedId) {
            return inventory[i];
        }
    }
    return null;
}
