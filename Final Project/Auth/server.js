// Ayden DaCosta
// This is the server side of the PA 8
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const port = 80;
const cookieParser= require("cookie-parser");
const MongoStore = require("connect-mongo");
app.use(cors());
app.use(express.json());

app.use(express.static('public_html'));
app.set("json spaces", 2);



const mongoDBURL = 'mongodb://127.0.0.1:27017/final';


mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: String,
  password: String,
});

let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}

function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if (last + 1000000 < now) {
      delete sessions[usernames[i]];
    }
  }
}

setInterval(removeSessions, 2000);


app.use(cookieParser());    
app.get('/', (req, res) => { res.redirect('/Register.html'); });
app.use('/Register.html', authenticate);





function authenticate(req, res, next) {
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c != undefined && c.login!= undefined) {
    if (sessions[c.login.username] != undefined && 
      sessions[c.login.username].id == c.login.sessionID) {
      next();
    } else {
      res.redirect('/Homepage.html');
    }
  }  else {
    res.redirect('/Homepage.html');
  }
}


app.use(session({
  secret: 'mySecret', 
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: mongoDBURL }),
  cookie: {
    secure: false, 
    httpOnly: true, 
  }
}));

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (user && user.password === password) { // Replace with bcrypt.compare if using hashed passwords
    req.session.userId = user._id;
    res.cookie("login",{"username":username, "sessionID":addSession(username)}, {maxAge: 1000000})
    res.json({ message: 'Logged in successfully', username:username });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Registration endpoint
app.post('/add/user', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username: username });
  console.log(req.body);
  if (existingUser) {
    return res.status(409).send('Username already exists');
  }
  const newUser = new User({ username, password }); 
  await newUser.save();
  req.session.userId = newUser._id;
  res.status(201).send('User created and logged in');

    
  
});

const User = mongoose.model('User', UserSchema);
app.get('/get/users',async(req, res) => {
 
 let doc = await User.find({})
      res.json(doc);
    })
    



app.post('/add/user', async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

 
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(409).json({ error: 'Username already taken.' });
  }


  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, password: hashedPassword });

  newUser.save()
    .then(() => res.status(201).json({ message: 'User added successfully' }))
    .catch(err => res.status(500).json({ error: 'Error adding user' }));
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

 
  const user = await User.findOne({ username });    
  if (user && await bcrypt.compare(password, user.password)) {

    req.session.userId = user._id;
    console.log("login");
    res.json({ message: 'Logged in successfully',username:username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});