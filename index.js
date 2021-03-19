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

app.get('/import', (req, res) => {
    importCycle(req, res);
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
    item = await db.collection('cycles').find({ codi_cicle_formatiu: req.query.codi_cicle_formatiu }).toArray();

    if (item == undefined || item == null || item == "") {
        res.send("CICLO NO ENCONTRADO")
    } else {
        for (let i = 0; i < item.length; i++) {
            cycle.push(item[i].nom_cicle_formatiu);
            cycle.push(item[i].nom_modul);
            cycle.push(item[i].nom_unitat_formativa);
        }

        cycle = onlyUnique(cycle);
        cycle = transformArrayToDict(cycle);
        res.send(JSON.stringify(cycle));
    }
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

//
function transformArrayToDict(cycle) {
    var cont = 1;
    const cycle_dict = {

    };

    cycle_dict["nom_cicle"] = cycle[0];

    for (var i = 1; i < cycle.length; i++) {
        if (cycle[i].charAt(0) == 'M' && cycle[i].charAt(1) == 'P') {
            var module = cycle[i];

            const nameKeyModule = "modul" + cont;
            cycle_dict[nameKeyModule] = module;

            var unitys = [];
            for (let j = i + 1; j < cycle.length; j++) {
                if (cycle[j].charAt(0) == "U" && cycle[j].charAt(1) == "F") {
                    unitys.push(cycle[j]);
                } else {
                    cont += 1;
                    break;
                }
            }

            cycle_dict[cycle_dict[nameKeyModule]] = unitys;
        }
    }


    console.log(cycle_dict);

    return cycle_dict;
}

function importCycle(req, res) {
    var JSONcycles = convertCSVToJSON(res);
}

function convertCSVToJSON(res) {

    // require csvtojson module
    const CSVToJSON = require('csvtojson');

    var cycle = "";
    // convert cycle.csv file to JSON array
    (async() => {
        try {
            cycle = await CSVToJSON().fromFile('/home/super/Baixades/Taules_cataleg_FP_18-19-LOE.csv');

            importMongoDB(res, cycle);

        } catch (err) {
            console.log(err);
        }
    })();
}

async function importMongoDB(res, cycle) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    for (var i = 0; i < cycle.length; i++) {
        var newCycle = cycle[i];
        await db.collection("cycles").insertOne(newCycle, function(err, res) {
            if (err) throw err;
            console.log(i + " document updated");
        });
    }
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
})