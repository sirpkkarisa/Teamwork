const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const Pool = require('./models/employee');
const gifPool = require('./models/gifs');
const articlePool = require('./models/articles');
const auth = require('./middleware/auth');

const MIME_TYPE = {
  'image/gif': 'gif',
};
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPE[file.mimetype];
    callback(null, `${name + Date.now()}.${extension}`);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.gif') {
      return callback('Only gif images allowed');
    }
    return callback(null, true);
  },
});
Pool.createTables();
gifPool.createGifTable();
gifPool.commentsTable();
articlePool.createArticleTable();
articlePool.commentsTable();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.post('/auth/create-user', Pool.createEmployee);
app.post('/auth/signin', Pool.signIn);
app.post('/gifs', auth, upload.single('image'), gifPool.createGif);
app.post('/articles', auth, articlePool.createArticle);
app.patch('/articles/:articleId', auth, articlePool.editAnArticle);
app.delete('/articles/:articleId', auth, articlePool.deletOneArticle);
app.get('/articles', auth, articlePool.getAllArticles);
app.get('/articles/:articleId', auth, articlePool.getOneArticle);
app.delete('/gifs/:gifId', auth, gifPool.deleteOne);
app.get('/gifs/:gifId', auth, gifPool.getOneGif);
app.post('/articles/:articleId/comment', auth, articlePool.commentToArticle);
app.post('/gifs/:gifId/comment', auth, gifPool.commentToGif);
module.exports = app;
