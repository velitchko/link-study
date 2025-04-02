const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const assignedEncoding = [ 'link', 'no-link',];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8' ];

const taskDescriptions = new Map([
    ['t1', ''],
    ['t2', ''],
    ['t3', ''],
    ['t4', ''],
    ['t5', ''],
    ['t6', ''],
    ['t7', ''],
    ['t8', '']
]);

const threshold = 1;

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();

    const subsDir = `${__dirname}/data`;

    if (!fs.existsSync(subsDir)) {
        fs.mkdirSync(subsDir);
    }

    const subFiles = fs.readdirSync(subsDir);

    const sortedTaskCodes = taskCodes.sort(() => Math.random() - 0.5);
    const sortedTaskDescriptions = taskCodes.map(code => taskDescriptions.get(code));

    res.send({
        status: 200,
        message: '👍',
        params: {
            userId: user,
            encoding: assignedEncoding,
            dataset: assignedDataset,
            level: assignedLevel,
            taskCodes: sortedTaskCodes,
            taskDescriptions: sortedTaskDescriptions,
        }
    });
});

app.post('/results', (req, res) => {
    filePath = `${__dirname}/data/${req.body.params.encoding}_${req.body.params.dataset}_${req.body.params.level}#${req.body.params.userId}.json`;
    console.log('📝 Writing to file...', filePath);

    fs.writeFileSync(filePath, JSON.stringify(req.body.results));
    res.send({
        status: 200,
        message: '👍'
    });
});

// start the server
app.listen(8080)
    .on('error', (err) => {
        console.log(`🚒 ${err}`);
    }).on('listening', () => {
        console.log('🚀 Server is listening at http://localhost:8080');
    });
