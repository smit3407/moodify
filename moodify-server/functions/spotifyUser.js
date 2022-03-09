const axios = require('axios');
const spotify_url = 'https://api.spotify.com/v1';

async function getUserId(token) {
    return await axios.get(spotify_url + '/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((data) => {
      toReturn = data.data.id;
      console.log(toReturn);
      return toReturn;
    }).catch((err) => {
      console.log('unsuccessful user profile')
      console.log(err)
    });
}

async function getUserProfile(token) {
  return await axios.get(spotify_url + '/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((data) => {
      console.log('successful user profile api')
      console.log(token);
      return data.data;
    })
    .catch((err) => {
      console.log('unsuccessful user profile api')
      console.log(err);
      return err;
    });
}

async function getPlaylistFollow(token) {
  return await axios.get(spotify_url + '/me/playlists', {
    headers: { Authorization: `Bearer ${token}`},
  }).then((data) => {
    toReturn = data.data;
    console.log(toReturn);
    return toReturn;
  }).catch((err) => {
    console.log(err);
    return err;
  });
}

// Request to spotify for user's top tracks
// Returns list of ids of the user's top tracks
async function userTop(token, type) {
  console.log('running user top ' + type);

  if (type == 'tracks') {
    return await axios.get(spotify_url + '/me/top/tracks', {
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
        });
      });
      return toReturn;
    }).catch((err) => {
      console.log('unsuccessful user top tracks')
      console.log(err)
    })
  }

  return await axios.get(spotify_url + '/me/top/artists', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((data) => {
    console.log('Got user top artists!');
    var items = data.data.items;
    var toReturn = [];
    items.forEach(element => {
      // console.log(element)
      toReturn.push({
        "id": element.id,
        "name": element.name,
        "genres": element.genres,
        "popularity": element.popularity,
        "followers": element.followers
      });
    });
    return toReturn;
  }).catch((err) => {
    console.log('unsuccessful user top artists')
    console.log(err)
  })
}

module.exports = { getUserId, getUserProfile, getPlaylistFollow, userTop };