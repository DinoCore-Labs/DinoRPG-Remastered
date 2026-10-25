<template>
	<section class="mt-test" aria-label="Exploration des Cavernes Magnétiques">
		<!-- STEP_20O_MT_DUNGEON: original eight-piece Motion Twin message box. -->
		<MtDungeonMessageBox
			v-if="activeMessage"
			:title="activeMessage.title"
			:text="activeMessage.text"
			:confirm-label="activeMessage.confirmLabel"
			:cancel-label="activeMessage.cancelLabel"
			:busy="busy"
			@confirm="confirmMessage"
			@close="closeMessage"
		/>
		<header class="mt-test__header">
			<h2>Les Cavernes Magnétiques</h2>
			<p>Exploration des cartes et graphismes d'origine Motion Twin</p>
			<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">← Revenir à la fiche du Dinoz</RouterLink>
		</header>

		<p v-if="errorMessage" class="mt-test__error" role="alert">{{ errorMessage }}</p>
		<p v-if="notice" class="mt-test__notice" role="status">{{ notice }}</p>
		<p v-if="loading && !session">Chargement du donjon…</p>

		<section v-if="!session && !loading && !exitOutcome" class="mt-test__panel">
			<p>Entre dans le donjon depuis les Pylônes de Magnétite avec un groupe disponible.</p>
			<p>Les conditions d'accès et la position des Dinoz sont vérifiées côté serveur.</p>
			<button type="button" :disabled="busy" @click="start">Entrer dans les Cavernes Magnétiques</button>
		</section>

		<section v-if="exitOutcome" class="mt-test__panel" aria-live="polite">
			<h3>{{ exitOutcome.kind === 'complete' ? 'Donjon terminé' : 'Retour à la surface' }}</h3>
			<p>{{ exitOutcome.text }}</p>
			<p class="mt-test__caption">
				Votre progression a été sauvegardée. Aucune récompense de fin supplémentaire n'est attribuée.
			</p>
			<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Retour à la fiche du Dinoz</RouterLink>
		</section>

		<template v-if="session">
			<p v-if="!isMagnetic" class="mt-test__notice">
				Ce Dinoz possède déjà une session {{ session.mapId }}. Cette page de test est réservée aux Cavernes Magnétiques.
			</p>
			<template v-else>
				<details class="mt-test__status">
					<summary>Informations sur l'exploration</summary>
					<span
						>Carte : <strong>{{ session.mapId }}</strong></span
					>
					<span>Étage : {{ stage + 1 }} / 4</span>
					<span>Case : {{ session.position.x }}, {{ session.position.y }}, {{ session.position.l }}</span>
					<span>Révision : {{ session.revision }}</span>
					<span>Clés MT récupérées : {{ session.keys.filter(Boolean).length }}</span>
				</details>

				<section v-if="partyDefeated || partyLeaderDead" class="mt-test__panel" aria-live="polite">
					<p v-if="partyDefeated">
						Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.
					</p>
					<p v-else>Le chef du groupe est KO : évacuation nécessaire avant de reprendre l’exploration.</p>
					<button type="button" :disabled="busy" @click="evacuateDefeated">Évacuer le groupe KO</button>
				</section>

				<div class="mt-test__viewport">
					<MtOriginalDungeonCanvas
						v-if="view"
						:scene="view.scene"
						:guardians="view.guardianSprites ?? []"
						:stage-key="session.mapId"
						:actors="visualParty"
						:facing-right="facingRight"
						:show-unverified-same-name-overlays="true"
					/>
					<div v-else class="mt-test__placeholder">Chargement de la vue…</div>
					<div
						v-if="view && !partyDefeated"
						class="mt-test__original-controls"
						aria-label="Commandes originales du donjon"
					>
						<button
							v-if="partyNeedsIrma"
							class="mt-test__original-irma"
							type="button"
							:disabled="busy || !partyActionsLoaded"
							aria-label="Utiliser Irma pour restaurer les actions du groupe"
							title="Restaurer les actions du groupe"
							@click="restoreDungeonActions"
						>
							<img src="/dungeon/mt/interf_irma.png" alt="Potion d'Irma" />
						</button>
						<template v-else>
							<button
								class="mt-test__original-dir mt-test__original-up"
								type="button"
								:disabled="cannotMove"
								aria-label="Nord"
								@click="move('north')"
							>
								<img src="/dungeon/mt/interf_arrow.png" alt="" />
							</button>
							<button
								class="mt-test__original-dir mt-test__original-left"
								type="button"
								:disabled="cannotMove"
								aria-label="Ouest"
								@click="move('west')"
							>
								<img src="/dungeon/mt/interf_arrow.png" alt="" />
							</button>
							<button
								class="mt-test__original-dir mt-test__original-right"
								type="button"
								:disabled="cannotMove"
								aria-label="Est"
								@click="move('east')"
							>
								<img src="/dungeon/mt/interf_arrow.png" alt="" />
							</button>
							<button
								class="mt-test__original-dir mt-test__original-down"
								type="button"
								:disabled="cannotMove"
								aria-label="Sud"
								@click="move('south')"
							>
								<img src="/dungeon/mt/interf_arrow.png" alt="" />
							</button>
							<button
								v-if="stairDirections.includes('up')"
								class="mt-test__original-stair mt-test__original-stair-up"
								type="button"
								:disabled="cannotMove"
								aria-label="Escalier vers le haut"
								@click="move('up')"
							>
								<img src="/dungeon/mt/interf_stair_up.png" alt="" />
							</button>
							<button
								v-if="stairDirections.includes('down')"
								class="mt-test__original-stair mt-test__original-stair-down"
								type="button"
								:disabled="cannotMove"
								aria-label="Escalier vers le bas"
								@click="move('down')"
							>
								<img src="/dungeon/mt/interf_stair_down.png" alt="" />
							</button>
						</template>
					</div>
					<div v-if="view && partyNeedsIrma && !partyDefeated" class="mt-test__irma-hint" role="status">
						Actions épuisées : utilisez Irma pour continuer.
					</div>
					<div v-if="view" class="mt-test__original-level">Niveau -{{ session.position.l + 1 }}</div>
				</div>
				<p class="mt-test__caption">
					PixiJS : caméra amortie selon View.hx, murs en profondeur et Dinoz intégrés à la scène. Le flou du brouillard
					et certains ancrages PNG restent à comparer au SWF original.
				</p>

				<button class="mt-test__refresh" type="button" :disabled="busy" @click="refresh">Actualiser la vue</button>
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
					<template v-if="session.pending.kind === 'guardian'">
						<p v-if="guardianTrial" class="mt-test__caption">
							Gardien MT : <strong>{{ guardianTrial.monsterKey }}</strong> — apparence issue du catalogue MT.
						</p>
						<p class="mt-test__caption">
							Le combat utilise le moteur Remastered ; il consomme l'action de combat des Dinoz et peut attribuer de
							l'XP ou des objets.
						</p>
						<button type="button" :disabled="busy" @click="fightGuardian">Combattre le gardien</button>
					</template>
					<button
						v-if="session.pending.kind === 'guardian' && devCapabilities?.guardianSkip"
						type="button"
						:disabled="busy"
						@click="skipGuardian"
					>
						Franchir le gardien (test local, sans combat)
					</button>
					<button
						v-if="session.pending.kind === 'boundary-start' && stage === 0"
						type="button"
						:disabled="busy"
						@click="exitDungeon"
					>
						Quitter le donjon (retour à la surface)
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
						v-if="session.pending.kind === 'boundary-exit' && stage === 3"
						type="button"
						:disabled="busy"
						@click="exitDungeon"
					>
						Sortir définitivement du donjon
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
						Cette interaction n'est pas encore résoluble dans cette version. Le déplacement reste bloqué conformément à
						l'état serveur.
					</p>
				</section>

				<section v-if="activeHealZone" class="mt-test__panel" aria-live="polite">
					<p>Zone de soin active : utilise des objets de soin sur la fiche de tes Dinoz, puis reviens ici.</p>
					<p>La zone sera définitivement désactivée dès que le groupe quittera cette case.</p>
					<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Soigner le chef de groupe</RouterLink>
					<RouterLink
						v-for="member in visualMembers.filter(m => m.id !== leaderId)"
						:key="member.id"
						:to="{ name: 'DinozPage', params: { id: member.id } }"
						>Soigner le Dinoz {{ member.id }}</RouterLink
					>
				</section>

				<details v-if="view" class="mt-test__details mt-test__journal">
					<summary>Journal et coffres découverts ({{ journalEntries.length }})</summary>
					<p v-if="journalError" role="status">{{ journalError }}</p>
					<p v-else-if="journalEntries.length === 0">Aucun texte découvert pour le moment.</p>
					<ol v-else>
						<li v-for="entry in journalEntries" :key="`${entry.mapId}:${entry.level}:${entry.scenarioIndex}`">
							<strong>Carte {{ entry.stage + 1 }} — niveau {{ entry.level + 1 }}</strong>
							<p>{{ entry.text }}</p>
						</li>
					</ol>
					<button type="button" :disabled="busy" @click="loadJournal">Actualiser les découvertes</button>
				</details>

				<details v-if="view" class="mt-test__details">
					<summary>Diagnostics de fidélité</summary>
					<p>
						Sol et murs : PNG originaux, mais ancrages et sous-clips Flash non entièrement rétablis. Le bruit Perlin
						Flash est toujours absent. Les Dinoz affichés viennent de l'animation actuelle de Remastered.
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
import { mtDungeonCombatTrigger } from '../components/dungeon/mtDungeonCombatTrigger.js';
import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';
import MtDungeonMessageBox from '../components/dungeon/MtDungeonMessageBox.vue';
import { advanceMtTrail, mtFollowerPositions, type MtTrailPoint } from '../components/dungeon/dungeonPartyTrail.js';
import { DinozService } from '../services/dinoz.service.js';
import {
	MtDungeonService,
	type MtDungeonCurrentView,
	type MtDungeonJournalEntry,
	type MtDungeonEncounter,
	type MtDungeonDevCapabilities,
	type MtGuardianTrialPreview,
	type MtDungeonWorldExitResult
} from '../services/mtDungeon.service.js';
import { sessionStore } from '../store/sessionStore';
import { localStore } from '../store/localStore';
import { userStore } from '../store/userStore.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonCommand } from '@dinorpg/core/models/dungeon/dungeon.types.js';

