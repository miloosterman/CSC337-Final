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
  scores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score' }],
});
var User = mongoose.model('User', UserSchema);


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
const X_PIECE = 1;
const O_PIECE = 2;
let tictacGames = [];
let tictacUsers = {};

function makeNewBoard(player, gamemode){
  // For PVP search for a game to be part of
  let createnewgame = true;
  if (gamemode == 'pvp') { 
    for (let i = 0; i < tictacGames.length; i++) {
      if (tictacGames[i]['player2'] == undefined) {
        tictacGames[i]['player2'] = player;
        tictacGames[i]['ready'] = 1
        tictacUsers[player] = tictacGames[i]; // might work, may need to use an ID
        createnewgame = false;
        break;
      }
    }
  }

  if (createnewgame) {
    let tictacgame = {};
    tictacgame['board'] = [0,0,0,0,0,0,0,0,0];
    tictacgame['done'] = 0;
    tictacgame['ready'] = 0;
    tictacgame['winner'] = '';
    tictacgame['player1'] = player;
    tictacgame['player2'] = undefined;
    tictacgame['created'] = Date.now();
    tictacgame['gamemode'] = gamemode;
    //make game use ai if playing solo
    if (gamemode == 'pve'){ 
      tictacgame['player2'] = 'aiplayer';
      tictacgame['ready'] = 1;
    }
    tictacGames.push(tictacgame);
    tictacUsers[player] = tictacgame;
  }
}

//make a new board
function tictacstartOver(player, gamemode) {
  for (let i = 0; i < tictacGames.length; i++) {
    if (tictacGames[i]['player1'] == player || tictacGames[i]['player2'] == player) {
      if (tictacGames[i]['player1'] in tictacUsers) {
        delete tictacUsers[tictacGames[i]['player1']];
      }
      if (tictacGames[i]['player2'] in tictacUsers) {
        delete tictacUsers[tictacGames[i]['player2']];
      }
      tictacGames.splice(i,1);
      break;
    }
  }
  makeNewBoard(player, gamemode)
}

//check if board spot has been taken, if not then reset
function tictacopenSpots(tictacboard) {
  let spots = [];
  for (let i = 0; i < 9; i++) {
      if (tictacboard[i] == 0) {
          spots.push(i);
      }
  }
  console.log(spots.length);
  return spots;
}

function countPieces(tictacboard, piece) {
  let counter = 0;
  for (let i = 0; i < 9; i++) {
      if (tictacboard[i] == piece) {
          counter++;
      }
  }
  return counter;
}

//check if game has been won
function tictaccheckForWinner(tictacboard, check) {
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
function tictaccheckForCat(tictacboard) {
    let spots = tictacopenSpots(tictacboard);
    if (spots.length <= 0) {
        return true;
    }
    return false;
}

//grab user location, gamemode, piece type from user and check if game is over
app.post('/tictac/move/:LOCATION/:GAMEMODE/:PLAYER', (req, res) => {
  //user info from client
  const movelocation = req.params.LOCATION;
  const gamemode = req.params.GAMEMODE;
  const tictacplayer = req.params.PLAYER;
  if(tictacplayer in tictacUsers) {
    console.log('extsting game');
  } else {
    console.log('newgame');
    makeNewBoard(tictacplayer, gamemode);
  }
  let tictacgame = tictacUsers[tictacplayer];
  
  console.log(tictacgame);
  console.log('movelocation', movelocation);
  let winner = ''; // game over state
  let aimove = -1; // no AI move

  //check if X, O, or Tie Game won
  let piece = O_PIECE;
  let game_piece = 'O';
  if (tictacplayer == tictacgame['player1']) {
    piece = X_PIECE;
    game_piece = 'X';
  }
  console.log(game_piece);

  //check if game is over
  if (tictacgame['done'] == 0) {
    if (tictacgame['board'][movelocation] != 0) {
      return;
    }

    if (gamemode == 'pvp') {
      countx = countPieces(tictacgame['board'], X_PIECE);
      counto = countPieces(tictacgame['board'], O_PIECE);
      console.log('countx', countx);
      console.log('counto', counto);
      // X Move must have equal parts to move
      if (piece == X_PIECE && countx != counto) {
        return;
      }
      // O move must have 1 more X and O to move
      if (piece == O_PIECE && countx != counto+1) {
        return;
      }
    }
    tictacgame['board'][movelocation] = piece;

    if (tictaccheckForWinner(tictacgame['board'], piece)) {
      winner = game_piece;
      tictacgame['done'] = 1;
    } else if (tictaccheckForCat(tictacgame['board'])) {
      winner = 'Tie Game';
      tictacgame['done'] = 1;
    } else if (gamemode == 'pve') {
      //use AI to randomly select a empty spot
      // AI is always 'O'
      let o = tictacopenSpots(tictacgame['board']);
      let aipos = Math.floor(Math.random() * o.length);
      aimove = o[aipos];
      tictacgame['board'][aimove] = 2;

      if (tictaccheckForWinner(tictacgame['board'], O_PIECE)) {
        winner = 'O';
        tictacgame['done'] = 1;
      } else if (tictaccheckForCat(tictacgame['board'])) {
        winner = 'Tie Game';
        tictacgame['done'] = 1;
      }
    } else {
      //pve get other player move
    }
  }
  tictacgame['winner'] = winner;

  if (tictacgame['done'] == 1) {
    if (gamemode == 'pve') {
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
    else if(gamemode == 'pvp') {
      let p1 = User.findOne({username: tictacgame['player1']}).exec();
      let p2 = User.findOne({username: tictacgame['player2']}).exec();
      
      Promise.all([p1, p2]).then((users) => {
        let user1 = users[0];
        let user2 = users[1];
        
        if (!user1 || !user2) { 
            console.log('didnt find users'); 
        } else { 
            let updateScore1, updateScore2;
            
            if (winner == 'X') { 
                updateScore1 = Score.findOneAndUpdate({_id: user1.scores[0]}, {$inc: {TicTacWin: 1}}).exec();
                updateScore2 = Score.findOneAndUpdate({_id: user2.scores[0]}, {$inc: {TicTacLoss: 1}}).exec();
            } else if (winner == 'O') { 
                updateScore1 = Score.findOneAndUpdate({_id: user1.scores[0]}, {$inc: {TicTacLoss: 1}}).exec();
                updateScore2 = Score.findOneAndUpdate({_id: user2.scores[0]}, {$inc: {TicTacWin: 1}}).exec();
            }
            
            Promise.all([updateScore1, updateScore2])
                .then((score) => { console.log('updated scores'); })
                .catch((error) => { console.log('scores not updated'); });
        }
      });
    }
    tictacstartOver(tictacplayer, gamemode);
  }

  //send game status back to user
  let retval = {"aimove":aimove, "winner":winner, "board": tictacgame['board']};
  res.send(JSON.stringify(retval));
})

//reset game
app.post('/reset/tictac/', (req, res) => {
    res.send(JSON.stringify('1'));
})

//update board
app.get('/tictac/board/:gamemode/:player', (req, res) => {
  let player = req.params.player;

  //find game
  let game = tictacGames[player];

  if (game) {
      // If the game session exists, return the current state of the game board
      res.json({ board: game.board });
  } else {
      // If the game session does not exist, return an error
      res.status(404).json({ error: 'Game not found' });
  }
});


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