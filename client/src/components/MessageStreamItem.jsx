import React from 'react';

function MessageStreamItem(props) {
  const className = props.message.username === props.currentUser ? 'user-me' : 'user-other';
  // "http://materializecss.com/images/sample-1.jpg"
  // <img src="http://materializecss.com/images/sample-1.jpg" alt="Video message" />
  // console.log(props.message);
  return (
    <li className={className}>
      <div className="card">
        <div className="card-image">
          <video src={props.message.url} height="360" width="480" controls></video>
        </div>
      </div>
    </li>
  );
}

MessageStreamItem.propTypes = {
  currentUser: React.PropTypes.string,
  message: React.PropTypes.object,
};

export default MessageStreamItem;
