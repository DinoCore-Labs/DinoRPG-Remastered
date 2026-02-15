<template>
	<div
		class="map_container"
		ref="container"
		@touchstart="touchStart($event)"
		@touchmove="drag($event)"
		@mousemove="isMouseDevice ? parallax($event) : null"
	>
		<div
			v-if="mapReady"
			class="full_map"
			:style="{
				left: `${-(left ?? 0)}px`,
				top: `${-(top ?? 0)}px`,
				position: 'relative',
				float: 'left',
				transform: `translateX(${-translation.x}px)translateY(${-translation.y}px)`
			}"
		>
			<template v-for="(place, index) in placeMap" :key="index">
				<img
					class="icon"
					:class="{
						myPos: myPos(place.placeId),
						canGo: canGo(place.placeId)
					}"
					:src="getImgURL('map/icon', place.icon)"
					:alt="place.icon"
					:style="{ left: place.posLeft + 'px', top: place.posTop + 'px' }"
					@click="moveTo(place.placeId)"
					@mouseenter="isHover(place.name, place.placeId, true)"
					@mouseleave="isHover(place.name, place.placeId, false)"
					v-tippy="{
						content: formatContent($t(`place.name.${place.name}`)),
						theme: 'small'
					}"
				/>
				<template v-if="place.placeId === PlaceEnum.MARAIS_COLLANT && showFloodedSwamp">
					<div class="flooded-swamp" :style="{ left: place.posLeft - 4 + 'px', top: place.posTop - 30 + 'px' }">
						<img
							:src="getImgURL('icons', 'act_move')"
							alt="flooded swamp"
							v-tippy="{
								content: formatContent($t(`place.hint.marais.flooded`)),
								theme: 'small'
							}"
						/>
					</div>
				</template>
				<template v-if="place.placeId === PlaceEnum.MARAIS_COLLANT && showFoggedSwamp">
					<div class="foggy-swamp" :style="{ left: place.posLeft - 4 + 'px', top: place.posTop - 30 + 'px' }">
						<img
							:src="getImgURL('icons', 'act_fight')"
							alt="flooded swamp"
							v-tippy="{
								content: formatContent($t(`place.hint.marais.foggy`)),
								theme: 'small'
							}"
						/>
					</div>
				</template>
			</template>
			<svg
				version="1.1"
				width="100%"
				height="100%"
				:viewBox="svgSize"
				xmlns="http://www.w3.org/2000/svg"
				style="z-index: 100; position: absolute"
				id="svgDraw"
			>
				<template v-for="line in svgLines">
					<line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" :id="line.name" class="svgLine" />
				</template>
			</svg>
			<img class="map-img" ref="carte" :src="getImgURL('map/map', getPlaceMap() ?? '')" :alt="getPlaceMap()" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { placeList } from '../../constants/place.js';
import type { PlaceDisplayed } from '@dinorpg/core/models/place/placeDisplayed.js';
import type { svgLines } from '@dinorpg/core/models/place/svgLines.js';
import { dinozStore } from '../../store/dinozStore.js';
import { sessionStore } from '../../store/sessionStore.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
//import { UnavailableReason } from '@drpg/prisma/enums';
//import { formatText } from '../../utils/formatText.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { SWAMP_FLOODED_DAYS, SWAMP_FOG_DAYS } from '@dinorpg/core/models/place/placeList.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { formatText } from '../../utils/formatText.js';
import { DinozService } from '../../services/dinoz.service.js';

