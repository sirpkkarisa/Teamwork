const { Pool } = require('pg');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary');
const uuid = require('uuid');

cloudinary.config({
  cloud_name: 'dmbxci9y8',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.createGifTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS
    gifs(
        gif_id UUID,
        image_title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
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
exports.createGif = (req, res) => {
  cloudinary.uploader.upload(req.file.path,
    (result) => {
      const gifId = uuid.v4();
      const { imageTitle } = req.body;
      const imageUrl = result.secure_url;

      pool.query('INSERT INTO gifs VALUES($1,$2,$3)', [gifId, imageTitle, imageUrl])
        .then(
          () => {
            res.status(201)
              .json({
                status: 'success',
                data: {
                  gifId,
                  message: 'GIF image successfully posted',
                  title: imageTitle,
                  imageUrl,
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
    });
};
exports.deleteOne = (req, res) => {
  const { gifId } = req.params;
  pool.query('DELETE FROM gifs WHERE gif_id=$1', [gifId])
    .then(
      () => {
        res.status(200)
          .json({
            status: 'success',
            data: {
              message: 'GIF deleted successfully',
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
exports.getOneGif = (req, res) => {
  const { gifId } = req.params;
  pool.query('SELECT * FROM gifs WHERE gif_id=$1', [gifId])
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
        res.status(400)
          .json({
            error,
          });
      },
    );
};
exports.commentsTable = () => {
  pool.query(`CREATE TABLE IF NOT EXISTS
        gif_comments(
            comment_id UUID,
            gif_id UUID REFERENCES gifs(gif_id) ON DELETE CASCADE,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY(comment_id)
        )
`).then(
    () => {
      console.log('gifcomments table created');
    },
  ).catch(
    (error) => {
      console.log(error);
    },
  );
};
exports.commentToGif = (req, res) => {
  const { gifId } = req.params;
  const commentId = uuid.v4();
  const { comment } = req.body;
  pool.query('INSERT INTO gif_comments VALUES($1,$2,$3)', [commentId, gifId, comment])
    .then(
      () => {
        pool.query('SELECT image_title FROM gifs WHERE gif_id=$1', [gifId])
          .then(
            ({ rows }) => {
              res.status(200)
                .json({
                  status: 'success',
                  data: {
                    message: 'Comment successfully created',
                    gifTitle: rows,
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
