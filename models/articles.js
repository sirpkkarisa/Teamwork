const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.createArticleTable = () => {
  pool.query(`CREATE TABLE  IF NOT EXISTS
    articles(
        article_id UUID,
        employee_id UUID NOT NULL REFERENCES employees(employee_id),
        title VARCHAR(255) NOT NULL,
        article TEXT NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(article_id),
        UNIQUE(article_id)
    )
`).then(
    () => {
      console.log('ARTICLES Table created');
    },
  ).catch(
    (error) => {
      console.log(error);
    },
  );
};
