// import {
// 	StructuredSection,
// 	StructuredView,
// } from '../types/structureAnswer.types';

// export function structureAnswer(raw: string): StructuredView | null {
// 	if (!raw.trim()) return null;

// 	// 1) Try to parse JSON
// 	try {
// 		const parsed = JSON.parse(raw) as any;

// 		if (
// 			typeof parsed === 'object' &&
// 			parsed !== null &&
// 			typeof parsed.type === 'string'
// 		) {
// 			// It’s our structured JSON
// 			const sections = Array.isArray(parsed.sections)
// 				? parsed.sections.map((s: any) => ({
// 						heading: String(s.heading ?? ''),
// 						body: String(s.body ?? ''),
// 					}))
// 				: null;

// 			const bullets = Array.isArray(parsed.bullets)
// 				? parsed.bullets.map((b: any) => String(b))
// 				: null;

// 			return {
// 				type: parsed.type,
// 				title: parsed.title ?? undefined,
// 				overview: undefined, // will be derived from sections if needed
// 				sections,
// 				bullets,
// 				rawText: parsed.rawText ?? undefined,
// 			};
// 		}
// 	} catch {
// 		// Not JSON, fall through to text mode below
// 	}

// 	// 2) Fallback: treat as structured text (previous behavior)
// 	const lines = raw
// 		.split(/\r?\n/)
// 		.map((l) => l.trim())
// 		.filter(Boolean);

// 	if (lines.length === 0) {
// 		return null;
// 	}

// 	const [firstLine, ...restLines] = lines;
// 	const title = firstLine || undefined;

// 	const sections: StructuredSection[] = [];
// 	let current: StructuredSection | null = null;

// 	const headingRegex =
// 		/^(overview|key ideas?|step-?by-?step|examples?|next steps?|limitations?)[:]?$/i;
// 	const bulletRegex = /^[-*•]\s+/;

// 	const bullets: string[] = [];

// 	for (const line of restLines) {
// 		if (headingRegex.test(line)) {
// 			if (current) sections.push(current);
// 			current = { heading: line.replace(/:$/, ''), body: '' };
// 			continue;
// 		}

// 		if (bulletRegex.test(line)) {
// 			bullets.push(line.replace(bulletRegex, '').trim());
// 			continue;
// 		}

// 		if (!current) {
// 			current = { heading: 'Details', body: line };
// 		} else {
// 			current.body = current.body ? `${current.body}\n${line}` : line;
// 		}
// 	}

// 	if (current) sections.push(current);

// 	const overviewSection = sections.find((s) => /^overview$/i.test(s.heading));
// 	const overview = overviewSection?.body;

// 	return {
// 		type: 'explanation',
// 		title,
// 		overview,
// 		sections,
// 		bullets,
// 		rawText: undefined,
// 	};
// }

import {
	StructuredSection,
	StructuredView,
} from '../types/structureAnswer.types';

export function structureAnswer(raw: string): StructuredView | null {
	if (!raw.trim()) return null;

	// 1) Try to parse JSON (keep this if you still sometimes get JSON)
	try {
		const parsed = JSON.parse(raw) as any;

		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof parsed.type === 'string'
		) {
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
				overview: undefined,
				sections,
				bullets,
				rawText: parsed.rawText ?? undefined,
			};
		}
	} catch {
		// Not JSON, fall through to markdown mode below
	}

	// 2) Markdown-based structured text (stream-friendly)

	// Split into non-empty trimmed lines
	const lines = raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	if (lines.length === 0) {
		return null;
	}

	// Title: first line starting with "# " if present, otherwise just first line
	let title: string | undefined;
	let startIndex = 0;

	if (lines[0].startsWith('# ')) {
		title = lines[0].slice(2).trim() || undefined;
		startIndex = 1;
	} else {
		title = lines[0] || undefined;
		startIndex = 1;
	}

	const sections: StructuredSection[] = [];
	const bullets: string[] = [];

	let currentSection: StructuredSection | null = null;
	let overviewLines: string[] = [];
	let inOverview = true; // until we see first "## "

	for (let i = startIndex; i < lines.length; i++) {
		const line = lines[i];

		// Section heading: "## Heading"
		if (line.startsWith('## ')) {
			// Close previous section
			if (currentSection) {
				sections.push(currentSection);
			}

			const headingText = line.slice(3).trim() || 'Section';
			currentSection = { heading: headingText, body: '' };
			inOverview = false;
			continue;
		}

		// Bullet line: "- something" or "* something" or "• something"
		if (/^[-*•]\s+/.test(line)) {
			const bulletText = line.replace(/^[-*•]\s+/, '').trim();
			bullets.push(bulletText);

			// Also attach bullet text to current section body for readability
			if (currentSection) {
				currentSection.body = currentSection.body
					? `${currentSection.body}\n- ${bulletText}`
					: `- ${bulletText}`;
			}
			continue;
		}

		// Paragraph / normal text
		if (inOverview) {
			overviewLines.push(line);
		} else {
			if (!currentSection) {
				// If no section yet but we're past overview, create a default one
				currentSection = { heading: 'Details', body: line };
			} else {
				currentSection.body = currentSection.body
					? `${currentSection.body}\n${line}`
					: line;
			}
		}
	}

	// Push last open section
	if (currentSection) {
		sections.push(currentSection);
	}

	const overview =
		overviewLines.length > 0 ? overviewLines.join('\n') : undefined;

	return {
		type: 'explanation',
		title,
		overview,
		sections,
		bullets,
		rawText: undefined,
	};
}
