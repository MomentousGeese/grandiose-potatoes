import React from 'react';

import { getUsers, getCurrentUser, getMessages, filterMessages, createMessage } from '../util/profileUtil.js';

import User from './User';

import MessageStream from './MessageStream';

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
      currentUser: 'Greg', // this.props.currentUser?
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

  startRec() {
    console.log('ayyyy start the video lmaoooo');
  }

  stopRec() {
    console.log('stop the video, u w0t m8?');
  }

  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">Ryan</a></li>
  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">Robb</a></li>
  // <li><a onClick={this.handleClick} className="collection-item light-blue-text">John Cena</a></li>
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
            messages={this.state.currentMessages}
          />
        </div>
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
        <div className="fixed-action-btn horizontal" style={this.state.videoButtonStyle} >
          <a className="btn-floating btn-large red">
            <i className="large material-icons">videocam</i>
          </a>
          <ul>
            <li onClick={this.handleCancelVideoClick} ><a className="btn-floating red"><i className="material-icons">not_interested</i></a></li>
            <li><a className="btn-floating red">POST</a></li>
            <li><a className="btn-floating red"><i className="material-icons">replay</i></a></li>
            <li><a className="btn-floating red"><i className="material-icons">stop</i></a></li>
            <li><a className="btn-floating red"><i className="material-icons">album</i></a></li>
          </ul>

        </div>
      </div>
    );
  }
}
export default Profile;
