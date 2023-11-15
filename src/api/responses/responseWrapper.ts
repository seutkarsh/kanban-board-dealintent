export class APIError {
	id: string;
	status?: string;
	code?: string;
	title: string;
	description: string;

	constructor(title: string, description: string, code?: string) {
		this.id = Math.random().toString(36).substring(7);
		this.title = title;
		this.description = description;
		this.code = code;
	}
}
export class ResponseWrapper<T> {
	success: boolean;
	data?: T;
	errors?: Array<APIError>;
	meta: Record<string, unknown>;

	constructor() {
		this.success = false;
		this.meta = {};
	}

	setData(data: T): void {
		this.data = data;
		this.success = true;
	}
	setError(error: APIError): void {
		this.errors = [error];
		this.success = false;
	}
}