export default defineComponent({
	name: 'WorldMap',
	props: {
		dinozData: { type: Object as PropType<DinozFiche>, required: true }
	},
	data() {
		return {
			sessionStore: sessionStore(),
			dinozStore: dinozStore(),
			placeMap: [] as Array<PlaceDisplayed>,
			translation: {
				x: 0,
				y: 0
			},
			left: 0,
			top: 0,
			svgLines: [] as Array<svgLines>,
			svgSize: undefined as string | undefined,
			mapReady: false as boolean,
			lastTouch: { x: 0, y: 0 },
			containerRect: undefined as DOMRect | undefined,
			mapImageRect: undefined as DOMRect | undefined,
			PlaceEnum,
			DinozStatusId
		};
	},
	methods: {
		parallax(e: MouseEvent) {
			const rect = document.querySelector('.map_container')?.getBoundingClientRect(); //taille du wrapper (250*300)
			const mapImage = document.querySelector('.full_map')?.getBoundingClientRect(); //taille de l'image de la map
			if (!rect || !mapImage) {
				return;
			}
			const xFactor = placeList.find(place => place.placeId === this.dinozData.placeId)?.xFactor ?? 1;
			const yFactor = placeList.find(place => place.placeId === this.dinozData.placeId)?.yFactor ?? 1;
			const centerMapY = mapImage.height - rect.height;
			const centerMapX = mapImage.width - rect.width;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			this.translation.x = Math.floor((-1 * (centerX - mouseX)) / xFactor);
			this.translation.y = Math.floor((-1 * (centerY - mouseY)) / yFactor);
			// Protect the translation top overflow
			if (this.top + this.translation.y < 0) {
				this.translation.y = -this.top;
			} else if (this.top + this.translation.y > centerMapY) {
				this.translation.y = 0;
			}
			// Protect the translation left overflow
			if (this.left + this.translation.x < 0) {
				this.translation.x = -this.left;
			} else if (this.left + this.translation.x > centerMapX) {
				this.translation.x = 0;
			}
		},
		touchStart(e: TouchEvent) {
			if (!this.mapImageRect) this.mapImageRect = document.querySelector('.full_map')?.getBoundingClientRect(); //taille de l'image de la map
			if (e.targetTouches && e.targetTouches[0]) {
				this.lastTouch = { x: e.targetTouches[0].pageX, y: e.targetTouches[0].pageY };
			}
		},
		drag(e: TouchEvent) {
			if (this.mapImageRect && this.containerRect && e.targetTouches && e.targetTouches[0]) {
				e.preventDefault();
				const newTouch = { x: e.targetTouches[0].pageX, y: e.targetTouches[0].pageY };
				this.translation.x -= newTouch.x - this.lastTouch.x;
				this.translation.y -= newTouch.y - this.lastTouch.y;
				this.lastTouch = newTouch;
				// Protect the translation top overflow
				if (this.top + this.translation.y < 0) {
					this.translation.y = -this.top;
				} else if (this.mapImageRect.height - this.containerRect.height - this.top < this.translation.y) {
					this.translation.y = this.mapImageRect.height - this.containerRect.height - this.top;
				}
				// Protect the translation left overflow
				if (this.left + this.translation.x < 0) {
					this.translation.x = -this.left;
				} else if (this.mapImageRect.width - this.containerRect.width - this.left < this.translation.x) {
					this.translation.x = this.mapImageRect.width - this.containerRect.width - this.left;
				}
			}
		},
		getPlaceMap() {
			return placeList.find(place => place.placeId === this.dinozData.placeId)?.map;
		},
		centerPos(mapImage: DOMRect) {
			const rect = document.querySelector('.map_container')?.getBoundingClientRect(); // taille du wrapper (250*300)
			if (!rect) {
				return;
			}
			let centerMapY: number = mapImage.height - rect.height;
			let centerMapX: number = mapImage.width - rect.width;
			const boxMap = document.getElementById('boxMap') as HTMLDivElement;
			if (boxMap && centerMapX < 0) {
				boxMap.style.width = mapImage.width + 'px';
				centerMapX = 0;
			}
			if (boxMap && centerMapY < 0) {
				boxMap.style.height = mapImage.height + 'px';
				centerMapY = 0;
			}
			const centerX: number = rect.width / 2;
			const centerY: number = rect.height / 2;
			const actualPlace = placeList.find(place => place.placeId === this.dinozData.placeId);
			this.left = (actualPlace?.posLeft ?? 0) - centerX;
			this.top = (actualPlace?.posTop ?? 0) - centerY;
			// Protect the initial top overflow
			if (this.top + this.translation.y < 0) {
				this.top = 0;
			} else if (this.top + this.translation.y > centerMapY) {
				this.top = centerMapY;
			}
			// Protect the initial left overflow
			if (this.left + this.translation.x < 0) {
				this.left = 0;
			} else if (this.left + this.translation.x > centerMapX) {
				this.left = centerMapX;
			}
		},
		async moveTo(placeId: number): Promise<void> {
			if (!this.dinozData.borderPlace?.includes(placeId)) {
				return;
			}

			// Check if dinoz is being sold
			/*if (this.dinozData.unavailableReason === UnavailableReason.selling) {
				this.$toast.open({ message: formatText(this.$t(`toast.isSelling`)), type: 'error' });
				return;
			}*/

			try {
				const moveTry = await DinozService.move(this.dinozData.id, placeId);
				this.sessionStore.setFightResult(moveTry);
				// Update Dinoz Place in the store if fight is win
				const dinozId = this.dinozData.id;
				const dinozList = this.dinozStore.getDinozList;
				const place = placeList.find(place => place.placeId === placeId);

				if (!dinozList || !dinozId || !place) {
					this.$toast.open({
						message: formatText(this.$t(`toast.missingData`)),
						type: 'error'
					});

					return;
				}

				if (moveTry.result) {
					this.dinozStore.setDinozList(
						dinozList.map(dinoz => {
							if (dinoz.id === dinozId || dinoz.leaderId === dinozId) {
								//this.dinozStore.clearNpc(dinoz.id);
								if (dinoz.life !== 0) {
									// Update dinoz place
									dinoz.placeId = place.alias || placeId;

									// Update dinoz HP
									dinoz.life -= moveTry.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
								} else {
									//Remove dead dinoz from the party
									dinoz.leaderId = null;
								}
							}
							return dinoz;
						})
					);
				}
				this.$router.push({
					name: 'FightPage',
					params: { dinozId: this.dinozData.id?.toString() }
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		myPos(placeId: number): boolean {
			return placeId === this.dinozData.placeId;
		},
		canGo(placeId: number): boolean {
			return this.dinozData.borderPlace?.includes(placeId) ?? false;
		},
		svgMagic(mapImage: DOMRect): void {
			let mapX = 0;
			let mapY = 0;
			if (mapImage.height > mapImage.width) {
				this.svgSize = `0 0 ${(mapImage.width / mapImage.height) * 100} 100`;
				mapY = 100;
				mapX = (mapImage.width / mapImage.height) * 100;
			} else {
				this.svgSize = `0 0 100 ${(mapImage.height / mapImage.width) * 100}`;
				mapY = (mapImage.height / mapImage.width) * 100;
				mapX = 100;
			}
			const actualPlace: PlaceDisplayed | undefined = placeList.find(place => place.placeId === this.dinozData.placeId);
			const x1 = (((actualPlace?.posLeft ?? 0) + 8.5) / mapImage.width) * mapX;
			const y1 = (((actualPlace?.posTop ?? 0) + 8.5) / mapImage.height) * mapY;
			this.dinozData.borderPlace?.forEach(closePlace => {
				const place = placeList.find(place => place.placeId === closePlace);
				const x2: number = (((place?.posLeft ?? 0) + 8.5) / mapImage.width) * mapX;
				const y2: number = (((place?.posTop ?? 0) + 8.5) / mapImage.height) * mapY;
				this.svgLines.push({ x1, y1, x2, y2, name: place?.name ?? '' });
			});
		},
		isHover(placeName: string, placeId: number, state: boolean): void {
			const line: Element | null = document.querySelector(`#${placeName}`);
			if (this.canGo(placeId)) {
				state ? line?.classList.add('isHover') : line?.classList.remove('isHover');
			}
		},
		waitForImageToLoad(): void {
			const img = new Image();
			const map = placeList.find(p => p.placeId === this.dinozData.placeId)?.map;
			img.src = this.getImgURL('map/map', map ?? '');
			//console.log(img);
			img.onload = () => {
				// We only keep places that belong to the current map and places that dinoz can reach (useful for hidden ones)
				this.placeMap = placeList.filter(
					place =>
						place.map === map &&
						(!place.hidden ||
							this.dinozData.borderPlace?.includes(place.placeId) ||
							place.placeId === this.dinozData.placeId)
				);
				const mapImage = { width: img.naturalWidth, height: img.naturalHeight } as DOMRect;
				this.centerPos(mapImage);
				this.svgMagic(mapImage);
				this.mapReady = true;
			};
		}
	},
	computed: {
		isMouseDevice() {
			return window.matchMedia('(pointer:fine)').matches;
		},
		showFloodedSwamp() {
			if (!this.dinozData.status.some(status => status.statusId === DinozStatusId.SWAMP_BUOY)) {
				return false;
			}
			const day = new Date().getDay();
			if (!SWAMP_FLOODED_DAYS.includes(day)) {
				return false;
			}
			return true;
		},
		showFoggedSwamp() {
			if (!this.dinozData.status.some(status => status.statusId === DinozStatusId.SWAMP_LANTERN)) {
				return false;
			}
			const day = new Date().getDay();
			if (!SWAMP_FOG_DAYS.includes(day)) {
				return false;
			}
			return true;
		}
	},
	mounted(): void {
		this.containerRect = document.querySelector('.map_container')?.getBoundingClientRect(); //taille du wrapper (250*300)
		this.waitForImageToLoad();
	},
	watch: {
		'dinozData.borderPlace'() {
			this.waitForImageToLoad();
		}
	}
});
</script>

<style lang="scss" scoped>
.map_container {
	height: 250px;
	overflow: hidden;
	position: relative;
}
.full_map {
	position: relative;
	width: fit-content;
	height: auto;
	transition:
		top 1s,
		left 1s;
	pointer-events: none;
}
.myPos {
	filter: drop-shadow(1px 1px 2px white) drop-shadow(-1px -1px 2px white);
}
.canGo {
	cursor: pointer;
	z-index: 500 !important;
}
.imgHidden {
	display: none;
}
.icon {
	position: absolute;
	pointer-events: auto;
	z-index: 200;
	&:hover {
		animation: blinker 1s linear infinite;
		filter: drop-shadow(0 0 2px white);
	}
}
.isHover {
	stroke-dasharray: 1;
	animation: svgAnime 20s linear infinite;
}
.svgLine {
	stroke: gray;
	stroke-width: 1px;
}
.flooded-swamp,
.foggy-swamp {
	position: absolute;
	width: 24px;
	font-size: 0;
	z-index: 200;
	pointer-events: auto;
	img {
		width: 24px;
		height: 24px;
	}
	&::before,
	&::after {
		content: '';
		position: absolute;
		background-color: red;
		width: 100%;
		height: 2px;
		top: 50%;
		left: 0;
		transform-origin: center;
		pointer-events: none;
	}
	&::before {
		transform: translateY(-50%) rotate(45deg);
	}
	&::after {
		transform: translateY(-50%) rotate(-45deg);
	}
}
@keyframes blinker {
	50% {
		filter: brightness(150%) drop-shadow(0 0 2px white);
	}
}
@keyframes svgAnime {
	0% {
		stroke-dashoffset: 100;
	}
	100% {
		stroke-dashoffset: 0;
	}
}
</style>
