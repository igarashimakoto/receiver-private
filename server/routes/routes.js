const express = require('express');
const router = express.Router();
const {registerUser, getUser, verifyJWT, login, getUserTypes, registerSchedule, 
       getSchedules, deleteSchedule, registerBookedSchedule, getBookedSchedules, deleteBookedSchedule,
       getEnterprises, getSpecificSchedules} = require('../controllers/Controller');

router.post('/login', login);
router.post('/register', registerUser);
router.post('/register/time', registerSchedule);
router.get('/user', verifyJWT, getUser);
router.get('/control/userTypes', getUserTypes);
router.get('/control/schedules',verifyJWT, getSchedules);
router.get('/control/schedules/:dayOfWeek/:entid',verifyJWT, getSpecificSchedules);
router.delete('/control/enterprise/schedule/delete/:timeid',verifyJWT, deleteSchedule);
router.post('/register/bookSchedule',verifyJWT, registerBookedSchedule);
router.get('/control/bookedSchedules', verifyJWT, getBookedSchedules); 
router.delete('/control/user/BookedSchedule/delete',verifyJWT, deleteBookedSchedule);
router.get('/control/enterprises',verifyJWT, getEnterprises); 

module.exports = router;


