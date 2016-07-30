import React from 'react';
import ReactDOM from 'react-dom';

import MessageStreamItem from './MessageStreamItem';
import InlineRecorder from './InlineRecorder';

class MessageStream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      atScrollBottom: true,
    };

    setTimeout(() => {
      const thisNode = ReactDOM.findDOMNode(this);
      thisNode.scrollTop = thisNode.scrollHeight;
    }, 1);
  }

  componentDidUpdate() {
    // If the user was already at the bottom, scroll to the bottom
    const thisNode = ReactDOM.findDOMNode(this);
    thisNode.scrollTop = thisNode.scrollHeight;
  }

  render() {
    return (
      <ul className="message-stream">
        {
          this.props.messages.map(message => (
            <MessageStreamItem currentUser={this.props.currentUser} message={message} key={message.createdAt} />
          ))
        }
        {
          this.props.showVideoRecorder ? <InlineRecorder
            currentUser={this.props.currentUser}
            currentOtherUser={this.props.currentOtherUser}
            emitAndAppendNewMessage={this.props.emitAndAppendNewMessage}
          /> : null
        }
      </ul>
    );
  }
}

MessageStream.propTypes = {
  showVideoRecorder: React.PropTypes.bool,
  currentUser: React.PropTypes.string,
  currentOtherUser: React.PropTypes.string,
  messages: React.PropTypes.array,
  emitAndAppendNewMessage: React.PropTypes.func,
};

export default MessageStream;
