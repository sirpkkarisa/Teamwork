const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');
const gifModel = require('../models/gifs');

const articleModel = require('../models/articles');
const commentModel = require('../models/comments');
const articleCtrl = require('../controllers/articles');

gifModel.createGifTable();
articleModel.createArticleTable();
commentModel.commentsTable();

router.post('/', auth, articleCtrl.createArticle);
router.patch('/:articleId', auth, articleCtrl.editAnArticle);
router.delete('/:articleId', auth, articleCtrl.deletOneArticle);
router.get('/', auth, articleCtrl.getAllArticles);
router.get('/:articleId', auth, articleCtrl.getOneArticle);
router.post('/:articleId/comment', auth, articleCtrl.commentToArticle);

module.exports = router;
