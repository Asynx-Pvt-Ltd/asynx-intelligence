export type User = {
	id: string;
	email: string;
	name: string;
	role: 'user' | 'admin';
	createdAt: Date;
};

export type ApiResponse<T> = {
	data: T;
	message?: string;
};

export type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
};
