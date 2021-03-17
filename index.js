const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000
var MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";
var item = "";
var secretkey = "";

app.use(cors());

app.get('/', (req, res) => {
   res.json('{"status": "ok"}')
});

app.get('/users', (req, res) => {
    queryUsers(req, res);
});

app.get('/admins', (req, res) => {
    queryUsers(req, res);
});

async function queryUsers(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');
    item = await db.collection('users').findOne({ email: req.query.email });
    if (item == "" || item == null || item == undefined) {
        console.log("ERROR IN GET ITEM");
    } else {
        var token = createToken(req, res);
        if (token == "" || token == null || token == undefined) {
            console.log("ERROR IN TOKEN");
        } else {
            item.token = token;
            console.log(item);
            upgradeUser(req, res, token);
            res.send(item);
        }
    }

    client.close();
}

function createToken(req, res) {
    if (item.isAdmin) {
        secretkey = "admin";
    } else {
        secretkey = "user";
    }
    var token = jwt.sign({ item: item }, secretkey, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
    })

    res.send({
        token
    })
    return token
}

async function upgradeUser(req, res, token) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var myquery = { email: req.query.email };
    var newvalues = { $set: { token: token } };
    await db.collection("users").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

    //await db.collection('users').updateOne({email : req.query.email}, item);
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
})