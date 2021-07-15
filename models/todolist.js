const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
});

const TodoList = mongoose.model('TodoList', todoSchema);
module.exports = TodoList;