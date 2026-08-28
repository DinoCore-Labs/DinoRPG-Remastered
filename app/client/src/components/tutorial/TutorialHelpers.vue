<template>
	<Teleport to="body">
		<div
			v-for="helper in displayedHelpers"
			:key="helper.key"
			class="tutorial-helper"
			:class="`tutorial-helper--${helper.placement}`"
			:style="helper.style"
		>
			{{ t(helper.textKey) }}
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TutorialHelperResponse } from '../../services/tutorial.service';
import { dinozStore } from '../../store/dinozStore';
import { sessionStore } from '../../store/sessionStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { checkTutorialHelperCondition } from './tutorialHelperCondition';

type DisplayedHelper = {
	key: string;
	textKey: string;
	placement: 'top' | 'bottom';
	style: CSSProperties;
};

const tutorialStore = useTutorialStore();
const dStore = dinozStore();
const sStore = sessionStore();

const route = useRoute();
const { t, te } = useI18n();

const displayedHelpers = ref<DisplayedHelper[]>([]);

const objective = computed(() => tutorialStore.currentObjective);

const currentDinoz = computed(() => {
	const dinozId = dStore.getCurrentDinozId;
	if (dinozId === undefined) {
		return undefined;
	}
	return dStore.getDinoz(dinozId);
});

const currentTab = computed<string | null>(() => {
	switch (sStore.getTabDinoz) {
		case 1:
			return 'map';
		case 2:
			return 'inventory';
		case 3:
			return 'details';
		default:
			return null;
	}
});

function normalizePath(value: string): string {
	return value.replace(/^\/+|\/+$/g, '');
}

function escapeRegex(value: string): string {
	return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

function matchesUrl(pattern?: string): boolean {
	if (!pattern) {
		return true;
	}
	const currentPath = normalizePath(route.path);
	const normalizedPattern = normalizePath(pattern);
	const regexPattern = escapeRegex(normalizedPattern)
		.replace(/\*\*/g, '__DOUBLE_STAR__')
		.replace(/\*/g, '[^/]+')
		.replace(/__DOUBLE_STAR__/g, '.*');
	return new RegExp(`^${regexPattern}$`).test(currentPath);
}

function isVisibleElement(element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	const style = window.getComputedStyle(element);
	return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

function findTarget(selector: string): HTMLElement | null {
	try {
		const elements = document.querySelectorAll<HTMLElement>(selector);
		for (const element of elements) {
			if (isVisibleElement(element)) {
				return element;
			}
		}
	} catch {
		console.warn(`[tutorial] Invalid helper selector: ${selector}`);
	}
	return null;
}

function canDisplayHelper(helper: TutorialHelperResponse): boolean {
	if (!matchesUrl(helper.url)) {
		return false;
	}
	return checkTutorialHelperCondition(helper.cond, {
		tab: currentTab.value,
		life: currentDinoz.value?.life ?? null
	});
}

function positionHelper(helper: TutorialHelperResponse, target: HTMLElement): DisplayedHelper | null {
	const currentObjective = objective.value;
	if (!currentObjective) {
		return null;
	}
	const textKey = `tutorial.objectives.${currentObjective.id}.helpers.${helper.id}`;
	if (!te(textKey)) {
		return null;
	}
	const rect = target.getBoundingClientRect();
	const left = Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90);
	const placeBelow = rect.top < 80;
	return {
		key: `${currentObjective.id}:${helper.id}`,
		textKey,
		placement: placeBelow ? 'bottom' : 'top',
		style: {
			left: `${left}px`,
			top: placeBelow ? `${rect.bottom + 12}px` : `${rect.top - 12}px`
		}
	};
}

function refreshHelpers(): void {
	const currentObjective = objective.value;
	if (!currentObjective || tutorialStore.tutorial?.completed) {
		displayedHelpers.value = [];
		return;
	}
	const helpers: DisplayedHelper[] = [];
	for (const helper of currentObjective.helpers) {
		if (!canDisplayHelper(helper)) {
			continue;
		}
		const target = findTarget(helper.selector);
		if (!target) {
			continue;
		}
		const displayed = positionHelper(helper, target);
		if (displayed) {
			helpers.push(displayed);
		}
	}
	displayedHelpers.value = helpers;
}

let animationFrame: number | null = null;

function scheduleRefresh(): void {
	if (animationFrame !== null) {
		cancelAnimationFrame(animationFrame);
	}
	animationFrame = requestAnimationFrame(() => {
		animationFrame = null;
		void nextTick(() => {
			refreshHelpers();
		});
	});
}

let observer: MutationObserver | null = null;

watch(
	() => objective.value,
	() => scheduleRefresh(),
	{ deep: true }
);

watch(
	() => route.fullPath,
	() => scheduleRefresh()
);

watch(
	() => sStore.getTabDinoz,
	() => scheduleRefresh()
);

watch(
	() => currentDinoz.value?.life,
	() => scheduleRefresh()
);

onMounted(() => {
	scheduleRefresh();
	const root = document.querySelector('.mainpage') ?? document.body;
	observer = new MutationObserver(() => {
		scheduleRefresh();
	});
	observer.observe(root, {
		childList: true,
		subtree: true,
		attributes: true
	});
	window.addEventListener('resize', scheduleRefresh);
	window.addEventListener('scroll', scheduleRefresh, true);
});

onBeforeUnmount(() => {
	observer?.disconnect();
	if (animationFrame !== null) {
		cancelAnimationFrame(animationFrame);
	}
	window.removeEventListener('resize', scheduleRefresh);
	window.removeEventListener('scroll', scheduleRefresh, true);
});
</script>

<style scoped>
.tutorial-helper {
	position: fixed;
	z-index: 10000;
	max-width: 180px;
	padding: 7px 10px;
	border: 1px solid #9f5841;
	border-radius: 5px;
	background: #fff0bd;
	color: #7b321c;
	font-size: 12px;
	font-weight: 700;
	line-height: 1.25;
	text-align: center;
	pointer-events: none;
	box-shadow: 0 2px 4px rgb(0 0 0 / 25%);
}
.tutorial-helper--top {
	transform: translate(-50%, -100%);
}
.tutorial-helper--top::after {
	position: absolute;
	top: 100%;
	left: 50%;
	width: 0;
	height: 0;
	border: 7px solid transparent;
	border-top-color: #9f5841;
	content: '';
	transform: translateX(-50%);
}
.tutorial-helper--bottom {
	transform: translateX(-50%);
}
.tutorial-helper--bottom::after {
	position: absolute;
	bottom: 100%;
	left: 50%;
	width: 0;
	height: 0;
	border: 7px solid transparent;
	border-bottom-color: #9f5841;
	content: '';
	transform: translateX(-50%);
}
</style>
