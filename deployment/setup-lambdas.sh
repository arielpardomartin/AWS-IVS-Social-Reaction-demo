#!/bin/bash
region=$(aws configure get region)

printf "\Installing Lambda layer packages...\n"
cd ../serverless/layer/nodejs
npm i --silent

printf "\nGenerating Lambda layer zip file...\n"
cd ../../../deployment
node zip-generator.js ../serverless/layer

printf "\nGenerating Lambda functions zip files...\n"
node zip-generator.js \
../serverless/lambda-on-connect \
../serverless/lambda-on-disconnect \
../serverless/lambda-send-message \
../serverless/lambda-add-reaction \
../serverless/lambda-get-reactions \

printf "\nCreating S3 bucket to upload Lambda functions zip files...\n"
if [ ${region} == 'us-east-1' ]
then
    aws s3api create-bucket --bucket social-reactions-demo-lambda-functions-<RANDOM_SUFFIX> --region ${region}
else
    aws s3api create-bucket --bucket social-reactions-demo-lambda-functions-<RANDOM_SUFFIX> --region ${region} --create-bucket-configuration LocationConstraint=${region}
fi

if [ $? != 0 ]; then exit 1; fi

printf "\nUploading Lambda layer zip file into S3 bucket...\n"
aws s3 cp layer.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/

printf "\nUploading Lambda functions zip files into S3 bucket...\n"
aws s3 cp lambda-on-connect.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/
aws s3 cp lambda-on-disconnect.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/
aws s3 cp lambda-send-message.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/
aws s3 cp lambda-add-reaction.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/
aws s3 cp lambda-get-reactions.zip s3://social-reactions-demo-lambda-functions-<RANDOM_SUFFIX>/
if [ $? != 0 ]; then exit 1; fi

printf "\nLambda functions setup complete!\n"