const route = useRoute();
const router = useRouter();
const leaderId = Number(route.params.id);
const session = ref<MtDungeonSession | null>(null);
const view = ref<MtDungeonCurrentView | null>(null);
const encounter = ref<MtDungeonEncounter | null>(null);
const journalEntries = ref<MtDungeonJournalEntry[]>([]);
const journalError = ref('');
const exitOutcome = ref<MtDungeonWorldExitResult | null>(null);
const errorMessage = ref('');
const notice = ref('');
const originalEntryText = ref<string | null>(null); // STEP_20O_MT_DUNGEON
const entryDismissed = ref(false);
const exitDismissed = ref(false);
const scenarioDismissedRevision = ref('');
const devCapabilities = ref<MtDungeonDevCapabilities | null>(null);
const guardianTrial = ref<MtGuardianTrialPreview | null>(null);
const loading = ref(true);
const busy = ref(false);
const visualMembers = ref<{ id: number; display: string; life: number; fight: boolean; remaining: number }[]>([]);
const partyActionsLoaded = ref(false);
const movementTrail = ref<MtTrailPoint[]>([]);
const facingRight = ref(true);
function asTrailPoint(run: MtDungeonSession): MtTrailPoint {
	return { mapId: run.mapId, x: run.position.x, y: run.position.y, l: run.position.l };
}
const visualParty = computed(() => {
	const run = session.value;
	const currentView = view.value;
	if (!run || !currentView) return [];
	const positions = [
		asTrailPoint(run),
		...mtFollowerPositions(movementTrail.value, asTrailPoint(run), visualMembers.value.length - 1)
	];
	// If the profile request fails, keep a neutral location marker for testing.
	if (!visualMembers.value.length) return [{ id: leaderId, display: '', x: run.position.x, y: run.position.y }];
	return visualMembers.value.flatMap((member, index) => {
		const location = positions[index]!;
		if (location.mapId !== run.mapId || location.l !== run.position.l) return [];
		const x = location.x - currentView.scene.viewport.ix;
		const y = location.y - currentView.scene.viewport.iy;
		if (x < -2 || x > 10 || y < -2 || y > 10) return [];
		return [{ id: member.id, display: member.display, x: location.x, y: location.y }];
	});
});
async function loadVisualParty(): Promise<void> {
	try {
		const leader = await DinozService.getDinozFiche(leaderId, { silent: true });
		const followers = await Promise.all(
			leader.followers.map(follower => DinozService.getDinozFiche(follower.id, { silent: true }))
		);
		visualMembers.value = [
			{ id: leader.id, display: leader.display, life: leader.life, fight: leader.fight, remaining: leader.remaining },
			...followers.map(follower => ({
				id: follower.id,
				display: follower.display,
				life: follower.life,
				fight: follower.fight,
				remaining: follower.remaining
			}))
		];
		partyActionsLoaded.value = true;
	} catch {
		// Navigation fails closed when the server-side party action state is unknown.
		visualMembers.value = [];
		partyActionsLoaded.value = false;
	}
}
const stage = computed(() => Number(session.value?.mapId.split('_')[1] ?? 0));
const isMagnetic = computed(() => session.value?.mapId.startsWith('stepp_') ?? false);
const partyLeaderDead = computed(() => visualMembers.value.some(member => member.id === leaderId && member.life <= 0));
const partyDefeated = computed(
	() => visualMembers.value.length > 0 && visualMembers.value.every(dinoz => dinoz.life <= 0)
);
const partyNeedsIrma = computed(
	() => partyActionsLoaded.value && visualMembers.value.some(dinoz => dinoz.life > 0 && !dinoz.fight)
);
const cannotMove = computed(
	() =>
		partyDefeated.value ||
		partyLeaderDead.value ||
		partyNeedsIrma.value ||
		!partyActionsLoaded.value ||
		busy.value ||
		loading.value ||
		!session.value ||
		!!session.value.pending ||
		session.value.locked
);
const activeHealZone = computed(() => {
	const run = session.value;
	const current = view.value;
	if (!run || !current || run.locked || run.pending) return false;
	return current.scene.features.some(
		feature =>
			feature.kind === 'heal' && !feature.consumed && feature.x === run.position.x && feature.y === run.position.y
	);
});
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
	if (pending.kind === 'boundary-exit') return true;
	if (pending.kind === 'boundary-start') return true;
	if (pending.kind === 'guardian') return true;
	if (pending.kind !== 'scenario') return false;
	return (
		encounter.value?.kind === 'scenario' ||
		(encounter.value?.kind === 'scenario-combat' && encounter.value.status === 'ready-for-combat')
	);
});

