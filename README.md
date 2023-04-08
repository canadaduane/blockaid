# blockaid

Blockaid is an npm CLI tool (node.js) that allows you to require that a port is listening, or not listening, before taking an action.
It also allows you to kill whatever is found listening on a port before taking an action.

## Example usage

If you use package.json scripts to start a server, you might have configured something like:

(package.json)
```json
"scripts": {
  "dev": "nodemon server.js"
}
```

If `server.js` depends on another service (e.g. a mysql database running on port 3306), you could require that port 3306 is running
first, like so:

```json
"scripts": {
  "dev": "blockaid -r mysql:3306 && nodemon server.js"
}
```

In this example, if port 3306 is not running, then an easy-to-understand error message will be printed with the failure to run server.js:

```
$ npm run dev
mysql is required, but is not listening on port 3306.
```

The shell return value will be "0" (indicating success) or "1" (indicating failure to meet the requirement specified).

## Instructions

```
>>> blockaid : Require that a port is listening, not listening, or kill whatever is found listening.


  -r, --require-listening PROGRAM_NAME:PORT

    Require that a process is listening at PORT; PROGRAM_NAME is used for error messages


  -x, --require-not-listening PROGRAM_NAME:PORT

    Require that a process is NOT listening at PORT; PROGRAM_NAME is used for error messages


  -k, --kill-if-listening PROGRAM_NAME:PORT

    If a process is listening at PORT, kill it; PROGRAM_NAME is used for console message

```
