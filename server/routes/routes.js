const express = require('express');
const router = express.Router();
const {register_user, get_user, verifyJWT, login, getUserTypes, register_Time} = require('../controllers/Controller');

router.post('/login', login);
router.post('/register', register_user);
router.post('/register/interval',verifyJWT, register_Time);
router.post('/user', verifyJWT, get_user);
router.get('/control/userTypes', getUserTypes);

module.exports = router;


