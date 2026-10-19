/**
 * Authenticated, viewport-limited MT test renderer.
 * The original Flash perlinNoise pixels have not been recovered; this endpoint
 * now uses explicitly approximate EternalTwin-style value noise (not Flash perlinNoise).
 * Never return the complete DungeonStructure or hidden event coordinates.
 */
import { effectiveMtDungeonScenarioIcons } from '@dinorpg/core/models/dungeon/dungeon.blocks.js';
import { buildMtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { getDungeonSkin } from '@dinorpg/core/models/dungeon/dungeon.skins.js';
import { createMtDungeonTerrainNoise } from '@dinorpg/core/models/dungeon/dungeon.terrainNoise.js';
import { redactMtDungeonViewport } from '@dinorpg/core/models/dungeon/dungeon.viewport.js';

import { getVisibleMtDungeonGuardianVisuals } from './mtDungeonGuardianVisuals.service.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function getMtDungeonCurrentView(identity: MtSessionIdentity) {
	const session = await mtDungeonDependencies().repository.load(identity);
	if (!session) throw new MtDungeonSessionError('not-found');
	const archive = getMtDungeonArchive();
	const cfg = archive.configuration(session.mapId);
	const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
	const stage = Number(session.mapId.slice(session.mapId.lastIndexOf('_') + 1));
	const definition = archive.definition(dungeonId);
	const skinName = definition.stages[stage]?.skin;
	const skin = skinName && getDungeonSkin(skinName);
	if (!skin) throw new Error(`Original MT skin missing for ${session.mapId}`);
	const { position, flags, fog } = session;
	const scene = buildMtDungeonScene({
		map: cfg.map,
		level: position.l,
		viewX: position.x - 4,
		viewY: position.y - 4,
		skin,
		// Neutral fallback until original Flash perlinNoise implementation is ported.
		noiseAt: createMtDungeonTerrainNoise(session.mapId, position.l, skin.perlin),
		flags: new Set(flags),
		scenarioIcons: effectiveMtDungeonScenarioIcons(cfg.scenarioIcons, cfg.blockRules, flags),
		tower: cfg.tower,
		fog: fog === null ? null : Uint8Array.from(fog)
	});
	// Never expose monsters on tiles that have not been revealed.
	const visibleScene = redactMtDungeonViewport(scene, cfg.map, fog);
	const guardianSprites = getVisibleMtDungeonGuardianVisuals(
		visibleScene,
		cfg.map.width,
		cfg.map.height,
		definition.monsters
	);
	return {
		mapId: session.mapId,
		revision: session.revision,
		position: { ...position },
		skin: skinName,
		stage,
		scene: visibleScene,
		guardianSprites,
		limitations: ['approximate-terrain-noise', 'flash-actor-not-yet-ported'] as const
	};
}
