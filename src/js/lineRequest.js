import config from '../config/';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export function requestPostLine(line) {
  fetch(config.REQUEST_POST_URL, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({ line: line, timestamp: +new Date() }),
    })
    .then(function(res) {
      if (res.status >= 400 && res.status < 600) {
        // TODO: Error handling for invalid line
        console.log('Line is invalid and coult not be added');
      } else {
        console.log('Line successfully added');
      }
    });
}

export function requestDeleteLine(id) {
  fetch(config.REQUEST_DELETE_URL, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({ id: id, timestamp: +new Date() }),
    })
    .then(function(res) {
      if (res.status >= 400 && res.status < 600) {
        // TODO: Error handling for invalid line
        console.log('Line could not be deleted');
      } else {
        console.log('Line successfully deleted');
      }
    });
}

