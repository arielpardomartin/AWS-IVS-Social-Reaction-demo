## Deployment

### Prerequisites

* [Node.js version 12.0.0 or later](https://nodejs.org/) to run Node scripts
* [AWS account](https://aws.amazon.com/) to create resources
* [AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) to run scripts
* [Git Bash](https://git-scm.com/) to run Bash scripts (only on Windows)
* [Docker version 20.10.5 or later](https://www.docker.com/) and Docker daemon up and running to build and push ECS container images

<br>

### 1) Assign random suffix to resource names

Run `bash assign-random-suffix.sh`.

This will generate a 6 character length alphanumeric value. Then, it will update the [cloudformation.yaml](./cloudformation.yaml) file and bash script files by replacing the placeholder `<RANDOM_SUFFIX>`, located at the end of the resource names, with the random value generated to ensure uniqueness.

> **Note:**<br>
> There is no script to reverse this step, but you can use Git to discard all changes and go back to the original state.

<br>

### 2) Configure AWS CLI

Run `aws configure` to set your credentials and the region where you want the demo resources deployed.

<br>

### 3) Configure IVS channel

Before performing this step, you must have an [IVS channel](https://aws.amazon.com/es/ivs/) created. So you can get the `ARN` and `Playback URL` from it. These parameters must be placed in the [ivs-channels.json file](./ivs-channels.json) so that the player gets the channel to play the live stream. 
It is important to clarify that you can put as many channels as you want in the [ivs-channels.json file](./ivs-channels.json).

> **Note:**
The player only takes the first channel you put in the [ivs-channels.json file](./ivs-channels.json).

To change the channel you can pass query string parameters in the player URL.
For example:

1) If we have this URL: https://example.cloudfront.net 
2) And we add to the URL the following query parameters: https://example.cloudfront.net?channelArn=value&playbackUrl=value 
3) The player will use those values to connect to IVS and stream that channel.

<br>

### 4) Run deployment script

Run `bash deploy.sh`.

This will deploy the demo infrastructure in AWS and then perform the following configuration steps using the default configuration values included in this repo.

> **Note:**<br>
> On MacOS, some steps of the deployment show large outputs that require you to press "q" to continue with the deployment execution.

In case of failure, check the script outputs and the CloudFormation console. Common issues are:
* The Docker daemon is not running (check [how to configure and troubleshoot the Docker daemon](https://docs.docker.com/config/daemon/))
* A service quota has been reached (check [AWS service quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html))<br>

After solving the issue, run the cleanup script and then the deployment script again (some error messages stating that the resources could not be deleted may arise during the cleanup process if the deployment was made partially).

<br>

## Usage

At the end of the deploy.sh execution, you will see the following output in the console:


![outputs](img/outputs.jpg)

Use the **Stream Server URL** and the **Stream Key** values to configure your streaming tool (we are using [OBS](https://obsproject.com/) in this example):

![OBS Config](img/obs-config.jpg)

Check that you have the following Output settings: 

* **Bitrate:** `2500 Kbps`
* **Keyframe Interval:** `2`
* **CPU Usage:** `veryfast`
* **Tune:** `zerolatency`

![OBS Outputs](img/obs-outputs.jpg)

### How to visualize the stream

Open up the player using the **Player URL** value provided in the console output:

![player](../social-reactions-demo.png)

<br>

## Cleanup

Run `bash cleanup.sh`.

This will remove all the resources created during the execution of `deploy.sh`.

<br>

## Scripts included in this folder

This section includes details of every script present in this folder for informational purposes, you need only to run the scripts described in the **Deployment** and **Cleanup** sections above.

<br>

### generate-player-app-env-vars.js

Creates a file with the environment variables for the player-app, after obtaining them from the output file of the CloudFormation deployment (i.e. `stack.json`). This script is called by the [deploy-player-app.sh](#deploy-player-appsh) script.

Parameters:
1) STACK_FILE_PATH (required)

Example:

```shell
node generate-player-app-env-vars.js stack.json
```

<br>

### deploy-player-app.sh

Calls the [generate-player-app-env-vars.js](#generate-player-app-env-varsjs) script to create the .env file with the corresponding environment variables. Then, the required dependencies are installed and the application is built using the previously generated environment variables. Finally, the build files are uploaded to an S3 bucket. This script is called by the [deploy.sh](#deploysh) script.

Parameters:
1) STACK_FILE_PATH (required)

Example:

```shell
bash deploy-player-app.sh stack.json
```

<br>

### setup-images.sh

Creates a repository in the Amazon ECS private registry to host the Reactions container image. Then, logs in into the registry and uses the [Reactions Dockerfile]((../serverless/reactions-server/Dockerfile)) to build and push the corresponding image. This script is called by the [deploy.sh](#deploysh) script.

Parameters: None

Example:

```shell
bash setup-images.sh
```

<br>

### setup-lambdas.sh

Generates a zip file for each Lambda function located within the [serverless folder](../serverless) by calling the [zip-generator.js](#zip-generatorjs) script. Then, creates an S3 bucket and uploads the Lambda functions zip files into it. This script is called by the [deploy.sh](#deploysh) script.

Parameters: None

Example:

```shell
bash setup-lambdas.sh
```

<br>

### create-stack.sh

Creates the CloudFormation stack using the specified stack name and the [cloudformation.yaml file](./cloudformation.yaml). This script is called by the [deploy.sh](#deploysh) script.

Parameters:
1) STACKNAME (required)

Example:

```shell
bash create-stack.sh ivs-social-reactions-demo-stack
```

<br>

### zip-generator.js

Generates a zip file for each specified folder. This script is called by the [setup-lambdas.sh](#setup-lambdassh) script.

Parameters:
* FOLDER_PATH (variable)

Example:

```shell
node zip-generator.js ../serverless/lambda-on-connect ../serverless/lambda-on-disconnect ../serverless/lambda-send-message ../serverless/lambda-get-reactions ../serverless/lambda-add-reactions  
```

<br>

### deploy.sh

Main script used to perform the demo deployment. It calls the following scripts:

1) [setup-lambdas.sh](#setup-lambdassh)
2) [create-stack.sh](#create-stacksh)
3) [deploy-player-app.sh](#deploy-player-appsh)
4) [generate-output.js](#generate-outputjs)

Parameters: None

Example:

```shell
bash deploy.sh
```

<br>

### cleanup.sh

Removes all the demo resources that were created by [deploy.sh](#deploysh).

Parameters: None

Example:

```shell
bash cleanup.sh
```

<br>

### assign-random-suffix.sh

Generates a 6 character length alphanumeric value and assigns it to every `<RANDOM_SUFFIX>` placeholder located in the following files:

* [cleanup.sh](./cleanup.sh)
* [cloudformation.yaml](./cloudformation.yaml)
* [deploy-player-app.sh](./deploy-player-app.sh)
* [setup-lambdas.sh](./setup-lambdas.sh)
* [setup-images.sh](./setup-images.sh)

Parameters: None

Example:

```shell
bash assign-random-suffix.sh
```

<br>

### generate-output.js

Generates the outputs needed to run the demo, specifically:

* **Player URL**

To retrieve the values, it uses the CloudFormation *stack.json* output file and the AWS SDK. This script is called by [deploy.sh](#deploysh) after deploying all the needed resources.

Parameters:
* `--stackOutputFilePath`: Path to CloudFormation output file (required).

Example:

```shell
node generate-output.js --stackOutputFilePath stack.json
```

<br>

### delete-api-stages.js

Deletes the **demo** stage created for both API Gateways (Reader WebSocket). This script is called by the [cleanup.sh](#cleanupsh) script prior to remove the stack.

Parameters:
* `--stackOutputFilePath`: Path to CloudFormation output file (required).

Example:

```shell
node delete-api-stages.js --stackOutputFilePath stack.json
```
