<template>
	<div v-if="visible" class="simple-confirm-dialog-mask" @click="rejectDialog">
		<div class="simple-confirm-dialog dz-box" @click.stop>
			<header class="simple-confirm-dialog-header">
				<h3 class="simple-confirm-dialog-title">{{ header }}</h3>
				<img
					class="simple-confirm-dialog-close"
					:src="getImgURL('icons', 'small_delete')"
					alt="close"
					@click="rejectDialog"
				/>
			</header>

			<section class="simple-confirm-dialog-content">
				<i v-if="icon" :class="icon" class="simple-confirm-dialog-icon"></i>
				<p class="simple-confirm-dialog-message">{{ message }}</p>
			</section>

			<footer class="simple-confirm-dialog-footer">
				<DZButton class="btn btn-reject" @click="rejectDialog">
					<div class="btn-content">
						<img :src="getImgURL('icons', 'small_delete')" alt="delete" />
						<span>{{ rejectLabel }}</span>
					</div>
				</DZButton>
				<DZButton class="btn btn-accept" @click="acceptDialog" @keydown.enter="acceptDialog">
					<div class="btn-content">
						<img :src="getImgURL('icons', 'small_right')" alt="right" />
						<span>{{ acceptLabel }}</span>
					</div>
				</DZButton>
			</footer>
		</div>
	</div>
</template>

<script lang="ts">
import { getImgURL } from '../../utils/getImgURL';
import DZButton from './DZButton.vue';
export default {
	components: {
		DZButton
	},
	name: 'DZConfirmDialog',
	emits: [
		'update:visible', // Pour le support de v-model:visible
		'confirm', // Quand l'utilisateur confirme
		'reject' // Quand l'utilisateur annule
	],
	data() {
		return {
			isDialogOpen: false,
			currentMessage: '',
			currentHeader: '',
			// Stocker les fonctions de callback pour l'acceptation et le rejet
			resolveCallback: null,
			rejectCallback: null
		};
	},
	props: {
		visible: Boolean,
		header: String,
		message: String,
		icon: String,
		acceptLabel: String,
		rejectLabel: String,
		onConfirm: Function,
		onReject: Function
	},
	methods: {
		acceptDialog() {
			if (this.onConfirm) {
				this.onConfirm();
			}
		},
		rejectDialog() {
			if (this.onReject) {
				this.onReject();
			}
		},
		getImgURL
	}
};
</script>

<style scoped>
.simple-confirm-dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}
.simple-confirm-dialog {
	width: 90%;
	max-width: 400px;
	overflow: hidden;
}
.simple-confirm-dialog-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-left: 24px;
	padding-right: 6px;
	margin-top: -12px;
}
.simple-confirm-dialog-close {
	cursor: pointer;
}
.simple-confirm-dialog-content {
	padding: 1rem;
	display: flex;
	align-items: center;
	gap: 1rem;
	color: #fdf1c4;
}
.simple-confirm-dialog-icon {
	font-size: 1.5rem;
	color: orange;
}
.simple-confirm-dialog-footer {
	padding: 1rem;
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
}
.btn-content {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
</style>
