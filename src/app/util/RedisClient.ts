import { createClient, RedisClientType } from 'redis';
import Redlock, { Lock } from 'redlock';
import envVars from "@shared/env-vars";
import logger from "@util/logger";

// Define specific bitfield operation commands with the correct Redis syntax
type BitFieldGetOperation = ["GET", string, number];
type BitFieldSetOperation = ["SET", string, number, number];
type BitFieldIncrByOperation = ["INCRBY", string, number, number];
// Define a type for the xReadGroup response
type BitFieldOverflowOperation = ["OVERFLOW", "WRAP" | "SAT" | "FAIL"];
type StreamEntry = { name: string; messages: { id: string; message: Record<string, string> }[] };
type RedisCommand = [string, ...string[]];
type TimeSeriesDataPoint = [string, string];
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
type BitFieldOperation = BitFieldGetOperation |
  BitFieldSetOperation |
  BitFieldIncrByOperation |
  BitFieldOverflowOperation;


class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private redlock: Redlock | undefined;

  private constructor() {
    this.client = createClient({ url: envVars.redis.url });
    this.client.on('error', (err: unknown) => logger.error('Redis Client Error', err));

    // Connect client and initialize Redlock immediately after connection
    this.connect()
      .then(() => {
        this.redlock = new Redlock([this.client], {
          retryCount: 20, // Adjust as needed
          retryDelay: 200, // Adjust as needed
          retryJitter: 100,
        });
        logger.info('Redlock initialized successfully');
      })
      .catch((error: unknown) => {
        logger.error('Error initializing Redis client', { error });
      });
  }


  // Singleton pattern to ensure only one instance
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  // Connect client
  private async connect(): Promise<void> {
    await this.client.connect();
  }

  // Wrapping Redis `set` method
  public async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // Wrapping Redis `get` method
  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Wrapping Redis `del` method
  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // Additional example method for incrementing a counter
  public async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  // List Operations
  public async lPush(key: string, ...values: string[]): Promise<number> {
    return this.client.lPush(key, values);
  }

  public async rPop(key: string): Promise<string | null> {
    return this.client.rPop(key);
  }

  public async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lRange(key, start, stop);
  }

  // Set Operations
  public async sAdd(key: string, ...members: string[]): Promise<number> {
    return this.client.sAdd(key, members);
  }

  public async sIsMember(key: string, member: string): Promise<boolean> {
    return this.client.sIsMember(key, member);
  }

  public async sMembers(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }

  // Hash Operations
  public async hSet(key: string, field: string, value: string): Promise<number> {
    return this.client.hSet(key, field, value);
  }

  public async hGet(key: string, field: string): Promise<string | null> {
    return await this.client.hGet(key, field) ?? null;
  }

  public async hGetAll(key: string): Promise<Record<string, string>> {
    return this.client.hGetAll(key);
  }

  public async hDel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hDel(key, fields);
  }

  // Pub/Sub Operations
  public async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate(); // Create a duplicate client for subscribing
    await subscriber.connect();
    subscriber.subscribe(channel, callback);
  }

  // Subscribing to key expiration events
  public async subscribeToExpirations(
    pattern: string,
    callback: (key: string) => void
  ): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.configSet('notify-keyspace-events', 'Ex'); // Enable key expiration events
    await subscriber.subscribe(`__keyevent@0__:expired`, (key) => {
      if (key.startsWith(pattern)) callback(key);
    });
  }

  public async subscribeToPattern(
    pattern: string,
    callback: (message: string) => void
  ): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.pSubscribe(pattern, callback);
  }

  // Sorted Set Operations
  public async zAdd(key: string, score: number, member: string): Promise<number> {
    return this.client.zAdd(key, { score, value: member });
  }

  public async zRange(
    key: string,
    start: number,
    stop: number,
    reverse = false
  ): Promise<string[]> {
    return reverse ?
      this.client.zRange(
        key,
        start,
        stop,
        { REV: true }
      ) : this.client.zRange(key, start, stop);
  }

  // Geospatial Operations
  public async geoAdd(
    key: string,
    longitude: number,
    latitude: number,
    member: string
  ): Promise<number> {
    return this.client.geoAdd(key, { longitude, latitude, member });
  }

  public async geoRadius(
    key: string,
    longitude: number,
    latitude: number,
    radius: number,
    unit: 'm' | 'km' | 'mi' | 'ft' = 'km'
  ): Promise<string[]> {
    return this.client.geoRadius(key, { longitude, latitude }, radius, unit);
  }

  public async geoPos(key: string, member: string): Promise<[number, number] | null> {
    const position = await this.client.geoPos(key, member);
    return position && position[0]
      ? [parseFloat(position[0].longitude), parseFloat(position[0].latitude)]
      : null;
  }

  // Bloom Filter Operations (using RedisBloom module)
  public async bfAdd(key: string, item: string): Promise<number> {
    const response = await this.client.sendCommand(['BF.ADD', key, item]);
    return response ? parseInt(response.toString(), 10) : 0; // Return 0 if response is undefined
  }


  public async bfExists(key: string, item: string): Promise<boolean> {
    const response = await this.client.sendCommand(['BF.EXISTS', key, item]);
    return response === '1'; // RedisBloom returns '1' for true and '0' for false
  }

  // HyperLogLog for Approximate Counting
  public async pfAdd(key: string, ...elements: string[]): Promise<number> {
    const response = await this.client.pfAdd(key, elements);
    return response ? 1 : 0;
  }

  public async pfCount(key: string): Promise<number> {
    return this.client.pfCount(key);
  }

  // Stream Operations
  public async xAdd(
    key: string,
    id: string,
    fields: Record<string, string | number>
  ): Promise<string> {
    const stringifiedFields: Record<string, string> = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.toString()])
    );
    return this.client.xAdd(key, id, stringifiedFields);
  }

  public async xRead(key: string, lastId: string, count?: number): Promise<StreamEntry[]> {
    const response = await this.client.xRead([{ key, id: lastId }], { COUNT: count });
    return response ?? [];
  }

  // Rate Limiting
  public async rateLimit(
    key: string,
    limit: number,
    windowInSeconds: number
  ): Promise<boolean> {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, windowInSeconds); // Set expiration for the window
    }
    return current <= limit;
  }

  // Acquiring a lock
  public async acquireLock(resource: string, ttl: number): Promise<Lock | null> {
    if (!this.redlock) {
      logger.warn("Redlock not initialized");
      return null;
    }
    try {
      logger.info(`Attempting to acquire lock for ${resource} with TTL ${ttl}`);
      const lock = await this.redlock.acquire([resource], ttl);
      logger.info(`Lock acquired for ${resource}`);
      return lock;
    } catch (error) {
      if (error instanceof Error && error.message.includes("quorum")) {
        logger.warn(`Failed to acquire lock on ${resource}: quorum not achieved. Check Redis node connectivity.`);
        return null;
      }
      throw error;
    }
  }



  // Example method for releasing a lock
  public async releaseLock(lock: Lock): Promise<void> {
    await lock.release();
  }

  // Setting and getting bits
  public async setBit(key: string, offset: number, value: 0 | 1): Promise<number> {
    return this.client.setBit(key, offset, value);
  }

  public async getBit(key: string, offset: number): Promise<number> {
    return this.client.getBit(key, offset);
  }

  public async bitField(key: string, operations: BitFieldOperation[]): Promise<number[]> {
    // Flatten operations and convert all elements to strings for Redis command
    const flatOperations = operations.flat().map(String);
    const response = await this.client.sendCommand(['BITFIELD', key, ...flatOperations]);

    // Check if response is an array and filter out any null values
    if (Array.isArray(response)) {
      return response
        .filter(
          (value): value is number =>
            typeof value === 'number' && value !== null
        );
    }
    return []; // Return empty array if response is not an array
  }
  // Setting and getting JSON values

  public async jsonSet<T extends JSONValue>(key: string, path: string, value: T): Promise<void> {
    await this.client.sendCommand(['JSON.SET', key, path, JSON.stringify(value)]);
  }

  public async jsonGet<T extends JSONValue>(key: string, path: string): Promise<T | null> {
    const response = await this.client.sendCommand(['JSON.GET', key, path]);
    return response ? (JSON.parse(response.toString()) as T) : null;
  }

  public async jsonDelete(key: string, path: string): Promise<void> {
    await this.client.json.del(key, path);
  }

  // Creating a time series and adding data points
  public async tsCreate(key: string, retention: number): Promise<void> {
    await this.client.sendCommand(['TS.CREATE', key, 'RETENTION', retention.toString()]);
  }

  public async tsAdd(key: string, timestamp: number, value: number): Promise<number> {
    const response = await this.client.sendCommand([
      'TS.ADD',
      key,
      timestamp.toString(),
      value.toString()
    ]);
    return response ? parseInt(response.toString(), 10) : 0;
  }

  public async tsRange(key: string, from: string, to: string): Promise<TimeSeriesDataPoint[]> {
    const response = await this.client.sendCommand(['TS.RANGE', key, from, to]);
    return response ? (JSON.parse(response.toString()) as TimeSeriesDataPoint[]) : [];
  }

  // Aggregating data points
  public async tsRangeWithAggregation(
    key: string,
    from: string,
    to: string,
    aggregationType: 'avg' | 'min' | 'max' | 'sum',
    bucketSize: number
  ): Promise<TimeSeriesDataPoint[]> {
    const response = await this.client.sendCommand([
      'TS.RANGE',
      key,
      from,
      to,
      'AGGREGATION',
      aggregationType.toUpperCase(),
      bucketSize.toString()
    ]);
    return response ? (JSON.parse(response.toString()) as TimeSeriesDataPoint[]) : [];
  }

  // Incrementing a counter by a specific amount
  public async incrementBy(key: string, amount: number): Promise<number> {
    return this.client.incrBy(key, amount);
  }

  public async multiExec(commands: RedisCommand[]): Promise<(string | number)[]> {
    const multi = this.client.multi();
    commands.forEach(command => {
      // Ensure all elements in the command array are strings
      const commandArgs = command.map(arg => arg.toString());
      multi.addCommand(commandArgs);
    });
    return (await multi.exec()) as (string | number)[];
  }

  public async executeLuaScript(
    script: string,
    keys: string[],
    args: (string | number)[]
  ): Promise<string | number | (string | number)[]> {
    return await this.client.eval(script, {
      keys,
      arguments: args.map(arg => arg.toString())
    }) as string | number | (string | number)[]; // Explicit cast to avoid `any`
  }

  // Add a score to a leaderboard
  public async addToLeaderboard(key: string, score: number, member: string): Promise<number> {
    return this.client.zAdd(key, { score, value: member });
  }

  // Get the top N members in a leaderboard
  public async getTopFromLeaderboard(key: string, count: number): Promise<string[]> {
    return this.client.zRange(key, 0, count - 1, { REV: true });
  }

  // Get rank of a specific member
  public async getRankFromLeaderboard(key: string, member: string): Promise<number | null> {
    return this.client.zRevRank(key, member);
  }

  // Create a consumer group for a stream
  public async createConsumerGroup(stream: string, group: string, startFrom = '>'): Promise<void> {
    await this.client.xGroupCreate(stream, group, startFrom, { MKSTREAM: true });
  }

  // Read from a stream with a consumer group
  public async readFromStreamGroup(
    stream: string,
    group: string,
    consumer: string,
    count: number
  ): Promise<StreamEntry[]> {
    const response = await this.client.xReadGroup(
      group,
      consumer,
      [{ key: stream, id: '>' }],
      { COUNT: count }
    );
    return response ?? [];
  }

  public async cfAdd(key: string, item: string): Promise<number> {
    const response = await this.client.sendCommand(['CF.ADD', key, item]);
    return response ? parseInt(response.toString(), 10) : 0;
  }

  public async cfExists(key: string, item: string): Promise<boolean> {
    const response = await this.client.sendCommand(['CF.EXISTS', key, item]);
    return response === '1';
  }

  // Adding an item to the Top-K list
  public async topKAdd(key: string, item: string): Promise<void> {
    await this.client.sendCommand(['TOPK.ADD', key, item]);
  }

  // Querying the Top-K list
  public async topKList(key: string): Promise<string[]> {
    const response = await this.client.sendCommand(['TOPK.LIST', key]);
    return response ? response.toString().split(',') : [];
  }

  public async cacheAside<T>(key: string, fallback: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get(key);
    if (cached) return JSON.parse(cached) as T;

    const result = await fallback();
    await this.set(key, JSON.stringify(result), ttl);
    return result;
  }

  // Custom method for disconnecting the client
  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}

export default RedisClient;
