const fs = require('fs');
const pathConfigFile = '../web-ui/player-app/config.js';
const pathStackFile = process.argv[2];
const IVSchannels = process.argv[3];

// Function to filter stack.json outputs by output key
const findOutput = (outputs, key) => {
  return outputs.filter((output) => {
    return output.OutputKey === key;
  })[0].OutputValue;
};

// Read stack.json file and get outputs section
const stackInfo = JSON.parse(fs.readFileSync(pathStackFile, 'utf8'));
const cloudformationOutputs = stackInfo.Stacks[0].Outputs;
const channels = fs.readFileSync(IVSchannels, 'utf8');

if (!cloudformationOutputs) {
  console.log('\n\nCloudFormation output file was not generated correctly, please execute deployment again...');
  process.exit(1);
}

// Get value for StreamPlaybackUrl key
const WS_SOCIAL_REACTIONS_URL = findOutput(cloudformationOutputs, 'ReaderWebSocketURL');

// Get value for StreamPlaybackUrl key
const ENDPOINT_METADATA = findOutput(cloudformationOutputs, 'SocialReactionsApiReactions');

// Create config.js file with environment variables
let configFile = `
    const config = {
        WS_SOCIAL_REACTIONS_URL: "${WS_SOCIAL_REACTIONS_URL}",
        ENDPOINT_METADATA: {
            metadata: "${ENDPOINT_METADATA}"
        },
        CHANNELS: ${channels}
    };

    export { config };
`;

// Write config.js file
fs.writeFileSync(pathConfigFile, configFile);
