#!/bin/bash
region=$(aws configure get region)

printf "\nCreating S3 bucket to upload API definition YAML files...\n"
if [ ${region} == 'us-east-1' ]
then
    aws s3api create-bucket --bucket social-reactions-demo-api-definitions-<RANDOM_SUFFIX> --region ${region}
else
    aws s3api create-bucket --bucket social-reactions-demo-api-definitions-<RANDOM_SUFFIX> --region ${region} --create-bucket-configuration LocationConstraint=${region}
fi
if [ $? != 0 ]; then exit 1; fi

printf "\nUploading API definition YAML files into S3 bucket...\n"
aws s3 cp ../api.definition.yaml s3://social-reactions-demo-api-definitions-<RANDOM_SUFFIX>/
if [ $? != 0 ]; then exit 1; fi

printf "\nLambda functions setup complete!\n"