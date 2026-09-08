export type LegalNoticesSection = {
	id: string;
	title: string;
	content: string;
};

const SECTION_HEADING_PATTERN = /^##[ \t]+(.+?)\r?$/gm;

export const parseLegalNoticesMarkdown = (source: string): LegalNoticesSection[] => {
	const headings = [...source.matchAll(SECTION_HEADING_PATTERN)];

	return headings.map((heading, index) => {
		const bodyStart = (heading.index ?? 0) + heading[0].length;
		const bodyEnd = headings[index + 1]?.index ?? source.length;

		return {
			id: String(index + 1),
			title: heading[1].trim(),
			content: source.slice(bodyStart, bodyEnd).trim()
		};
	});
};
