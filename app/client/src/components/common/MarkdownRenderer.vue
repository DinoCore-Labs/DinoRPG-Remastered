<template>
	<div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script lang="ts">
import markdownit from 'markdown-it';
import { defineComponent } from 'vue';

const md = new markdownit({
	breaks: true,
	linkify: true,
	html: false
});

export default defineComponent({
	name: 'MarkdownRenderer',
	props: {
		source: {
			type: String,
			required: true
		}
	},
	computed: {
		renderedHtml(): string {
			return md.render(this.source ?? '');
		}
	}
});
</script>
