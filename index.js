const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000
var MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";
var item = "";
var secretkey = "";
var cycle = [];

app.use(cors());

app.get('/', (req, res) => {
    res.json({ status: 'ok', inspirational_message: 'if you can read this, something powerful is going on in this API.' });
});

app.get('/users', (req, res) => {
    queryUsers(req, res);
});

app.get('/admins', (req, res) => {
    queryUsers(req, res);
});

app.get('/cicle', (req, res) => {
    importCicle(req, res);
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

async function importCicle(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');
    item = await db.collection('cycles').find({ codi_cicle: req.query.codi_cicle }).toArray();

    for (let i = 0; i < item.length; i++) {
        cycle.push(item[i].nom_cicle);
        cycle.push(item[i].nom_modul);
        cycle.push(item[i].nom_unitat_formativa);
    }

    cycle = onlyUnique(cycle);
    res.send(cycle);
}

//check items repeated in array cycle
function onlyUnique(cycle) {
    const unique = [];

    for (var i = 0; i < cycle.length; i++) {
        const elemento = cycle[i];

        if (!unique.includes(cycle[i])) {
            unique.push(elemento);
        }
    }

    return unique;
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
})