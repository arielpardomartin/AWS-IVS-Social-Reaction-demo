#!/bin/bash
echo
read -p "Stack name: " STACKNAME
PLAYER_BUCKET=s3://social-reactions-demo-player-app-<RANDOM_SUFFIX>
LAMBDA_FUNCTIONS_BUCKET=s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>
API_DEFINITIONS_BUCKET=s3://social-reactions-demo-api-definitions-<RANDOM_SUFFIX>

printf "\nEmptying bucket \"$PLAYER_BUCKET\"...\n"
aws s3 rm $PLAYER_BUCKET --recursive --quiet

printf "\nEmptying bucket \"$LAMBDA_FUNCTIONS_BUCKET\"...\n"
aws s3 rm $LAMBDA_FUNCTIONS_BUCKET --recursive --quiet

printf "\nEmptying bucket \"$API_DEFINITIONS_BUCKET\"...\n"
aws s3 rm $API_DEFINITIONS_BUCKET --recursive --quiet

# Remove stages to avoid this error when deleting APIs:
# "Active stages pointing to this deployment must be moved or deleted"
node delete-api-stages.js --stackOutputFilePath stack.json

printf "\nRemoving stack \x1b[33m$STACKNAME\x1b[0m...\n"
aws cloudformation delete-stack --stack-name $STACKNAME
aws cloudformation wait stack-delete-complete --stack-name $STACKNAME

printf "\nRemoving bucket \"$PLAYER_BUCKET\"...\n"
aws s3 rb $PLAYER_BUCKET --force

printf "\nRemoving bucket \"$LAMBDA_FUNCTIONS_BUCKET\"...\n"
aws s3 rb $LAMBDA_FUNCTIONS_BUCKET --force

printf "\nRemoving bucket \"$API_DEFINITIONS_BUCKET\"...\n"
aws s3 rb $API_DEFINITIONS_BUCKET --force

printf "\nCleanup complete!\n"