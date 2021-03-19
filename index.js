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
            dealJSON(res, cycle);
            //console.log(cycle);
            //importMongoDB(res, cycle);

        } catch (err) {
            console.log(err);
        }
    })();
}

function dealJSON(res, cycle) {
    arrayCycles = [];
    nameCycle = {};

    for (var i = 0; i < cycle.length; i++) {
        const codi_cicle = cycle[i]['codi_cicle_formatiu'];
        const cicle = cycle[i]['nom_cicle_formatiu'];
        const codi_adaptacio_curricular = cycle[i]['codi_adaptacio_curricular'];
        const hores_cicle_formatiu = cycle[i]['hores_cicle_formatiu'];
        const data_inici_cicle_formatiu = cycle[i]['data_inici_cicle_formatiu'];
        const data_fi_cicle_formatiu = cycle[i]['data_fi_cicle_formatiu'];
        const codi_modul = cycle[i]['codi_modul'];
        const module = cycle[i]['nom_modul'];
        const durada_min_modul = cycle[i]['durada_min_modul'];
        const durada_max_modul = cycle[i]['durada_max_modul'];
        const data_inici_modul = cycle[i]['data_inici_modul'];
        const data_fi_modul = cycle[i]['data_fi_modul'];
        const codi_unitat_formativa = cycle[i]['codi_unitat_formativa'];
        const unitat = cycle[i]['nom_unitat_formativa'];
        const durada_unitat_formativa = cycle[i]['durada_unitat_formativa'];
        const indicador_fct = cycle[i]['indicador_fct'];
        const indicador_sintesis = cycle[i]['indicador_sintesis'];
        const indicador_idioma = cycle[i]['indicador_idioma'];
        const indicador_projecte = cycle[i]['indicador_projecte'];

        //in case the cycle is not, we take its name, module and training unit
        if (nameCycle[codi_cicle] == undefined) {
            newUnitat = {
                "codi_unitat_formativa": codi_unitat_formativa,
                "nom_unitat_formativa": unitat,
                "durada_unitat_formativa": durada_unitat_formativa,
                "indicador_fct": indicador_fct,
                "indicador_sintesis": indicador_sintesis,
                "indicador_idioma": indicador_idioma,
                "indicador_projecte": indicador_projecte
            }
            modules = {};
            modules[codi_modul] = {
                "codi_modul": codi_modul,
                "nom_modul": module,
                "unitats": [newUnitat],
                "durada_min_modul": durada_min_modul,
                "durada_max_modul": durada_max_modul,
                "data_inici_modul": data_inici_modul,
                "data_fi_modul": data_fi_modul
            };
            nameCycle[codi_cicle] = {
                "codi_cicle_formatiu": codi_cicle,
                "nom_cicle_formatiu": cicle,
                "moduls": modules,
                "codi_adaptacio_curricular": codi_adaptacio_curricular,
                "hores_cicle_formatiu": hores_cicle_formatiu,
                "data_inici_cicle_formatiu": data_inici_cicle_formatiu,
                "data_fi_cicle_formatiu": data_fi_cicle_formatiu
            };
        } else { //in case the cycle exists, and the module does not exist, we will take the module and unit and add it
            modules = nameCycle[codi_cicle]["moduls"];
            if (modules[codi_modul] == undefined) {
                newUnitat = {
                    "codi_unitat_formativa": codi_unitat_formativa,
                    "nom_unitat_formativa": unitat,
                    "durada_unitat_formativa": durada_unitat_formativa,
                    "indicador_fct": indicador_fct,
                    "indicador_sintesis": indicador_sintesis,
                    "indicador_idioma": indicador_idioma,
                    "indicador_projecte": indicador_projecte
                };
                modules[codi_modul] = {
                    "codi_modul": codi_modul,
                    "nom_modul": module,
                    "unitats": [newUnitat],
                    "durada_min_modul": durada_min_modul,
                    "durada_max_modul": durada_max_modul,
                    "data_inici_modul": data_inici_modul,
                    "data_fi_modul": data_fi_modul
                };

                nameCycle[codi_cicle]["moduls"] = modules;
            } else { // and if there is the cycle i the module, i the unit not, we will update the unit
                newUnitat = {
                    "codi_unitat_formativa": codi_unitat_formativa,
                    "nom_unitat_formativa": unitat,
                    "durada_unitat_formativa": durada_unitat_formativa,
                    "indicador_fct": indicador_fct,
                    "indicador_sintesis": indicador_sintesis,
                    "indicador_idioma": indicador_idioma,
                    "indicador_projecte": indicador_projecte
                };
                nameCycle[codi_cicle]["moduls"][codi_modul]["unitats"].push(newUnitat);
            }
        }
    }

    console.log(nameCycle);
    res.send(nameCycle);
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