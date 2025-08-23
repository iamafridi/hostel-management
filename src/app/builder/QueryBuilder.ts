import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    //search
    search(searchableFields: string[]) {
        const searchTerm = this?.query?.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' }, // 'i' = case insensitive
                }) as FilterQuery<T>),
            });
        }
        return this;  // this return na korle amra chaining korte parbo na

    }

    //filter : ekhanae kichu korte hoy na as eta query ta receive korbe
    filter() {
        const queryObj = { ...this.query };

        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach((el) => delete (queryObj as any)[el]);

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
        return this;
    }


    //Sorting
    sort() {
        const sort = (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';  //ek er odik field er upor sorting chalaite parbo
        this.modelQuery = this.modelQuery.sort(sort as string);

        return this;
    }

    //paginate
    paginate() {
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 1;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    // field limiting
    fields() {
        const fields = (this?.query?.fields as string)?.split(',')?.join(' ') || '-__';

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }


}


export default QueryBuilder;