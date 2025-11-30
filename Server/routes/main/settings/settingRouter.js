const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('main/index', {content:"./settings/settings.ejs", title:"Settings", subtitle:"Manage your account Setting and preferences", which:"account", index: 0}, (e, content) => {
        console.log(e);
        res.end(content);
    });
});

router.get('/preferences', (req, res) => {
    res.render('main/index', {content:"./settings/settings.ejs", title:"Settings", subtitle:"Manage your account Setting and preferences", which:"prefer", index: 1}, (e, content) => {
        res.end(content);
    });
});

router.get('/project', (req, res) => {
    res.render('main/index', {content:"./settings/settings.ejs", title:"Settings", subtitle:"Manage your account Setting and preferences", which:"project", index: 2}, (e, content) => {
        res.end(content);
    });
});

module.exports = router;