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