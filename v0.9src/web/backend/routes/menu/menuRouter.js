const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('menu/index');
});

module.exports = router;