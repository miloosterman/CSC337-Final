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
  scores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score' }],
});
var User = mongoose.model('User', UserSchema);


GameClickSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gameName: String,
  clicks: { type: Number, default: 0 }
});
const GameClick = mongoose.model('GameClick', GameClickSchema);

app.post('/game-click', async (req, res) => {
  let gameName = req.body.gameName;
  let userId = req.session.userId; // Assuming userId is stored in session

  // Logic to update the game click count
  const clickRecord = await GameClick.findOne({ user: userId, gameName: gameName });
 
  if (clickRecord) {
   
    clickRecord.clicks += 1;
    await clickRecord.save();
  } else {
    await new GameClick({ user: userId, gameName: gameName, clicks: 1 }).save();
  }

  // After updating the click count, calculate the favorite game
  const favoriteGame = await calculateFavoriteGame(userId);
 


  // Sending the favorite game as part of the response (optional)
  res.status(200).json({ message: 'Game click recorded', favoriteGame: favoriteGame });
});
async function calculateFavoriteGame(userId) {
  try {
    // Find the most-clicked game for the given user
    const mostClickedGame = await GameClick.findOne({ user: userId }).sort({ clicks: -1 });
  

    if (!mostClickedGame) {
      return null;
    }

    const favoriteGameName = mostClickedGame.gameName;

    // Aggregate the total clicks for the favorite game across all users
    const gameClickCount = await GameClick.aggregate([
      { $match: { gameName: favoriteGameName } },
      { $group: { _id: null, totalCount: { $sum: "$clicks" } } },
    ]);

    if (gameClickCount.length === 0) {
      return null;
    }

    const totalClicks = gameClickCount[0].totalCount;
    return { gameName: favoriteGameName, totalClicks };
   
  } catch (error) {
    console.error('Error calculating favorite game:', error);
    return null;
  }
}
app.get('/most-clicked-game', async (req, res) => {

res.json( await calculateFavoriteGame(req.session.userId));
});

// Score
var ScoreSchema = new Schema(
  { Snake: Number,
      TicTacWin: Number,
      TicTacLoss: Number,
      CheckerWin: Number,
      CheckerLoss: Number });
  var Score = mongoose.model('Score', ScoreSchema);

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
      let username = c.login.username; //grab the username from the cookie
      console.log(username);
      if ( sessions[username] != undefined && sessions[username].id == c.login.sessionID ) {
          next();
      } else {
          res.redirect('/Homepage.html');
      }
  } else {
      res.redirect('/Homepage.html');
  }
}




// Login endpoint
app.post('/login', async (req, res) => {
try {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });

  if (user) {
    console.log(user);
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

  // Create a new Score schema and set all the elements to 0
  const newScore = new Score({
      Snake: 0,
      TicTacWin: 0,
      TicTacLoss: 0,
      CheckerWin: 0,
      CheckerLoss: 0
  });
  await newScore.save();

  const newUser = new User({
      username, 
      salt: newSalt, 
      hash: hashedPassword, 
      scores: [newScore._id] // Add the new Score's id to the User's scores array
  });
  await newUser.save();

  req.session.userId = newUser._id;
  res.status(201).send('User and score created and logged in');
});

app.get('/scores/:game', async (req, res) => {
  try {
    const game = req.params.game;
    const users = await User.find().populate('scores');
    console.log(users);
    // Check if users are returned
    if (!users || users.length === 0) {
      return res.status(404).send('No users found');
    }
    let gameScores = {};
    users.forEach(user => {
      if (user.scores && user.scores.length > 0 && user.scores[0][game] !== undefined) {
        gameScores[user.username] = user.scores[0][game];
      }
    });
    console.log(gameScores);
    // Sort gameScores in descending order
    const sortedGameScores = Object.entries(gameScores).sort((a, b) => b[1] - a[1]);
    // Check if scores are populated
    res.send(sortedGameScores);
  } catch (error) {
    console.error(`Error fetching scores for ${req.params.game}:`, error);
    res.status(500).send('Internal server error');
  }
});


/*
Keala Goodell
This Server-Side Code is used for Tic-Tac-Toe. 
*/

//set lists to empty, board to empty, and 
//X and O numerical id
let sqXList = [];
let sqOList = [];
let tictacboard = [0,0,0,0,0,0,0,0,0];
let tictacdone_yet = 0;
const X_PIECE = 1;
const O_PIECE = 2;

//clear board, reset done_yet back to false
function tictacstartOver() {
    tictacboard = [];
    tictacdone_yet = 0;
    tictacresetting = -1;
    tictacreset_counter = 0;
    for (let i = 0; i < 9; i++) {
        tictacboard.push(0);
    }
}

//check if board spot has been taken, if not then reset
function tictacopenSpots() {
    let spots = [];
    for (let i = 0; i < 9; i++) {
        if (tictacboard[i] == 0) {
            spots.push(i);
        }
    }
    console.log(spots.length);
    return spots;
}

