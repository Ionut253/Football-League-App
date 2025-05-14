const fs = require('fs');
const path = require('path');

const startId = 100002;
const count = 21;
const teamIds = Array.from({ length: count }, (_, i) => startId + i);

const csvContent = 'teamId\n' + teamIds.join('\n');
const outputPath = path.join(__dirname, 'team-ids.csv');

fs.writeFileSync(outputPath, csvContent);
console.log(`CSV file generated at: ${outputPath}`); 

// run with this command:
// node src/scripts/generate-team-ids.js