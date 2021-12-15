#!/bin/bash

# Validate that the required parameter is given
if [ -z $1 ]; then
	printf "\n\nSTACK_FILE_PATH parameter is required" && exit 1
fi

STACK_FILE_PATH=$1
S3_BUCKET_URI=s3://social-reactions-demo-player-app-<RANDOM_SUFFIX>/

printf "\n\Generating config.js file with values..."
node generate-player-app-config-file.js $STACK_FILE_PATH ivs-channels.json
if [ $? != 0 ]; then exit 1; fi

printf "\n\nInstalling Player App dependencies..."
cd ../web-ui/player-app
npm i --silent

printf "\n\nUploading Player App files..."
aws s3 cp ./index.html $S3_BUCKET_URI --content-type "text/html; charset=utf-8" --only-show-errors
aws s3 cp ./index.css $S3_BUCKET_URI --content-type "text/css; charset=utf-8" --only-show-errors 
aws s3 cp ./index.js $S3_BUCKET_URI --content-type "text/javascript; charset=utf-8" --only-show-errors 
aws s3 cp ./config.js $S3_BUCKET_URI --content-type "text/javascript; charset=utf-8" --only-show-errors
aws s3 cp ./websocket.js $S3_BUCKET_URI --content-type "text/javascript; charset=utf-8" --only-show-errors
cd ../../deployment
if [ $? != 0 ]; then exit 1; fi

printf "\n\nPlayer App deployment complete!\n"