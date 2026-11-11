#!/usr/bin/env python3
"""Kabuki step 11: Motion Twin lost route, final battle and Aura reward.

Run from local monorepo root. --check validates all targets and edits nothing.
No Git operations, no network access.
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
ROOT=Path.cwd()
SERVICE=Path('app/server/src/Scenario/Service/scenarioMoveFight.service.ts')
CONTROLLER=Path('app/server/src/Scenario/Controller/kabukiScenario.controller.ts')
REWARDS=Path('packages/core/src/models/rewards/rewardsKeyMap.ts')
TEST=Path('app/server/test/unit/kabuki-totem-scenario.test.ts')
LANGS=['FR','EN','ES','DE']

def require(ok:bool,why:str):
    if not ok:raise RuntimeError(why)

def inject_once(text:str,needle:str,replacement:str,path:Path)->str:
    require(text.count(needle)==1,f'{path}: expected one anchor {needle!r}; found {text.count(needle)}')
    return text.replace(needle,replacement,1)

def prepare()->dict[Path,str]:
    require((ROOT/'pnpm-workspace.yaml').exists(),'Run from DinoRPG-Remastered root')
    for path in [SERVICE,REWARDS]:require((ROOT/path).is_file(),f'Missing {path}')
    for path in [CONTROLLER,TEST]:require(not (ROOT/path).exists(),f'{path} already exists, refusing overwrite')
    require((ROOT/'packages/core/src/models/dialogs/data/yakuziKabukiTotem.dialog.ts').exists(),'Install step10 first')
    require((ROOT/'packages/core/src/models/monster/bossList.ts').exists(),'Missing bossList')
    require((ROOT/'packages/core/src/models/monster/monsterList.ts').exists(),'Missing monsterList')
    monsters=(ROOT/'packages/core/src/models/monster/monsterList.ts').read_text('utf8')
    bosses=(ROOT/'packages/core/src/models/monster/bossList.ts').read_text('utf8')
    for symbol in ['KABUKI_YAKUZI']:
        require(symbol in monsters,f'Missing step05 monster {symbol}')
    for symbol in ['IGOR_BARBARA','IGOR_CHOUPETTE','IGOR_POUPOULE','PR_IGOR','YAKUZI']:
        require(symbol in bosses,f'Missing Igor/Yakuzi monster {symbol}')
    changes={}
    path=REWARDS;data=(ROOT/path).read_text('utf8')
    require(not re.search(r'(?m)^\s*kaura\s*:',data),'kaura reward mapping already exists')
    data=inject_once(data,'\tmagnet: Reward.MAGNET,','\tmagnet: Reward.MAGNET,\n\tkaura: Reward.KAURA,',path)
    data=inject_once(data,'\tmagnet: StatTracking.MAGNET,','\tmagnet: StatTracking.MAGNET,\n\tkaura: StatTracking.KAURA,',path)
    changes[path]=data
    path=SERVICE;data=(ROOT/path).read_text('utf8')
    require('processKabukiScenarioMoveFight' not in data,'Step11 already installed')
    marker="import { processStarScenarioMoveFight } from '../Controller/starScenario.controller.js';"
    data=inject_once(data,marker,marker+"\nimport { processKabukiScenarioMoveFight } from '../Controller/kabukiScenario.controller.js';",path)
    match=re.search(r'(?m)^(?P<indent>[\t ]*)const starFight\s*=\s*await processStarScenarioMoveFight\(input\);',data)
    require(match is not None,f'{path}: expected Star scenario move dispatch')
    pos=match.start();indent=match.group('indent')
    data=(data[:pos]+f'{indent}const kabukiFight = await processKabukiScenarioMoveFight(input);\n'
          f'{indent}if (kabukiFight !== false) return kabukiFight;\n'
          +data[pos:])
    changes[path]=data
    changes[CONTROLLER]=CONTROLLER_CONTENT
    changes[TEST]=TEST_CONTENT
    messages={
      'FR':{'lost':"Comme prévu, votre Dinoz s'est perdu sur la route de l'île du Totem. Yakuzi et ses deux Kabukis viennent à sa rescousse !",'finalStart':"Vous arrivez enfin à l'Ile du Totem... mais qu'est-ce qui peut bien se passer ici ?",'finalEnd':"Vous avez vaincu Igor et ses sbires ! Vous avez par la même occasion récupéré l'Aura Kabuki !"},
      'EN':{'lost':'As expected, your Dinoz gets lost on the way to Totem Island. Yakuzi and his two Kabukis come to the rescue!','finalStart':'You finally reach Totem Island... but what could be happening here?','finalEnd':'You defeated Igor and his minions! You also recovered the Kabuki Aura!'},
      'ES':{'lost':'Como era de esperar, tu Dinoz se pierde camino a la Isla del Tótem. ¡Yakuzi y sus dos Kabukis acuden a ayudarlo!','finalStart':'Por fin llegas a la Isla del Tótem... ¿qué estará pasando aquí?','finalEnd':'¡Has derrotado a Igor y sus secuaces! ¡También has recuperado el Aura Kabuki!'},
      'DE':{'lost':'Wie erwartet verirrt sich dein Dinoz auf dem Weg zur Toteminsel. Yakuzi und seine beiden Kabukis kommen zur Hilfe!','finalStart':'Endlich erreichst du die Toteminsel ... aber was geschieht hier?','finalEnd':'Du hast Igor und seine Gefolgsleute besiegt und die Kabuki-Aura zurückerhalten!'},
    }
    for lang in LANGS:
        path=Path(f'app/client/src/i18n/locales/{lang}.json')
        require((ROOT/path).exists(),f'Missing {path}')
        data=json.loads((ROOT/path).read_text('utf8'))
        scenarios=data.setdefault('scenarios',{})
        kabuki=scenarios.setdefault('kabuki',{})
        texts=kabuki.setdefault('texts',{})
        require('totemLost' not in texts and 'totemFinalStart' not in texts,f'Step11 translations present in {lang}')
        texts.update(totemLost=messages[lang]['lost'],totemFinalStart=messages[lang]['finalStart'],totemFinalEnd=messages[lang]['finalEnd'])
        changes[path]=json.dumps(data,ensure_ascii=False,indent='\t')+'\n'
    return changes

CONTROLLER_CONTENT=r"""import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, type FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { prisma } from '../../prisma.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import type { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';
import { getUserScenarioProgression } from './scenarioProgress.controller.js';

