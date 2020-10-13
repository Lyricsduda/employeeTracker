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
// Function to display all employee's
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


// ------------------------------------------------------------------

function addEmployees() {

  var query =
    `SELECT role.id, role.title,role.salary 
      FROM role`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));
    roleInformation(roleChoices);
  });
}



function roleInformation(roleChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?"
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO employee SET ?`
      connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;
          console.log("Employee Inserted successfully!\n");

          loadPrompts();
        });
    });
}