//check if game has been won
function itctaccheckForWinner(check) {
    if (tictacboard[0] == check && tictacboard[1] == check && tictacboard[2] == check) {
        return true;
    }
    if (tictacboard[3] == check && tictacboard[4] == check && tictacboard[5] == check) {
        return true;
    }
    if (tictacboard[6] == check && tictacboard[7] == check && tictacboard[8] == check) {
        return true;
    }
    if (tictacboard[0] == check && tictacboard[3] == check && tictacboard[6] == check) {
        return true;
    }
    if (tictacboard[1] == check && tictacboard[4] == check && tictacboard[7] == check) {
        return true;
    }
    if (tictacboard[2] == check && tictacboard[5] == check && tictacboard[8] == check) {
        return true;
    }
    if (tictacboard[0] == check && tictacboard[4] == check && tictacboard[8] == check) {
        return true;
    }
    if (tictacboard[2] == check && tictacboard[4] == check && tictacboard[6] == check) {
        return true;
    }
    return false;
  }

  //check if game is tied
  function tictaccheckForCat() {
    let spots = tictacopenSpots();
    if (spots.length <= 0) {
        return true;
    }
    return false;
}
//grab user location, gamemode, piece type from user and check if game is over
app.post('/tictac/move/:LOCATION/:PIECE/:GAMEMODE/:PLAYER', (req, res) => {
  //user info from client
  const movelocation = req.params.LOCATION;
  const piece = req.params.PIECE;
  const gamemode = req.params.GAMEMODE;
  const tictacplayer = req.params.PLAYER;
  console.log(movelocation);
  console.log(piece)
  let winner = ''; // game over state
  let aimove = -1; // no AI move

  //check if game is over
  if (tictacdone_yet == 0) {
    tictacboard[movelocation] = 1;
    sqXList.push(movelocation); // not sure if this is needed

    //check if X, O, or Tie Game wom
    if (itctaccheckForWinner(X_PIECE)) {
      winner = 'X';
      tictacdone_yet = 1;
    } else if (tictaccheckForCat()) {
      winner = 'Tie Game';
      tictacdone_yet = 1;
    } else {
      //use AI to randomly select a empty spot
      let o = tictacopenSpots();
      let aipos = Math.floor(Math.random() * o.length);
      aimove = o[aipos];
      tictacboard[aimove] = 2;
      sqOList.push(aimove); // not sure if this is needed

      if (itctaccheckForWinner(O_PIECE)) {
        winner = 'O';
        tictacdone_yet = 1;
      } else if (tictaccheckForCat()) {
        winner = 'Tie Game';
        tictacdone_yet = 1;
      }
    }
  }

  if(tictacdone_yet == 1) {
    //check if user already exists
    let p1 = User.findOne({username: tictacplayer}).exec();
    p1.then((user) => {
        //don't make score if user doesn't exist
        if (!user) {
            console.log('didnt find user');
        } else {
            let updateScore;
            if (winner == 'X') {
                updateScore = Score.findOneAndUpdate(
                    {_id: user.scores[0]}, // assuming the first score is the one to update
                    {$inc: {TicTacWin: 1}}
                ).exec();
            } else if (winner == 'O') {
                updateScore = Score.findOneAndUpdate(
                    {_id: user.scores[0]}, // assuming the first score is the one to update
                    {$inc: {TicTacLoss: 1}}
                ).exec();
            }
            Promise.all([updateScore])
            .then((score) => {
                console.log('updated score');
            })
            .catch((error) => {
                console.log('score not updated');
            });
        }
    });
  }

  //send game status back to user
  let retval = {"aimove":aimove, "winner":winner, "board": tictacboard};
  res.send(JSON.stringify(retval));
})


//reset game
app.post('/reset/tictac/', (req, res) => {
    let reset = tictacstartOver();
    res.send(JSON.stringify(reset));
})

/*
Keala Goodell
This Server-Side Code is used for Snake. 
*/

//update player score
app.post('/snake/:PLAYER/:SNAKESCORE', (req, res) => {
  const snakeplayer = req.params.PLAYER;
  const snakescore = req.params.SNAKESCORE;
    //check if user already exists
    let p1 = User.findOne({username: snakeplayer}).exec();
    p1.then((user) => {
        //don't make score if user doesn't exist
        if (!user) {
            console.log('didnt find user');
        } else {
                updateScore = Score.findOneAndUpdate(
                    {_id: user.scores[0]}, // assuming the first score is the one to update
                    {$max: {Snake: snakescore}}
                ).exec();
            Promise.all([updateScore])
            .then((score) => {
                console.log('updated score');
            })
            .catch((error) => {
                console.log('score not updated');
            });
        }
    });
  })
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
  

  