//npm install express
//npm install mongoose

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const uri = "mongodb+srv://admin:DbLv98QyYq6hawu@cluster0.dzgdm.mongodb.net?retryWrites=true&w=majority";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var item = {};
var secretkey = "";
const fs = require("fs");

app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json({ limit: '500mb' }));
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


// CRUD cycles:
// create cycles
app.get('/api/db/cycles/create', (req, res) => {
    createCycles(req, res);
})

//read cycles:
app.get('/api/db/cycles/read', (req, res) => {
    readCycles(req, res);
});

// Import cycles:
app.post('/api/db/cycle/import', (req, res) => {
    importEndPoint(req, res);
});

app.post('/api/db/cycle/update', (req, res) => {
    updateCycle(req, res);
});

//CRUD students:
//create students:
app.post('/api/db/student/create', (req, res) => {
    createStudent(req, res);
});

//read students:
app.get('/api/db/student/read', (req, res) => {
    readStudents(req, res);
});

//update students:
app.get('/api/db/student/update', (req, res) => {
    updateStudent(req, res);
});

//import students:
app.post('/api/db/student/import', (req, res) => {
    importStudents(req, res);
})

//import ufs students:
app.get('/api/db/student/import/ufs', (req, res) => {
    importStudentsUFs(req, res);
})

//upload photos students:
app.post('/api/db/student/upload', (req, res) => {
    uploadPhoto(req, res);

})

//download image:
app.get('/api/db/student/read/image', (req, res) => {
    readImage(req, res);
})

//CR requirements
//read requirementsprofile:
app.post('/api/db/requirmentsprofile/create', (req, res) => {
    createRequirment(req, res);
})

//read requirements profile:
app.get('/api/db/requirmentsprofile/read', (req, res) => {
    readRequirmentsProfile(req, res);
})

//validation requirment
app.get('/api/db/requirements/validation', (req, res) => {
    validationRequirements(req, res);
})

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

async function createCycles(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var json = req.body;

    importMongoDB(json, "cycles");
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

    importMongoDB(json, "cycles");
}

async function importStudents(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var json = req.body;
    importMongoDB(json, "users");
}

async function uploadPhoto(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.dni != null || req.query.dni != undefined) {
            item = await db.collection('requirements').findOne({ "dni": req.query.dni });
            var photo = req.body;

            console.log(photo);
            var newPhotos = item.photos;
            newPhotos.push(Object.keys(photo)[1]);

            var myquery = { dni: req.query.dni };
            var newvalues = { $set: { photos: Object.keys(photo)[0] } };
            await db.collection("requirements").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });

        }

        //convertingBase64toImage(Object.keys(photo)[0], res);
        res.send("SUCCESFULL");

    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}

async function readImage(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.dni != null || req.query.dni != undefined) {
            item = await db.collection('requirements').findOne({ "dni": req.query.dni });
        }

        convertingBase64toImage(item.photo, res);

    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}



function convertingBase64toImage(item_image, item, res) {
    let base64String = 'data:image/png;base64,' + item_image;

    // Remove header
    let base64Image = base64String.split(';base64,').pop();
    fs.writeFile('image.png', base64Image, { encoding: 'base64' }, function(err) {
        console.log('File created');
    });

}

async function importMongoDB(json, collectionBD) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');
    console.log(json);
    Object.keys(json).forEach(i => {
        var newCycle = json[i];
        db.collection(collectionBD).insertOne(newCycle, function(err, res) {
            if (err) throw err;
            console.log((i + 1) + " document inserted");
        });
    });
}

