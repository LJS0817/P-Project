const express = require('express');
const router = express.Router();

// router.get('/', (req, res) => {
//     const cards = [
//         {id:"1", title:"Test 123", author:"opq", updated:"2025.11.11", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//         {id:"2", title:"1234153", author:"sadf", updated:"2023.11.21", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//         {id:"3", title:"abcde", author:"1234", updated:"2015.11.31", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//     ]
//     const hist = [
//         {pid:"1", id:"1", name:"Test 123", when:"2025.11.11"},
//         {pid:"1", id:"2", name:"1234153", when:"2023.11.21"},
//         {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
//         {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
//     ]
//     res.render('index', {content:"./dashboard/dashboard.ejs", title:"Dashboard", subtitle:"Welcome Username", cards:cards, histories:hist}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/', (req, res) => {
//     const hist = [
//         {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"Test", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"1234", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//         {date:"2025 . 11 . 29   20 : 00", project:"abcd", page:"test12345"},
//     ]
//     res.render('index', {content:"./history/history.ejs", title:"Histories", subtitle:"Showing all your analysis histories", history:hist}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/list', (req, res) => {
//     const projects = [
//         { id: "1", name: "Test 123", desc: "asdailjsk;fmvc,.Csdaf4", author: "opq", pages:[1, 2, 3], updated: "2025.11.11 20:00"},
//         { id: "2", name: "1234153", desc: "qwerfdas32", author: "sadf", pages:[1, 2, 3, 4, 5, 6, 7], updated: "2023.11.21 20:00"},
//         { id: "3", name: "abcde", desc: "13242134321", author: "1234", pages:[1, 2, 3, 4, 1, 1, 1], updated: "2015.11.31 20:00"},
//     ]
//     res.render('index', {content:"./project/listProject.ejs", title:"Project", subtitle:"Project manage", projects:projects}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/add', (req, res) => {
//     res.render('index', {content:"./project/setProject.ejs", title:"Project", subtitle:"Add new project"}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/', (req, res) => {
//     res.render('index', {content:"./project/emptyProject.ejs", title:"Project", subtitle:"Add new project"}, (e, content) => {
//         res.end(content);
//     });
// });

router.get('/', (req, res) => {
    res.render('index', {content:"./project/viewProject.ejs", title:"Project", subtitle:"Project manage"}, (e, content) => {
        res.end(content);
    });
});


module.exports = router;