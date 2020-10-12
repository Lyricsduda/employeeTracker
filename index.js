// Require's for npm packages
const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");
const { stat } = require("fs");

// Mysql connection to local sever
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mashedpotatos1!",
  database: "employees_DB"
});
// Connection to main functions
connection.connect(function (err) {
  if (err) throw err;
  start();
});
// Function to start the application, display a ascii logo, and to move to the main menu function
function start() {
  const logoText = logo({ name: "Employee Manager" }).render();
  console.log(logoText);
  loadPrompts();
}

// Function to load main inquier prompts
function loadPrompts() {
  inquirer
    .prompt({
      name: "mainMenu",
      type: "list",
      message: "What would you like to do?",
      choices: ["View All Employees", "Add Employees", "Update Employee Role", "Exit"]
    })
    .then(function (answer) {
      if (answer.mainMenu === "View All Employees") {
        viewAll();
      }
      else if (answer.mainMenu === "Add Employees") {
        addEmployees();
      }
      else if (answer.mainMenu === "Update Employee Role") {
        updateRole();
      } 
      else if (answer.mainMenu === "Exit") {
        connection.end();
      }
      else {
        connection.end();
      }
    });
}
// Function to display all employee'
function viewAll() {
  var query =
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee
    LEFT JOIN role 
    ON employee.role_id = role .id
    LEFT JOIN department
    ON department.id = role .department_id
    LEFT JOIN employee m
    ON m.id = employee.manager_id`
    connection.query(query, function (err, res) {
      if (err) throw err;
      console.table(res);
      loadPrompts();
    });
}