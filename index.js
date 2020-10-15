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
      choices: ["View All Employees", "Add Employees", "Update Employee Role", "Remove employee", "Exit"]
    })
    .then(function (answer) {
      if (answer.mainMenu === "View All Employees") {
        viewAll();
      }
      else if (answer.mainMenu === "Add Employees") {
        roleInformation();
      }
      else if (answer.mainMenu === "Remove employee") {
        employeeInforomation();
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

// Function to give addEmployee a option for role selection
function roleInformation() {
  var query =
    `SELECT role.id, role.title, role.salary 
      FROM role`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleInformationChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));
    addEmployees(roleInformationChoices);
  });
}

// function to add a employee from the database based on the user's choice
function addEmployees(roleInformationChoices) {
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
        choices: roleInformationChoices
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

// Function to generate the choices for the removeEmployee function
function employeeInforomation() {
  var query =
    `SELECT employee.id, employee.first_name, employee.last_name
      FROM employee`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeInformation = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${id} ${first_name} ${last_name}`
    }));

    removeEmployees(deleteEmployeeInformation);
  });
}

// function to remove a employee from the database based on the user's choice

function removeEmployees(deleteEmployeeInformation) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeInformation
      }
    ])
    .then(function (answer) {
      var query = `DELETE FROM employee WHERE ?`;
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;
        console.log("Employee deleted!\n");
        loadPrompts();
      });
    });
}

// Function to give promptEmployeeUpdate choices for what role to update to when updating employee infromation
function updateRole() {
  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeInformationChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));
    roleInformationArray(employeeInformationChoices);
  });
}

// Function to give promptEmployeeUpdate choices for what employee to update to when updating employee infromation
function roleInformationArray(employeeInformationChoices) {
  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`
  let roleInformationChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleInformationChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    promptEmployeeUpdate(employeeInformationChoices, roleInformationChoices);
  });
}

// Function to select what employee and role you wish to update and update them
function promptEmployeeUpdate(employeeInformationChoice, roleInformationChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeInformationChoice
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleInformationChoices
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`
      connection.query(query,
        [ answer.roleId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) throw err;
          console.log("Employee Updated successfully!");
          loadPrompts();
        });
    });
}
