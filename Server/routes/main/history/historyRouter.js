const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const hist = [
        {date:"2025 . 11 . 30   20 : 00", project:"Test", page:"test121324345"},
        {date:"2025 . 11 . 21   20 : 00", project:"143124234", page:"tfsdafest12345"},
        {date:"2025 . 11 . 22   20 : 00", project:"abcd", page:"testsda12345"},
        {date:"2025 . 12 . 29   20 : 00", project:"Test", page:"tes3124t12345"},
        {date:"2025 . 01 . 29   20 : 00", project:"3", page:"test1dsafasdf2345"},
        {date:"2025 . 12 . 29   20 : 00", project:"abcd", page:"testf12345"},
        {date:"2025 . 09 . 29   20 : 00", project:"absdafzxcvcd", page:"test4324sda12345"},
        {date:"2025 . 07 . 29   20 : 00", project:"Test", page:"sa2"},
        {date:"2025 . 12 . 29   20 : 00", project:"1234", page:"test1zxcv2zxcv345"},
        {date:"2025 . 11 . 29   20 : 00", project:"dsafzxc", page:"test1asdf345"},
        {date:"2025 . 11 . 29   20 : 00", project:"eaasdfsd", page:"asdf"},
        {date:"2025 . 11 . 29   20 : 00", project:"t", page:"asd"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"tesasdt12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test1asd2345"},
        {date:"2025 . 11 . 29   20 : 00", project:"dsf", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"Teadsst", page:"teasdfasdfst12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"a", page:"dasf"},
        {date:"2025 . 11 . 29   20 : 00", project:"abasdfcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", project:"3412", page:"test12345"},
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