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
