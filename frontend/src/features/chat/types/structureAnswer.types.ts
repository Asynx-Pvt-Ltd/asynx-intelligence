export type StructuredSection = {
	heading: string;
	body: string;
};

export type StructuredView = {
	type?: 'explanation' | 'general' | 'error';
	title?: string | null;
	overview?: string;
	sections: StructuredSection[] | null;
	bullets: string[] | null;
	rawText?: string | null;
};
