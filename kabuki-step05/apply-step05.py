#!/usr/bin/env python3
"""Kabuki stage 05: scripted Gorges boss intervention, no Git or network mutations.
Run from root after steps 01-04. Anchors fail closed; files are staged before writing.
"""
from pathlib import Path
import re
import sys
ROOT=Path.cwd()
def once(s,old,new,path):
    n=s.count(old)
    if n!=1: raise RuntimeError(f'{path}: expected 1 anchor, found {n}: {old[:100]!r}')
    return s.replace(old,new,1)
def main():
    if not (ROOT/'pnpm-workspace.yaml').exists(): raise RuntimeError('Run from monorepo root')
    paths=['packages/core/src/models/monster/monsterList.ts',
           'packages/core/src/models/monster/monsterKey.ts',
           'packages/core/src/models/monster/monsterKeyMap.ts',
           'app/server/src/utils/fight/fight.mapper.ts',
           'app/server/src/Fight/Service/fight.service.ts',
           'app/server/src/Fight/Service/processDialogFight.service.ts',
           'app/server/src/utils/fight/generateFight.ts',
           'app/server/src/utils/fight/kabukiYakuziFight.ts']
    files={p:(ROOT/p).read_text(encoding='utf-8') for p in paths}
    if not (ROOT/'packages/core/src/models/dialogs/data/yakuziChase.dialog.ts').is_file():
        raise RuntimeError('Step 03 must be installed')
    # Dedicated MT monster; retain exact stats and DNA, but ninja skill is not modeled yet.
    p=paths[0];s=files[p]
    s=once(s,"\tANY = 'ANY'","\tKABUKI_YAKUZI = 'KABUKI_YAKUZI',\n\tANY = 'ANY'",p)
    s=once(s,"\t[Monster.GOUPIGNON]: {",'''\t/** MT monsters.xml: yakkb1 (the anonymous Kabuki summoned at the Gorges). */
\t[Monster.KABUKI_YAKUZI]: {
\t\tid: Monster.KABUKI_YAKUZI,
\t\tname: '???',
\t\tlevel: 10,
\t\thp: 100,
\t\telements: { fire: 0, wood: 1, water: 4, lightning: 2, air: 4 },
\t\tbonus_attack: 0,
\t\tbonus_defense: 0,
\t\tresilience: 40,
\t\todds: 0,
\t\tskills: [], // MT ninja skill is not implemented yet; not silently substituted.
\t\tzones: [],
\t\tcanBeCaptured: false,
\t\tdisplay: 'E9ERKdJzrAYd5P00'
\t},
\t[Monster.GOUPIGNON]: {''',p)
    files[p]=s
    p=paths[1];s=files[p];s=once(s,"\t'any'\n] as const;","\t'any',\n\t'yakkb1'\n] as const;",p);files[p]=s
    p=paths[2];s=files[p];s=once(s,'\tany: Monster.ANY','\tyakkb1: Monster.KABUKI_YAKUZI,\n\tany: Monster.ANY',p);files[p]=s
    p=paths[3];s=files[p];s=once(s,"scriptedEncounter?: 'kabuki_yakuzi_forges';","scriptedEncounter?: 'kabuki_yakuzi_forges' | 'kabuki_yakuzi_gorges';",p);files[p]=s
    p=paths[4];s=files[p];s=once(s,"scriptedEncounter?: 'kabuki_yakuzi_forges';","scriptedEncounter?: 'kabuki_yakuzi_forges' | 'kabuki_yakuzi_gorges';",p);files[p]=s
    p=paths[5];s=files[p]
    # Locate the whole Step 04 assignment, regardless of Prettier formatting.
    # Do not depend on a particular ternary's spaces, parentheses or line breaks.
    assignment = re.compile(
        r"(?m)^(?P<indent>[ \t]*)const\s+scriptedEncounter\s*=\s*"
        r"(?P<expression>[\s\S]*?);(?=\s*(?:const\s+fightResult\b|\n))"
    )
    matches = list(assignment.finditer(s))
    if len(matches) != 1:
        raise RuntimeError(
            f'{p}: expected exactly one `const scriptedEncounter = ...;` '
            f'from Step 04; found {len(matches)}. '
            'Check that Step 04 is installed, or share this code block.'
        )
    m = matches[0]
    original = m.group('expression')
    # Fail closed rather than rewriting an unrelated local customisation.
    required = ('yakuzi_forges', 'ready', 'kabuki_yakuzi_forges')
    if not all(token in original for token in required):
        raise RuntimeError(f'{p}: unexpected Step 04 scriptedEncounter expression: {original[:220]!r}')
    if 'kabuki_yakuzi_gorges' in original:
        raise RuntimeError(f'{p}: Step 05 looks already applied')
    indent = m.group('indent')
    # An explicit union type avoids a fragile nested ternary and as-const formatting.
    replacement = (
        indent + "const scriptedEncounter: 'kabuki_yakuzi_forges' | 'kabuki_yakuzi_gorges' | undefined =\n"
        + indent + "\tdialogId === 'yakuzi_forges' && phaseId === 'ready'\n"
        + indent + "\t\t? 'kabuki_yakuzi_forges'\n"
        + indent + "\t\t: dialogId === 'yakuzi_gorges' && phaseId === 'combat'\n"
        + indent + "\t\t\t? 'kabuki_yakuzi_gorges'\n"
        + indent + "\t\t\t: undefined;"
    )
    s = s[:m.start()] + replacement + s[m.end():]
    files[p]=s
    p=paths[6];s=files[p]
    s=once(s,"import { escapeYakuziAfterDefeat } from './kabukiYakuziFight.js';", "import { escapeYakuziAfterDefeat, setGorgesYakuziInitialLife, summonKabukiAtGorges } from './kabukiYakuziFight.js';",p)
    s=once(s,'\t// Prepare the fight: fighters arrive, some special skills and items are handled *before* the start of the fight','\tif (config.scriptedEncounter === \'kabuki_yakuzi_gorges\') {\n\t\tsetGorgesYakuziInitialLife(fightData.fighters);\n\t}\n\n\t// Prepare the fight: fighters arrive, some special skills and items are handled *before* the start of the fight',p)
    s=once(s,"\t\tif (config.scriptedEncounter === 'kabuki_yakuzi_forges') {\n\t\t\tescapeYakuziAfterDefeat(fightData.fighters, fightData.steps);\n\t\t}\n\t\tcheckDeaths(fightData);", "\t\tif (config.scriptedEncounter === 'kabuki_yakuzi_forges') {\n\t\t\tescapeYakuziAfterDefeat(fightData.fighters, fightData.steps);\n\t\t} else if (config.scriptedEncounter === 'kabuki_yakuzi_gorges') {\n\t\t\tsummonKabukiAtGorges(fightData);\n\t\t}\n\t\tcheckDeaths(fightData);",p)
    files[p]=s
    p=paths[7];s=files[p]
    if 'summonKabukiAtGorges' in s:raise RuntimeError('Already applied stage 05')
    s += '''

/** Motion Twin: kabuki phase 5, Yakuzi starts with 30 HP (max HP is unchanged). */
export function setGorgesYakuziInitialLife(fighters: DetailedFighter[]): boolean {
    const yakuzi = fighters.find(f => !f.attacker && f.type === FighterType.BOSS && f.name === 'yakuzi');
    if (!yakuzi) return false;
    yakuzi.hp = 30;
    yakuzi.startingHp = 30;
    return true;
}

/**
 * MT Scenario.hx phase 5: on Yakuzi's lethal hit, summon yakkb1 and
 * withdraw Yakuzi. Triggered before checkDeaths, so no premature win.
 * A native fighter is introduced into the existing engine and appears in
 * the FightProcessResult fighter roster (the array is shared by config).
 */
export function summonKabukiAtGorges(fightData: DetailedFight): boolean {
    const yakuzi = fightData.fighters.find(f =>
        !f.attacker && f.type === FighterType.BOSS && f.name === 'yakuzi' && !f.escaped
    );
    if (!yakuzi || yakuzi.hp > 0) return false;

    const count = fightData.fighters.filter(f => f.type !== FighterType.DINOZ).length;
    const renfortApplied = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_RENFORTS)).length;
    const wormCalls = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_WORM_CALL)).length;
    const kabuki = initializeMonster(
        { existingMonsters: count, renfortApplied, wormCalls },
        null, 1, monsterList[Monster.KABUKI_YAKUZI], fightData.place, false, fightData.rng
    );
    // Independent enemy, not Yakuzi's disposable invocation; fighting continues.
    kabuki.time = Math.max(fightData.time, yakuzi.time);
    fightData.fighters.push(kabuki);
    fightData.steps.push({ action: 'arrive', fid: kabuki.id });
    // MT heals Yakuzi to 100 HP and removes him from battle.
    yakuzi.maxHp = Math.max(yakuzi.maxHp, 100);
    yakuzi.hp = 100;
    yakuzi.escaped = true;
    fightData.steps.push({ action: 'leave', fighter: {
        id: yakuzi.id, name: yakuzi.name, type: yakuzi.type, attacker: yakuzi.attacker
    }});
    return true;
}
'''
    s=once(s,"import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';", "import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';\nimport { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';\nimport { Skill } from '@dinorpg/core/models/skills/skillList.js';\nimport type { DetailedFight } from './generateFight.js';\nimport { initializeMonster } from './getFighters.js';",p)
    files[p]=s
    test=ROOT/'app/server/test/unit/kabuki-yakuzi-gorges.test.ts'
    if test.exists():raise RuntimeError(f'Test already exists: {test}')
    test_src='''import { describe, it, expect } from 'vitest';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import { setGorgesYakuziInitialLife, summonKabukiAtGorges } from '../../src/utils/fight/kabukiYakuziFight.js';

const boss = (hp: number) => ({
    id: 1, name: 'yakuzi', attacker: false, type: FighterType.BOSS,
    hp, maxHp: 50, startingHp: 50, escaped: false, time: 0
}) as DetailedFighter;

function mockFight(yakuzi: DetailedFighter): DetailedFight {
    return {
        fighters: [yakuzi], steps: [], time: 0, place: 49,
        rng: () => 0.5
    } as unknown as DetailedFight;
}

describe('Kabuki MT — Gorges', () => {
    it('uses original yakkb1 stats', () => {
        const monster = monsterList[Monster.KABUKI_YAKUZI];
        expect(monster.hp).toBe(100);
        expect(monster.level).toBe(10);
        expect(monster.display).toBe('E9ERKdJzrAYd5P00');
        expect(monster.canBeCaptured).toBe(false);
    });
    it('starts Yakuzi at 30 HP without changing maxHP', () => {
        const yakuzi = boss(50);
        expect(setGorgesYakuziInitialLife([yakuzi])).toBe(true);
        expect(yakuzi.hp).toBe(30);
        expect(yakuzi.startingHp).toBe(30);
        expect(yakuzi.maxHp).toBe(50);
    });
    it('cannot summon while Yakuzi still fights', () => {
        const fight = mockFight(boss(1));
        expect(summonKabukiAtGorges(fight)).toBe(false);
        expect(fight.fighters).toHaveLength(1);
    });
    it('summons once on a lethal hit and Yakuzi escapes alive', () => {
        const yakuzi = boss(0);
        const fight = mockFight(yakuzi);
        expect(summonKabukiAtGorges(fight)).toBe(true);
        expect(fight.fighters).toHaveLength(2);
        const kabuki = fight.fighters[1];
        expect(kabuki.name).toBe('???');
        expect(kabuki.hp).toBe(100);
        expect(kabuki.attacker).toBe(false);
        expect(kabuki.escaped).toBe(false);
        expect(yakuzi.escaped).toBe(true);
        expect(yakuzi.hp).toBe(100);
        expect(fight.steps.map(step => step.action)).toEqual(['arrive','leave']);
        expect(summonKabukiAtGorges(fight)).toBe(false);
        expect(fight.fighters).toHaveLength(2);
    });
    it('does not affect unrelated bosses', () => {
        const wrong = { ...boss(0), name: 'igor' } as DetailedFighter;
        const fight = mockFight(wrong);
        expect(summonKabukiAtGorges(fight)).toBe(false);
    });
});
'''
    # All anchors checked; apply changes.
    for p,s in files.items():
        (ROOT/p).write_text(s,encoding='utf-8');print('Updated',p)
    test.parent.mkdir(parents=True,exist_ok=True)
    test.write_text(test_src,encoding='utf-8');print('Created',test.relative_to(ROOT))
    print('Done. No Git commands or remote writes executed.')
if __name__=='__main__':
    try:main()
    except Exception as e:print('ERROR:',e,file=sys.stderr);sys.exit(1)
