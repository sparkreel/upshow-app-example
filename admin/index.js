const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT;
const mongouri =  process.env.MONGO_URI;

const app = express();
let logger = console;

app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200
}));

app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const MongoClient = require('mongodb').MongoClient,
    Logger = require('mongodb').Logger,
    assert = require('assert');

MongoClient.connect(mongouri, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    Logger.setLevel('info');

    const db = client.db('admin');
    const collectionSettings = db.collection('settings');

    const defaultSettings = {
        logo: "https://cdn.upshow.tv/ui4_assets/upshow_tv_logo_white.png",
        name: "Upshow TV"
    };

    const findOrCreateByAppKey = (app_key) => collectionSettings.findOne({ app_key })
        .then(settings => {
            if (settings) {
                return settings;
            } else {
                return collectionSettings.insertOne({ app_key, ...defaultSettings }).then( result => result.ops[0] );
            }
        });

    const resRenderAdmin = (response, app_key, settings) => {
        const payload = {
            ...defaultSettings,
            ...settings,
            app_key
        };

        response.render('admin.hbs', payload, (err, html) => {
            if (err) {
                console.error(err);
                response.sendStatus(500);
            } else {
                response.send(html);
            }
        });
    }

    app.get('/admin', (req, res) => {
        const app_key = req.query.app_key;
        if (app_key) {
            findOrCreateByAppKey(app_key).then(settings => {
                const { name, logo } = settings;
                resRenderAdmin(res, app_key, { name, logo, app_key });
            });
        } else {
            resRenderAdmin(res);
        }
    });

    app.get('/settings', (req, res) => {
        const app_key = req.query.app_key;
        if (app_key) {
            findOrCreateByAppKey(app_key).then(settings => {
                const { name, logo } = settings;
                res.send({ name, logo, app_key });
            });
        } else {
            res.sendStatus(404);
        }
    });

    app.post('/settings', (req, res) => {
        const { name, logo, app_key } = req.body;
        const settings = { name, logo };
        if (app_key) {
            collectionSettings.updateOne({ app_key }, { $set: settings }, { upsert: true })
                    .then( () => {
                        findOrCreateByAppKey(app_key).then(data => {
                            resRenderAdmin(res, app_key, data);
                        });
                    });
        } else {
            resRenderAdmin(res);
        }
    });

    app.post('/impression', (req, res) => {
        const { impression, age, app_key } = req.body;

        if (app_key) {
            findOrCreateByAppKey(app_key).then(settings => {
                if(!settings.impressions){
                    settings.impressions = [];
                }
                settings.impressions.push({impression, age});
                collectionSettings.updateOne({ app_key }, { $set: settings }).then( () => res.sendStatus(200) );
            });
        } else {
            res.sendStatus(404);
        }
    });

    app.listen(port, () => logger.info(`Admin is up and running: LISTENING ON ${port}`));
});


