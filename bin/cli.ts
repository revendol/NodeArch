import path from 'path';
import { Plop, run } from 'plop';
import 'ts-node/register'; // For handling TypeScript files

async function initPlop() {
  const plopfilePath = path.join(__dirname, './plopfile.js');

  // Set up the environment and load the Plopfile
  Plop.prepare(
    {
      cwd: process.cwd(),
      configPath: plopfilePath,
      preload: [],
      completion: '', // Leave this empty
    },
    (env) => {
      // Pass the environment and arguments to `run`
      run(env, process.argv.slice(2), false); // Add `false` as the third parameter
    }
  );
}

initPlop().catch((error) => {
  console.error("Failed to initialize Plop:", error);
  process.exit(1);
});
