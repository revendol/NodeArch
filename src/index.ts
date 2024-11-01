import './pre-start'; // Must be the first import
import logger from '@util/logger';
import envVars from '@shared/env-vars';
import server from './server';

/***************************************************************
 * To enable clustering, uncomment the following lines
 * (10 to 12), (21 to 36) and 39.
 ***************************************************************/
// import os from 'node:os';
// import cluster from 'node:cluster';
// const totalCPUs = os.cpus().length;

// Validate and parse port
const port = Number(envVars.port);
if (isNaN(port) || port <= 0 || port > 65535) {
  logger.error(`Invalid port number: ${envVars.port}`);
  throw new Error('Invalid port number');
}

// if (cluster.isPrimary) {
//   logger.info(`Number of CPUs available: ${totalCPUs}`);
//   logger.info(`Primary process PID: ${process.pid}`);
//
//   // Fork a worker for each CPU
//   for (let i = 0; i < totalCPUs; i++) {
//     cluster.fork();
//   }
//
//   // Listen for workers exiting and restart them
//   cluster.on('exit', (worker, code, signal) => {
//     logger.warn(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
//     logger.info("Spawning a new worker...");
//     cluster.fork();
//   });
// } else {
//  // Start server on the specified port for worker processes
server.start(port);  // Removed callback
// }
