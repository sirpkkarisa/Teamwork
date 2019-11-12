const { Pool } = require('pg');
const dotenv = require('dotenv');

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
