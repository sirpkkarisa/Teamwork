const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const gifCtrl = require('../controllers/gifs');
const upload = require('../middleware/config-multer');

gifCtrl.commentsTable();


router.delete('/:gifId', auth, gifCtrl.deleteOne);
router.get('/:gifId', auth, gifCtrl.getOneGif);
router.post('/', auth, upload.single('image'), gifCtrl.createGif);
router.post('/:gifId/comment', auth, gifCtrl.commentToGif);
router.get('/feed', gifCtrl.getAll);

module.exports = router;
