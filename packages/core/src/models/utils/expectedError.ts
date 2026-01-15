export class ExpectedError extends Error {
	statusCode: number;

	constructor(message = '', statusCode = 400) {
		super(message);
		this.statusCode = statusCode;
	}
}
