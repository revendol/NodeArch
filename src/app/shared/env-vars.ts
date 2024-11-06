/* eslint-disable node/no-process-env */

export default {
  nodeEnv: (process.env.NODE_ENV ?? ''),
  port: (process.env.PORT ?? 0),
  folder: (process.env.FOLDER ?? 'uploads'),
  cookieProps: {
    key: 'CookiePropsKey',
    secret: (process.env.COOKIE_SECRET ?? ''),
    options: {
      httpOnly: true,
      signed: true,
      path: (process.env.COOKIE_PATH ?? ''),
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: (process.env.COOKIE_DOMAIN ?? ''),
      secure: (process.env.SECURE_COOKIE === 'true'),
    },
  },
  jwt: {
    secret: (process.env.JWT_SECRET ?? 'SecretKey'),
    exp: (process.env.JWT_TOKEN_EXP ?? '30 days'),
    refExp: (process.env.REFRESH_TOKEN_EXP ?? '30 days'),
  },
  mongoDB: {
    url: 
    (process.env.MONGO_CONN_URL ?? 
      'mongodb://localhost:27017/node_arch')
  },
  mailer: {
    from: (process.env.MAIL_FROM ?? 'noreply@example.com'),
    mailtrap: {
      host: "smtp.mailtrap.io",
      port: 2525,
      secure:false,
      auth: {
        user: "api",
        pass: "jksdhfkjsdfjksdfjksdfjkdsf",
      }
    }

  },
  redis: {
    enable: process.env.REDIS_ENABLE === 'true',
    url: (process.env.REDIS_URL ?? 'redis://localhost:6379'),
    cacheTTL: parseInt(process.env.CACHE_EXPIRY || "3600"),
  },
  logging: {
    driver: (process.env.LOG_DRIVER) ?? 'file', // 'file' or 'elk'
    logPath: (process.env.LOG_FILE_PATH) ?? 'logs',
    level: (process.env.LOG_LEVEL) ?? 'info',
    elasticSearchHost: (process.env.LOG_ELK_HOST) ?? 'http://elasticsearch:9200',
    esIndexPrefix: (process.env.LOG_ES_INDEX_PREFIX) ?? 'app-logs', // ES index prefix
    fileName: (process.env.LOG_FILE_NAME) ?? 'app-%DATE%.log', // ES index name pattern
    datePattern: (process.env.LOG_FILE_DATE_PATTERN) ?? 'YYYY-MM-DD',
    maxFiles: (process.env.LOG_MAX_FILES) ?? '14d', // ES index
  }
} as const;
