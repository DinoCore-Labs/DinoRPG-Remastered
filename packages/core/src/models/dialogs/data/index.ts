import { archisageDialog } from './archisage.dialog.js';
import { atlanteGuardDialog } from './atlanteGuard.dialog.js';
import { coralMinerDialog } from './coralMiner.dialog.js';
import { hydargolDialog } from './hydargol.dialog.js';
import { jovebozeDialog } from './joveboze.dialog.js';
import { padamoineDialog } from './padamoine.dialog.js';
import { papyJoeDialog } from './papy.dialog.js';
import { professorEugeneDialog } from './prof.dialog.js';
import {
	strangeRangerAfterSpyDialog,
	strangeRangerIntroDialog,
	strangeRangerRewardDialog,
	strangeRangerTechDialog
} from './rodeur.dialog.js';
import { shamanMouDialog } from './shamanMou.dialog.js';
import { speleleologueDialog, speleleologueIceDialog } from './spelele.dialog.js';
import { strangeHippoDialog, strangePterozDialog, strangeRockyDialog } from './totems.dialog.js';
import { venerableDialog, venerableHurtDialog } from './venerable.dialog.js';
import { weirdManDialog } from './weirdMan.dialog.js';
import { woundedSoldierDialog } from './woundedSoldier.dialog.js';

export const dialogDefinitions = [
	// Dinoville
	professorEugeneDialog,
	jovebozeDialog,
	padamoineDialog,
	strangeRockyDialog,
	papyJoeDialog,
	//woundedSoldierDialog,
	strangeRangerAfterSpyDialog,
	// Iles Atlantéinées
	strangeHippoDialog,
	coralMinerDialog,
	atlanteGuardDialog,
	hydargolDialog,
	archisageDialog,
	// GTC
	strangePterozDialog,
	shamanMouDialog,
	strangeRangerIntroDialog,
	strangeRangerTechDialog,
	strangeRangerRewardDialog,
	venerableDialog,
	venerableHurtDialog,
	speleleologueDialog,
	speleleologueIceDialog,
	// Foret
	weirdManDialog
];
