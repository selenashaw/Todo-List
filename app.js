const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TodoList = require('./models/todolist');
const User = require('./models/user');

const app = express();

// connect to mongodb
const dbURI = "mongodb+srv://todolistuser:H0ONs965b12YtLlw@cluster0.lnlly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('Listening on port 3000');
    app.listen(3000);
  })
  .catch(err => console.log(err))

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('This is my todo list app!');
})

// -------------------------------------------------------------------
// User Requests
// -------------------------------------------------------------------

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, password} = req.body;
  
    // check for valid new username and password
    if (!username || !password) {
      return res.send('Please fill out both a username and password field');
    }
    if (password.length < 5) {
      return res.send('Passwords must be at least 5 characters long');
    }
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
       return res.send('Oops, a user with that name already exists, please try another');
    }

    // using bcrypt to hash passwords
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // creating new user
    const newUser = new User({
      username: username,
      password: passwordHash
    })

    newUser.save()
      .then(result => {
        res.send('User created!');
      })
      .catch(err=> {
        console.log(err);
      })
  } catch (error) {
    res.send(error);
  } 
})

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send('Please enter a username and password');
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.send('No account for this user has been created');
    }

    const pwMatch = await bcrypt.compare(password, user.password);
    if (!pwMatch) {
      return res.send('Invalid password');
    }

    // creating jwt
    const token = jwt.sign({ id: user._id }, 'SuperSecretKey');
    res.json({
      token,
      user: user
    });

  } catch (error) {
    res.send(error);
  }
})

// auth function for deleting an account and verifying users
const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.send('No authentication token');
    }

    const verified = jwt.verify(token, 'SuperSecretKey');
    if (!verified) {
      return res.send('Token verification failed');
    }
    req.user = verified.id;
    next();
  } catch (error) {
    res.send(error);
  }
}

// Delete user account
app.delete('/deleteuser', auth, async (req, res) => {
  User.findByIdAndDelete(req.user)
  .then(result => {
    res.send('User successfully deleted');
  })
  .catch(err=> {
    console.log(err);
  })
})

// Boolean Token validation
app.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.json(false);
    }
    
    const verified = jwt.verify(token, 'SuperSecretKey');
    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error) {
    res.send(error);
  }
})


// -------------------------------------------------------------------
// TodoList Requests
// -------------------------------------------------------------------

// Get all todolists associated with a user
app.get('/lists', auth, async (req, res) => {
  const user = await User.findById(req.user);
  
  TodoList.find({ user: user.username }).exec(function (err, list) {
    if (err) {
      console.log(err);
      res.send('whoops there was an error');
    }
    else {
      if (list.length === 0) {
        res.send("Looks like you don't have any TodoLists");
      }
      else {
        res.send(list);
      }
    }
  });
})

// Get specific todolist associated with a user
app.get('/lists/:id', auth, async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(req.user);

  TodoList.findById(id).exec(function (err, list) {
    if (err) {
      console.log(err);
      res.send('whoops there was an error');
    }
    else {
      if (list.user !== user.username || list === null) {
        res.send("You don't have a TodoList with that id")
      }
      else {
        res.send(list);
      }
    }
  });
})

// Add a new todolist
// If this were an actual field on a page, the username would be a hidden input
// To be added to the body so we don't have to append it on the backend,
// see readme for request body json formatting
app.post('/newlist', auth, async (req, res) => {
  const content = req.body;
  const user = await User.findById(req.user);
  content.user = user.username;

  const list = new TodoList(content);
  list.save()
    .then(result => {
      res.send('List created!');
    })
    .catch(err=> {
      console.log(err);
    })
})

// Delete a specific todolist (uses mongodb generated ids)
app.delete('/deletelist/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(req.user);

    const removelist = await TodoList.findById(id);
    if (removelist.user !== user.username || removelist === null) {
      res.send("No list to delete");
    }
    else {
      TodoList.deleteOne(removelist)
        .then(res.send('List deleted'))
    }
  } catch (error) {
    res.send(error);
  }
})