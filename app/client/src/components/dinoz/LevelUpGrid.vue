<template>
	<div class="container" ref="grid">
		<template v-for="(cell, index) in levelUpGrid" :key="index">
			<div class="box" :class="isSelected(index) && isSpinning ? 'active' : ''">
				<img :src="getImgURL('elements', `elem_${cell}`)" :alt="cell" :id="index.toString()" />
				<div class="effect" v-if="isSelected(index) && isSpinOver">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { userStore } from '../../store/userStore';

export default defineComponent({
	name: 'LevelUpGrid',
	props: {
		grid: {
			type: Object as PropType<{
				fire: number;
				wood: number;
				water: number;
				lightning: number;
				air: number;
			}>,
			required: true
		},
		element: { type: Number, required: true }
	},
	data() {
		return {
			levelUpGrid: [] as Array<string>,
			selectedIndex: -1 as number,
			increment: 0 as number,
			isSpinOver: false as boolean,
			speed: 50 as number,
			isSpinning: false as boolean,
			userStore: userStore()
		};
	},
	computed: {
		isSelected(): { (cellIndex: number): boolean } {
			return (cellIndex: number) => {
				return this.increment % 20 === cellIndex;
			};
		}
	},
	methods: {
		spin(duration = 4000) {
			// Durée totale de 4 secondes par défaut
			this.isSpinning = true;
			this.isSpinOver = false;
			this.increment = 0;
			// Points de transition en % de progression
			// (début rapide, ralentissement progressif)
			const phases = [0.2, 0.4, 0.6, 0.75, 0.9, 1] as const;
			// Facteurs de vitesse: élevés au début (rapide),
			// puis diminuant progressivement (ralentissement)
			const speeds = [2, 1.5, 1.3, 1.0, 0.7, 0.3] as const;
			const totalSteps = 80 + this.selectedIndex;
			const baseSpeed = duration / totalSteps;
			const spinStep = () => {
				if (this.isSpinOver) return;
				// Détermine la phase actuelle
				const progress = this.increment / totalSteps;
				// Trouve la 1ère phase dont progress est inférieur au seuil
				let phaseIndex = phases.findIndex(p => progress < p);
				// Si on a dépassé toutes les phases, on prend la dernière
				if (phaseIndex === -1) phaseIndex = phases.length - 1;
				const speedFactor = speeds[phaseIndex] ?? 0.3;
				this.speed = baseSpeed / speedFactor;
				setTimeout(() => {
					this.increment++;
					// Vérifie si l'animation est terminée
					if (this.increment >= totalSteps) {
						this.isSpinOver = true;
						this.$emit('spinOver');
						return;
					}
					spinStep();
				}, this.speed);
			};
			spinStep();
		}
	},
	mounted(): void {
		const fire = new Array(this.grid.fire).fill('fire');
		const wood = new Array(this.grid.wood).fill('wood');
		const water = new Array(this.grid.water).fill('water');
		const lightning = new Array(this.grid.lightning).fill('lightning');
		const air = new Array(this.grid.air).fill('air');

		this.levelUpGrid = this.levelUpGrid.concat(fire).concat(wood).concat(water).concat(lightning).concat(air);

		const target = ElementType[this.element]?.toLowerCase();
		const selectElement = this.levelUpGrid.reduce((a: number[], e: string, i: number) => {
			if (target && e === target) a.push(i);
			return a;
		}, []);
		const randomIdx = Math.floor(Math.random() * selectElement.length);
		this.selectedIndex = selectElement[randomIdx] ?? 0;
		this.isSpinning = !this.isSpinning;
		/*if (this.userStore.getPlayerOptions.skipLevel) {
			this.increment = this.selectedIndex;
			this.isSpinning = false;
			this.isSpinOver = true;
			this.$emit('spinOver');
		} else {*/
		this.spin();
		//}
	}
});
</script>

<style lang="scss" scoped>
.container {
	width: 50%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	cursor: pointer;
}
.box {
	position: relative;
	width: 30px;
	height: 30px;
	margin: 0.15em;
	border: 2px solid #cb8354;
	border-radius: 4px;
	background: linear-gradient(180deg, #4f250d 0%, #a75532 10%, #cb8354 100%);
	box-shadow: 1px 3px 1px #622c0d;
	img {
		margin-top: 5px;
	}
}
.active {
	position: relative;
	z-index: 10;
	transform-style: preserve-3d;
	&:after {
		content: '';
		display: block;
		opacity: 1;
		position: absolute;
		top: -2px;
		left: -2px;
		width: 30px;
		height: 30px;
		border: 2px solid white;
		border-radius: 4px;
		box-shadow:
			0 0 6px white,
			0 0 12px white,
			0 0 16px white,
			0 0 6px 4px inset white;
	}
}
@keyframes fadeIn {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
.effect {
	transform: translateZ(-100px);
	top: -7px;
	left: -36px;
	right: 0;
	bottom: 0;
	position: absolute;
	z-index: 9;
	opacity: 1;
	width: 100px;
	height: 50px;
	div {
		position: absolute;
		width: 100px;
		height: 50px;
		background: rgb(255, 255, 255);
		background: radial-gradient(circle, rgba(255, 255, 255, 1) 10%, rgba(255, 255, 255, 0.2) 100%);
		border-radius: 50%;
		filter: blur(10px);
		animation-duration: 6s;
		animation-timing-function: cubic-bezier(0.25, 0, 0.75, 1);
		animation-iteration-count: infinite;
		animation-direction: alternate;
		&:nth-child(1) {
			animation-name: glow1;
			animation-duration: 8s;
		}
		&:nth-child(2) {
			animation-name: glow2;
			animation-duration: 12s;
		}
		&:nth-child(3) {
			animation-name: glow3;
			animation-duration: 16s;
		}
		&:nth-child(4) {
			animation-name: rev-glow1;
			animation-duration: 16s;
		}
		&:nth-child(5) {
			animation-name: rev-glow2;
			animation-duration: 12s;
		}
		&:nth-child(6) {
			animation-name: rev-glow3;
			animation-duration: 8s;
		}
	}
}
@keyframes glow1 {
	from {
		transform: rotate(65deg) scale(1.6, 0.3);
	}
	to {
		transform: rotate(245deg) scale(1.6, 0.3);
	}
}
@keyframes glow2 {
	from {
		transform: rotate(125deg) scale(1.3, 0.3);
	}
	to {
		transform: rotate(305deg) scale(1.3, 0.3);
	}
}
@keyframes glow3 {
	from {
		transform: rotate(15deg) scale(1.5, 0.3);
	}
	to {
		transform: rotate(195deg) scale(1.5, 0.3);
	}
}
@keyframes rev-glow1 {
	from {
		transform: rotate(105deg) scale(1.6, 0.3);
	}
	to {
		transform: rotate(-75deg) scale(1.6, 0.3);
	}
}
@keyframes rev-glow2 {
	from {
		transform: rotate(40deg) scale(1.3, 0.3);
	}
	to {
		transform: rotate(-140deg) scale(1.3, 0.3);
	}
}
@keyframes rev-glow3 {
	from {
		transform: rotate(170deg) scale(1.5, 0.3);
	}
	to {
		transform: rotate(-10deg) scale(1.5, 0.3);
	}
}
</style>
