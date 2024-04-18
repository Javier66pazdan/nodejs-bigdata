import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

import { singletonMongoDBConnection } from "./db/conn"

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", async (req: Request, res: Response) => {
    let testCollection = await singletonMongoDBConnection.getTestCollection();
    let results = await testCollection.find({})
        .toArray();

    res.send(results).status(200);
});

app.listen(port, () => {
    console.log(`Serwer został uruchomiony na porcie ${port}`);
});