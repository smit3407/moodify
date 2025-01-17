import React from 'react';
import axios from 'axios';
import { Col, Row, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Button from '../components/Button';
import logo from '../images/logo-white.png';

function Dashboard() {
  const navigate = useNavigate();
  const { hash } = window.location;
  if (typeof Cookies.get('SpotifyAccessToken') === 'undefined' && hash !== '') {
    const accessToken = hash.split('&')[0].split('=')[1];
    const expiresIn = hash.split('&')[2].split('=')[1];

    Cookies.set('SpotifyAccessToken', accessToken, { expires: parseInt('0x', expiresIn) / 86400 });
  }

  const accessToken = Cookies.get('SpotifyAccessToken');

  React.useEffect(() => {
    if (window.location.hash === '' && Cookies.get('SpotifyAccessToken') === undefined) {
      return navigate('/');
    }
    axios.get(`https://smit3407-moodify-server.herokuapp.com/user/${accessToken}`)
      .then((data) => {
        axios.post(`https://smit3407-moodify-server.herokuapp.com/user/post?id=${data.data.id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function postMood(mood) {
    axios.post(`https://smit3407-moodify-server.herokuapp.com/user/update/mood?type=${mood}&token=${accessToken}`)
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="basic-frame">
      <Row>
        <Col style={{ marginTop: '50px' }} md={{ span: 10, offset: 1 }}>
          <h1>How are you feeling?</h1>
        </Col>
        <Col>
          <Link className="home-button" to={{ pathname: '/dashboard' }}>
            <img style={{ width: '90%', marginTop: '25px', marginRight: '25px' }} alt="" src={logo} />
          </Link>
        </Col>
      </Row>

      <br />
      <br />
      <Container>
        <Row className="justify-content-md-center">
          <Col md lg="4">
            <Link to={{ pathname: '/submood?mood=excited' }}>
              <Button color="#ED6A20" text="excited" type="round" onClick={() => postMood('excited')} />
            </Link>
          </Col>
          <Col md="auto">
            <Link to={{ pathname: '/submood?mood=content' }}>
              <Button color="#26CF37" text="content" type="round" onClick={() => postMood('content')} />
            </Link>
          </Col>
          <Col md lg="4">
            <Link to={{ pathname: '/submood?mood=happy' }}>
              <Button color="#F3D226" text="happy" type="round" onClick={() => postMood('happy')} />
            </Link>
          </Col>
        </Row>
        <br />
        <br />
        <br />
        <Row className="justify-content-md-center">
          <Col md lg="4">
            <Link to={{ pathname: '/submood?mood=bad' }}>
              <Button color="#A136F4" text="bad" type="round" onClick={() => postMood('bad')} />
            </Link>
          </Col>
          <Col md="auto">
            <Link to={{ pathname: '/submood?mood=sad' }}>
              <Button color="#3D93F9" text="sad" type="round" onClick={() => postMood('sad')} />
            </Link>
          </Col>
          <Col md lg="4">
            <Link to={{ pathname: '/submood?mood=angry' }}>
              <Button color="#F22D2D" text="angry" type="round" onClick={() => postMood('angry')} />
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;
