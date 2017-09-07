const express = require('express');
const app = express();
var port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const path = require('path');

import config from './config';
import Line from './common/Line';
import { lineIsValid } from './common/validateLine';
import fb from './config/firebase-admin';

let currentGridLines = [];
let lines = [];

fb.ref('/grid/').on('value', function(snapshot) {
  currentGridLines = [];

  let lineKeys = (snapshot.val()) ? Object.keys(snapshot.val()) : [];
  lines = [];

  let i = 0;
  snapshot.forEach((item)=>{
    lines.push(item.val())
    currentGridLines.push({key: lineKeys[i], line: item.val()});
    i++;
  });
});


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public/views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index', {
    data: lines,
  });
});

app.post(config.REQUEST_POST_URL, function(req, res) {
  res.setHeader('Content-Type', 'application/json');
    let line = req.body.line || '';
    if (lineIsValid(line)) {
     saveLine(req.body.line);
     res.sendStatus(200);
    } else {
     res.sendStatus(400);
    }
});

app.post(config.REQUEST_DELETE_URL, function(req, res) {
  res.setHeader('Content-Type', 'application/json');
    let id = req.body.id || '';
    if (deleteLine(id)) {
     res.sendStatus(200);
    } else {
     res.sendStatus(400);
    }
});

app.listen(port, function() {
  console.log('Server listening on port ' + port + ' :)');
});

function saveLine(line) {
 // TODO: Check and update slope
 fb.ref('/grid/').push(line);
}

function deleteLine(id) {
 // TODO: Check and update slope
 for (var i = 0; i < currentGridLines.length; i++) {
   if (currentGridLines[i].line.id == id) {
    console.log('deleting line key'+currentGridLines[i].key);
    console.log('with id'+id);
    fb.ref('/grid/'+currentGridLines[i].key).remove();
    return true;
   }
 }

 return false;
}
