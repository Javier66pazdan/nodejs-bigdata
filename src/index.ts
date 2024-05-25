import express, { Express } from "express";
import dotenv from "dotenv";

dotenv.config();
// Routes after env config
import {moviesRouter} from "./routes/movies";
import {uploadRouter} from "./routes/upload";
import {postprocessRouter} from "./routes/postprocess";

const app: Express = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json())

app.use('/movies', moviesRouter);
app.use('/upload', uploadRouter)
app.use('/postprocess', postprocessRouter)

app.listen(port, () => {
    console.log(`Serwer został uruchomiony na porcie ${port}`);
});