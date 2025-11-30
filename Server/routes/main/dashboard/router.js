const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const cards = [
        {id:"1", title:"Test 123", author:"opq", updated:"2025.11.11", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
        {id:"2", title:"1234153", author:"sadf", updated:"2023.11.21", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
        {id:"3", title:"abcde", author:"1234", updated:"2015.11.31", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
    ]
    const hist = [
        {pid:"1", id:"1", name:"Test 123", when:"2025.11.11"},
        {pid:"1", id:"2", name:"1234153", when:"2023.11.21"},
        {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
        {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
    ]
    res.render('main/index', { content:"./dashboard/dashboard.ejs", title:"Dashboard", subtitle:"Welcome Username", cards:cards, histories:hist }, (e, content) => {
        res.end(content);
    });
});

module.exports = router;