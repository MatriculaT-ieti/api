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
            tractarJSON(cycle);
            console.log(cycle);
            //importMongoDB(res, cycle);

        } catch (err) {
            console.log(err);
        }
    })();
}

function tractarJSON(cycle) {
    nameCycle = {
        codi_cicle_formatiu: 'CFPM    AF21',
        nom_cicle_formatiu: 'Impressió gràfica (converting)',
        codi_adaptacio_curricular: '21',
        hores_cicle_formatiu: '2000',
        data_inici_cicle_formatiu: '14/11/13',
        data_fi_cicle_formatiu: '',
        codi_modul: 'AF21008',
        nom_modul: 'MP8. Processos de laminat',
        durada_min_modul: '165',
        durada_max_modul: '165',
        data_inici_modul: '',
        data_fi_modul: '26/08/16',
        codi_unitat_formativa: 'AF2100801',
        nom_unitat_formativa: "UF1. Preparació d'equips i materials pel procés de laminat",
        durada_unitat_formativa: '25',
        indicador_fct: 'N',
        indicador_sintesis: 'N',
        indicador_idioma: 'N',
        indicador_projecte: 'N'
    };

    for (var i = 0; i < cycle.length; i++) {
        const cicle = cycle[i]['nom_cicle_formatiu'];
        const module = cycle[i]['nom_modul'];
        const unitat = cycle[i]['nom_unitat_formativa'];

        if (nameCycle[cicle] == undefined) {
            modules = {};
            unitats = [unitat];
            modules[module] = unitats;
            nameCycle[cicle] = modules;
        } else {
            modules = nameCycle[cicle];
            if (modules[module] == undefined) {
                unitats = [];
                unitats.push(unitat);
                modules[module] = unitats;
                nameCycle[cicle] = modules;
            } else {
                nameCycle[cicle][module].push(unitat);
            }
        }
    }

    console.log(nameCycle);
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