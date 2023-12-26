# equip-judge0-integration

This repository contains the source code for demo integration of [Judge0 API](https://api.judge0.com).

## Files

- `ExpressServer` - Express.js server that listens for execution completion events from Judge0 API.

- `constants.js` - Constants used in the project.

- `listeners.js` - All the DOM event listeners are defined here.

- `script.js` - The main script that handles the execution of code.

- `batched_submission.js` - A script that submits a batch of submissions to Judge0 API.

## Installation

### Judge0 Installation

[Judge0 server installation link](https://github.com/judge0/judge0/blob/master/CHANGELOG.md#deployment-procedure)

```bash
wget https://github.com/judge0/judge0/releases/download/v1.13.0/judge0-v1.13.0.zip
unzip judge0-v1.13.0.zip

cd judge0-v1.13.0
docker-compose up -d db redis
sleep 10s
docker-compose up -d
sleep 5s
```

### Web server installation

The static files in the repository were copied to `/var/www/html` directory.

There is a simple Express.js server inside `/ExpressServer` that listens for execution completion events from Judge0 API. Later, it would save the results to a database.

