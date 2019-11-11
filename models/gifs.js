const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.createGifTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS
    gifs(
        gif_id UUID,
        employee_id UUID NOT NULL REFERENCES employees(employee_id),
        image_title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(gif_id),
        UNIQUE(gif_id)
    );
    `,
  ).then(
    () => {
      console.log('GIFS table created');
    },
  ).catch(
    (error) => {
      console.log(error);
    },
  );
};
