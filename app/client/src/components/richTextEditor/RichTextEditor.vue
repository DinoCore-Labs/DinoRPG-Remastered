<template>
	<div class="editor">
		<div class="text-format-dialog">
			<div class="toolbar">
				<div class="toolbar-formatting">
					<RichTextEditorFormattingButton
						v-for="button in richTextEditorFormattingButtons"
						:key="button.type + button.action"
						:type="button.type"
						:label="$t(button.label)"
						:title="$t(button.title)"
						@click="executeRichEditorAction(button)"
					/>
				</div>
				<div class="toolbar-dialog-buttons">
					<button class="format-button" :title="$t('richTextEditor.cleanButtonDescription')" @click="cancel">X</button>
					<button
						type="button"
						class="format-button"
						@click="confirm"
						:title="$t('richTextEditor.buttonValidateAdvEditor')"
					>
						<img :src="getImgURL('editor', 'send')" alt="send" />
					</button>
				</div>
			</div>
			<textarea
				v-model="editedText"
				class="edit-area"
				@select="selectHighlightedText"
				@keydown.esc.exact.prevent="cancel"
				@keydown.enter.exact.prevent="confirm"
				ref="textEditor"
			></textarea>
			<ul class="emote-tabs">
				<RichTextEditorEmoteButton
					v-for="(button, i) in richTextEditorEmoteButtons"
					:key="i"
					:config="button"
					:selected="selectedEmoteTab == i"
					@select="selectedEmoteTab = selectedEmoteTab == i ? -1 : i"
				/>
			</ul>
			<RichTextEditorEmotePanel
				v-if="selectedEmoteTab != -1"
				:config="richTextEditorEmoteButtons[selectedEmoteTab]"
				@emote="insertEmote"
			/>
			<div v-else class="emote-line" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RichTextEditorEmotePanel from './RichTextEditorEmotePanel.vue';
import RichTextEditorEmoteButton from './RichTextEditorEmoteButton.vue';
import RichTextEditorFormattingButton from './RichTextEditorFormattingButton.vue';
import {
	richTextEditorEmoteButtons,
	richTextEditorFormattingButtons,
	type FormattingType,
	type RichTextEditorFormattingButtonConfig
} from './RichTextEditorConfig';
import { formatText } from '../../utils/formatText';
import {
	applySelectedTextFormatting,
	clearSelectedTextFormattingLogic,
	formatEmote,
	getFormattingLengthForType,
	insertTextAtPositionLogic,
	type TextSelection
} from './RichTextFormatter';

