const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/static/js/date.js');

const app = express();
const items = ['Send an email'];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const day = date.getDate();
  res.render('list', { listTitle: day, newListItems: items });
});

app.post('/', (req, res) => {
  let item = req.body.newItem;

  if (item.length === 0 || item.length > 20) {
    res.redirect('/');
  } else items.push(item);
  res.redirect('/');
});

app.post('/del', (req, res) => {
  let itemNumber = req.body.deleteBtn;
  items.splice(itemNumber, 1);
  res.redirect('/');
});

app.post('/about', (req, res) => {
  res.render('about');
});

app.listen(3000, () => console.log('Listening on port 3000'));
