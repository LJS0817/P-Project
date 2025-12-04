const express = require('express');
const router = express.Router();
const {getAdminContext} = require('../sidebarUtil')

router.get('/', (req, res) => {
    const cards = [
        {tag:"Users", value:"30", points:[0, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
        {tag:"Projects", value:"40", points:[0, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
        {tag:"Analyzed pages", value:"4", points:[100, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
    ]
    const users = [
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
    ]
    res.render('main/index', getAdminContext({ content:"./admin/dashboard/dashboard.ejs", title:"Dashboard", subtitle:"Welcome Username", cards:cards, users:users }), (e, content) => {
        res.end(content);
    });
});

module.exports = router;