const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const linkEncoding = ['nodelink', 'nolink', 'interactive'];
const taskCodes = ['t1', 't2', 't3', 't4', 't5', 't6'];
const graphComplexity = ['low', 'high'];
const taskDescriptions = new Map([
    ['t1', 'Which nodes (if removed) would break the network into separate parts?'], // Node / Topology Task
    ['t2', 'Which nodes have the most links to other nodes?'], // Node / Topology Task
    ['t3', 'Does a path of length 4 exist between ${A} and ${B}?'], // Link / Browsing Task
    ['t4', 'How many common neighbors are there between ${A} and ${B}?'], // Link / Browsing Task
    ['t5', 'How many groups can you see?'], // Cluster / Overview Task
    ['t6', 'Which nodes belong to the biggest connected group?'], // Cluster / Overview Task
]);

const threshold = 15; // est. 90 participants in total

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    const userAssignments = {
        nodelink: { low: 0, high: 0 },
        nolink: { low: 0, high: 0 },
        interactive: { low: 0, high: 0 }
    };

    // keep track of each new user 
    let user = uuid.v4();

    const subsDir = `${__dirname}/data`;

    if (!fs.existsSync(subsDir)) {
        fs.mkdirSync(subsDir);
    }

    const subFiles = fs.readdirSync(subsDir);

    subFiles.forEach(file => {
        const params = file.split('#')[0];
        const [encoding, complexity] = params.split('_');
        // console.log('📂 File:', file, 'Encoding:', encoding, 'Dataset:', dataset, 'Complexity:', complexity)
        ;
        userAssignments[encoding][complexity]++;
    });


    // TODO: Once the threshold is reached start looping through the encodings and complexities
    let assignedEncoding, assignedComplexity;

    for (const encoding of linkEncoding) {
        for (const complexity of graphComplexity) {
            if (userAssignments[encoding][complexity] < threshold) {
                assignedEncoding = encoding;
                assignedComplexity = complexity;
                userAssignments[encoding][complexity]++;

                console.log('🔥 Assigned:', assignedEncoding, assignedComplexity);
                break;
            }
        }
        if (assignedEncoding) break;
    }

    const sortedTaskCodes = taskCodes.sort(() => Math.random() - 0.5);
    const sortedTaskDescriptions = taskCodes.map(code => taskDescriptions.get(code));
    console.log('📝 Assigned tasks:', sortedTaskCodes, sortedTaskDescriptions);

    res.send({
        status: 200,
        message: '👍',
        params: {
            userId: user,
            encoding: assignedEncoding,
            complexity: assignedComplexity,
            taskCodes: sortedTaskCodes,
            taskDescriptions: sortedTaskDescriptions,
        }
    });
});

app.post('/results', (req, res) => {
    filePath = `${__dirname}/data/${req.body.params.encoding}_${req.body.params.complexity}#${req.body.params.userId}.json`;
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