const SCENARIO = 'kabuki';

/** These are virtual/actual locations from the original Motion Twin map. */
export function getKabukiMovePhase(
    progression: number,
    fromPlace: PlaceEnum,
    triggerPlace: PlaceEnum,
    toPlace: PlaceEnum
): 'lost' | 'final' | null {
    if (fromPlace !== PlaceEnum.MINES_DE_CORAIL) return null;
    if (progression === 19 && triggerPlace === PlaceEnum.ITLOST && toPlace === PlaceEnum.MINES_DE_CORAIL) return 'lost';
    if (progression === 20 && triggerPlace === PlaceEnum.ITOTEM && toPlace === PlaceEnum.ITOTEM) return 'final';
    return null;
}

/** MT XML monsters.xml: yakkb2 Ninjutsu and yakkb3 Kage. */
const NINJUTSU = {
    ...monsterList[Monster.KABUKI_YAKUZI],
    name: 'Ninjutsu',
    display: 'E9ERKdJzrAYd5P00',
    level: 10,
    hp: 100,
    elements: { fire: 0, wood: 1, water: 5, lightning: 2, air: 7 }
};
const KAGE = {
    ...monsterList[Monster.KABUKI_YAKUZI],
    name: 'Kage',
    display: 'E9OI0HBqXBb9dH00',
    level: 15,
    hp: 100,
    elements: { fire: 0, wood: 1, water: 7, lightning: 2, air: 8 }
};

/**
 * The summoned Kabuki sprites reuse the step05 implementation.
 * Their original ninja/disque/etc skills are NOT yet simulated by that implementation.
 */
export const KABUKI_TOTEM_OPPONENTS = [
    bossList[Boss.PR_IGOR],
    bossList[Boss.IGOR_BARBARA],
    bossList[Boss.IGOR_CHOUPETTE],
    bossList[Boss.IGOR_POUPOULE]
];
export const KABUKI_TOTEM_ALLIES = [bossList[Boss.YAKUZI], NINJUTSU, KAGE];

/** A narrative transition, not a combat: the lost route returns to Coral Mines. */
function lostIslandResult(): FightResult {
    return {
        fighters: [], goldEarned: 0, xpEarned: 0, levelUp: false,
        totalHpLost: 0, result: false, history: [], hpLost: [], itemsUsed: [],
        place: PlaceEnum.MINES_DE_CORAIL,
        movementEvent: { key: 'kabuki_lost_island', text: 'scenarios.kabuki.texts.totemLost' },
        source: 'scenario',
        scenario: { key: SCENARIO, fightKey: 'kabuki_lost_island', progressed: true, progression: 20 }
    };
}

/**
 * MT step 19 -> 20 occurs on the ITLOST technical passage. A CAS update
 * prevents duplicate progression. The group remains at Coral Mines.
 */
async function processLostRoute(input: ScenarioMoveFightInput): Promise<FightResult> {
    const claim = await prisma.userScenario.updateMany({
        where: { userId: input.user.id, scenarioKey: SCENARIO, progression: 19 },
        data: { progression: 20 }
    });
    const result = lostIslandResult();
    if (claim.count !== 1 && result.scenario) result.scenario.progressed = false;
    return result;
}

