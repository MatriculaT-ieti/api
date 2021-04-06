const express = require('express')
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var cors = require('cors');
var item = {};
var secretkey = "";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(cors());

// Default:
app.get('/', (req, res) => {
    res.json({ status: 'ok', inspirational_message: 'if you can read this, something powerful is going on in this API.' });
});

// Login: 
app.get('/api/login/students', (req, res) => {
    queryUsers(req, res, false);
});

app.get('/api/login/admins', (req, res) => {
    queryUsers(req, res, true);
});

// Import cycles:
app.post('/api/db/cycle/import', (req, res) => {
    console.log("XDDDDD");
    importEndPoint(req, res);
});

// CRUD cycles:
app.get('/api/db/cycles/read', (req, res) => {
    readCycles(req, res);
});

async function queryUsers(req, res, isAdmin) {
    try {
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');
        item = await db.collection('users').findOne({ email: req.query.email, password: req.query.password, isAdmin: isAdmin });
        if (item == "" || item == null || item == undefined) {
            res.send({ token: null });
        } else {
            var token = createToken(req, res);

            item.token = token;
            console.log(item);
            await upgradeUser(req, res, token);
            res.send(item);
        }
    } catch (error) {}


}

function createToken(req, res) {
    if (item.isAdmin) {
        secretkey = "admin";
    } else {
        secretkey = "user";
    }
    item.token = "";
    var token = jwt.sign({ item: item }, secretkey, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
    })


    res.send({
        token
    });
    return token;
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

async function readCycles(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.id != null || req.query.id != undefined) {
            item = await db.collection('cycles').findOne({ "_id": ObjectId(req.query.id) });
            // Range parameter
        } else if (req.query.range != null || req.query.range != undefined) {
            if (Object.keys(JSON.parse(req.query.range))[0] === "from" && Object.keys(JSON.parse(req.query.range))[1] === "to") {
                let from = JSON.parse(req.query.range).from;
                let to = JSON.parse(req.query.range).to;

                if (from < to && from >= 0) {
                    to -= from;
                    item = db.collection('cycles').find().skip(from).limit(to);
                    item = item.toArray();
                }
            }
            // Filter parameter
        } else if (req.query.filter != "" && req.query.filter != undefined) {
            item = db.collection('cycles').find(JSON.parse(req.query.filter));
            item = item.toArray();

            if (Object.keys(item).length < 0) {
                item = { status: 'warning', description: 'we did not find anything...' };
            }
        }
        res.send(await item);
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }

}

async function importEndPoint(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var json = req.body;

    console.log(json);
    //importMongoDB(json);
}

async function importMongoDB(json) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    Object.keys(json).forEach(i => {
        var newCycle = json[i];
        db.collection("cycles").insertOne(newCycle, function(err, res) {
            if (err) throw err;
            console.log(i + " document inserted");
        });
    });
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
});