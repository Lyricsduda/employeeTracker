const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");
const { stat } = require("fs");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Mashedpotatos1!",
    database: "employees_DB"
  });

  connection.connect(function(err) {
    if (err) throw err;

    start();
  });

  function start() {
    const logoText = logo({name: "Employee Manager"}).render();
    console.log(logoText);
    loadPrompts();
  }

  function loadPrompts() {
    inquirer
      .prompt({
        name: "mainMenu",
        type: "list",
        message: "What would you like to do?",
        choices: ["View All Employees", "Add Employees", "Update Employee Role"]
      })
      .then(function(answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.mainMenu === "View All Employees") {
            viewAll();
        }
        else if(answer.mainMenu === "Add Employees") {
            addEmployees();
        }
        else if(answer.mainMenu === "Update Employee Role") {
            updateRole();
        }else{
          connection.end();
        }
    });
  }
  function viewAll() {
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
    ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
    ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      console.table(res);

      loadPrompts();
    });

  }


// function viewAll() {
//   connection.query ("SELECT * FROM employee,role,department", function(err, res) {
//       if (err) throw err;
//       for (var i = 0; i < res.length; i++) {
//           console.log("Id: " + res[i].id + "|" + 
//                       "First Name: " + res[i].first_name + "|" + 
//                       "Last Name: " + res[i].last_name + "|" +
//                       "Title: " + res[i].title + "|" +
//                       "Department: " + res[i].name + "|" +
//                       "Salary: " + res[i].salary + "|" +
//                       "manager: " + res[i].title);
//           console.log("--------------------------------------------------------------------------------");
//       }
//       loadPrompts();
//   });