async function readStudents(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.cicle_formatiu != null || req.query.cicle_formatiu != undefined) {
            item = await db.collection('users').find({ 'cicle_formatiu': req.query.cicle_formatiu });
            item = item.toArray();
            // Range parameter
        } else if (req.query.range != null || req.query.range != undefined) {
            if (Object.keys(JSON.parse(req.query.range))[0] === "from" && Object.keys(JSON.parse(req.query.range))[1] === "to") {
                let from = JSON.parse(req.query.range).from;
                let to = JSON.parse(req.query.range).to;

                if (from < to && from >= 0) {
                    to -= from;
                    item = db.collection('users').find().skip(from).limit(to);
                    item = item.toArray();
                }
            }
            // Filter parameter
        } else if (req.query.filter != "" && req.query.filter != undefined) {
            item = db.collection('users').find(JSON.parse(req.query.filter));
            item = item.toArray();

            if (Object.keys(item).length < 0) {
                item = { status: 'warning', description: 'we did not find anything...' };
            }
        } else if (req.query.email != "" && req.query.email != undefined) {
            item = await db.collection('users').findOne({ 'Correu electrònic': req.query.email });

            if (item == null) {
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

async function updateStudent(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.email != null || req.query.email != undefined) {
            item = await db.collection('users').findOne({ 'Correu electrònic': req.query.email });
            var json = req.body
            var myquery = { 'Correu electrònic': req.query.email };
            var newvalues = { $set: json };
            await db.collection("users").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log(key + ' ' + item.Nom + " document updated");
            });

            if (item == null) {
                item = { status: 'warning', description: 'we did not find anything...' };
            }
        }
        res.send({ status: 'successful', description: 'User: ' + item.Nom + ' it has been updated' });
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}

async function updateCycle(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        // Id parameter
        if (req.query.codi != null || req.query.codi != undefined) {
            item = await db.collection('cycles').findOne({ 'codi_cicle_formatiu': req.query.codi });
            var json = JSON.parse(req.body);
            for (var key in json) {
                for (var keyItem in item) {
                    if (key == keyItem) {
                        var updateVal = {};
                        updateVal[key] = json[key];
                        var myquery = { 'codi_cicle_formatiu': req.query.codi };
                        var newvalues = { $set: updateVal };
                        await db.collection("cycles").updateOne(myquery, newvalues, function(err, res) {
                            if (err) throw err;
                            console.log(key + ' ' + item.Nom + " document updated");
                        });
                    }
                }
            }

            if (item == null) {
                item = { status: 'warning', description: 'we did not find anything...' };
            }
        }
        res.send({ status: 'successful', description: 'User: ' + item.Nom + ' it has been updated' });
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}

async function importStudentsUFs(req, res) {
    var email = req.query.email;
    var json = req.query.json;

    if (json == null || json == undefined || json == "" || email == null || email == undefined || email == "") {
        res.send('json or email field empty');
    } else {
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        var myquery = { email: email };
        var newvalues = { $set: { cursando: json } };
        await db.collection("users").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log('1 document updated');
        });

        res.send('User with email ' + email + ' has been updated');
    }
}

async function readRequirmentsProfile(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        item = await db.collection('requirement_profile').find({});
        item = item.toArray();
        res.send(await item);
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}

async function createRequirment(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var json = req.body;
    importMongoDB(json, "requirement_profile");
}

async function createStudent(req, res) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('matricula');

    var json = req.body;
    importMongoDB(json, "users");
}

async function validationRequirements(req, res) {
    try {
        item = { status: 'warning', description: 'we did not find anything...' };
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('matricula');

        if (req.query.dni != null || req.query.dni != undefined || req.query.tipo != null || req.query.tipo != undefined) {
            item = await db.collection('requirements').findOne({ 'dni': req.query.dni, 'name': req.query.tipo });

            if (req.query.valido == '0' || req.query.valido == '1' || req.query.valido == '2') {
                var myquery = { dni: req.query.dni, name: req.query.tipo };
                var newvalues = { $set: { validado: parseInt(req.query.valido) } };
                await db.collection("requirements").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log('1 document updated');
                });

                res.send(await item);
            } else {
                res.send({ status: 'error', description: '0 denied, 1 on hold, 2 accept' })
            }

        }
    } catch (error) {
        console.log("Something went wrong...");
        console.log(error);
        res.send({ status: 'error', description: 'something went wrong...' })
    }
}

app.listen(port, () => {
    console.log(`API ready and listening at port 5000`);
});