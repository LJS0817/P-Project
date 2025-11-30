const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/menu/menuRouter'));
app.use('/auth', require('./routes/auth/authRouter'));
app.use('/dashboard', require('./routes/main/dashboard/router'));
app.use('/dashboard/project', require('./routes/main/project/projectRouter'));
app.use('/dashboard/history', require('./routes/main/history/historyRouter'));
app.use('/dashboard/settings', require('./routes/main/settings/settingRouter'));


// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running`);
});
