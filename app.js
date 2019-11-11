const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const date = require(__dirname + '/static/js/date.js');
const day = date.getDate();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set('view engine', 'ejs');

// Connect to mongoDB
mongoose.connect('mongodb+srv://admin-mj:<PASSWORD>@cluster0-s0ach.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Schema for list items
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Model for list items
const Item = mongoose.model('Item', itemsSchema);

// Create default 'Item' objects and add to an array
const item1 = new Item({ name: 'To add an item press +' });
const item2 = new Item({ name: '<- Press to delete an item' });

const defaultItems = [item1, item2];

// Schema (object) for a custom lists
const listSchema = {
  name: String,
  items: [itemsSchema]
};
// Model for a custom lists
const List = mongoose.model('List', listSchema);

// Routes

app.get('/', (req, res) => {
  const day = date.getDate();

  // Find all items in collection; if collection is empty insert default items
  Item.find({}, (err, items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems, err => {
        !err ? console.log('Added default items...') : console.log(err);
        res.redirect('/');
      });
    } else {
      !err
        ? res.render('list', { listTitle: 'Today', newListItems: items, day: day })
        : console.log(err); //add .name to list item <p> in list.ejs
    }
  });
});

app.get('/:customList', (req, res) => {
  const customListName = _.capitalize(req.params.customList);

  // If custom list exists get the list, else create a new list
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({ name: customListName, items: defaultItems });
        // Save new list to list collection
        list.save();
        res.redirect('/' + customListName);
      } else {
        // Show existing list
        res.render('list', { listTitle: foundList.name, newListItems: foundList.items, day: day });
      }
    }
  });
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });
  // Home directory list
  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    // Find a list with corresponding name in 'lists' collection and add item
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    // Delete from the main list
    Item.findByIdAndDelete(checkedId, err =>
      !err ? console.log(`${checkedId} deleted`) : console.log(err)
    );
    res.redirect('/');
  } else {
    // Find a list, them if id matches ,remove item from an array with mongoDB $pull operator
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedId } } },
      (err, foundList) => {
        !err ? res.redirect('/' + listName) : console.log(err);
      }
    );
  }
});

app.post('/about', (req, res) => {
  res.render('about');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