type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat'; // STEP_20O_MT_DUNGEON
type MtNarrative = { kind: MtNarrativeKind; title: string; text: string; confirmLabel: string; cancelLabel?: string };
const activeMessage = computed((): MtNarrative | null => {
	if (exitOutcome.value && !exitDismissed.value) {
		return { kind: 'exit', title: 'Sortie du donjon', text: exitOutcome.value.text, confirmLabel: 'Retour à la fiche' };
	}
	if (session.value && originalEntryText.value && !entryDismissed.value) {
		return {
			kind: 'entry',
			title: 'Les Cavernes Magnétiques',
			text: originalEntryText.value,
			confirmLabel: 'Continuer'
		};
	}
	const run = session.value;
	const current = encounter.value;
	if (run?.pending?.kind === 'scenario' && current?.text) {
		const key = run.mapId + ':' + run.revision;
		if (scenarioDismissedRevision.value === key) return null;
		if (current.kind === 'scenario') {
			return {
				kind: 'scenario',
				title: 'Découverte',
				text: current.text,
				confirmLabel: 'Lire / récupérer',
				cancelLabel: 'Plus tard'
			};
		}
		if (current.kind === 'scenario-combat' && current.status === 'ready-for-combat') {
			return {
				kind: 'scenario-combat',
				title: 'Rencontre',
				text: current.text,
				confirmLabel: 'Combattre',
				cancelLabel: 'Plus tard'
			};
		}
	}
	return null;
});
function closeMessage(): void {
	const kind = activeMessage.value?.kind;
	if (kind === 'entry') entryDismissed.value = true;
	if (kind === 'exit') exitDismissed.value = true;
	if ((kind === 'scenario' || kind === 'scenario-combat') && session.value)
		scenarioDismissedRevision.value = session.value.mapId + ':' + session.value.revision;
}
function confirmMessage(): void {
	const kind = activeMessage.value?.kind;
	if (kind === 'entry') entryDismissed.value = true;
	if (kind === 'exit') {
		exitDismissed.value = true;
		void router.push({ name: 'DinozPage', params: { id: String(leaderId) } });
	}
	if (kind === 'scenario') {
		closeMessage();
		resolveScenario();
	}
	if (kind === 'scenario-combat') {
		closeMessage();
		fight();
	}
}
async function showOriginalEntryText(): Promise<void> {
	try {
		// Public metadata contain introduction and exit only; no hidden scenario leaks.
		const definition = (await MtDungeonService.getCatalog(language.value)).find(value => value.id === 'stepp');
		if (definition?.enter.text) {
			originalEntryText.value = definition.enter.text;
			entryDismissed.value = false;
		}
	} catch (error) {
		errorMessage.value = formatError(error);
	}
}

