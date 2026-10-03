const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory database
let users = [];
let exercises = [];
let userIdCounter = 1;

// POST /api/users - Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.json({ error: 'Username is required' });
  }

  const user = {
    username: username,
    _id: userIdCounter.toString()
  };

  users.push(user);
  userIdCounter++;

  res.json(user);
});

// GET /api/users - Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises - Add an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Validate inputs
  if (!description || !duration) {
    return res.json({ error: 'Description and duration are required' });
  }

  // Parse date
  let exerciseDate;
  if (date) {
    exerciseDate = new Date(date);
  } else {
    exerciseDate = new Date();
  }

  const exercise = {
    _id: userId,
    username: user.username,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  exercises.push(exercise);

  res.json(exercise);
});

// GET /api/users/:_id/logs - Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Get user's exercises
  let userExercises = exercises.filter(e => e._id === userId);

  // Filter by date range if provided
  if (from || to) {
    userExercises = userExercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);

      if (from && exerciseDate < new Date(from)) {
        return false;
      }
      if (to && exerciseDate > new Date(to)) {
        return false;
      }
      return true;
    });
  }

  // Limit results if provided
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Format log entries (remove _id from log items)
  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});