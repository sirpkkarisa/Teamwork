const express = require('express');

const router = express.Router();
const Pool = require('../models/employee');
const empCtrl = require('../controllers/employees');

Pool.createTables();

router.post('/create-user', empCtrl.createEmployee);
router.post('/signin', empCtrl.signIn);
module.exports = router;
