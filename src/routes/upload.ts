import {Router} from "express";
import {CHUNKS_DIR} from "../utils/constants";
import {upload} from "../utils/multer-config";
import * as fs from "fs";
import {assembleChunks} from "../utils/assemble-chunks";
import {Readable} from "stream";
import csv from 'csv-parser';
import {singletonMongoDBConnection} from "../db/conn";

interface File {
    /** Name of the form field associated with this file. */
    fieldname: string;
    /** Name of the file on the uploader's computer. */
    originalname: string;
    /**
     * Value of the `Content-Transfer-Encoding` header for this file.
     * @deprecated since July 2015
     * @see RFC 7578, Section 4.7
     */
    encoding: string;
    /** Value of the `Content-Type` header for this file. */
    mimetype: string;
    /** Size of the file in bytes. */
    size: number;
    /**
     * A readable stream of this file. Only available to the `_handleFile`
     * callback for custom `StorageEngine`s.
     */
    stream: Readable;
    /** `DiskStorage` only: Directory to which this file has been uploaded. */
    destination: string;
    /** `DiskStorage` only: Name of this file within `destination`. */
    filename: string;
    /** `DiskStorage` only: Full path to the uploaded file. */
    path: string;
    /** `MemoryStorage` only: A Buffer containing the entire file. */
    buffer: Buffer;
}

export const uploadRouter = Router();

uploadRouter.post('/', upload.single('file'), async (req, res) => {
    const { file, body: { totalChunks, currentChunk } } = req;
    const chunkFilename = `${file?.originalname}.${currentChunk}`;
    const chunkPath = `${CHUNKS_DIR}/${chunkFilename}`;
    fs.rename(file?.path as string, chunkPath, (err) => {
        if (err) {
            console.error('Error moving chunk file:', err);
            res.status(500).send('Error uploading chunk');
        } else {
            if (+currentChunk === +totalChunks) {
                const results: any[] = []
                // All chunks have been uploaded, assemble them into a single file
                assembleChunks(file!.originalname, totalChunks)
                    .then(() => {
                        // res.send('File uploaded successfully')
                        fs.createReadStream(`./uploads/${file!.originalname}`)
                            .pipe(csv())
                            .on('data', (data) => results.push(data))
                            .on('end', async () => {
                                console.log(results[0])
                                try {
                                    const moviesUploadCollection = await singletonMongoDBConnection.getMoviesUploadCollection();
                                    await moviesUploadCollection.insertMany(results);
                                    fs.unlinkSync(`./uploads/${file!.originalname}`);
                                    res.status(200).send('File uploaded and records inserted successfully.');
                                } catch (error) {
                                    console.error('Error inserting records:', error);
                                    res.status(500).send('Error inserting records.');
                                }
                            });

                    })
                    .catch((err) => {
                        console.error('Error assembling chunks:', err);
                        res.status(500).send('Error assembling chunks');
                    });
            } else {
                res.send('Chunk uploaded successfully');
            }
        }
    });
});