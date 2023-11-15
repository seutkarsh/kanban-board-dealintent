export class UnauthorizedError extends Error {
    status: number;

    constructor(error: Error) {
        super(error.message);
        this.status = 401;
        this.name = "UnauthorizedError";
    }
}