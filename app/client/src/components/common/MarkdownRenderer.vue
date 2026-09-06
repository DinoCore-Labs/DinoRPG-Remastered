<template>
	<div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script lang="ts">
import markdownit from 'markdown-it';
import { defineComponent } from 'vue';

import { helpers } from '../../utils/formatText';

function createMarkdownRenderer(gameIcons = false) {
	const md = new markdownit({
		breaks: true,
		linkify: true,
		html: false
	});
	md.linkify.set({
		fuzzyLink: true,
		fuzzyEmail: true
	});
	if (gameIcons) {
		md.renderer.rules.text = (tokens, idx) => {
			const content = md.utils.escapeHtml(tokens[idx].content);
			return content.replace(/:(\w+):/g, (match, iconKey: string) => {
				try {
					return helpers.computeImageHtml(iconKey);
				} catch {
					return match;
				}
			});
		};
	}
	return md;
}

const markdownRenderer = createMarkdownRenderer();
const gameMarkdownRenderer = createMarkdownRenderer(true);

export default defineComponent({
	name: 'MarkdownRenderer',
	props: {
		source: {
			type: String,
			required: true
		},
		gameIcons: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		renderedHtml(): string {
			const renderer = this.gameIcons ? gameMarkdownRenderer : markdownRenderer;
			return renderer.render(this.source ?? '');
		}
	}
});
</script>
