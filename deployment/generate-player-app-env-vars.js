const fs = require('fs');
const pathStackFile = process.argv[2];
const pathEnvFile = '../web-ui/player-app/.env';

// Function to filter stack.json outputs by output key
/*
const findOutput = (outputs, key) => {
    return outputs.filter((output) => {
        return output.OutputKey === key;
    })[0].OutputValue;
};
*/

// Read stack.json file and get outputs section
const stackInfo = JSON.parse(fs.readFileSync(pathStackFile, 'utf8'));
const cloudformationOutputs = stackInfo.Stacks[0].Outputs;

if (!cloudformationOutputs) {
  console.log('\n\nCloudFormation output file was not generated correctly, please execute deployment again...');
  process.exit(1);
}

// Create .env file with environment variables
let envFile = '';

// Write .env file
fs.writeFileSync(pathEnvFile, envFile);
