import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import ElasticsearchTransport from 'winston-elasticsearch';
import envVars from "@shared/env-vars";

// Elasticsearch transport configuration
const esTransportOpts = {
  level: envVars.logging.level,
  clientOpts: {
    node: envVars.logging.elasticSearchHost, // Ensure this matches your Docker container's Elasticsearch setup
  },
  indexPrefix: envVars.logging.esIndexPrefix, // Index prefix for your logs in Elasticsearch
  format: format.combine(
    format.timestamp(),
    format.json()
  )
};


// Create the logger
const logger = createLogger({
  level: envVars.logging.level,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),
    new transports.DailyRotateFile({
      filename: `${envVars.logging.logPath}/${envVars.logging.fileName}`,
      datePattern: envVars.logging.datePattern,
      maxFiles: envVars.logging.maxFiles
    }),
    ...(envVars.logging.driver === 'elk'
      ? [new (ElasticsearchTransport.ElasticsearchTransport as any)(esTransportOpts)]
      : [])
  ]
});

export default logger;
