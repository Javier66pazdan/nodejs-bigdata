import { MongoClient, Db } from "mongodb";

const connectionString = process.env.MONGODB_URI || "";

class MongoDBConnection {

    private static _instance: MongoDBConnection | null = null;
    private client: MongoClient;
    private _conn: Db | null = null;

    constructor() {
        if(MongoDBConnection._instance) {
            throw new Error('MongoDBConnection to singleton, wykorzystaj metodę getInstance().')
        }
        MongoDBConnection._instance = this;
        this.client = new MongoClient(connectionString);
    }

    static getInstance() {
        return MongoDBConnection._instance;
    }

    get conn(): Db | null {
        return this._conn;
    }

    set conn(value: Db | null) {
        this._conn = value;
    }

    private async getNodejsBigdataDbConnection(): Promise<Db> {
        try {
            if (this.conn) {
                return this.conn
            }
            this.conn = (await this.client.connect()).db(process.env.MONGODB_DBNAME);
            return this.conn;
        } catch (e) {
            console.error("Błąd przy połączeniu do MongoDB:", e);
            throw e;
        }
    }

    async getTestCollection() {
        const nodejsBigdataDbConnection = await this.getNodejsBigdataDbConnection();
        return nodejsBigdataDbConnection.collection(process.env.TEST_COLLECTION as string)
    }
}

export const singletonMongoDBConnection = new MongoDBConnection();