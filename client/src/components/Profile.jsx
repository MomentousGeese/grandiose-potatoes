// lib
import React from 'react';
import io from 'socket.io-client';

// util
import { getUsers, getCurrentUser, getMessages, filterMessages, createMessage } from '../util/profileUtil.js';

// components
import User from './User';
import MessageStream from './MessageStream';

// socket init
const socket = io();

////////////// MOCK DATA ////////////////////////
// const messages = [
//   {
//     url: 'http://materializecss.com/images/sample-1.jpg',
//     type: 'image',
//     createdAt: '2016-07-26',
//     username: 'Robb',
//   },
//   {
//     url: 'http://materializecss.com/images/sample-1.jpg',
//     type: 'image',
//     createdAt: '2016-07-27',
//     username: 'Greg',
//   },
//   {
//     url: 'http://materializecss.com/images/sample-1.jpg',
//     type: 'image',
//     createdAt: '2016-07-28',
//     username: 'Robb',
//   },
// ];
////////////// MOCK DATA ////////////////////////

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      allUsers: [],
      currentUser: null, // this.props.currentUser?
      currentOtherUser: null,
      allMessages: [],
      currentMessages: [],
      showLoading: true,
      videoButtonStyle: { display: "none" },
      showVideoRecorder: false,
    };

    console.log('currentMessages: ', this.state.currentMessages);

    this.handleCancelVideoClick = this.handleCancelVideoClick.bind(this);
    this.handleUserClick = this.handleUserClick.bind(this);
    this.handleVideoClick = this.handleVideoClick.bind(this);
    this.emitAndAppendNewMessage = this.emitAndAppendNewMessage.bind(this);

    socket.on('add message', (message) => {
      message = JSON.parse(message);
      if (message.otherUser === this.state.currentUser) {
        delete message.otherUser;
        this.setState({
          allMessages: this.state.allMessages.concat(message),
          currentMessages: this.state.currentMessages.concat(message),
        });
      }
    });
  }

  componentDidMount() {
    // /////////////////////////////////
    //    POST REQUEST DATA FORMAT    //
    //                                //
    //     info = {                   //
    //       url: url,                //
    //       type: type,              //
    //       senderName: sender,      //
    //       receiverName: receiver,  //
    //     };                         //
    //                                //
    // /////////////////////////////////

    // const info = {
    //   url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
    //   type: "vid",
    //   senderName: "John Cena",
    //   receiverName: "ryan",
    // };
    // createMessage(info);
    Promise.all([getUsers(), getCurrentUser(), getMessages()])
      .then((values) => {
        console.log(values[1].username);
        this.setState({
          allUsers: values[0].map(user => user.username),
          currentUser: values[1].username,
          allMessages: values[2],
          showLoading: false,
        });
      })
      .catch(console.error.bind(console));
  }

  handleUserClick(e) {
    const otherUser = e.target.textContent;
    // console.log(e.target.textContent);
    // console.log(this.state.currentUser);
    this.setState({
      currentMessages: filterMessages(this.state.allMessages, this.state.currentUser, otherUser),
      currentOtherUser: otherUser,
    });

    console.log(this.state.currentMessages);
  }

  handleVideoClick() {
    this.setState({
      videoButtonStyle: { right: "150px" },
      showVideoRecorder: true,
    });
  }

  handleCancelVideoClick() {
    this.setState({
      videoButtonStyle: { display: "none" },
      showVideoRecorder: false,
    });
  }

  emitAndAppendNewMessage(type, url) {
    const infoForAppend = {
      url,
      type,
      username: this.state.currentUser,
      otherUser: this.state.currentOtherUser,
    };

    this.setState({
      allMessages: this.state.allMessages.concat(infoForAppend),
      currentMessages: this.state.currentMessages.concat(infoForAppend),
    });

    socket.emit('add message', JSON.stringify(infoForAppend));
  }

  startRec() {
    console.log('ayyyy start the video lmaoooo');
  }

  stopRec() {
    console.log('stop the video, u w0t m8?');
  }

  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">Ryan</a></li>
  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">Robb</a></li>
  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">John Cena</a></li>
  // onClick={this.handleCancelVideoClick}
  render() {
    return (
      <div>
        <div className="row">
          <h3>Messages</h3>
        </div>
        <div className="row message-box">
          <div className="col s3">
            <ul className="collection">
              {
                this.state.allUsers.map((user, i) => (
                  <User handleClick={this.handleUserClick} otherUserName={user} key={i} />
                ))
              }
            </ul>
          </div>

          <MessageStream
            showVideoRecorder={this.state.showVideoRecorder}
            currentUser={this.state.currentUser}
            currentOtherUser={this.state.currentOtherUser}
            messages={this.state.currentMessages}
            emitAndAppendNewMessage={this.emitAndAppendNewMessage}
          />
        </div>
        {
          this.state.currentOtherUser !== null ?
            <div className="fixed-action-btn">
              <a className="btn-floating btn-large blue">
                <i className="large material-icons">send</i>
              </a>
              <ul>
                <li><a className="btn-floating blue"><i className="material-icons">gif</i></a></li>
                <li onClick={this.handleVideoClick}>
                  <a className="btn-floating blue"><i className="material-icons">videocam</i></a>
                </li>
              </ul>
            </div>
          : null
        }
      </div>
    );
  }
}
export default Profile;
