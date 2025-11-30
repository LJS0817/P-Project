const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const projects = [
        { id: "1", name: "Test 123", desc: "asdailjsk;fmvc,.Csdaf4", author: "opq", pages:[1, 2, 3], updated: "2025.11.11 20:00"},
        { id: "2", name: "1234153", desc: "qwerfdas32", author: "sadf", pages:[1, 2, 3, 4, 5, 6, 7], updated: "2023.11.21 20:00"},
        { id: "3", name: "abcde", desc: "13242134321", author: "1234", pages:[1, 2, 3, 4, 1, 1, 1], updated: "2015.11.31 20:00"},
    ]
    res.render('main/index', {content:"./project/listProject.ejs", title:"Project", subtitle:"Project manage", projects:projects}, (e, content) => {
        res.end(content);
    });
});

router.get('/view/:id', (req, res) => {
    res.render('main/index', {content:"./project/viewProject.ejs", title:"Project name", subtitle:"Analysis your design"}, (e, content) => {
        res.end(content);
    });
});

router.get('/add', (req, res) => {
    res.render('main/index', {content:"./project/setProject.ejs", title:"Project", subtitle:"Add new project", flag:"add"}, (e, content) => {
        res.end(content);
    });
});

router.get('/edit/:id', (req, res) => {
    res.render('main/index', {content:"./project/setProject.ejs", title:"Project", subtitle:"Add new project", flag:"edit"}, (e, content) => {
        res.end(content);
    });
});


module.exports = router;