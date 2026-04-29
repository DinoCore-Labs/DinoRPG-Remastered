export class ExpectedError<TParams extends Record<string, unknown> = Record<string, unknown>> extends Error {
	code: string;
	statusCode: number;
	params?: TParams;
	constructor(code: string, opts?: { statusCode?: number; params?: TParams; message?: string }) {
		super(opts?.message ?? code);
		this.name = 'ExpectedError';
		this.code = code;
		this.statusCode = opts?.statusCode ?? 400;
		this.params = opts?.params;
		Object.setPrototypeOf(this, ExpectedError.prototype);
	}
}
