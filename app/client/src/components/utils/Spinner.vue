<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useLoadingStore } from '../../store/loadingStore';

const { isOn } = storeToRefs(useLoadingStore());
</script>

<template>
	<div v-show="isOn" class="spinner_overlay">
		<div class="loader">
			<div class="inner one"></div>
			<div class="inner two"></div>
			<div class="inner three"></div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.loader {
	position: absolute;
	top: calc(50% - 32px);
	left: calc(50% - 32px);
	width: 64px;
	height: 64px;
	border-radius: 50%;
	perspective: 800px;
}
.inner {
	position: absolute;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
.one {
	left: 0%;
	top: 0%;
	animation: rotate-one 1s linear infinite;
	border-bottom: 3px solid #efeffa;
}
.two {
	right: 0%;
	top: 0%;
	animation: rotate-two 1s linear infinite;
	border-right: 3px solid #efeffa;
}
.three {
	right: 0%;
	bottom: 0%;
	animation: rotate-three 1s linear infinite;
	border-top: 3px solid #efeffa;
}
.spinner_overlay {
	//dark background
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
	background-color: rgba(15, 15, 67, 0.6);
	z-index: 100;
}
@keyframes rotate-one {
	0% {
		transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
	}
	100% {
		transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
	}
}
@keyframes rotate-two {
	0% {
		transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
	}
	100% {
		transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
	}
}
@keyframes rotate-three {
	0% {
		transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
	}
	100% {
		transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
	}
}
</style>
