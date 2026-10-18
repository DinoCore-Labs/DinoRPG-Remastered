<template>
	<section class="mt-test" aria-label="Exploration des Cavernes Magnétiques">
		<header class="mt-test__header">
			<h2>Les Cavernes Magnétiques</h2>
			<p>Exploration expérimentale — cartes et graphismes d'origine Motion Twin</p>
			<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">← Revenir à la fiche du Dinoz</RouterLink>
		</header>

		<p v-if="errorMessage" class="mt-test__error" role="alert">{{ errorMessage }}</p>
		<p v-if="notice" class="mt-test__notice" role="status">{{ notice }}</p>
		<p v-if="loading && !session">Chargement du donjon…</p>

		<section v-if="!session && !loading" class="mt-test__panel">
			<p>Entre dans le donjon depuis les Pylônes de Magnétite avec un groupe disponible.</p>
			<p>Les conditions d'accès et la position des Dinoz sont vérifiées côté serveur.</p>
			<button type="button" :disabled="busy" @click="start">Entrer dans les Cavernes Magnétiques</button>
		</section>

		<template v-if="session">
			<p v-if="!isMagnetic" class="mt-test__notice">
				Ce Dinoz possède déjà une session {{ session.mapId }}. Cette page de test est réservée aux Cavernes Magnétiques.
			</p>
			<template v-else>
				<div class="mt-test__status">
					<span
						>Carte : <strong>{{ session.mapId }}</strong></span
					>
					<span>Étage : {{ stage + 1 }} / 4</span>
					<span>Case : {{ session.position.x }}, {{ session.position.y }}, {{ session.position.l }}</span>
					<span>Révision : {{ session.revision }}</span>
				</div>

				<div class="mt-test__viewport">
					<MtOriginalDungeonCanvas v-if="view" :scene="view.scene" />
					<div v-else class="mt-test__placeholder">Chargement de la vue…</div>
					<!-- Position only: this is explicitly NOT an archived Flash Dinoz sprite. -->
					<span v-if="view" class="mt-test__leader-marker" aria-label="Position du Dinoz (repère temporaire)">◆</span>
				</div>
				<p class="mt-test__caption">
					◆ : position du groupe (repère temporaire, non MT). Brouillard et géométrie issus de la session serveur.
				</p>

				<div class="mt-test__controls" aria-label="Déplacements dans le donjon">
					<div class="mt-test__arrows">
						<button type="button" aria-label="Nord" :disabled="cannotMove" @click="move('north')">↑</button>
						<div>
							<button type="button" aria-label="Ouest" :disabled="cannotMove" @click="move('west')">←</button>
							<button type="button" aria-label="Sud" :disabled="cannotMove" @click="move('south')">↓</button>
							<button type="button" aria-label="Est" :disabled="cannotMove" @click="move('east')">→</button>
						</div>
					</div>
					<div class="mt-test__stair-controls">
						<button type="button" :disabled="cannotMove || !stairDirections.includes('up')" @click="move('up')">
							Escalier ↑
						</button>
						<button type="button" :disabled="cannotMove || !stairDirections.includes('down')" @click="move('down')">
							Escalier ↓
						</button>
						<button type="button" :disabled="busy" @click="refresh">Actualiser</button>
					</div>
				</div>
				<p class="mt-test__caption">
					Clavier : flèches, ZQSD ou WASD. Un déplacement = une commande validée par le serveur.
				</p>

				<section v-if="session.pending" class="mt-test__panel" aria-live="polite">
					<h3>Interaction en attente : {{ session.pending.kind }}</h3>
					<p v-if="encounter?.text">{{ encounter.text }}</p>
					<p v-if="encounter?.status" class="mt-test__caption">État serveur : {{ encounter.status }}</p>
					<button
						v-if="session.pending.kind === 'scenario' && encounter?.kind === 'scenario'"
						type="button"
						:disabled="busy"
						@click="resolveScenario"
					>
						Lire / récupérer le coffre
					</button>
					<button
						v-if="
							session.pending.kind === 'scenario' &&
							encounter?.kind === 'scenario-combat' &&
							encounter.status === 'ready-for-combat'
						"
						type="button"
						:disabled="busy"
						@click="fight"
					>
						Combattre
					</button>
					<button
						v-if="session.pending.kind === 'boundary-exit' && stage < 3"
						type="button"
						:disabled="busy"
						@click="transition('forward')"
					>
						Passer à la carte suivante
					</button>
					<button
						v-if="session.pending.kind === 'boundary-start' && stage > 0"
						type="button"
						:disabled="busy"
						@click="transition('backward')"
					>
						Revenir à la carte précédente
					</button>
					<p v-if="!actionAvailable" class="mt-test__caption">
						Cette interaction n'est pas encore résoluble : aucun combat, soin, or ou passage extérieur n'est simulé. Le
						déplacement reste bloqué conformément à l'état serveur.
					</p>
				</section>

				<details v-if="view" class="mt-test__details">
					<summary>Diagnostics de fidélité</summary>
					<p>
						Sol et murs : PNG originaux ; sélection mt.Rand conservée. Bruit Perlin et acteur Flash encore non
						reproduits.
					</p>
					<p>Les régions inconnues et les événements cachés ne sont pas transmis par l'API de vue.</p>
				</details>
			</template>
		</template>
	</section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';