function formatError(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const code = (error.response?.data as { code?: string } | undefined)?.code;
		return code ? `Serveur : ${code}` : `Requête impossible (${error.response?.status ?? 'réseau'}).`;
	}
	return error instanceof Error ? error.message : 'Erreur inattendue.';
}

/** Read-only: an inaccessible journal must never block dungeon movement. */
async function loadJournal(): Promise<void> {
	try {
		const result = await MtDungeonService.getJournal(leaderId, language.value);
		journalEntries.value = result.entries;
		journalError.value = '';
	} catch {
		journalError.value = 'Journal momentanément indisponible.';
	}
}

async function refresh(): Promise<void> {
	if (busy.value) return;
	loading.value = true;
	errorMessage.value = '';
	try {
		const current = await MtDungeonService.getSession(leaderId);
		// Do not render actors from the new session on a view from the old revision.
		// A rejected move or a browser-tab resync must not produce a fake walk.
		const latestView = current.mapId.startsWith('stepp_') ? await MtDungeonService.getView(leaderId) : null;
		if (latestView && (latestView.revision !== current.revision || latestView.mapId !== current.mapId))
			throw new Error('La vue du donjon a changé pendant le chargement : actualise pour synchroniser.');
		const latestEncounter =
			current.pending && latestView ? (await MtDungeonService.getEncounter(leaderId, language.value)).encounter : null;
		if (
			session.value &&
			(session.value.mapId !== current.mapId ||
				JSON.stringify(session.value.position) !== JSON.stringify(current.position))
		)
			movementTrail.value = [];
		session.value = current;
		view.value = latestView;
		encounter.value = latestEncounter;
		await loadGuardianTrial(current);
		await loadVisualParty();
		if (latestView) await loadJournal();
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			session.value = null;
			view.value = null;
			encounter.value = null;
			guardianTrial.value = null;
			journalEntries.value = [];
			journalError.value = '';
		} else errorMessage.value = formatError(error);
	} finally {
		loading.value = false;
	}
}
async function afterMutation(next: MtDungeonSession): Promise<void> {
	const latestView = await MtDungeonService.getView(leaderId);
	if (latestView.revision !== next.revision || latestView.mapId !== next.mapId)
		throw new Error('La session a changé pendant le déplacement : une actualisation est nécessaire.');
	const latestEncounter = next.pending
		? (await MtDungeonService.getEncounter(leaderId, language.value)).encounter
		: null;
	// Commit both reactive values synchronously so Pixi receives a matching
	// authoritative position and 9x9 viewport for the camera interpolation.
	const journalChanged =
		!session.value ||
		session.value.mapId !== next.mapId ||
		JSON.stringify(session.value.flags) !== JSON.stringify(next.flags);
	session.value = next;
	view.value = latestView;
	encounter.value = latestEncounter;
	await loadGuardianTrial(next);
	await loadVisualParty();
	if (journalChanged) await loadJournal();
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
function restoreDungeonActions(): void {
	if (!session.value || !partyNeedsIrma.value || partyDefeated.value) return;
	void execute(async () => {
		const paid = await MtDungeonService.useDungeonIrma(leaderId, session.value!.revision);
		await loadVisualParty();
		if (!partyActionsLoaded.value || partyNeedsIrma.value) {
			throw new Error('Une action reste indisponible : vérifiez les Dinoz du groupe.');
		}
		notice.value = `${paid.used} Potion(s) d'Irma consommée(s). Exploration reprise.`;
	});
}
function start() {
	void execute(async () => {
		await afterMutation(await MtDungeonService.startMagneticCaverns(leaderId));
		await showOriginalEntryText();
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
		if (result.blockedDoor === 'missing-key') {
			// Consume the revision, but do not animate a fake movement.
			await afterMutation(result.session);
			notice.value = 'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.';
			return;
		}
		if (direction === 'west') facingRight.value = false;
		if (direction === 'east') facingRight.value = true;
		movementTrail.value = advanceMtTrail(
			movementTrail.value,
			asTrailPoint(previous),
			asTrailPoint(result.session),
			Math.max(0, visualMembers.value.length - 1)
		);
		await afterMutation(result.session);
		if (mtDungeonCombatTrigger(result.session.pending, encounter.value) === 'guardian') {
			const { token } = await MtDungeonService.prepareGuardianFight(leaderId, result.session.revision);
			const fightResult = await MtDungeonService.resolveGuardianFight(leaderId, token);
			sessionStore().setFightResult(fightResult);
			await router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });
			return;
		}
		if (mtDungeonCombatTrigger(result.session.pending, encounter.value) === 'scenario') {
			const { token } = await MtDungeonService.prepareFight(leaderId, result.session.revision);
			const fightResult = await MtDungeonService.resolveFight(leaderId, token);
			sessionStore().setFightResult(fightResult);
			await router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });
			return;
		}
		if (typeof result.goldAwarded === 'number') {
			if (typeof result.walletGold === 'number') userStore().setGold(result.walletGold);
			notice.value =
				result.goldAwarded > 0
					? `Trésor récupéré : +${result.goldAwarded} or.`
					: 'Trésor récupéré (valeur MT brute : 0).';
		}
	});
}
function transition(action: 'forward' | 'backward') {
	if (!session.value?.pending) return;
	void execute(async () => {
		await afterMutation(await MtDungeonService.transition(leaderId, session.value!.revision, action));
		movementTrail.value = [];
	});
}
function resolveScenario() {
	if (encounter.value?.kind !== 'scenario' || !session.value) return;
	void execute(async () => {
		const outcome = await MtDungeonService.resolveScenario(leaderId, session.value!.revision, language.value);
		const previous = session.value!;
		movementTrail.value = advanceMtTrail(
			movementTrail.value,
			asTrailPoint(previous),
			asTrailPoint(outcome.session),
			Math.max(0, visualMembers.value.length - 1)
		);
		await afterMutation(outcome.session);
		notice.value = outcome.message ?? 'Événement traité par le serveur.';
	});
}
async function loadGuardianTrial(run: MtDungeonSession): Promise<void> {
	guardianTrial.value = null;
	if (!run.pending || run.pending.kind !== 'guardian' || !import.meta.env.DEV) return;
	try {
		guardianTrial.value = await MtDungeonService.getGuardianTrialPreview(leaderId);
	} catch {
		/* Not enabled or no valid guardian: keep the original pending state. */
	}
}
function fightGuardian() {
	if (session.value?.pending?.kind !== 'guardian') return;
	void execute(async () => {
		const { token } = await MtDungeonService.prepareGuardianFight(leaderId, session.value!.revision);
		const result = await MtDungeonService.resolveGuardianFight(leaderId, token);
		sessionStore().setFightResult(result);
		await router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });
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
async function loadDevCapabilities(): Promise<void> {
	if (!import.meta.env.DEV) return;
	try {
		devCapabilities.value = await MtDungeonService.getDevCapabilities();
		if (session.value) await loadGuardianTrial(session.value);
	} catch {
		// 404 is expected when the server has not opted in to local dev tools.
		devCapabilities.value = null;
	}
}
function skipGuardian(): void {
	if (!session.value || session.value.pending?.kind !== 'guardian' || !devCapabilities.value?.guardianSkip) return;
	void execute(async () => {
		const previous = session.value!;
		const next = await MtDungeonService.devSkipGuardian(leaderId, previous.revision);
		movementTrail.value = advanceMtTrail(
			movementTrail.value,
			asTrailPoint(previous),
			asTrailPoint(next),
			Math.max(0, visualMembers.value.length - 1)
		);
		await afterMutation(next);
		notice.value = 'Gardien franchi en mode test : aucun combat, XP ou récompense.';
	});
}
function exitDungeon(): void {
	const current = session.value;
	const pendingKind = current?.pending?.kind;
	if (!current || (pendingKind !== 'boundary-start' && pendingKind !== 'boundary-exit')) return;
	if (
		!(current.mapId === 'stepp_0' && pendingKind === 'boundary-start') &&
		!(current.mapId === 'stepp_3' && pendingKind === 'boundary-exit')
	)
		return;
	void execute(async () => {
		const outcome = await MtDungeonService.worldExit(leaderId, current.revision, language.value);
		session.value = null;
		view.value = null;
		encounter.value = null;
		guardianTrial.value = null;
		movementTrail.value = [];
		exitOutcome.value = outcome;
		journalEntries.value = [];
	});
}
function evacuateDefeated(): void {
	if (!session.value || (!partyDefeated.value && !partyLeaderDead.value)) return;
	void execute(async () => {
		await MtDungeonService.evacuateDefeatedGroup(leaderId, session.value!.revision);
		session.value = null;
		view.value = null;
		encounter.value = null;
		guardianTrial.value = null;
		movementTrail.value = [];
		await router.replace({ name: 'DinozPage', params: { id: String(leaderId) } });
	});
}
function onKeyDown(event: KeyboardEvent): void {
	if (event.altKey || event.ctrlKey || event.metaKey || cannotMove.value || !!activeMessage.value) return;
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
	// STEP_20O_MT_DUNGEON
	window.addEventListener('keydown', onKeyDown);
	void (async () => {
		await refresh();
		await loadDevCapabilities();
		if (route.query.mtEntry === '1' && session.value?.mapId.startsWith('stepp_')) {
			await showOriginalEntryText();
			const query = { ...route.query };
			delete query.mtEntry;
			await router.replace({ query });
		}
	})();
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
.mt-test__original-controls {
	position: absolute;
	z-index: 20;
	left: 5px;
	top: 5px;
	width: 90px;
	height: 92px;
	pointer-events: none;
}
.mt-test__original-controls button {
	position: absolute;
	border: 0;
	padding: 0;
	background: transparent;
	line-height: 0;
	pointer-events: auto;
	filter: drop-shadow(0 1px 2px #241c0a);
}
.mt-test__original-controls button:disabled {
	opacity: 0.35;
	cursor: not-allowed;
}
.mt-test__original-controls button:not(:disabled):hover {
	filter: drop-shadow(0 0 5px #eee883);
}
.mt-test__original-dir {
	width: 24px;
	height: 24px;
}
.mt-test__original-dir img {
	width: 24px;
	height: 20px;
}
.mt-test__original-up {
	top: 0;
	left: 31px;
}
.mt-test__original-left {
	top: 30px;
	left: 0;
}
.mt-test__original-right {
	top: 30px;
	left: 62px;
}
.mt-test__original-down {
	top: 58px;
	left: 31px;
}
.mt-test__original-up img {
	transform: rotate(-90deg);
}
.mt-test__original-left img {
	transform: rotate(180deg);
}
.mt-test__original-right img {
	transform: rotate(0deg);
}
.mt-test__original-down img {
	transform: rotate(90deg);
}
.mt-test__original-stair {
	top: 29px;
}
.mt-test__original-stair-up {
	left: 33px;
}
.mt-test__original-stair-down {
	left: 56px;
}
.mt-test__original-stair img {
	width: 24px;
	height: 28px;
}
.mt-test__original-irma {
	top: 17px;
	left: 27px;
}
.mt-test__original-irma img {
	width: 24px;
	height: 31px;
	image-rendering: auto;
}
.mt-test__irma-hint {
	position: absolute;
	top: 84px;
	left: 7px;
	z-index: 20;
	max-width: 170px;
	padding: 3px 5px;
	font-size: 11px;
	background: #261f11df;
	color: #fff0b3;
	border-radius: 3px;
}
.mt-test__original-level {
	position: absolute;
	right: 8px;
	bottom: 5px;
	z-index: 20;
	color: #f5eccb;
	font-size: 17px;
	font-weight: 600;
	text-shadow:
		1px 2px 2px #000,
		-1px -1px 2px #000;
	pointer-events: none;
}
.mt-test__refresh {
	font-size: 0.72rem;
}
.mt-test__viewport {
	position: relative;
	width: 100%;
	overflow: hidden;
	background: #3d3325;
	border: 5px solid #5f4123;
	box-shadow: inset 0 0 10px #201a13;
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
.mt-test__journal {
	width: min(420px, 100%);
	max-width: 420px;
	padding: 0.55rem 0.7rem;
	border: 1px solid #a38b6c;
	background: #efdfbd;
}
.mt-test__journal summary {
	cursor: pointer;
	font-weight: 700;
}
.mt-test__journal ol {
	padding-left: 1.1rem;
}
.mt-test__journal li {
	margin: 0.65rem 0;
}
.mt-test__journal li p {
	margin: 0.25rem 0;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}
</style>
