import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const localesPath = resolve(__dirname, '../src/i18n/locales');
const outputPath = resolve(__dirname, '../src/content/faq');

const languages = ['FR', 'EN', 'ES', 'DE'];

/**
 * Current FAQPage ordering.
 */
const faqOrder = [
	1, 2, 8, 3, 9, 10, 4, 5, 6, 11, 12, 13, 14, 15, 16, 7, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];

function convertLegacyFormatting(value) {
	return value
		.replace(/\s*&&\s*&&\s*/g, '\n\n')
		.replace(/\s*&&\s*/g, '\n')
		.replace(/\/\/([^/\n]+)\/\//g, '*$1*')
		.trim();
}

await mkdir(outputPath, {
	recursive: true
});

for (const language of languages) {
	const localeFile = resolve(localesPath, `${language}.json`);

	const source = JSON.parse(await readFile(localeFile, 'utf8'));

	const faq = source.faq;

	if (!faq) {
		console.warn(`[FAQ] No FAQ found in ${language}.json`);
		continue;
	}

	const lines = [];

	for (const faqNumber of faqOrder) {
		const entry = faq[`faq${faqNumber}`];

		if (!entry) {
			console.warn(`[FAQ] faq${faqNumber} missing in ${language}.json`);
			continue;
		}

		lines.push(`## ${entry.question}`);
		lines.push('');
		lines.push(convertLegacyFormatting(entry.answer));
		lines.push('');
	}

	const outputFile = resolve(outputPath, `${language}.md`);

	await writeFile(outputFile, `${lines.join('\n').trim()}\n`, 'utf8');

	console.log(`[FAQ] Generated ${language}.md`);
}
