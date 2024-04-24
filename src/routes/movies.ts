import {Request, Response, Router} from "express";
import {ObjectId, Sort} from "mongodb";

import {singletonMongoDBConnection} from "../db/conn";
import {
    DeleteMoviesUrlParams,
    GetMoviesQueryParams,
    PatchMoviesBody, PostAggregateBody,
    PostMoviesBody,
    SortOptions
} from "../core/interfaces/getMovies.interfaces";

export const moviesRouter = Router();

moviesRouter
    .get('/test', async (req: Request, res: Response) => {
        const testCollection = await singletonMongoDBConnection.getTestCollection();
        let results = await testCollection.find({})
            .toArray();

        res.send(results).status(200);
    })
    .get('/', async (req: Request<unknown, unknown, unknown, GetMoviesQueryParams>, res: Response) => {
        const moviesCollection = await singletonMongoDBConnection.getMoviesCollection();

        const {
            page = 1,
            per_page = 10,
            sort = SortOptions.DESCENDING,
            sort_by = 'release_date'
        } = req.query;

        const skip = page > 1 ? (page - 1) * per_page : 0;

        const sortOptions: Sort = {
            [sort_by]: sort
        }

        const moviesResults = await moviesCollection
            .find({})
            .sort(sortOptions)
            .skip(skip)
            .limit(per_page)
            .toArray();

        res.send(moviesResults).status(200);
    })
    .post('/', async (req: Request<unknown, unknown, PostMoviesBody>, res: Response) => {
        const postMovieBody: PostMoviesBody = req.body;

        const moviesCollection = await singletonMongoDBConnection.getMoviesCollection();

        await moviesCollection.insertOne(postMovieBody);

        res.send({message: "Successfully added a new record."}).status(200);
    }).patch('/', async (req: Request<unknown, unknown, PatchMoviesBody>, res: Response) => {
        const patchMovieBody: PatchMoviesBody = req.body;

        const id = { _id: new ObjectId(patchMovieBody._id) };
        const body = { $set: {...patchMovieBody.body} }

        if (!ObjectId.isValid(patchMovieBody._id)) {
            return res.status(400).json({ message: 'Invalid id.' });
        }

        const moviesCollection = await singletonMongoDBConnection.getMoviesCollection();

        const result = await moviesCollection.updateOne(id, body);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        res.send({message: `Successfully updated record with id ${patchMovieBody._id}.`}).status(200);
    })
    .delete('/:id', async (req: Request<DeleteMoviesUrlParams>, res: Response) => {
        const { id } = req.params;

        const moviesCollection = await singletonMongoDBConnection.getMoviesCollection();

        const movieIdToDelete = { _id: new ObjectId(id) }

        await moviesCollection.deleteOne(movieIdToDelete);

        res.send({message: `Successfully deleted record with id ${movieIdToDelete}.`}).status(200);
    });