import { MtDungeonService, type MtDungeonCurrentView, type MtDungeonEncounter } from '../services/mtDungeon.service.js';
import { sessionStore } from '../store/sessionStore';
import { localStore } from '../store/localStore';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonCommand } from '@dinorpg/core/models/dungeon/dungeon.types.js';

const route = useRoute();
const router = useRouter();
const leaderId = Number(route.params.id);
const session = ref<MtDungeonSession | null>(null);
const view = ref<MtDungeonCurrentView | null>(null);
const encounter = ref<MtDungeonEncounter | null>(null);
const errorMessage = ref('');
const notice = ref('');
const loading = ref(true);
const busy = ref(false);
const stage = computed(() => Number(session.value?.mapId.split('_')[1] ?? 0));
const isMagnetic = computed(() => session.value?.mapId.startsWith('stepp_') ?? false);
const cannotMove = computed(
	() => busy.value || loading.value || !session.value || !!session.value.pending || session.value.locked
);
const language = computed(() =>
	String(localStore().getLanguage ?? 'fr')
		.toLowerCase()
		.slice(0, 2)
);
const stairDirections = computed(() => {
	if (!view.value || !session.value) return [] as string[];
	const here = session.value.position;
	// stepp is not a tower: View.updateArrows() maps door.up=false to UP, true to DOWN.
	return view.value.scene.features
		.filter(f => f.kind === 'stair' && f.x === here.x && f.y === here.y)
		.map(f => (f.kind === 'stair' ? (f.up ? 'down' : 'up') : ''));
});
const actionAvailable = computed(() => {
	const pending = session.value?.pending;
	if (!pending) return false;
	if (pending.kind === 'boundary-exit') return stage.value < 3;
	if (pending.kind === 'boundary-start') return stage.value > 0;
	if (pending.kind !== 'scenario') return false;
	return (
		encounter.value?.kind === 'scenario' ||
		(encounter.value?.kind === 'scenario-combat' && encounter.value.status === 'ready-for-combat')
	);
});

function formatError(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const code = (error.response?.data as { code?: string } | undefined)?.code;
		return code ? `Serveur : ${code}` : `Requête impossible (${error.response?.status ?? 'réseau'}).`;
	}
	return error instanceof Error ? error.message : 'Erreur inattendue.';
}

