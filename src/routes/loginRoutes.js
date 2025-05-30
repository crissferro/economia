const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/registro', loginController.registro);
router.post('/', loginController.login);
router.get('/logout', loginController.logout);
router.post('/cambiar-password', loginController.cambiarPassword);


module.exports = router;