const { Pool } = require('pg');
const dotenv = require('dotenv');
const uuid = require('uuid');

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.createArticleTable = () => {
  pool.query(`CREATE TABLE  IF NOT EXISTS
    articles(
        article_id UUID,
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
exports.createArticle = (req, res) => {
  const articleId = uuid.v4();
  const { title } = req.body;
  const { article } = req.body;
  pool.query('INSERT INTO articles VALUES($1,$2,$3)', [articleId, title, article])
    .then(
      () => {
        res.status(201)
          .json({
            status: 'success',
            data: {
              message: 'Article successfully created',
              articleId,
              title,
              article,
            },
          });
      },
    ).catch(
      (error) => {
        res.status(400)
          .json({
            error,
          });
      },
    );
};
exports.editAnArticle = (req, res) => {
  const { title } = req.body;
  const { articleId } = req.params;
  const { article } = req.body;
  if (!title === null && !article === null) {
    return res.status(400)
      .json({
        error: 'Title and article must not be empty',
      });
  }
  return pool.query('UPDATE articles SET title=$2,article=$3 WHERE article_id=$1', [articleId, title, article])
    .then(
      () => {
        res.status(200)
          .json({
            status: 'success',
            data: {
              message: 'Article successfully updated',
              title,
              article,
            },
          });
      },
    ).catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
exports.deletOneArticle = (req, res) => {
  const { articleId } = req.params;
  pool.query('DELETE FROM articles WHERE article_id=$1', [articleId])
    .then(
      () => {
        res.status(200)
          .json({
            status: 'success',
            data: {
              message: 'Article successfully deleted',
            },
          });
      },
    ).catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
exports.getAllArticles = (req, res) => {
  pool.query('SELECT * FROM articles')
    .then(
      ({ rows }) => {
        const data = rows.map((results) => results);
        res.status(200)
          .json({
            status: 'success',
            data,
          });
      },
    ).catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
exports.getOneArticle = (req, res) => {
  const { articleId } = req.params;
  pool.query('SELECT * FROM articles WHERE article_id=$1', [articleId])
    .then(
      ({ rows }) => {
        const data = rows.map((results) => results);
        res.status(200)
          .json({
            data,
          });
      },
    ).catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
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
exports.commentToArticle = (req, res) => {
  const { articleId } = req.params;
  const commentId = uuid.v4();
  const { comment } = req.body;
  pool.query('INSERT INTO comments VALUES($1,$2,$3);', [commentId, articleId, comment])
    .then(
      () => {
        pool.query('SELECT title,article FROM articles WHERE article_id=$1', [articleId])
          .then(
            ({ rows }) => {
              const article = rows.map((results) => results);
              res.status(201)
                .json({
                  status: 'success',
                  data: {
                    message: 'Comment successfully created',
                    article,
                    comment,
                  },
                });
            },
          ).catch(
            (error) => {
              res.status(400)
                .json({
                  error,
                });
            },
          );
      },
    ).catch(
      (error) => {
        res.status(500)
          .json({
            error,
          });
      },
    );
};
