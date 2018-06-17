#!/bin/bash

#sleep to wait for network, necessary for git pull
sleep 15

cd ~/Dashboard
echo "STARTING" >> logs

#wait for network to come on line... also needed for git pull
ping -c 1 -W 20 google.com

#pull new code and install depends
/usr/bin/git pull >> logs
npm install  >> logs

#start server
node index.js  >> logs
