#!/bin/bash
region=$(aws configure get region)
printf "\nThe region currently configured is \x1b[33m${region}\x1b[0m.\n\n"

read -p $'Deploying this demo application in your AWS account will create and consume AWS resources, which will cost money.\n
Are you sure you want to proceed? Press 'y' to acknowledge and proceed, or press any other key to abort: ' -n 1 -r
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
else
    printf "\n\n\n\n"
fi

read -p "Stack name: " stackname

printf "\n\nInstalling dependencies...\n"
npm i --silent
if [ $? != 0 ]; then exit 1; fi

bash setup-lambdas.sh
bash setup-api-definitions.sh
bash setup-images.sh $stackname
bash create-stack.sh $stackname
bash deploy-player-app.sh stack.json
cd ../deployment && node generate-output.js --stackOutputFilePath stack.json