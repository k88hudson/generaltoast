# General Toast

This is a sample micro[b]log app using [meatspace](https://npmjs.org/package/meatspace).

## Installation

### Clone the repository

> git clone git://github.com/ednapiranha/generaltoast.git

### Copy over json files and adjust values as needed

> cp local.json-dist local.json
> cp whitelist.json-dist whitelist.json

whitelist.json contains emails that are allowed to manage posts.

Include your Amazone S3 key, secret and bucket in local.json so that you can upload photos.

### Install and start redis

> brew install redis
> redis-server

## Run the server

> node app.js
