const express = require('express')
const app = express()
var cors = require('cors')
const PORT = process.env.PORT || 5000
var MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";

app.use(cors());

app.get('/users', (req, res) => {
  queryUsers(req, res);
})

async function queryUsers(req, res) {
  const client = await MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db('matricula');
  const items = await db.collection('users').find({email : req.query.email, isAdmin: false}).toArray();
  res.send(items);
  client.close();
}

app.listen(port, () => {
  console.log(`API ready and listening at port 5000`);
})
