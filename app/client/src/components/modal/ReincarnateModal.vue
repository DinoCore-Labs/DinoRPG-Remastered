<template>
	<div v-if="enabled" class="modal-background">
		<div class="modal-box">
			<button class="modal-close" @click="$emit('close')">{{ $t(`modal.close`) }}</button>
			<div class="details">
				<div class="choice">
					<div class="title">
						<p
							v-html="
								formatContent(
									$t('reincarnate.choice1.name', {
										price: Price,
										goldIcon: `<img src='${getImgURL('icons', 'small_gold')}' alt='gold'/>`
									})
								)
							"
						/>
					</div>
					<a class="button" @click="reincarnate(true)">{{ $t(`reincarnate.choice1.action`) }}</a>
					<p>
						{{ $t(`reincarnate.choice1.explanation`) }}
					</p>
					<ul>
						<li>{{ $t(`reincarnate.choice1.list1`) }}</li>
						<li>{{ $t(`reincarnate.choice1.list2`) }}</li>
					</ul>
					<p></p>
				</div>

				<div class="choice">
					<div class="title">
						<p v-html="formatContent($t(`reincarnate.choice2.name`))" />
					</div>
					<a class="button" @click="reincarnate(false)">{{ $t(`reincarnate.choice2.action`) }}</a>
					<p>
						{{ $t(`reincarnate.choice2.explanation`) }}
					</p>
					<ul>
						<li>{{ $t(`reincarnate.choice2.list1`) }}</li>
						<li>{{ $t(`reincarnate.choice2.list2`) }}</li>
					</ul>
					<p></p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { DinozService } from '../../services/index.js';
import { defineComponent, type PropType } from 'vue';
import { errorHandler } from '../../utils/errorHandler.js';
import eventBus from '../../events/index.js';
import { getImgURL } from '../../utils/getImgURL.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

export default defineComponent({
	name: 'Reincarnate',
	props: {
		enabled: Boolean,
		dinoz: {
			type: Object as PropType<DinozFiche>,
			required: true,
			default: 1
		}
	},
	computed: {
		Price(): number {
			return Math.round(this.dinoz.race.price * this.dinoz.level ** 0.5);
		}
	},
	methods: {
		async reincarnate(keepSeed: boolean): Promise<void> {
			const dinozId = parseInt(this.$route.params.id as string);

			const confirmFinal = await this.$confirm({
				header: this.$t('popup.attention'),
				message: this.$t('reincarnate.finalWarning'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject')
			});
			if (!confirmFinal) return;

			try {
				await DinozService.reincarnate(dinozId, keepSeed);
				this.$toast.open({
					message: this.$t('toast.reincarnation'),
					type: 'info'
				});

				await this.$refreshGold();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			eventBus.emit('refreshDinoz', true);
			this.$emit('close');
		}
	}
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
.choice {
	float: left;
	position: relative;
	width: 260px;
	height: 220px;
	padding: 5px;
	background-color: #bc683c;
	font-size: 10pt;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	.title {
		height: 34px;
		margin-bottom: 5px;
		color: #ffee92;
		font-size: 13pt;
		line-height: 11pt;
		border-bottom: 1px solid #ffee92;
		img {
			display: block;
			float: left;
			margin-right: 5px;
			position: relative;
		}
	}
	.button {
		position: absolute;
		margin-top: 130px;
	}
	ul {
		list-style: square;
		margin: 0px;
		padding: 0px;
		padding-left: 30px;
		color: #fce3bc;
	}
}
.details {
	margin-top: 10px;
	font-size: 0.65em;
	display: flex;
	gap: 40px;
	justify-content: space-around;
}
.modal-background {
	position: fixed;
	background: color.adjust(#09092d65, $alpha: 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	.modal-box {
		max-width: 600px;
		position: absolute;
		padding: 2em;
		font-size: 1.1em;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow:
			0 0 0 1px #aa885f,
			0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
	}
}
.modal-close {
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: color.adjust(brown, $alpha: -0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;
	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}
@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
@media (max-width: 699px) {
	.details {
		flex-direction: column;
		gap: 20px;
	}
}
</style>
