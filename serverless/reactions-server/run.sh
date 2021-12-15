#!/bin/bash

# -------------------------------------------------------------------------------------
# Description
# -------------------------------------------------------------------------------------
#
# Retrieves messages from an SQS queue and sends those messages as timed metadata to an
# IVS channel.

while :
do
  echo "Loop start"
  node src/sendTimedMetadata.js
  echo "Loop finish"
done