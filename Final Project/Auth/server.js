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

// Scores
const ScoreSchema = new Schema(
  { Snake: Number,
      TicTacWin: Number,
      TicTacLoss: Number,
      CheckerWin: Number,
      CheckerLoss: Number });
var Score = mongoose.model('Item', ScoreSchema);

const UserSchema = new Schema({
  username: String,
  password: String,
  scores: [mongoose.Schema.Types.ObjectId],
});
var User = mongoose.model('User', UserSchema)

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

//Keala Goodell 
//Tic Tic Toe Stuff

let sqXList = [];
let sqOList = [];
let board = [0,0,0,0,0,0,0,0,0];
let selected = 0;
let done_yet = 0;
let resetting = -1;
let reset_counter = 0;


function startOver() {
    board = [];
    selected = 0;
    done_yet = 0;
    resetting = -1;
    reset_counter = 0;
    for (let i = 0; i < 9; i++) {
        board.push(0);
    }
    sqXList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    sqOList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    document.getElementById('sqE').style.display = 'none';
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
    sqXList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    sqOList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    document.getElementById('sqE').style.display = 'none';
}

function checkForDone() {
    let check = 1;
    if (board[0] == check && board[1] == check && board[2] == check) {
        return check;
    }
    if (board[3] == check && board[4] == check && board[5] == check) {
        return check;
    }
    if (board[6] == check && board[7] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[3] == check && board[6] == check) {
        return check;
    }
    if (board[1] == check && board[4] == check && board[7] == check) {
        return check;
    }
    if (board[2] == check && board[5] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[4] == check && board[8] == check) {
        return check;
    }
    if (board[2] == check && board[4] == check && board[6] == check) {
        return check;
    }
    check = 2;
    if (board[0] == check && board[1] == check && board[2] == check) {
        return check;
    }
    if (board[3] == check && board[4] == check && board[5] == check) {
        return check;
    }
    if (board[6] == check && board[7] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[3] == check && board[6] == check) {
        return check;
    }
    if (board[1] == check && board[4] == check && board[7] == check) {
        return check;
    }
    if (board[2] == check && board[5] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[4] == check && board[8] == check) {
        return check;
    }
    if (board[2] == check && board[4] == check && board[6] == check) {
        return check;
    }
    let spots = openSpots();
    if (spots.length == 0) {
        return 3;
    }
    return 0;
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

app.post('/play/move/:LOCATION', (req, res) => {
    const movelocation = req.params.LOCATION;
    console.log('LOCATION');
    console.log(movelocation);
    let winner = -1; // game over state
    let aimove = -1; // no AI move
    if (done_yet == 0) {
    board[movelocation] = 1;
    sqXList.push(movelocation); // not sure if this is needed
    winner = checkForDone();  // should return 0 or 1
    if (winner == 1) {
      done_yet = 1;
    } else {
      let o = openSpots();
      if (o.length == 0) {
        winner = -1; // Nobody wins, AI no move (client needs to respond to no ai move winner 0)
        done_yet = -1;
       } else {
        let aipos = Math.floor(Math.random() * o.length);
        aimove = o[aipos];
        board[aimove] = 2;
        sqOList.push(aimove); // not sure if this is needed
        winner = checkForDone();
        if (winner == 2) {
           done_yet = 1;
        } else if (o.length == 1) {
           done_yet = 1;
           winner = -1;
         }
       }
    }
    }
    
    let retval = {"aimove":aimove, "winner":winner};
    console.log(retval);
    res.send(JSON.stringify(retval));
})

// Call startOver when the page loads
//window.onload = startOver;


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});