import { createConnection } from "net";
import killPort from "kill-port";

// Get the command line arguments
const args = process.argv.slice(2);

const requirements = [];

const REQ = {
  require_listening: 1,
  require_not_listening: 2,
  kill_if_listening: 3,
};

// Loop through the arguments and process them
for (let i = 0; i < args.length; i++) {
  let requirement = null;

  let arg1 = args[i];
  switch (arg1) {
    case "-h":
    case "--help":
      console.log(
        "\n>>> blockade : Require that a port is listening, not listening, or kill whatever is found listening.\n\n\n" +
          "  -r, --require-listening PROGRAM_NAME:PORT\n\n" +
          "    Require that a process is listening at PORT; PROGRAM_NAME is used for error messages\n\n\n" +
          "  -x, --require-not-listening PROGRAM_NAME:PORT\n\n" +
          "    Require that a process is NOT listening at PORT; PROGRAM_NAME is used for error messages\n\n\n" +
          "  -k, --kill-if-listening PROGRAM_NAME:PORT\n\n" +
          "    If a process is listening at PORT, kill it; PROGRAM_NAME is used for console message\n\n\n"
      );
      continue;
  }

  // Arguments with parameters
  let arg2 = args[i + 1];

  if (arg1 != null && arg2 != null) {
    switch (arg1) {
      case "-r":
      case "--require-listening":
        requirement = REQ.require_listening;
        break;
      case "-x":
      case "--require-not-listening":
        requirement = REQ.require_not_listening;
        break;
      case "-k":
      case "--kill-if-listening":
        requirement = REQ.kill_if_listening;
        break;
      default:
        console.log(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  } else {
    console.log(`Error: ${arg1} requires a following argument`);
    process.exit(1);
  }

  const [program, port] = args[i + 1].split(":");
  if (program != null && port != null) {
    requirements.push({ port: parseInt(port, 10), program, requirement });
  } else {
    console.log("Error: program and port expected, e.g. program:3001");
    process.exit(1);
  }

  i++; // Skip the next argument as it has been processed
}

const listening = (port, host = "localhost", timeout = 1000) =>
  new Promise((resolve) => {
    const socket = createConnection({ host, port, timeout });
    const no = () => (socket.destroy(), resolve(false));
    const yes = () => (socket.end(), resolve(true));
    socket.on("connect", yes).on("timeout", no).on("error", no);
  });

void (async () => {
  for (let r of requirements) {
    const program = r.program === "" ? "process" : r.program;
    const isListening = await listening(r.port);
    if (r.requirement === REQ.require_listening && !isListening) {
      console.error(
        `${program} is required, but is not listening on port ${r.port}.`
      );
      process.exit(1);
    }

    if (r.requirement === REQ.require_not_listening && isListening) {
      console.error(
        `port ${r.port} must be free, but a process (e.g. ${program}) is already listening.`
      );
      process.exit(1);
    }

    if (r.requirement === REQ.kill_if_listening && isListening) {
      console.log(
        `port ${r.port} must be free, but a process (e.g. ${program}) is already listening. Killing process...`
      );
      await killPort(r.port, "tcp");
      process.exit(1);
    }
  }
})();
