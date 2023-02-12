#!/bin/bash

echo "Starting Webserver"
sudo node index.js >> stdout.txt 2> stderr.txt &


process=$(ps -A | grep node)

if [ -z "${process}" ]; then
     echo "Something went wrong"
     exit 1
fi
echo "Webserver is live"
