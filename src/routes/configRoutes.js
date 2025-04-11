const express = require('express');
const router = express.Router();

router.get('/config', (req, res) => {
    const backendUrl = process.env.NODE_ENV === 'development'
        ? process.env.BACKEND_URL_DEV
        : process.env.BACKEND_URL_PROD;

    res.json({ backendUrl });
});

module.exports = router;
