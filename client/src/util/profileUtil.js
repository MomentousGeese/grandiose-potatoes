function getCurrentUser() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: '/api/currentuser',
      success: (data) => {
        resolve(data);
      },
      error: (err) => {
        reject('Unable to retrieve current user:', err);
      },
    });
  });
}

function getUsers() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: "/api/users",
      success: (data) => {
        console.log('Got user data from server');
        console.log(data);
        const users = [];
        for (let i = 0; i < data.length; i++) {
          console.log(data[i].username);
          users.push(data[i].username);
        }
        resolve(data);
      },
      error: (err) => {
        console.log('Unable to retrieve users: ', err);
        reject('Unable to retrieve users:', err);
      },
    });
  });
}

function getMessages() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: "/api/messages",
      success: (data) => {
        console.log('Got messages data from server');
        resolve(data);
      },
      error: (err) => {
        console.log('Unable to retrieve messages: ', err);
        reject('Unable to retrieve messages:', err);
      },
    });
  });
}

function filterMessages(messages, currentUser, otherUser) {
  const container = [];
  messages.forEach((message) => {
    if (message.Receiver.username === otherUser && message.Sender.username === currentUser) {
      container.push({
        url: message.url,
        type: message.type,
        createdAt: message.createdAt,
        username: currentUser,
      });
    } else if (message.Receiver.username === currentUser && message.Sender.username === otherUser) {
      container.push({
        url: message.url,
        type: message.type,
        createdAt: message.createdAt,
        username: otherUser,
      });
    }
  });
  return container;
}

function createMessage(info) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: '/api/messages',
      data: info,
      success: (res) => {
        console.log('Sending new message to server');
        resolve(res);
      },
      error: reject,
    });
  });
}

export {
  getUsers,
  getCurrentUser,
  getMessages,
  filterMessages,
  createMessage,
};