async function refresh(): Promise<void> {
	if (busy.value) return;
	loading.value = true;
	errorMessage.value = '';
	try {
		const current = await MtDungeonService.getSession(leaderId);
		session.value = current;
		if (current.mapId.startsWith('stepp_')) {
			view.value = await MtDungeonService.getView(leaderId);
			if (current.pending) {
				const result = await MtDungeonService.getEncounter(leaderId, language.value);
				encounter.value = result.encounter;
			} else encounter.value = null;
		} else {
			view.value = null;
			encounter.value = null;
		}
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			session.value = null;
			view.value = null;
			encounter.value = null;
		} else errorMessage.value = formatError(error);
	} finally {
		loading.value = false;
	}
}
async function afterMutation(next: MtDungeonSession): Promise<void> {
	session.value = next;
	view.value = await MtDungeonService.getView(leaderId);
	encounter.value = next.pending ? (await MtDungeonService.getEncounter(leaderId, language.value)).encounter : null;
}
async function execute(action: () => Promise<void>): Promise<void> {
	if (busy.value) return;
	busy.value = true;
	errorMessage.value = '';
	notice.value = '';
	try {
		await action();
	} catch (error) {
		const message = formatError(error);
		// Revisions can change in another browser tab. Never retry a write blindly.
		busy.value = false;
		await refresh();
		errorMessage.value = message;
		return;
	} finally {
		busy.value = false;
	}
}
function start() {
	void execute(async () => {
		await afterMutation(await MtDungeonService.startMagneticCaverns(leaderId));
		notice.value = 'Exploration initialisée sur la carte originale stepp_0.';
	});
}
function move(direction: 'north' | 'south' | 'west' | 'east' | 'up' | 'down') {
	if (cannotMove.value || !session.value) return;
	if ((direction === 'up' || direction === 'down') && !stairDirections.value.includes(direction)) return;
	void execute(async () => {
		const previous = session.value!;
		const offsets = {
			north: [0, -1, 0],
			south: [0, 1, 0],
			west: [-1, 0, 0],
			east: [1, 0, 0],
			up: [0, 0, -1],
			down: [0, 0, 1]
		} as const;
		const [dx, dy, dl] = offsets[direction];
		const command: DungeonCommand = { ...previous.position, dx, dy, dl };
		const result = await MtDungeonService.move(leaderId, previous.revision, command);
		if (!result.ok) {
			notice.value = 'Déplacement refusé par le serveur.';
			return;
		}
		await afterMutation(result.session);
	});
}
function transition(action: 'forward' | 'backward') {
	if (!session.value?.pending) return;
	void execute(async () => {
		await afterMutation(await MtDungeonService.transition(leaderId, session.value!.revision, action));
	});
}
function resolveScenario() {
	if (encounter.value?.kind !== 'scenario' || !session.value) return;
	void execute(async () => {
		const outcome = await MtDungeonService.resolveScenario(leaderId, session.value!.revision, language.value);
		await afterMutation(outcome.session);
		notice.value = outcome.message ?? 'Événement traité par le serveur.';
	});
}
function fight() {
	if (encounter.value?.kind !== 'scenario-combat' || encounter.value.status !== 'ready-for-combat' || !session.value)
		return;
	void execute(async () => {
		const { token } = await MtDungeonService.prepareFight(leaderId, session.value!.revision);
		const result = await MtDungeonService.resolveFight(leaderId, token);
		sessionStore().setFightResult(result);
		await router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });
	});
}
function onKeyDown(event: KeyboardEvent): void {
	if (event.altKey || event.ctrlKey || event.metaKey || cannotMove.value) return;
	const el = event.target;
	if (el instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(el.tagName)) return;
	const key = event.key.toLowerCase();
	const moveByKey: Record<string, 'north' | 'south' | 'west' | 'east'> = {
		arrowup: 'north',
		z: 'north',
		w: 'north',
		arrowdown: 'south',
		s: 'south',
		arrowleft: 'west',
		q: 'west',
		a: 'west',
		arrowright: 'east',
		d: 'east'
	};
	const direction = moveByKey[key];
	if (!direction) return;
	event.preventDefault();
	move(direction);
}
onMounted(() => {
	window.addEventListener('keydown', onKeyDown);
	void refresh();
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown));
</script>

<style scoped>
.mt-test {
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 0.65rem;
	width: 100%;
	max-width: 530px;
	margin: 0 auto 1rem;
	color: #37291b;
}
.mt-test__header {
	text-align: center;
}
.mt-test__header h2 {
	margin: 0.65rem 0 0.25rem;
	font-size: 1.3rem;
}
.mt-test__header p {
	font-size: 0.8rem;
	margin: 0.25rem 0 0.55rem;
}
.mt-test__status {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.4rem 0.85rem;
	font-size: 0.75rem;
}
.mt-test__viewport {
	position: relative;
	width: min(360px, 100%);
	aspect-ratio: 1;
	overflow: hidden;
	background: #3d3325;
	border: 5px solid #5f4123;
	box-shadow: inset 0 0 10px #201a13;
}
.mt-test__viewport :deep(.mt-dungeon-preview) {
	width: 100%;
	max-width: none;
}
.mt-test__viewport :deep(.mt-dungeon-preview__caption),
.mt-test__viewport :deep(.mt-dungeon-preview__diagnostics) {
	display: none;
}
.mt-test__leader-marker {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: #fff4ba;
	text-shadow:
		0 1px 4px #000,
		0 0 5px #000;
	font-size: 26px;
	pointer-events: none;
}
.mt-test__placeholder {
	text-align: center;
	padding-top: 40%;
}
.mt-test__controls {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	gap: 0.8rem;
}
.mt-test__arrows {
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 0.2rem;
}
.mt-test__arrows div {
	display: flex;
	gap: 0.2rem;
}
.mt-test__arrows button {
	width: 42px;
	height: 35px;
	font-size: 1.25rem;
}
.mt-test__stair-controls {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.mt-test button {
	cursor: pointer;
	padding: 0.4rem 0.7rem;
}
.mt-test button:disabled {
	cursor: not-allowed;
	opacity: 0.5;
}
.mt-test__caption {
	font-size: 0.72rem;
	line-height: 1.4;
	text-align: center;
	max-width: 360px;
	margin: 0;
}
.mt-test__panel {
	padding: 0.7rem 1rem;
	border: 1px solid #a38b6c;
	background: #efdfbd;
	width: min(360px, 100%);
	text-align: center;
}
.mt-test__panel h3 {
	margin: 0.3rem 0;
}
.mt-test__notice,
.mt-test__error {
	padding: 0.5rem;
	border: 1px solid #997452;
	width: min(360px, 100%);
	white-space: pre-wrap;
}
.mt-test__error {
	color: #a52112;
}
.mt-test__details {
	font-size: 0.75rem;
	max-width: 360px;
}
</style>
