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
                        id UUID,
                        firstname VARCHAR(255) NOT NULL,
                        lastname VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        gender VARCHAR(255) NOT NULL,
                        job_role VARCHAR(255) NOT NULL,
                        department VARCHAR(255) NOT NULL,
                        address VARCHAR(255) NOT NULL,
                        PRIMARY KEY(id),
                        UNIQUE(id),
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
exports.createEmployee = (req, res) => {
  const id = uuid.v4();
  const { firstname } = req.body;
  const { lastname } = req.body;
  const { email } = req.body;
  const { password } = req.body;
  const { gender } = req.body;
  const { jobRole } = req.body;
  const { department } = req.body;
  const { address } = req.body;

  bcrypt.hash(password, 10)
    .then(
      (hash) => {
        pool.query('INSERT INTO employees(id,firstname,lastname,email,password,gender,job_role,department,address) '
  + 'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [id, firstname, lastname, email, hash, gender, jobRole, department, address])
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
      (employee) => {
        if (!employee.rows) {
          return res.status(401)
            .json({
              error: new Error('User not found'),
            });
        }
        let hash = '';
        employee.rows.forEach((data) => {
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
              const id = employee.rows.map((data) => data.id);
              const token = jwt.sign(
                { employeeId: id },
                process.env.TOKEN,
                { expiresIn: '1h' },
              );
              return res.status(200)
                .json({
                  employeeId: id,
                  token,
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
