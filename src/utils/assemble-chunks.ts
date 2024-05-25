import * as fs from "fs";
import {pipeline} from "stream";
import {CHUNKS_DIR} from "./constants";
import {promisify} from "util";

const unlinkAsync = promisify(fs.unlink);
export async function assembleChunks(filename: string, totalChunks: number) {
    const writer = fs.createWriteStream(`./uploads/${filename}`, {flags: 'a'});
    for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = `${CHUNKS_DIR}/${filename}.${i}`;
        const reader = fs.createReadStream(chunkPath);
        await new Promise<void>((resolve, reject) => {
            reader.pipe(writer, { end: false });
            reader.on('end', async () => {
                await unlinkAsync(chunkPath);
                resolve();
            });
            reader.on('error', reject);
        });
        // await pipeline(
        //     fs.createReadStream(chunkPath),
        //     writer
        // );
        // console.log("TEST4")
        // fs.unlink(chunkPath, (err) => {
        //     if (err) {
        //         console.error('Error deleting chunk file:', err);
        //     }
        // });
    }
    writer.end();
}