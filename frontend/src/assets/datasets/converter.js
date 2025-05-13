const fs = require('fs');
const path = require('path');

// Directory containing the JSON files
const directoryPath = __dirname;

// Mappings for pathExists and commonNeighbor
const pathExistsIds = {
    "low_1": ["096376795", "096371032"],  // low_1
    "low_2": ["079626113", "079776038"], // low_2
    "low_3": ["61F", "62F"],              // low_3
    "low_4": ["053616858", "062298895"],  // low_4
    "low_5": ["052858299", "052775842"],  // low_5
    "low_6": ["055804021", "047030601"],  // low_6
    "high_1": ["nina", "pippa"],          // high_1
    "high_2": ["053359026", "052543127"],  // high_2
    "high_3": ["053370622", "053344784"],  // high_3 
    "high_4": ["062361330", "052782574"],  // high_4
    "high_5": ["052864516", "053560558"],  // high_5
    "high_6": ["062104553", "062336070"]   // high_6
};

const commonNeighborIds = {
    "low_1": ["079769800", "096370006"],  // low_1
    "low_2": ["095583111", "079575837"], // low_2
    "low_3": ["61F", "63F"],              // low_3
    "low_4": ["062053884", "062309359"],  // low_4
    "low_5": ["053568529", "053548113"],  // low_5
    "low_6": ["053619831", "053295566"],  // low_6
    "high_1": ["bj", "genny"],            // high_1
    "high_2": ["055537127", "062347838"],  // high_2
    "high_3": ["053568529", "053612590"],  // high_3 
    "high_4": ["062322784", "062336828"],  // high_4
    "high_5": ["062123365", "053275069"],  // high_5
    "high_6": ["052538768", "052834779"]   // high_6
};

const mapping = {};


// Function to generate unique IDs
let idCounter = 1;
function generateNewID() {
    const numberPart = String(Math.floor((idCounter - 1) / 26) + 1).padStart(2, '0'); // Two digits
    const letterPart = String.fromCharCode(65 + ((idCounter - 1) % 26)); // A-Z
    idCounter++;
    return `${numberPart}${letterPart}`; // NumberNumberLetter format
}

// Process each file in the directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        // Only process JSON files
        if (path.extname(file) === '.json') {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);

                    // Grab the id from the nodes array
                    const nodes = jsonData.graph.nodes || [];
                    const edges = jsonData.graph.edges || [];

                    // Update the nodes with new IDs
                    nodes.forEach((node) => {
                        if (node.id) {
                            // Save the old ID for reference
                            const oldID = node.id;
                            // Generate a new ID
                            node.id = generateNewID();
                            node.oldID = oldID; // Store the old ID for reference
                        }
                    });
                    // Update the edges source and target with new IDs
                    edges.forEach((edge) => {
                        if (edge.source) {
                            // Store the old ID for reference
                            edge.oldSourceID = edge.source; // Store the old ID for reference
                            const sourceNode = nodes.find((node) => node.id === edge.source);
                            if (sourceNode) {
                                edge.source = sourceNode.id;
                            }
                        }
                        if (edge.target) {
                            // Store the old ID for reference
                            edge.oldTargetID = edge.target; // Store the old ID for reference
                            const targetNode = nodes.find((node) => node.id === edge.target);
                            if (targetNode) {
                                edge.target = targetNode.id;
                            }
                        }
                    });

                    // Extract the file name without the extension
                    const fileName = path.basename(file, '.json');

                    // Initialize the mapping for the current file
                    mapping[fileName] = {
                        pathExists: [],
                        commonNeighbors: []
                    };

                    // Populate pathExists mapping
                    if (pathExistsIds[fileName]) {
                        pathExistsIds[fileName].forEach((oldId) => {
                            const node = nodes.find((node) => node.oldID === oldId);
                            if (node) {
                                mapping[fileName].pathExists.push({ oldId, newId: node.id });
                            }
                        });
                    }

                    // Populate commonNeighbors mapping
                    if (commonNeighborIds[fileName]) {
                        commonNeighborIds[fileName].forEach((oldId) => {
                            const node = nodes.find((node) => node.oldID === oldId);
                            if (node) {
                                mapping[fileName].commonNeighbors.push({ oldId, newId: node.id });
                            }
                        });
                    }

                    // Write the mapping to a separate JSON file
                    const mappingFilePath = path.join(directoryPath, 'mapping.json');
                    fs.writeFile(mappingFilePath, JSON.stringify(mapping, null, 2), (err) => {
                        if (err) {
                            console.error('Error writing mapping file:', err);
                        } else {
                            console.log('Mapping file updated successfully.');
                        }
                    });

                    // Print all node labels for file and add line separator
                    console.log(`\nFile: ${file}`);
                    nodes.forEach((node) => {
                        console.log(`Node ID: ${node.id}, Old: ${node.oldID}`);
                    });
                    console.log('-----------------------------------');

                    // Write the updated JSON back to the file
                    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                        if (err) {
                            console.error(`Error writing file ${file}:`, err);
                        } else {
                            console.log(`Updated file: ${file}`);
                        }
                    });
                } catch (parseError) {
                    console.error(`Error parsing JSON in file ${file}:`, parseError);
                }
            });
        }
    });
});