/**
 * MT final: the player is joined by Yakuzi and the two Kabukis against Igor.
 * The scripted dialogue/arrivals within the fight animation are still a
 * follow-up: this version keeps those allies in the initial fight roster.
 */
async function processFinalFight(input: ScenarioMoveFightInput): Promise<FightResult> {
    const fightProcess = calculateFightVsMonsters(
        input.team, input.user, PlaceEnum.ITOTEM,
        KABUKI_TOTEM_OPPONENTS, undefined, KABUKI_TOTEM_ALLIES
    );
    const result = await rewardFightVsMonsters(
        input.team, KABUKI_TOTEM_OPPONENTS, fightProcess, PlaceEnum.ITOTEM,
        input.user, { autoReequip: input.autoReequip }
    );
    const won = fightProcess.outcome === FightOutcome.AttackerWin;
    let progressed = false;
    if (won) {
        progressed = await prisma.$transaction(async tx => {
            const claimed = await tx.userScenario.updateMany({
                where: { userId: input.user.id, scenarioKey: SCENARIO, progression: 20 },
                data: { progression: 21 }
            });
            if (claimed.count !== 1) return false;
            await tx.userRewards.createMany({
                data: [{ userId: input.user.id, rewardId: Reward.KAURA }],
                skipDuplicates: true
            });
            return true;
        });
        if (progressed) {
            await updateMultipleDinoz(input.team.map(d => d.id), { placeId: PlaceEnum.ITOTEM });
        }
    }
    return {
        ...result,
        source: 'scenario',
        scenario: { key: SCENARIO, fightKey: 'kabuki_igor_totem', progressed, progression: progressed ? 21 : 20 },
        startText: { type: 'message', text: 'scenarios.kabuki.texts.totemFinalStart' },
        endText: won ? { type: 'message', text: 'scenarios.kabuki.texts.totemFinalEnd' } : undefined
    };
}

export async function processKabukiScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
    if (input.fromPlace !== PlaceEnum.MINES_DE_CORAIL) return false;
    if (input.triggerPlace !== PlaceEnum.ITLOST && input.triggerPlace !== PlaceEnum.ITOTEM) return false;
    const progression = await prisma.$transaction(tx => getUserScenarioProgression(tx, input.user.id, SCENARIO));
    const phase = getKabukiMovePhase(progression.progression, input.fromPlace, input.triggerPlace, input.toPlace);
    if (phase === 'lost') return processLostRoute(input);
    if (phase === 'final') return processFinalFight(input);
    return false;
}
"""

TEST_CONTENT=r"""import { describe, expect, it } from 'vitest';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Boss } from '@dinorpg/core/models/monster/bossList.js';
import { getKabukiMovePhase, KABUKI_TOTEM_ALLIES, KABUKI_TOTEM_OPPONENTS } from '../../src/Scenario/Controller/kabukiScenario.controller.js';

describe('Kabuki MT: route to Totem Island', () => {
    it('stage 19 lost route returns to Coral Mines', () => {
        expect(getKabukiMovePhase(19, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITLOST, PlaceEnum.MINES_DE_CORAIL)).toBe('lost');
        expect(getKabukiMovePhase(19, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBeNull();
    });
    it('stage 20 final encounter only occurs on the Totem route', () => {
        expect(getKabukiMovePhase(20, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBe('final');
        expect(getKabukiMovePhase(21, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBeNull();
    });
    it('final encounter starts with Igor and his three companions', () => {
        expect(KABUKI_TOTEM_OPPONENTS.map(m => m.id)).toEqual([Boss.PR_IGOR, Boss.IGOR_BARBARA, Boss.IGOR_CHOUPETTE, Boss.IGOR_POUPOULE]);
    });
    it('Yakuzi brings two different Kabuki allies', () => {
        expect(KABUKI_TOTEM_ALLIES.map(m => m.name)).toEqual(['yakuzi', 'Ninjutsu', 'Kage']);
        expect(KABUKI_TOTEM_ALLIES[1]?.display).not.toBe(KABUKI_TOTEM_ALLIES[2]?.display);
    });
});
"""


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--check',action='store_true',help='Validate local patch without writing files')
    args=p.parse_args()
    changes=prepare()
    if args.check:
        print(f'OK: validated {len(changes)} files, no changes written.');return
    for path,contents in changes.items():
        destination=ROOT/path
        destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_text(contents,'utf8')
        print('Updated:',path)
    print('Step11 installed. Build/test before committing.')

if __name__=='__main__':
    try:main()
    except Exception as e:
        print('ERROR:',e,file=sys.stderr);sys.exit(1)
