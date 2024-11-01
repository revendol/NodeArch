/**
 * Remove old files, copy front-end ones.
 */

// @ts-ignore
import fs from 'fs-extra';
import logger from 'jet-logger';
// @ts-ignore
import childProcess from 'child_process';


// Start
(async () => {
  try {
    // Remove current build
    await remove('./dist/');
    // Copy production env file
    await copy('./src/pre-start/env/production.env', './dist/pre-start/env/production.env');
    // Copy back-end files
    await exec('tsc --build tsconfig.prod.json', './');
  } catch (err:any) {
    logger.err(err);
  }
})();

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res:any, rej:any) => {
    return fs.remove(loc, (err:any) => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Copy file.
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, (err:any) => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, {cwd: loc}, (err:any, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return (!!err ? rej(err) : res());
    });
  });
}
