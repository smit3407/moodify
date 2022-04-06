const axios = require('axios');

const geniusUrl = 'https://api.genius.com';

const geniusAuth = '7yU_tuuwkHFlqOxVRF5AQkmt241kutabsGi7wh88sx_kv-5HW0hcdxqojHUdwllM';

function formatCredits(song) {
  const credits = song.data.response.song;
  const writers = credits.writer_artists;
  const writArr = [];
  const producers = credits.producer_artists;
  const prodArr = [];

  writers.forEach((writer) => {
    writArr.push(writer.name);
  });

  producers.forEach((producer) => {
    prodArr.push(producer.name);
  });

  const toReturn = {
    performedBy: credits.artist_names,
    writtenBy: writArr,
    producedBy: prodArr,
  };

  return toReturn;
}

async function getSongCredits(songTitle, artist) {
  return axios.get(`${geniusUrl}/search?q=${songTitle}%20${artist}`, {
    headers: {
      Authorization: `Bearer ${geniusAuth}`,
    },
  }).then(async (results) => {
    if (results.data.response.hits.length === 0) {
      return 'Failed';
    }

    const songId = results.data.response.hits[0].result.id;
    // console.log(`songId: ${songId}`);

    return axios.get(`${geniusUrl}/songs/${songId}`, {
      headers: {
        Authorization: `Bearer ${geniusAuth}`,
      },
    }).then((song) => formatCredits(song)).catch((error) => {
      console.log(error);
      return 'Failed';
    });
  }).catch((error) => {
    console.log(error);
    return 'Failed';
  });
}

module.exports = { getSongCredits, formatCredits };
