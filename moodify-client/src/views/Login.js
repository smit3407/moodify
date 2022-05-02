import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/login.css';
import logo from '../images/logo-white.png';

function Login() {
  const accessToken = Cookies.get('SpotifyAccessToken');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (typeof accessToken !== 'undefined') {
      return navigate('/dashboard');
    }
  });

  const REACT_APP_CLIENT_ID = 'f79f8a9b99344dda8c31b82e2ad7f63f';
  const REACT_APP_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
  const REACT_APP_REDIRECT_URL = 'https://voigniersmith.com/moodify/#/dashboard';

  const scopes = [
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    'user-library-modify',
    'user-library-read',
    'ugc-image-upload',
    'user-follow-modify',
    'streaming',
    'user-read-private',
    'user-read-email',
  ];

  const authorizeSpotify = () => {
    window.location.replace(`${REACT_APP_AUTHORIZE_URL}?client_id=${REACT_APP_CLIENT_ID}&response_type=token&redirect_uri=${REACT_APP_REDIRECT_URL}&scope=${scopes.join('%20')}&show_dialog=true`);
  };

  return (
    <div>
      <div className="login-page">
        <div className="login-page-items">
          <div className="moodify-title">
            Moodify
          </div>
          <div>
            <img src={logo} alt="logo" className="logo" />
          </div>
          <div>
            <Button text="Log in with Spotify" onClick={authorizeSpotify} type="wide" color="green" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
