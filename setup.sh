#!/bin/sh

npm install --prefix /home/ubuntu/genome/common/connect-elasticsearch

npm install --prefix /home/ubuntu/genome/common/ect

npm install --prefix /home/ubuntu/genome/common/grunt-ect-compiler

npm install --prefix /home/ubuntu/genome/common/grunt-elasticsearch

npm install --prefix /home/ubuntu/genome/common/grunt-npmlink

npm install --prefix /home/ubuntu/genome/common/helpers

npm install --prefix /home/ubuntu/genome/common/pimp-my-express

npm install --prefix /home/ubuntu/genome/web
npm link /home/ubuntu/genome/common/grunt-npmlink --prefix /home/ubuntu/genome/web 
grunt --base /home/ubuntu/genome/web link
grunt --base /home/ubuntu/genome/web symlink

npm install --prefix /home/ubuntu/genome/cli
npm link /home/ubuntu/genome/common/grunt-npmlink --prefix /home/ubuntu/genome/cli
grunt --base /home/ubuntu/genome/cli link
grunt --base /home/ubuntu/genome/cli symlink
