const express = require('express');
const axios = require('axios');

const router = express.Router();

const spotify_url = 'https://api.spotify.com/v1';

const User = require('../models/user');
const Mood = require('../models/mood');

//http://localhost:5000/user/{token}
router.get('/:token', (req, res) => {
  console.log('running user profile api')
  const { token } = req.params;

  axios.get(spotify_url + '/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((data) => {
      console.log('successful user profile api')
      console.log(token);
      res.json(data.data);
    })
    .catch((err) => {
      console.log('unsuccessful user profile api')
      console.log(err);
    });
});

// https://localhost:5000/user/tracks/:token
router.get('/tracks/:token', (req, res) => {
  console.log('running user top tracks');
  const { token } = req.params;

  axios.get(spotify_url + '/me/top/tracks', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((data) => {
    console.log('Got user top tracks!');
    var items = data.data.items;
    var toReturn = [];
    items.forEach(element => {
      toReturn.push({
        "songID": element.id,
        "songName": element.name,
        "songArtist": element.artists,
        "songAlbum": element.album.name,
        "moodTag": "",
        "popularity": element.popularity,
        "performedBy": element.artists,
        "writtenBy": element.artists,
        "producedBy": element.artists
      });
    });
    res.json(toReturn);
  }).catch((err) => {
    console.log('unsuccessful user top tracks')
    console.log(err)
  })
})

// ASK ANDREW WHY NEED TOKEN
// http://localhost:5000/user/dbprofile/{token}
router.get('/dbprofile/:token', async (req, res) => {
  console.log('running user info database retrieval');
  const { token } = req.params;

  axios.get(spotify_url + '/me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then((data) => {
    console.log('Got user profile from spotify');
    console.log(data.data.id);
    return findUser(data.data.id);
  }).then((data) => {
    console.log("is it printing everything?")
    console.log(data);
    res.json(data);
  }).catch((err) => {
    console.log(err);
  })
})

// http://localhost:5000/user/update/mood?type={core emotion}&token={token}
router.get('/update/mood', async (req, res) => {
  console.log('running user update mood info');
  const { type, token } = req.query;

  axios.get(spotify_url + '/me', {
    headers: { Authorization: `Bearer ${token}`}
  }).then((data) => {
    return checkMood(type, data.data.id);
  }).then(() => {
    res.sendStatus(200);
  }).catch((err) => {
    console.log(err);
  })
})

//new user
//get info from spotify api after authentication
// http://localhost5000/user/post?id={userID}
router.post('/post', async (req, res) => {
  const { id } = req.query;

  const user = {
    "userID": id
  };

  if (await checkUser(user)) {
    await postUser(user);
    res.json({
      "user was inserted": "into the db"
    });
  } else {
    res.json({
      "user was not inserted": "becuase they already exist"
    });
    console.log(user);
  }

})

router.put('/recommended', async (req, res) =>  {
  const { userID, songID } = req.query;
  
  const user = {
    "userID" : userID,
    "songID" : songID
  };

  try {
    return await User.findOne(
      { "userID": user.userID }
    ).then((data) => {
      if (data) {
        console.log("hereeeeee")
        console.log(data)
        if (!data.recommendedSongIDs.includes(user.songID)) {
          data.recommendedSongIDs.push(user.songID);
          data.numRecommendations++;
          console.log(data)
          data.save()
          console.log("inserting new recommended song")
          res.sendStatus(200)
        } else {
          console.log("user already has this recommended song")
          //res.sendStatus(400)
        }
      }
    }).then(() => {
      // res.sendStatus(200)
    })
  } catch (err) {
    console.log(err);
  }

})

//FUNCTIONS

async function postUser(user) {
  try {
    await new User(
      {
        "userID": user.userID,
        "logins": 1,
        "numRecommendations": 0
      }
    ).save();
  } catch (err) {
    console.log(err);
  }  
}


async function checkUser(user) {

  try {
    return await User.findOne(
      { "userID": user.userID }
    ).then((data) => {
      if (data) {
        console.log(data)
        return false;
      } else {
        return true;
      }
    })
  } catch (err) {
    console.log(err);
  }
}

async function findUser(userID) {
  try {
    let promise_obj = await User.findOne(
      { "userID": userID }//,
      //'userID logins',
    )
    console.log(promise_obj);
    return {
      "userID": promise_obj.userID,
      "logins": promise_obj.logins,
      "recommendedSongsIDs": promise_obj.recommendedSongIDs,
      "numRecommendations": promise_obj.numRecommendations
    };
  } catch (err) {
    console.log(err);
  }
}

// checks if mood is already in db and updates, if not it'll create it.
async function checkMood(mood, userID) {
  try {
    let promise_obj = await Mood.findOne(
      { "userID": userID, "type": mood }
    )
    if (promise_obj) {
      let arr = promise_obj.timeStamp;
      let timeNow = new Date();
      arr.push(timeNow.getTime());
      await Mood.updateOne(
        {
          "userID": userID,
          "type": mood
        },
        {
          "timeStamp": arr,
          "totalCount": promise_obj.totalCount + 1
        }
      )
    } else {
      let timeNow = new Date();
      let userMood = new Mood(
        {
          "userID": userID,
          "type": mood,
          "timeStamp": [timeNow.getTime()],
          "totalCount": 1,
        }
      )
      await userMood.save()
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = router;
