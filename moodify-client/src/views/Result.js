import React, { useState } from 'react';
import axios from 'axios';
import {
  Col, Row, Container, Card, Toast, Modal,
} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import CustomButton from 'react-bootstrap/Button';
import Cookies from 'js-cookie';
import SpotifyPlayer from 'react-spotify-web-playback';
import Button from '../components/Button';
import logo from '../images/logo-white.png';
import Playlist from '../components/Playlist';
import Toggle from '../components/Toggle';
import MoodStatistics from '../components/MoodStatistics';

function Result() {
  const accessToken = Cookies.get('SpotifyAccessToken');

  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const mood = query.get('mood');
  const submood1 = query.get('submood1');
  const submood2 = query.get('submood2');
  const submood3 = query.get('submood3');
  const submood4 = query.get('submood4');
  const submood5 = query.get('submood5');

  const customStyle = {
    'font-size': '2rem',
    color: 'white',
  };

  const buttonStyle = {
    outline: 'none',
    'background-color': 'transparent',
    'border-color': 'transparent',
    'box-shadow': 'none',
    color: 'black',
  };

  const toastStyle = {
    position: 'absolute',
    top: '10%',
    left: '50%',
    /* bring your own prefixes */
    transform: 'translate(-50%, -50%)',
  };

  const toastBodyStyle = {
    'text-align': 'center',
    color: 'black',
  };

  const [filterExplicitActive, setFilterExplicitActive] = useState(false);
  const [filterExplicitText, setFilterExplicitText] = useState('Explicit');
  const [filterPopText, setFilterPopText] = useState('Popularity');
  const [filterPopActive, setFilterPopActive] = useState(false);
  const [filterGenreText, setFilterGenreText] = useState('Genre');
  const [filterGenreActive, setFilterGenreActive] = useState(false);
  const [genreFilterIndex, setGenreFilterIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [personalizedSongs, setPersonalizedSongs] = useState([]);
  const [heartButton, setHeartButton] = useState('/heart-white.png');
  const [heartFill, setHeartFill] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState(undefined);
  const [filter, setFilter] = useState();
  const [genre, setGenre] = useState(['Genre']);
  const [name, setName] = useState();
  const [commName, setCommName] = useState();
  const [persName, setPersName] = useState();
  const [playlistLink, setPlaylistLink] = useState();
  const [imgLink, setImgLink] = useState();
  const [commImgLink, setCommImgLink] = useState();
  const [persImgLink, setPersImgLink] = useState();
  const [communityPlaylistActive, setCommunityPlaylistActive] = useState(true);
  const [songIds, setSongIds] = useState('');
  const [songUris, setSongUris] = useState();
  const [curSong, setCurSong] = useState();
  const [showMoodStatsModal, setShowMoodStatsModal] = useState(false);
  const [moodStatisticsData, setMoodStatisticsData] = useState({});
  const [playPlayback, setPlayPlayback] = useState(false);

  function isMostPopular() {
    const temp = [...filter];
    temp.sort((a, b) => b.popularity - a.popularity);
    setFilter(temp);
    console.log('MOST POPULAR');
  }

  function isLeastPopular() {
    const temp = [...filter];
    temp.sort((a, b) => a.popularity - b.popularity);
    setFilter(temp);
    console.log('LEAST POPULAR');
  }

  function isFilterGenreActive() {
    const currentSongs = communityPlaylistActive ? songs : personalizedSongs;
    let newIndex = genreFilterIndex + 1;
    console.log(newIndex, genre.length);
    console.log(genre[newIndex]);
    if (newIndex % genre.length === 0) {
      newIndex = 0;
      setGenreFilterIndex(newIndex);
      setFilterGenreActive(false);
      setFilter(currentSongs);
    } else {
      const songsToFilter = [...currentSongs];
      console.log(songsToFilter);
      setGenreFilterIndex(newIndex);
      setFilterGenreActive(true);
      const theGenre = genre[newIndex];
      const filtered = songsToFilter.filter((track) => track.artists?.some(
        (artist) => artist.genres?.includes(theGenre),
      ));
      console.log(filtered);
      setFilter(filtered);
    }
    setFilterGenreText(genre[newIndex]);
  }

  const upArrow = '\u{02191}';
  const downArrow = '\u{02193}';

  function isFilterPopActive() {
    const currentSongs = communityPlaylistActive ? songs : personalizedSongs;
    if (filterPopText === 'Popularity') {
      setFilterPopActive(true);
      setFilterPopText(`Popularity ${upArrow}`);
      isMostPopular();
    } else if (filterPopText === `Popularity ${upArrow}`) {
      setFilterPopActive(true);
      setFilterPopText(`Popularity ${downArrow}`);
      isLeastPopular();
    } else if (filterPopText === `Popularity ${downArrow}`) {
      setFilterPopActive(false);
      setFilterPopText('Popularity');
      setFilter(currentSongs);
      console.log('ORIGINAL');
    }
  }

  function isFilterExplicitActive() {
    const currentSongs = communityPlaylistActive ? songs : personalizedSongs;
    setFilterExplicitActive(!filterExplicitActive);
    if (filterExplicitActive === false) {
      setFilterExplicitText('Non-Explicit');
      const temp = [...filter];
      const noExplicit = temp.filter((song) => song.explicit === false);
      setFilter(noExplicit);
      console.log('NO EXPLICIT');
    } else if (filterExplicitActive === true) {
      setFilterExplicitText('Explicit');
      setFilter(currentSongs);
      console.log('EXPLICIT');
    }
  }

  const clearFilters = () => {
    if (filterExplicitActive) {
      setFilterExplicitActive(false);
      setFilterExplicitText('Explicit');
    }
    if (filterPopText === `Popularity ${downArrow}` || filterPopText === `Popularity ${upArrow}`) {
      setFilterPopActive(false);
      setFilterPopText('Popularity');
    }

    setGenreFilterIndex(0);
    setFilterGenreActive(false);
    setFilterGenreText('Genre');
  };

  const clickedCommunityPlaylist = () => {
    clearFilters();

    setFilter(songs);
    setSongUris(songs.map((item) => item.uri));
    setCommunityPlaylistActive(true);
    setImgLink(persImgLink);
    setName(persName);
  };

  const clickedPersonalizedPlaylist = () => {
    clearFilters();

    setFilter(personalizedSongs);
    setSongUris(personalizedSongs.map((item) => item.uri));
    setCommunityPlaylistActive(false);
    setImgLink(commImgLink);
    setName(commName);
  };

  function playerCallback(state) {
    setCurSong(state.track.id);
    console.log(state.track.id);
  }

  const startPlayback = (uri) => {
    setSongUris(uri);
    setPlayPlayback(true);
  };

  const playback = (
    <SpotifyPlayer
      name="Moodify Web Player"
      token={accessToken}
      uris={songUris}
      showSaveIcon
      callback={(state) => { playerCallback(state); }}
      play={playPlayback}
    />
  );

  const playlistCreatedToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Playlist Added to your Spotify Library!
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          OK
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  const failedToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Action failed, try again!
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          OK
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  const playlistSharedToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Playlist link copied to clipboard!
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          OK
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  function showWarning(type) {
    setToastContent(type);
    if (!toastActive) {
      setToastActive(true);
    }
  }

  async function followPlaylist() {
    try {
      let link;
      if (!heartFill) {
        setToastActive(false);
        setToastContent(undefined);

        let csvSong;
        if (communityPlaylistActive) {
          csvSong = songs.map((song) => song.id).join();
        } else {
          csvSong = personalizedSongs.map((song) => song.id).join();
        }

        setSongIds(csvSong);

        console.log(`csvSong: ${csvSong}`);

        link = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/create?token=${accessToken}&name=${name}&ids=${csvSong}`, { imgLink }).then((data) => {
          if (data.data !== 'Failed') return data.data;
          console.log('failed');
          return undefined;
        });

        console.log(link);

        if (link) {
          setHeartFill(true);
          setHeartButton('/heart-green.svg');
          setPlaylistLink(link);
          showWarning(playlistCreatedToast);
          setTimeout(() => {
            setToastActive(false); setToastContent(undefined);
          }, 3000);
        }
      } else {
        console.log('here');
        const playlistId = playlistLink.substring(34);
        console.log(playlistId);
        console.log(songIds);
        const item = await axios.delete(`https://smit3407-moodify-server.herokuapp.com/playlist/delete?playlistId=${playlistId}&songIds=${songIds}&token=${accessToken}`);
        console.log(item.data);
        setHeartFill(false);
        setHeartButton('/heart-white.png');
      }
    } catch (err) {
      // Failed to save playlist
      console.log(err);
      showWarning(failedToast);
      setTimeout(() => {
        setToastActive(false); setToastContent(undefined);
      }, 3000);
    }
  }

  async function sharePlaylist() {
    try {
      let link;
      if (!heartFill) {
        setToastActive(false);
        setToastContent(undefined);

        let csvSong;
        if (communityPlaylistActive) {
          csvSong = songs.map((song) => song.id).join();
        } else {
          csvSong = personalizedSongs.map((song) => song.id).join();
        }

        setSongIds(csvSong);

        link = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/create?token=${accessToken}&name=${name}&ids=${csvSong}&`).then((data) => {
          if (data.data !== 'Failed') return data.data;
          return undefined;
        });

        console.log(link);

        if (link) {
          setHeartFill(true);
          setHeartButton('/heart-green.svg');
          setPlaylistLink(link);
          navigator.clipboard.writeText(link);
          showWarning(playlistCreatedToast);
          setTimeout(() => {
            setToastActive(false); setToastContent(undefined);
          }, 3000);
          // Put up success toast w/ "Link Copied To Clipboard!"
          showWarning(playlistSharedToast);
          setTimeout(() => {
            setToastActive(false); setToastContent(undefined);
          }, 3000);
        } else {
          // Put up failure toast
          showWarning(failedToast);
          setTimeout(() => {
            setToastActive(false); setToastContent(undefined);
          }, 3000);
        }
      } else {
        navigator.clipboard.writeText(playlistLink);
        // Put up success toast w/ "Link Copied To Clipboard!"
        showWarning(playlistSharedToast);
        setTimeout(() => {
          setToastActive(false); setToastContent(undefined);
        }, 3000);
      }
    } catch (err) {
      // Put up failure toast
      showWarning(failedToast);
      setTimeout(() => {
        setToastActive(false); setToastContent(undefined);
      }, 3000);
    }
  }

  const playlistDeletedToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Playlist Removed from your Spotify Library!
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          OK
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  const shareToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Warning! By sharing this playlist, the playlist will automatically be
        added to your account!
        <CustomButton
          style={buttonStyle}
          onClick={() => sharePlaylist()}
        >
          Confirm
        </CustomButton>
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          Deny
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  const saveToast = (
    <Toast style={toastStyle}>
      <Toast.Body style={toastBodyStyle}>
        Warning! By liking this playlist, the playlist will automatically be
        added to your account!
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            followPlaylist();
          }}
        >
          Confirm
        </CustomButton>
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            setToastActive(false);
            setToastContent(undefined);
          }}
        >
          Deny
        </CustomButton>
      </Toast.Body>
    </Toast>
  );

  const moodStatsModal = (
    <Modal
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showMoodStatsModal}
    >
      <Modal.Body className="modal-text">
        <MoodStatistics data={moodStatisticsData} />
        <Button style={{ textAlign: 'center' }} onClick={() => setShowMoodStatsModal(false)} color="green" type="wide" text="Close" />
      </Modal.Body>
    </Modal>
  );

  React.useEffect(async () => {
    try {
      const userData = await axios.get(`https://smit3407-moodify-server.herokuapp.com/user/${accessToken}`);

      const associatedFeels = [];
      if (submood1 && submood1 !== '') {
        associatedFeels.push(submood1);
      }
      if (submood2 && submood2 !== '') {
        associatedFeels.push(submood2);
      }
      if (submood3 && submood3 !== '') {
        associatedFeels.push(submood3);
      }
      if (submood4 && submood4 !== '') {
        associatedFeels.push(submood4);
      }
      if (submood5 && submood5 !== '') {
        associatedFeels.push(submood5);
      }

      const data = await axios.post('https://smit3407-moodify-server.herokuapp.com/playlist/recommendations', {
        mood,
        associatedFeels,
        token: accessToken,
      });

      const personalizedData = await axios.get(`https://smit3407-moodify-server.herokuapp.com/playlist/personal/${accessToken}?cm=${mood}`);
      setPersonalizedSongs(personalizedData.data);

      const uris = data.data.map((item) => item.uri);

      setSongUris(uris);
      setSongs(data.data);
      setFilter(data.data);
      console.log(data.data);
      const genres = genre;
      data.data.forEach((track) => {
        if (track.artists) {
          track.artists.forEach((artist) => {
            if (artist.genres) {
              artist.genres.forEach((dat) => {
                if (dat) {
                  if (!genres.includes(dat)) { genres.push(dat); }
                }
              });
            }
          });
        }
      });
      console.log(genres);
      setGenre(genres);

      const moodStatsData = await axios.get(`https://smit3407-moodify-server.herokuapp.com/user/statistics/${userData.data.id}`);
      setMoodStatisticsData(moodStatsData.data);

      let newName = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/generatetitle?coremood=${mood}`);
      console.log(newName);
      newName = newName.data.split(' ').slice(1).join(' ');

      setName(newName);
      setPersName(newName);

      let newImgLink = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/generateimg?text=${newName}`);
      console.log(newImgLink.data);

      setImgLink(newImgLink.data);
      setPersImgLink(newImgLink.data);

      newName = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/generatetitle?coremood=${mood}`);
      console.log(newName);
      newName = newName.data.split(' ').slice(1).join(' ');
      setCommName(newName);

      newImgLink = await axios.post(`https://smit3407-moodify-server.herokuapp.com/playlist/generateimg?text=${newName}`);
      console.log(newImgLink.data);
      setCommImgLink(newImgLink.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  async function showMoodStats() {
    setShowMoodStatsModal(true);
  }

  let suggestButton;
  if (submood1 == null) {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  } else if (submood2 == null) {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}&submood1=${submood1}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  } else if (submood3 == null) {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}&submood1=${submood1}&submood2=${submood2}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  } else if (submood4 == null) {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}&submood1=${submood1}&submood2=${submood2}&submood3=${submood3}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  } else if (submood5 == null) {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}&submood1=${submood1}&submood2=${submood2}&submood3=${submood3}&submood4=${submood4}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  } else {
    suggestButton = (
      <Link to={{ pathname: `/suggest-song?mood=${mood}&submood1=${submood1}&submood2=${submood2}&submood3=${submood3}&submood4=${submood4}&submood5=${submood5}` }}>
        <Button color="green" type="wide" text="Suggest songs" />
      </Link>
    );
  }

  return (
    <div className="basic-frame">
      <Container>
        <Row>
          <Col md={{ span: 10, offset: 1 }}>
            <h1>
              <img
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  top: '15%',
                  left: '8.7%',
                  /* bring your own prefixes */
                  transform: 'translate(-50%, -50%)',
                }}
                src={imgLink}
                alt=""
              />
            </h1>
          </Col>
          <Col md={{ span: 10, offset: 1 }}>
            <h1>
              {name}
            </h1>
            <h2 style={{ color: '#1DAF51' }}>
              {' '}
              {mood}
              {' '}
            </h2>
            <h4 style={{ color: '#8fffb7' }}>
              {' '}
              {submood1}
              {' '}
              {submood2}
              {' '}
              {submood3}
              {' '}
              {submood4}
              {' '}
              {submood5}
              {' '}
            </h4>
          </Col>
          <Col>
            <Link className="home-button" to={{ pathname: '/dashboard' }}>
              <img style={{ width: '90%' }} alt="" src={logo} />
            </Link>
          </Col>
        </Row>
      </Container>

      <br />
      <div style={{ position: 'absolute', left: '5%' }}>
        <button
          className="button-wrapper"
          type="button"
          onClick={() => {
            if (!heartFill) {
              showWarning(saveToast);
            } else {
              followPlaylist(undefined);
              showWarning(playlistDeletedToast);
            }
          }}
        >
          <img style={{ width: '30px' }} alt="heart" src={heartButton} />
        </button>
        <Button color="#2C2C2C" type="pill" filterActive={filterExplicitActive} text={filterExplicitText} onClick={() => isFilterExplicitActive()} />
        <Button color="#2C2C2C" type="pill" filterActive={filterPopActive} text={filterPopText} onClick={() => isFilterPopActive(filterPopText)} />
        <Button color="#2C2C2C" type="pill" filterActive={filterGenreActive} text={filterGenreText} onClick={() => isFilterGenreActive(filterPopText)} />
      </div>

      <div style={{ position: 'absolute', right: '5%', marginTop: '5px' }}>
        {suggestButton}
        <Button color="green" type="wide" text="Mood Statistics" onClick={() => showMoodStats()} />
        <CustomButton
          style={buttonStyle}
          onClick={() => {
            if (heartFill) {
              sharePlaylist();
            } else {
              showWarning(shareToast);
            }
          }}
        >
          <i className="bi bi-box-arrow-up" style={customStyle} />
        </CustomButton>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Toggle
          leftText="Community"
          rightText="Personalized"
          leftActive={communityPlaylistActive}
          onClickLeft={clickedCommunityPlaylist}
          onClickRight={clickedPersonalizedPlaylist}
        />
        <br />
        {playback}
        {toastContent}
      </div>
      {toastContent}
      {moodStatsModal}

      <Card className="rec-playlist">
        <Card.Body>
          <Playlist songs={filter} curSong={curSong} playCallback={startPlayback} />
        </Card.Body>
      </Card>

    </div>
  );
}

export default Result;
