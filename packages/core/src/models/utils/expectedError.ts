export class ExpectedError<TParams extends Record<string, unknown> = Record<string, unknown>> extends Error {
	statusCode: number;
	params?: TParams;

	constructor(message: string, opts?: { statusCode?: number; params?: TParams }) {
		super(message);
		this.statusCode = opts?.statusCode ?? 400;
		this.params = opts?.params;
	}
}
