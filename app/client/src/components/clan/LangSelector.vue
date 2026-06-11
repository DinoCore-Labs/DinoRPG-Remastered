<template>
	<div class="flags">
		<Flag
			v-for="lang in langs"
			:key="lang.short"
			:lang="lang.short.toLocaleLowerCase()"
			:class="[value.includes(lang.short) ? 'selected' : '']"
			class="flag"
			@click="updatedSelectedLangs(lang.short)"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { Locales } from '../../i18n';
import Flag from '../utils/Flag.vue';

export default defineComponent({
	name: 'LangSelector',
	components: { Flag },
	props: {
		modelValue: {
			type: Array as PropType<string[]>,
			required: true,
			default: () => []
		}
	},
	emits: ['update:modelValue', 'change'],
	computed: {
		value: {
			get(): string[] {
				return this.modelValue;
			},
			set(newValue: string[]) {
				this.$emit('update:modelValue', newValue);
				this.$emit('change', newValue);
			}
		}
	},
	data() {
		return {
			langs: Locales
		};
	},
	methods: {
		updatedSelectedLangs(langShort: string) {
			const currentLangs = [...this.value];

			if (currentLangs.includes(langShort)) {
				this.value = currentLangs.filter(v => v !== langShort);
			} else {
				this.value = [...currentLangs, langShort];
			}
		}
	}
});
</script>

<style scoped lang="scss">
.flags {
	display: flex;
	justify-content: center;
	gap: 6px;

	.flag {
		cursor: pointer;
		width: 16px;
		height: 11px;
		border: 1px solid rgb(108, 113, 136);
		outline: 2px solid transparent;
		outline-offset: 0;
		box-shadow: none;

		&.selected {
			outline-color: #318d15;
		}
	}
}
</style>