export default defineComponent({
	name: 'RichTextEditor',
	components: {
		RichTextEditorEmoteButton,
		RichTextEditorEmotePanel,
		RichTextEditorFormattingButton
	},
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			editedText: this.modelValue,
			selectedEmoteTab: -1,
			selection: {
				start: 0,
				end: 0
			},
			showCharacterGrid: false,
			richTextEditorEmoteButtons,
			richTextEditorFormattingButtons
		};
	},
	computed: {
		formattedPreview(): string {
			// Conversion des marqueurs markdown en HTML pour la prévisualisation
			return formatText(this.editedText);
		}
	},
	watch: {
		modelValue(newVal: string) {
			// synchroniser les changements externes
			if (newVal !== this.editedText) {
				this.editedText = newVal;
			}
		}
	},
	methods: {
		selectHighlightedText(): void {
			const element = this.$refs.textEditor as HTMLTextAreaElement;
			this.selection = {
				start: element.selectionStart,
				end: element.selectionEnd
			};
		},
		executeRichEditorAction(button: RichTextEditorFormattingButtonConfig): void {
			switch (button.action) {
				case 'clearFormatting':
					this.clearFormatting();
					break;
				case 'applyFormatting':
					if (!button.actionParam) {
						return;
					}
					this.applyFormatting(button.actionParam as FormattingType);
					break;
			}
		},
		applyFormatting(type: FormattingType): void {
			const element = this.$refs.textEditor as HTMLTextAreaElement;
			let selection = this.getTextSelection(element);

			// If no text was selected create a new formatted block at cursor position
			if (!this.isValidSelection(selection)) {
				selection = {
					start: element.selectionStart,
					end: element.selectionStart
				};
			}

			try {
				const { newFullText, modifiedPart } = applySelectedTextFormatting(this.editedText, selection, type);
				const cursorPosition = selection.start + modifiedPart.length - getFormattingLengthForType(type);
				this.editedText = newFullText;
				this.updateCursorPosition(element, cursorPosition);
			} catch (error) {
				console.error('Error applying formatting:', error);
			}
		},
		clearFormatting(): void {
			const element = this.$refs.textEditor as HTMLTextAreaElement;
			const selection = this.getTextSelection(element);

			if (!this.isValidSelection(selection)) {
				return;
			}

			try {
				const { newFullText, modifiedPart } = clearSelectedTextFormattingLogic(this.editedText, selection);
				this.editedText = newFullText;
				this.updateCursorPosition(element, selection.start + modifiedPart.length);
			} catch (error) {
				console.error('Error clearing formatting:', error);
			}
		},
		insertEmote(emote: string): void {
			const element = this.$refs.textEditor as HTMLTextAreaElement;
			const cursorPosition = element.selectionStart;

			try {
				const formattedCharacter = formatEmote(emote);
				this.editedText = insertTextAtPositionLogic(this.editedText, cursorPosition, formattedCharacter);
				this.updateCursorPosition(element, cursorPosition + formattedCharacter.length);
				this.closeCharacterGrid();
			} catch (error) {
				console.error('Error inserting emote:', error);
			}
		},
		cancel(): void {
			this.$emit('cancel');
			this.showCharacterGrid = false;
			this.editedText = '';
		},
		confirm(): void {
			this.$emit('update:modelValue', this.editedText);
			this.$emit('send', this.editedText);
			this.showCharacterGrid = false;
			this.editedText = '';
		},
		toggleCharacterGrid(): void {
			this.showCharacterGrid = !this.showCharacterGrid;
		},
		isValidSelection(selection: TextSelection): boolean {
			return selection.start !== selection.end;
		},
		getTextSelection(element: HTMLTextAreaElement): TextSelection {
			const originalStart = element.selectionStart;
			const originalEnd = element.selectionEnd;
			// Only on correct selection, search for extended selection (with * or ~ symbols)
			if (originalStart !== originalEnd) {
				const newStart = this.getPositionbeforeSelected(originalStart);
				const newEnd = this.getPositionAfterSelected(originalEnd);
				if (newStart !== originalStart || newEnd !== originalEnd) {
					element.setSelectionRange(newStart, newEnd);
				}
			}
			return {
				start: element.selectionStart,
				end: element.selectionEnd
			};
		},
		getPositionbeforeSelected(start: number): number {
			// used to search formatting tag before selection, return new start position
			let index = start - 1;
			while (index >= 0 && /[*~]/.test(this.editedText[index])) {
				index--;
			}
			return index + 1;
		},
		getPositionAfterSelected(end: number): number {
			// used to search formatting tag after selection, return new end position
			let index = end;
			while (index < this.editedText.length && /[*~]/.test(this.editedText[index])) {
				index++;
			}
			return index;
		},
		updateCursorPosition(element: HTMLTextAreaElement, position: number): void {
			this.$nextTick(() => {
				element.focus();
				element.selectionStart = element.selectionEnd = position;
			});
		},
		closeCharacterGrid(): void {
			this.showCharacterGrid = false;
		}
	}
});
</script>

<style lang="scss" scoped>
.editor {
	display: flex;
	width: 100%;
}
.text-format-dialog {
	background-color: #ae6139;
	padding: 10px;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
	span {
		display: inline; /* Forcer les <span> à être inline */
	}
}
.toolbar {
	display: flex;
	flex-flow: row wrap;
	gap: 8px;
	justify-content: space-between;
	flex-wrap: wrap;
}
.toolbar-formatting {
	flex-flow: row wrap;
	justify-content: flex-start;
	gap: 8px;
}
.toolbar-dialog-buttons {
	flex-flow: row wrap;
	justify-content: flex-end;
	gap: 10px;
}
.edit-area {
	max-width: 100%;
	min-height: 90px;
	padding: 8px;
	border: 1px solid #fff;
	background-color: #cb7c49;
	font-family: inherit;
	resize: vertical;
}
.edit-area:focus {
	outline: none;
	border-color: #ae6139;
	box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.dialog-buttons {
	display: flex;
	justify-content: flex-end;
	flex-flow: row wrap;
	gap: 10px;
	margin-top: 10px;
}
.format-button {
	display: inline-block;
	background-color: #ae6139;
	cursor: pointer;
	border: 1px solid #fff;
	& {
		width: 24px;
		margin-left: 4px;
	}
	& img {
		max-width: 13px;
		max-height: 13px;
	}
	&:hover {
		background-color: #cb7c49;
	}
}
.emote-tabs {
	float: left;
	max-width: 70%;
	.new-tab {
		opacity: 0.3;
		&::after {
			background: none;
		}
		&.active,
		&:hover,
		&:focus {
			opacity: 1;
		}
	}
}
.emote-line {
	margin-top: -5px;
	border: 2px solid #fff;
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
}
</style>
