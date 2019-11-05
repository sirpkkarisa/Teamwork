const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const Pool = require('./models/employee');
const gifPool = require('./models/gifs');
const articlePool = require('./models/articles');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
});
// const fileFilter = (req, file, callback) => {
//   if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
//     callback(null, true);
//   } else {
//     callback(null, false);
//   }
// };
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 30,
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
app.post('/gifs', upload.single('image'), gifPool.createGif);
app.post('/articles', articlePool.createArticle);
app.patch('/articles/:id', articlePool.editAnArticle);
app.delete('/articles/:id', articlePool.deletOneArticle);
app.get('/articles', articlePool.getAllArticles);
app.get('/articles/:id', articlePool.getOneArticle);
app.delete('/gifs/:id', gifPool.deleteOne);
app.get('/gis/:id', gifPool.getOneGif);
app.post('/articles/:articleId/comment', articlePool.commentToArticle);
app.post('/gifs/:gifId/comment', gifPool.commentToGif);
module.exports = app;
