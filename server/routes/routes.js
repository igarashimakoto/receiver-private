const express = require('express');
const router = express.Router();
const {register_user, get_user, verifyJWT, login, getUserTypes, register_Time, 
       list_times, delete_schedule} = require('../controllers/Controller');

router.post('/login', login);
router.post('/register', register_user);
router.post('/register/time', register_Time);
router.get('/user', verifyJWT, get_user);
router.get('/control/userTypes', getUserTypes);
router.get('/control/times',verifyJWT, list_times);
router.delete('/control/enterprise/schedule/delete/:timeid',verifyJWT, delete_schedule);

module.exports = router;


