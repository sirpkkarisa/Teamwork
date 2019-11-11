const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
exports.commentsTable = () => {
  pool.query(`CREATE TABLE IF NOT EXISTS
          comments(
              comment_id UUID,
              article_id UUID REFERENCES articles(article_id),
              comment TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT NOW(),
              PRIMARY KEY(comment_id)
          )
  `).then(
    () => {
      console.log('Comments table created');
    },
  ).catch(
    (error) => {
      console.log(error);
    },
  );
};
