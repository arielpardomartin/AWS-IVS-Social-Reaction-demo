#!/bin/bash

STACKNAME=$1

# Validate that the required parameter is given
if [ -z $1 ]; then
	printf "\n\nSTACKNAME parameter is required" && exit 1
fi

# Setup variables
AWS_REGION=$(aws configure get region)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
REACTIONS_REPOSITORY_NAME=social-reactions-demo-reactions-images-<RANDOM_SUFFIX>

# Log in into registry
printf "\n\nLogging in into default private registry...\n"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
if [ $? != 0 ]; then exit 1; fi

cd ../serverless

# Build and push Reactions service image
printf "\n\nCreating image repository for Reactions service...\n"
aws ecr create-repository --repository-name $REACTIONS_REPOSITORY_NAME
printf "\n\nBuilding and pushing Reactions service image...\n"
cd ./reactions-server
docker build -q -t $ECR_REGISTRY/$REACTIONS_REPOSITORY_NAME:latest .
docker push $ECR_REGISTRY/$REACTIONS_REPOSITORY_NAME:latest
if [ $? != 0 ]; then exit 1; fi

printf "\n\nECS container images setup complete!\n"