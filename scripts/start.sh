#!/bin/bash

echo "Starting Webserver"
sudo node index.js >> /var/www/WeMaSu/backend/log/stdout.txt 2> /var/www/WeMaSu/backend/log/stderr.txt &


process=$(ps -A | grep node)

if [ -z "${process}" ]; then
     echo "Something went wrong"
     exit 1
fi
echo "Webserver is live"
