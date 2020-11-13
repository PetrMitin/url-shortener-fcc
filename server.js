require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const urlModule = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// body-parser is enbuilt in express
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Mongoose setup and functions
const urlSchema = new mongoose.Schema({
  'full_url': {type: String, required: true},
  '_id': Number
})

const Url = mongoose.model('Url', urlSchema);

mongoose.connect('mongodb+srv://petr:150600Pm@url-db.c0vis.mongodb.net/<dbname>?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})

const getPrevId = async () => {
  //.exec() returns either nothing or Promise fullfilling to the requested data. 
  //Do NOT use callback inside of the .exec() method. "await" it instead.
  let data = await Url.find({}).sort([['_id', -1]]).exec();
  if (!data[0]) {
    return 0
  }
  return data[0]._id
}

// mounting route /api/shorturl/...
app.post('/api/shorturl/new', async (req, res) => {
  const url_to_shorten = req.body.url;
  const parsedLookupUrl = urlModule.parse(url_to_shorten);
  dns.lookup(parsedLookupUrl.hostname, async (err, address, family) => {
    if (err) return console.log(err);
    if (address === null) {
      return res.json({"error": "invalid url"});
    }
    const prevId = await getPrevId();
    Url.create({
      'full_url': url_to_shorten,
      '_id': prevId + 1
    }, (err, data) => {
      if (err) return console.log(err);
      res.json({
        full_url: url_to_shorten,
        short_url: data._id
      })
    })
  })
})

app.get('/api/shorturl/all', (req, res) => {
  Url.find({}, (err, data) => {
    if (err) return console.log(err);
    res.json({"urls": data});
  })
})

app.param('url', async (req, res, next, id) => {
  const full_url = await Url.findOne({'_id': id}, (err, data) => {
    if (err) return console.log(err);
    return data.full_url;
  });
  req.body.full_url = full_url.full_url;
  next();
})

app.get('/api/shorturl/:url', (req, res) => {
  const url = req.body.full_url;
  res.redirect(url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
