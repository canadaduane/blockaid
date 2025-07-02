# blockaid

[![npm version](https://badge.fury.io/js/blockaid.svg)](https://badge.fury.io/js/blockaid)

`blockaid` is a lightweight, single-dependency CLI tool for orchestrating npm scripts. It helps you build reliable, OS-agnostic development and build workflows by making assertions about network ports.

## Use Cases

`blockaid` is useful when your scripts depend on other processes, such as a database, a local API, or a development server.

1.  **Ensure a database is running**: Before starting your application, guarantee that a database (like MySQL on port 3306) is ready to accept connections.
2.  **Prevent port conflicts**: Before starting a development server, ensure the target port is free to avoid `EADDRINUSE` errors.
3.  **Automate server restarts**: Kill an existing process on a port before starting a new one, streamlining scripts that restart or reload.

All checks are performed in a cross-platform way, so your `package.json` scripts work seamlessly on Windows, macOS, and Linux.

## Example Usage

### 1. Requiring a Dependent Service

If your `server.js` script depends on a MySQL database, you can require that an application is listening on port 3306 before proceeding:

```json
"scripts": {
  "dev": "blockaid -r mysql:3306 && nodemon server.js"
}
```

If no application is listening on port 3306, the script will exit with an error:

```
$ npm run dev
mysql is required, but is not listening on port 3306.
```

### 2. Requiring a Port to Be Free

To prevent port conflicts, you can require that a port is _not_ in use before starting your server. This is useful for avoiding `EADDRINUSE` errors.

```json
"scripts": {
  "dev": "blockaid -x webserver:3000 && nodemon server.js"
}
```

If an application is already listening on port 3000, `blockaid` will report it and exit:

```
$ npm run dev
port 3000 must be free, but a process (e.g. webserver) is already listening.
```

### 3. Killing an Existing Process

You can automatically kill any process listening on a given port before an action. This is common in development workflows where you want to ensure a clean start. `blockaid` waits for the kill signal to be sent and the process to terminate before exiting.

Here, we use an environment variable for the port and kill any existing listener:

```json
"scripts": {
  "start-dev": "PORT=3000 blockaid -k dev-server:PORT && nodemon server.js"
}
```

If a process is found, `blockaid` issues a kill command and waits for it to complete:

```
$ npm run start-dev
port 3000 must be free, but a process (e.g. dev-server) is already listening. Killing process...
(nodemon starts successfully afterward)
```

The shell return value will always be `0` (success) or `1` (failure).

## Command-Line Interface

| Flag                      | Alias | Description                                                                                                                                                     |
| ------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--require-listening`     | `-r`  | **PROGRAM_NAME:PORT**<br>Requires that a process is listening at `PORT`. `PROGRAM_NAME` is used for more helpful error messages.                                |
| `--require-not-listening` | `-x`  | **PROGRAM_NAME:PORT**<br>Requires that nothing is listening at `PORT`. `PROGRAM_NAME` is used in messages if the requirement is not met.                        |
| `--kill-if-listening`     | `-k`  | **PROGRAM_NAME:PORT**<br>If a process is listening at `PORT`, `blockaid` will kill it and wait for it to exit before proceeding. `PROGRAM_NAME` is for display. |

The `PORT` portion of the PROGRAM_NAME:PORT pair can be a number to use directly, or an environment variable to look up (e.g. the literal `myserver:PORT` would check process.env.PORT's value).
