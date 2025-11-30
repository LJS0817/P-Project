const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const hist = [
        {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
    ]
    res.render('main/index', 
        {content:"./history/history.ejs", 
            title:"Histories", 
            subtitle:"Showing all your analysis histories", 
            history:hist}, (e, content) => {
        res.end(content);
    });
});

module.exports = router;