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
  salt: String,  
  hash: String,  
  scores: [mongoose.Schema.Types.ObjectId],
});

// Items
var ScoreSchema = new Schema(
  { Snake: Number,
      TicTacWin: Number,
      TicTacLoss: Number,
      CheckerWin: Number,
      CheckerLoss: Number });
  var Score = mongoose.model('Item', ScoreSchema);

let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = { id: sid, time: now };
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
  if (c != undefined && c.login != undefined) {
    if (
      sessions[c.login.username] != undefined &&
      sessions[c.login.username].id == c.login.sessionID
    ) {
      next();
    } else {
      res.redirect('/Homepage.html');
    }
  } else {
    res.redirect('/Homepage.html');
  }
}

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoDBURL }),
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

// Login endpoint
app.post('/login', async (req, res) => {
try {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });

  if (user) {
    console.log('Password:', password);
    console.log('User Salt:', user.salt);
    console.log('User Hash:', user.hash);

    if (await bcrypt.compare(password + user.salt, user.hash)) {
      req.session.userId = user._id;
      res.cookie("login", { username, sessionID: addSession(username) }, { maxAge: 60000 * 60 * 24 });
      res.json({ message: 'Logged in successfully', username: username });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } else {
    res.status(401).send('Invalid credentials');
  }
} catch (error) {
  console.error('Login error:', error);
  res.status(500).send('Internal server error');
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
  const newSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password + newSalt, 10);

  const newUser = new User({
    username,
    salt: newSalt,
    hash: hashedPassword,
  });
  await newUser.save();
  req.session.userId = newUser._id;
  res.status(201).send('User created and logged in');
});

const User = mongoose.model('User', UserSchema);
app.get('/get/users', async (req, res) => {
  let doc = await User.find({});
  res.json(doc);
});


//Keala Goodell 
//Tic Tic Toe Stuff

let sqXList = [];
let sqOList = [];
let board = [0,0,0,0,0,0,0,0,0];
let selected = 0;
let done_yet = 0;
let resetting = -1;
let reset_counter = 0;
const X_PIECE = 1;
const O_PIECE = 2;


function startOver() {
    board = [];
    selected = 0;
    done_yet = 0;
    resetting = -1;
    reset_counter = 0;
    for (let i = 0; i < 9; i++) {
        board.push(0);
    }
}

function openSpots() {
    let spots = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] == 0) {
            spots.push(i);
        }
    }
    console.log(spots.length);
    return spots;
}

function startOver() {
    board = [];
    selected = 0;
    done_yet = 0;
    resetting = -1;
    reset_counter = 0;
    for (let i = 0; i < 9; i++) {
        board.push(0);
    }
}

function checkForWinner(check) {
    if (board[0] == check && board[1] == check && board[2] == check) {
        return true;
    }
    if (board[3] == check && board[4] == check && board[5] == check) {
        return true;
    }
    if (board[6] == check && board[7] == check && board[8] == check) {
        return true;
    }
    if (board[0] == check && board[3] == check && board[6] == check) {
        return true;
    }
    if (board[1] == check && board[4] == check && board[7] == check) {
        return true;
    }
    if (board[2] == check && board[5] == check && board[8] == check) {
        return true;
    }
    if (board[0] == check && board[4] == check && board[8] == check) {
        return true;
    }
    if (board[2] == check && board[4] == check && board[6] == check) {
        return true;
    }
    return false;
  }

  function checkForCat() {
    let spots = openSpots();
    if (spots.length <= 0) {
        return true;
    }
    return false;
}

function update() {
    if (resetting > 0) {
        reset_counter--;
        if (reset_counter <= 0) {
            document.getElementById(sqXList[resetting]).style.display = 'none';
            document.getElementById(sqXList[resetting]).style.display = 'none';
            resetting--;
            reset_counter = 20;
        }
        if (resetting <= 0) {
            startOver();
        }
        return;
    }
    // ... translate the rest of the Update method here ...
}

function onTriggerEnter(other) {
    let test_selected = 0;
    if (other.id == "square1") {
        test_selected = 1;
    }
    // ... repeat for all conditions ...
    if (test_selected > 0 && board[test_selected-1] == 0) {
        selected = test_selected;
    }
}

app.post('/play/move/:LOCATION/:PIECE/:MODE', (req, res) => {
    const movelocation = req.params.LOCATION;
    const piece = req.params.PIECE;
    const mode = req.params.MODE;
    console.log(movelocation);
    console.log(piece)
    let winner = ''; // game over state
    let aimove = -1; // no AI move
    if (done_yet == 0) {
      board[movelocation] = 1;
      sqXList.push(movelocation); // not sure if this is needed
      if (checkForWinner(X_PIECE)) {
        winner = 'X';
        done_yet = 1;
      } else if (checkForCat()) {
        winner = 'C';
        done_yet = 1;
      } else {
        let o = openSpots();
        let aipos = Math.floor(Math.random() * o.length);
        aimove = o[aipos];
        board[aimove] = 2;
        sqOList.push(aimove); // not sure if this is needed
        if (checkForWinner(O_PIECE)) {
          winner = 'O';
          done_yet = 1;
        } else if (checkForCat()) {
          winner = 'C';
          done_yet = 1;
        }
      }
    }
    
    let retval = {"aimove":aimove, "winner":winner, "board": board};
    console.log(retval);
    res.send(JSON.stringify(retval));
})


app.post('/reset/tictac/', (req, res) => {
    let reset = startOver();
    res.send(JSON.stringify(reset));
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});