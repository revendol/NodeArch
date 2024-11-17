import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import * as Elasticsearch from 'winston-elasticsearch';
import envVars from "@shared/env-vars";

// Elasticsearch transport configuration
const esTransportOpts = {
  level: envVars.logging.level,
  clientOpts: {
    node: envVars.logging.elasticSearchHost,
  },
  indexPrefix: envVars.logging.esIndexPrefix,
  format: format.combine(
    format.timestamp(),
    format.json()
  )
};

// Create an instance of ElasticsearchTransport if needed
const elasticsearchTransport = envVars.logging.driver === 'elk'
  ? new Elasticsearch.ElasticsearchTransport(esTransportOpts)
  : null;

// Create the logger instance
const loggerInstance = createLogger({
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
    ...(elasticsearchTransport ? [elasticsearchTransport] : [])
  ]
});

// Conditional logging wrapper
const isLoggingEnabled = envVars.logging.enabled; // Assuming `enabled` is a boolean flag in envVars

const logger = {
  info: (...args: [string, ...unknown[]]) => isLoggingEnabled && loggerInstance.info(...args),
  warn: (...args: [string, ...unknown[]]) => isLoggingEnabled && loggerInstance.warn(...args),
  error: (...args: [string, ...unknown[]]) => isLoggingEnabled && loggerInstance.error(...args),
};

export default logger;
