import mongoose, { Connection } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL as string;

if (!MONGODB_URL) {
    throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
}

interface MongooseCache {
    conn: Connection | null;
    promise: Promise<Connection> | null;
}

declare global {
    var mongooseCache: MongooseCache;
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

export async function connectToDb(): Promise<Connection> {
    if (global.mongooseCache.conn) {
        return global.mongooseCache.conn;
    }

    if (!global.mongooseCache.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
        };

        global.mongooseCache.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
            return mongoose.connection;
        });
    }

    try {
        global.mongooseCache.conn = await global.mongooseCache.promise;
    } catch (e) {
        global.mongooseCache.promise = null;
        console.error('Failed to connect to MongoDB:', e);
        throw e;
    }

    return global.mongooseCache.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
    if (global.mongooseCache.conn) {
        await mongoose.disconnect();
        global.mongooseCache.conn = null;
        global.mongooseCache.promise = null;
    }
}

// Event listeners for connection status
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});