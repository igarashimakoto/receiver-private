const express = require('express');
const router = express.Router();
const {registerUser, getUser, verifyJWT, login, getUserTypes, registerSchedule, 
       getSchedules, deleteSchedule, registerBookedSchedule, getBookedSchedules, deleteBookedSchedule,
       getEnterprises, getSpecificSchedules, updateBookedScheduleStatus, getEnterpriseBookings} = require('../controllers/Controller');

router.post('/login', login);
router.post('/register', registerUser);
router.post('/register/time', registerSchedule);
router.get('/user', verifyJWT, getUser);
router.get('/control/userTypes', getUserTypes);
router.get('/control/schedules',verifyJWT, getSchedules);
router.get('/control/schedules/:dayOfWeek/:entid',verifyJWT, getSpecificSchedules);
router.delete('/control/enterprise/schedule/delete/:timeid',verifyJWT, deleteSchedule);
router.post('/register/bookSchedule',verifyJWT, registerBookedSchedule);
router.get('/control/bookedSchedules/:userid/:status', verifyJWT, getBookedSchedules); 
router.delete('/control/user/BookedSchedule/delete',verifyJWT, deleteBookedSchedule);
router.get('/control/enterprises',verifyJWT, getEnterprises); 
router.post('/control/bookedSchedules/updateStatus',verifyJWT, updateBookedScheduleStatus);
router.get('/control/enterprise/bookings/:userid/:status',verifyJWT, getEnterpriseBookings);

module.exports = router;


