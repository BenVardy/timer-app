import React from 'react';
import styled from 'styled-components';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import history from 'history/browser';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ClipLoader } from 'react-spinners';
import QRCode from 'qrcode.react';

import CodeInput from './CodeInput';
import Layout from './Layout';
import Typography from './Typography';

dayjs.extend(utc);

const serverRoot = 'http://localhost:3001';

const Wrapper = styled.div`
  text-align: ${props => props.textAlign || 'left'};
  margin: 16px auto;
  outline: none;
  position: relative;
`;

const TimerWrapper = styled.div`
  display: inline-block;
  margin: 16px;
  text-align: left;
  vertical-align: top;
`;

const TimeStampWrapper = styled(Wrapper)`
  cursor: text;
  margin: 0;
  width: auto;
`;

const StylishQRCode = styled(QRCode)`
  display: block;
  max-height: 100%;
  max-width: 100%;

  @media only screen and (max-width: 1150px) {
    max-width: 50%;
    max-height: 50%;
    height: unset !important;
    width: unset !important;
  }

  @media only screen and (max-width: 950px) {
    display: none;
  }
`;

const Button = styled.button`
  border: 1px solid #888888;
  border-radius: 8px;
  background-color: transparent;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  font-family: 'Roboto';
  outline: none;
  padding: 8px 16px;
`;

const Number = styled(Typography)`
  font-size: 112px;
  color: ${props => (props.focused ? '#888' : 'black')};

  @media only screen and (max-width: 950px) {
    font-size: 48px;
  }
`;

const TimeUnit = styled(Number)`
  border-left: ${props => (props.displayCursor && props.focused ? '1px' : '0')}
    solid lightgrey;
  margin-right: 8px;
`;

class Timer extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super();
    /** @type {Cookies} */
    const cookies = props.cookies;

    let urlParams = new URLSearchParams(window.location.search.substring(1));
    let id = urlParams.get('id');

    let token = cookies.get('token');
    if (!token) {
      token = uuidv4();
      cookies.set('token', token);
    }

    this.state = {
      id,
      token,
      timerToken: null,
      loading: id !== null,
      number: 0,
      end: null,
      newTimeStamp: '',
      focused: false,
      interval: null,
    };

    this.createTimer = this.createTimer.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.handleCodeSubmit = this.handleCodeSubmit.bind(this);

    this.timerInterval = this.timerInterval.bind(this);
  }

  componentDidMount() {
    // Get times from API
    const { id } = this.state;

    if (id) this.fetchTimer(id);
  }

  handleClick() {
    const { token, timerToken, interval } = this.state;
    if (token === timerToken) {
      clearInterval(interval);

      this.setState({
        interval: null,
        focused: true,
      });
    }
  }

  handleBlur() {
    let { id, number, interval } = this.state;
    let newState = {
      focused: false
    };

    if (!interval && number > 0) {
      interval = this.timerInterval();
      // Call api to update/set here
      this.updateTimer(id, number);

      let end = dayjs.utc().add(number, 's').unix();

      Object.assign(newState, {
        interval,
        end,
        newTimeStamp: '',
      });
    }

    this.setState(newState);
  }

  handleKeyPress(e) {
    let { newTimeStamp, focused } = this.state;
    // Only allow edit if focused
    if (!focused) return;

    const { key } = e;
    if (key.match(/enter/i)) {
      e.target.tabIndex = 0;
      return this.handleBlur();
    }
    if (!key.match(/\d/)) return;
    // If we've filled it up
    if (newTimeStamp.length === 6) newTimeStamp = '';

    newTimeStamp += key;

    let date = dayjs.utc(
      '1970-01-01 ' + newTimeStamp.padStart(6, '0'),
      'YYYY-MM-DD HHmmss'
    );

    let number = date.unix();
    this.setState({
      number,
      newTimeStamp,
    });
  }

  handleCodeSubmit(id) {
    this.fetchTimer(id);
    history.push(`/?id=${id}`);
    this.setState({ id, loading: true });
  }

  fetchTimer(id) {
    fetch(`${serverRoot}?id=${id}`, {
        headers: { Accept: 'application/json' },
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw res.json();
          }
        })
        .then(json => {
          let { token: timerToken, end } = json;
          let start = dayjs.utc().unix();
          let number = Math.max(0, end - start);
          let interval = number > 0 ? this.timerInterval() : null;

          return {
            number,
            timerToken,
            end,
            totalTs: this.formatNumber(number),
            interval,
          };
        })
        .catch(err => {
          err.then(({ error }) => console.error(error));
          return {
            id: null,
          };
        })
        .then(newState => {
          this.setState(Object.assign({ loading: false }, newState));
        });
  }

  createTimer() {
    const {token} = this.state;

    fetch(serverRoot, {
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then(json => {
        const { id } = json;

        history.push(`/?id=${id}`);
        this.setState({ id, timerToken: token });
      });
  }

  updateTimer(id, number) {
    let start = dayjs.utc();
    let end = start.add(number, 's');

    let data = {
      id,
      start: start.unix(),
      end: end.unix(),
    };

    fetch(serverRoot, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then(json => {
        console.log(json);
      })
      .catch(err => {
        console.error(err);
      });
  }

  timerInterval() {
    return setInterval(() => {
      let { end, number, interval } = this.state;
      let start = dayjs.utc().unix();

      let newNumber = Math.max(0, end - start);

      if (newNumber !== number) {
        let newState = { number: newNumber };

        if (number <= 0) {
          clearInterval(interval);
          newState.interval = null;
        }

        this.setState(newState);
      }
    }, 10);
  }

  formatNumber(n) {
    let date = dayjs.utc(0).add(n, 's');
    return date.format('HH[h]mm[m]ss[s]');
  }

  createDisplay(n, focused) {
    let formatted = this.formatNumber(n);
    return formatted.split('').map((v, i) =>
      v.match(/\d/) ? (
        <Number key={i} focused={focused}>
          {v}
        </Number>
      ) : (
        <TimeUnit key={i} focused={focused} displayCursor={v === 's'}>
          {v}
        </TimeUnit>
      )
    );
  }

  render() {
    let { id, number, loading, focused } = this.state;

    return (
      <Layout>
        {loading ? (
          <ClipLoader></ClipLoader>
        ) : id !== null ? (
          <>
            <TimerWrapper>
              <TimeStampWrapper
                onClick={this.handleClick}
                onBlur={this.handleBlur}
                tabIndex="0"
                onKeyPress={this.handleKeyPress}
                >
                {this.createDisplay(number, focused)}
              </TimeStampWrapper>
              <Typography>Timer ID: {id}</Typography>
            </TimerWrapper>
            <StylishQRCode size={512} value={`https://benvardy.co.uk?id=${id}`} />
          </>
        ) : (
          <Wrapper>
            <Typography size="32px">Create a new Timer:</Typography>
            <Wrapper textAlign="center">
              <Button onClick={this.createTimer}>Create Timer</Button>
            </Wrapper>
            <Typography size="32px">Or Enter a Timer Code:</Typography>
            <Wrapper textAlign="center">
              <CodeInput handleSubmit={this.handleCodeSubmit}></CodeInput>
            </Wrapper>
          </Wrapper>
        )}
      </Layout>
    );
  }
}

export default withCookies(Timer);
