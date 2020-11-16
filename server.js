require('dotenv').config({path: process.cwd() + '/sample.env'});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Basic Configuration
const port = process.env.PORT || 4000;

app.use(cors());

// body-parser is enbuilt in express
app.use(express.urlencoded({extended: true}));
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'react-frontend', 'build')))
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'react-frontend', 'build', 'index.html'))
  })
}

//Mongoose setup and functions
const urlSchema = new mongoose.Schema({
  'full_url': {type: String, required: true},
  '_id': Number
})

const Url = mongoose.model('Url', urlSchema);

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const getPrevId = async () => {
  //.exec() returns either nothing or Promise fullfilling to the requested data. 
  //Do NOT use callback inside of the .exec() method. "await" it instead.
  let data = await Url.find({}).sort([['_id', -1]]).exec();
  if (!data[0]) {
    return 0
  }
  return data[0]._id
}

// mounting route /
app.post('/new', async (req, res) => {
  const url_to_shorten = req.body.url;
  if (!require('valid-url').isUri(url_to_shorten)) {
    return res.json({"error": "invalid url"});
  }
  const prevId = await getPrevId();
  Url.create({
    'full_url': url_to_shorten,
    '_id': prevId + 1
  }, (err, data) => {
    if (err) return res.sendStatus(500);
    const shortUrl = req.protocol + '://' + req.get('host') + '/' + data._id;
    res.json({
      full_url: url_to_shorten,
      short_url: shortUrl
    })
  })
})

app.param('url', async (req, res, next, id) => {
  const full_url = await Url.findOne({'_id': id}, (err, data) => {
    if (err) return console.log(err);
    if (!data) return null;
    return data.full_url;
  });
  if (full_url === null) {
    req.body.full_url = null;
  } 
  else {
    req.body.full_url = full_url.full_url;
  }
  next();
})

app.get('/:url', (req, res) => {
  const url = req.body.full_url;
  if (url) {
    return res.redirect(url);
  }
  res.redirect(process.env.MAIN_URL);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
