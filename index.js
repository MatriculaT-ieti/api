const express = require('express')
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var cors = require('cors');
var item = {};
var secretkey = "";

app.use(cors());

// Default:
app.get('/', (req, res) => {
    res.json({status: 'ok', inspirational_message: 'if you can read this, something powerful is going on in this API.'});
});

// Login: 
app.get('/api/login/students', (req, res) => {
    queryUsers(req, res);
});

app.get('/api/login/admins', (req, res) => {
    queryUsers(req, res);
});

// Import cycles:
app.get('/api/db/cycle/import', (req, res) => {
    convertCSVToJSON(res);
});

// CRUD cycles:
app.get('/api/db/cycles/read', (req, res) => {
    readCycles(req, res);
});

async function queryUsers(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');
    item = await db.collection('users').findOne({ email: req.query.email , password: req.query.password});
    if (item == "" || item == null || item == undefined) { 
        console.log("ERROR IN GET ITEM");
        res.send({token: null});
    } else {
        var token = createToken(req, res);
        
        item.token = token;
        console.log(item);
        upgradeUser(req, res, token);
        res.send(item);
    }

    client.close();
}

function createToken(res) {
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
    });
    return token;
}

async function upgradeUser(req, token) {
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
        item = {status: 'warning' , description: 'we did not find anything...'};
        const client = await MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('matricula');

        // Id parameter
        if (req.query.id != null || req.query.id != undefined) {
            item = await db.collection('cycles').findOne({"_id": ObjectId(req.query.id)});
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
                item = {status: 'warning' , description: 'we did not find anything...'};
            }
        }
        res.send(await item);
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({status: 'error' , description: 'something went wrong...'})
    }
   
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
                "durada_min_modul": durada_min_modul,
                "durada_max_modul": durada_max_modul,
                "data_inici_modul": data_inici_modul,
                "data_fi_modul": data_fi_modul,
                "unitats": [newUnitat]
            };
            nameCycle[codi_cicle] = {
                "codi_cicle_formatiu": codi_cicle,
                "nom_cicle_formatiu": cicle,
                "codi_adaptacio_curricular": codi_adaptacio_curricular,
                "hores_cicle_formatiu": hores_cicle_formatiu,
                "data_inici_cicle_formatiu": data_inici_cicle_formatiu,
                "data_fi_cicle_formatiu": data_fi_cicle_formatiu,
                "moduls": modules
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
                    "durada_min_modul": durada_min_modul,
                    "durada_max_modul": durada_max_modul,
                    "data_inici_modul": data_inici_modul,
                    "data_fi_modul": data_fi_modul,
                    "unitats": [newUnitat]
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
            //console.log(unitat);
        }
    }

    //console.log(nameCycle);
    importMongoDB(res, nameCycle);
}

async function importMongoDB(cycle) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    Object.keys(cycle).forEach(i => {
        var newCycle = cycle[i];
        db.collection("cycles").insertOne(newCycle, function(err, res) {
            if (err) throw err;
            console.log(i + " document inserted");
        });
    });
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
});
