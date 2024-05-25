import {Router} from "express";
import {singletonMongoDBConnection} from "../db/conn";

export const postprocessRouter = Router();

const BATCH_SIZE = 200

postprocessRouter.post('/', async (req, res) => {
    let skip = 0;
    let totalUpdated = 0;

    const moviesUploadCollection = await singletonMongoDBConnection.getMoviesUploadCollection();

    while (true) {
        // Download batch of records
        const records = await moviesUploadCollection.find({}).skip(skip).limit(BATCH_SIZE).toArray();

        if (records.length === 0) {
            break; // end
        }

        const updatedRecords = records.map(record => {
            const budget = parseFloat(record.budget);
            if (!isNaN(budget)) {
                record.budget = (budget + 1000).toString();
            }
            return record;
        });

        // prepare bulk write
        const bulkOps = updatedRecords.map(record => ({
            updateOne: {
                filter: { _id: record._id },
                update: { $set: { budget: record.budget } }
            }
        }));

        if (bulkOps.length > 0) {
            const result = await moviesUploadCollection.bulkWrite(bulkOps);
            totalUpdated += result.modifiedCount;
            console.log(`${result.modifiedCount} records updated in this batch`);
        }

        skip += BATCH_SIZE;
    }

    res.status(200).send(`${totalUpdated} records updated successfully.`);
})