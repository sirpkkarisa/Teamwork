const { Pool } = require('pg');
const dotenv = require('dotenv');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(
    () => {
      console.log('Connection has been established to our Postgres');
    },
  ).catch(
    (error) => {
      console.log('Connection Error to our Postgres');
      console.log(error);
    },
  );
exports.createTables = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
                    employees(
                        employee_id UUID,
                        first_name VARCHAR(255) NOT NULL,
                        last_name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        gender VARCHAR(255) NOT NULL,
                        job_role VARCHAR(255) NOT NULL,
                        department VARCHAR(255) NOT NULL,
                        address VARCHAR(255) NOT NULL,
                        added_on TIMESTAMP DEFAULT NOW(),
                        PRIMARY KEY(employee_id),
                        UNIQUE(employee_id),
                        UNIQUE(email)
                    );
    `;
  pool.query(queryText)
    .then(
      () => {
        console.log('Table created');
      },
    ).catch(
      (error) => {
        console.log(`Something went wrong due to ${error}`);
      },
    );
};
const emailIsValid = (inputEmail) => {
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (inputEmail.match(pattern) !== null) {
    return true;
  }
  return false;
};
const passwordIsStrong = (passInput) => {
  const pattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})');
  if (passInput.match(pattern)) {
    return true;
  }
  return false;
};
const isNotNull = (fName, lName, eMail, pass, sex, job, dept, addr) => {
  if (fName === undefined && lName === undefined && pass === undefined && sex
     === undefined && job === undefined && dept === undefined && addr === undefined) {
    return false;
  }
  return true;
};
exports.createEmployee = (req, res) => {
  const employeeId = uuid.v4();
  const { firstname } = req.body;
  const { lastname } = req.body;
  const { email } = req.body;
  const { password } = req.body;
  const { gender } = req.body;
  const { jobRole } = req.body;
  const { department } = req.body;
  const { address } = req.body;

  // if (isNotNull(firstname, lastname, email, password, gender, jobRole, department, address)) {
  //   return res.status(400)
  //     .json({
  //       error: 'All fields are required',
  //     });
  // }
  if (!emailIsValid(email)) {
    return res.status(400)
      .json({
        error: 'Invalid email',
      });
  }
  if (!passwordIsStrong(password)) {
    return res.status(400)
      .json({
        error: 'Weak password',
      });
  }
  bcrypt.hash(password, 10)
    .then(
      (hash) => {
        pool.query('INSERT INTO employees(employee_id,first_name,last_name,email,password,gender,job_role,department,address) '
  + 'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [employeeId, firstname, lastname, email, hash, gender, jobRole, department, address])
          .then(
            () => {
              res.status(201)
                .json({
                  message: 'User account successfully created',
                });
            },
          ).catch(
            (error) => {
              if (error.code === '23505') {
                res.status(400)
                  .json({
                    error: 'Email must be unique',
                  });
              } else {
                res.status(400)
                  .json({
                    error: `Uncaught Error with code ${error.code}`,
                  });
              }
            },
          );
      },
    );
};
exports.signIn = (req, res) => {
  pool.query('SELECT * FROM employees WHERE email=$1', [req.body.email])
    .then(
      ({ rows }) => {
        if (!rows) {
          return res.status(401)
            .json({
              error: new Error('Auth Failed'),
            });
        }
        let hash = '';
        rows.forEach((data) => {
          hash += data.password;
        });
        return bcrypt.compare(req.body.password, hash)
          .then(
            (valid) => {
              if (!valid) {
                return res.status(401)
                  .json({
                    error: new Error('Incorrect cridentials'),
                  });
              }
              let id = '';
              rows.forEach((data) => { id += data.employee_id; });
              const token = jwt.sign(
                { employeeId: id },
                process.env.TOKEN,
                { expiresIn: '1h' },
              );
              return res.status(200)
                .json({
                  status: 'success',
                  data: {
                    employeeId: id,
                    token,
                  },
                });
            },
          )
          .catch(
            (error) => {
              res.status(500)
                .json({
                  error,
                });
            },
          );
      },
    )
    .catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
