export interface AdminNewsPayload {
	slug: string;
	type: string;
	isPublished?: boolean;
	publishedAt?: Date | null;
	removeImage?: boolean;
	translations: {
		lang: string;
		title: string;
		excerpt?: string | null;
		content: string;
	}[];
	poll?: {
		isActive?: boolean;
		endAt: Date;
		options: {
			sortOrder?: number;
			translations: {
				lang: string;
				label: string;
			}[];
		}[];
	};
}
