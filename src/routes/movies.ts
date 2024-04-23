import {Request, Response, Router} from "express";

import {singletonMongoDBConnection} from "../db/conn";
import {GetMoviesQueryParams, PostMoviesBody, SortOptions} from "../core/interfaces/getMovies.interfaces";
import {Sort} from "mongodb";

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
    .post('/', async (req: Request<unknown, unknown, PostMoviesBody, unknown>, res: Response) => {
        const postMovieBody: PostMoviesBody = req.body;

        const moviesCollection = await singletonMongoDBConnection.getMoviesCollection();

        await moviesCollection.insertOne(postMovieBody);

        res.send({message: "Successfully added a new record."}).status(200);
    });
