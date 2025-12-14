
const express = require('express');
const app = express();
app.set('views', 'templates');
app.set('view engine', 'pug');
app.use('/css', express.static('resources/css'));
app.use('', express.static('resources'));

app.get('/', (req, res) => {
  res.render('user_page.pug');
})
app.get('/pay', (req, res) => {
  res.render('pay_page.pug');
})

app.listen(4131, () => {
  console.log('http://localhost:4131/');
});
