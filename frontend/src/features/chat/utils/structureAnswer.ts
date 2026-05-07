import {
	StructuredSection,
	StructuredView,
} from '../types/structureAnswer.types';

export function structureAnswer(raw: string): StructuredView | null {
	if (!raw.trim()) return null;

	// 1) Try to parse JSON
	try {
		const parsed = JSON.parse(raw) as any;

		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof parsed.type === 'string'
		) {
			// It’s our structured JSON
			const sections = Array.isArray(parsed.sections)
				? parsed.sections.map((s: any) => ({
						heading: String(s.heading ?? ''),
						body: String(s.body ?? ''),
					}))
				: null;

			const bullets = Array.isArray(parsed.bullets)
				? parsed.bullets.map((b: any) => String(b))
				: null;

			return {
				type: parsed.type,
				title: parsed.title ?? undefined,
				overview: undefined, // will be derived from sections if needed
				sections,
				bullets,
				rawText: parsed.rawText ?? undefined,
			};
		}
	} catch {
		// Not JSON, fall through to text mode below
	}

	// 2) Fallback: treat as structured text (previous behavior)
	const lines = raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	if (lines.length === 0) {
		return null;
	}

	const [firstLine, ...restLines] = lines;
	const title = firstLine || undefined;

	const sections: StructuredSection[] = [];
	let current: StructuredSection | null = null;

	const headingRegex =
		/^(overview|key ideas?|step-?by-?step|examples?|next steps?|limitations?)[:]?$/i;
	const bulletRegex = /^[-*•]\s+/;

	const bullets: string[] = [];

	for (const line of restLines) {
		if (headingRegex.test(line)) {
			if (current) sections.push(current);
			current = { heading: line.replace(/:$/, ''), body: '' };
			continue;
		}

		if (bulletRegex.test(line)) {
			bullets.push(line.replace(bulletRegex, '').trim());
			continue;
		}

		if (!current) {
			current = { heading: 'Details', body: line };
		} else {
			current.body = current.body ? `${current.body}\n${line}` : line;
		}
	}

	if (current) sections.push(current);

	const overviewSection = sections.find((s) => /^overview$/i.test(s.heading));
	const overview = overviewSection?.body;

	return {
		type: 'explanation',
		title,
		overview,
		sections,
		bullets,
		rawText: undefined,
	};
}
