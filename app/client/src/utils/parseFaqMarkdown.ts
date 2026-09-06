export interface FaqPair {
	id: number;
	question: string;
	answer: string;
}

export function parseFaqMarkdown(source: string): FaqPair[] {
	const lines = source.replace(/\r\n/g, '\n').split('\n');

	const pairs: FaqPair[] = [];

	let currentQuestion: string | null = null;
	let currentAnswer: string[] = [];

	const pushCurrentPair = () => {
		if (!currentQuestion) return;

		pairs.push({
			id: pairs.length + 1,
			question: currentQuestion,
			answer: currentAnswer.join('\n').trim()
		});

		currentQuestion = null;
		currentAnswer = [];
	};

	for (const line of lines) {
		if (line.startsWith('## ')) {
			pushCurrentPair();

			currentQuestion = line.slice(3).trim();
			continue;
		}

		if (currentQuestion) {
			currentAnswer.push(line);
		}
	}

	pushCurrentPair();

	return pairs;
}
