export enum SortOptions {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

export interface GetMoviesQueryParams {
    page: number;
    per_page: number;
    sort: SortOptions ;
    sort_by: string;
}

export interface PostMoviesBody {
    "adult": boolean;
    "belongs_to_collection": string;
    "budget": number,
    "genres": string;
    "id": number;
    "imdb_id": string;
    "original_language": string;
    "original_title": string;
    "overview": string;
    "popularity": number;
    "poster_path": string;
    "production_companies": string;
    "production_countries": string;
    "release_date": string
    "revenue": number;
    "runtime": number;
    "spoken_languages": string;
    "status": string;
    "title": string;
    "video": boolean;
    "vote_average": number;
    "vote_count": number;
}

export interface PatchMoviesBody {
    _id: string;
    body: Partial<PostMoviesBody>;
}

export interface DeleteMoviesUrlParams {
    id: string;
}

export interface PostAggregateBody {
    [stageName: string]: {};
}