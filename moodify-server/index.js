const express = require('express');

const port = 8080;
const cors = require('cors');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const routeUser = require('./routes/user');
const routeSong = require('./routes/song');
const routePlaylist = require('./routes/playlist');

mongoose.connect('mongodb+srv://moodify:teletubbies@cluster1.wlzag.mongodb.net/Moodify?retryWrites=true&w=majority')
  .then(() => {
    const app = express();
    app.use(cors);
    app.use(bodyParser.json());
    // Enables express to parse body data from x-www-form-encoded data
    // app.use(bodyParser.urlencoded({ extended: false }));
    // Added because mongo uses the x-www-form-encoded data
    // app.use(express.json());

    app.get('/', (req, res) => {
      res.send('Hello Moodify World');
    });

    app.use('/song', routeSong);
    app.use('/user', routeUser);
    app.use('/playlist', routePlaylist);

    app.listen(process.env.PORT || port, () => {
      console.log(`\nMoodify server listening on port ${port}`);
    });
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('Connected successfully');
});
