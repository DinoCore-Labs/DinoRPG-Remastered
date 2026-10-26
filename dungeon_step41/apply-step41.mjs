import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const paths={keys:'app/client/src/components/dungeon/mtDungeonKeyNames.ts',page:'app/client/src/pages/DungeonPage.vue',fr:'app/client/src/i18n/locales/FR.json',test:'app/client/test/unit/dungeon/mtDungeonKeyNames.test.ts'};
const content={};for(const [k,p] of Object.entries(paths)){const f=resolve(process.cwd(),p);if(!existsSync(f))throw Error('Missing '+f);content[k]=readFileSync(f,'utf8');}
function once(s,needle,replacement){const i=s.indexOf(needle);if(i<0||s.indexOf(needle,i+needle.length)!==-1)throw Error('Anchor absent/ambiguous: '+needle+'; no files modified');return s.slice(0,i)+replacement+s.slice(i+needle.length);}
const fr=JSON.parse(content.fr);fr.dungeon??={};fr.dungeon.keys={name:'Clé {prefix} {suffix}',unknown:'Clé n°{id}',pickup:'Vous avez trouvé la {key} !',lockedDoor:'Cette porte est verrouillée. Il vous faut la {key}.',prefixes:{p0:'des Arbres',p1:'des Calmars',p2:'des Dragons',p3:'des Kabukis',p4:'des Roméo',p5:'des Gobelins',p6:'des Anges',p7:'des Roncivores'},suffixes:{s0:'Magiques',s1:'Enchantés',s2:'Morts',s3:'en Plastique',s4:'Étincellants',s5:'Rouges',s6:'Maquillés',s7:'en Carton'}};
Object.assign(fr.dungeon,{goldPickup:"Vous avez récupéré {amount} pièces d'or !",goldEmpty:'Ce trésor ne contient plus de pièces d’or.',missingDoorKey:'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.',moveRefused:'Déplacement refusé par le serveur.',scenarioProcessed:'Événement traité par le serveur.'});
const keys=`/** Cosmetic MT key names: only the numeric keyId matters to gameplay. */
export type MtDungeonTranslate = (key: string, params?: Record<string, string | number>) => string;
function seed32(value: string): number {
  let hash = 2166136261;
  for (let i=0;i<value.length;i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash,16777619); }
  return hash >>> 0;
}
export function mtDungeonKeyName(leaderDinozId:number,mapId:string,keyId:number,t:MtDungeonTranslate):string {
  if(!Number.isSafeInteger(leaderDinozId)||leaderDinozId<=0||!Number.isSafeInteger(keyId)||keyId<0||!/^[a-z][a-z0-9]*_[0-9]+$/.test(mapId))return t('dungeon.keys.unknown',{id:keyId});
  const dungeonId=mapId.replace(/_[0-9]+$/,'');
  const prefixIndex=seed32(\`\${leaderDinozId}:\${dungeonId}:\${keyId}:prefix\`) % 8;
  const suffixIndex=seed32(\`\${leaderDinozId}:\${dungeonId}:\${keyId}:suffix\`) % 8;
  return t('dungeon.keys.name',{prefix:t(\`dungeon.keys.prefixes.p\${prefixIndex}\`),suffix:t(\`dungeon.keys.suffixes.s\${suffixIndex}\`)});
}
export function mtDungeonKeyPickupMessage(leaderDinozId:number,mapId:string,keyId:number,t:MtDungeonTranslate):string {
  return t('dungeon.keys.pickup',{key:mtDungeonKeyName(leaderDinozId,mapId,keyId,t)});
}
export function mtDungeonLockedDoorMessage(leaderDinozId:number,mapId:string,keyId:number,t:MtDungeonTranslate):string {
  return t('dungeon.keys.lockedDoor',{key:mtDungeonKeyName(leaderDinozId,mapId,keyId,t)});
}
`.replaceAll('\\`','`');
let page=content.page;
for(const [a,b] of [
['mtDungeonLockedDoorMessage(leaderId, result.session.mapId, result.requiredKey!)','mtDungeonLockedDoorMessage(leaderId, result.session.mapId, result.requiredKey!, t)'],
['mtDungeonKeyPickupMessage(leaderId, result.session.mapId, collectedKeys[0]!)','mtDungeonKeyPickupMessage(leaderId, result.session.mapId, collectedKeys[0]!, t)'],
['mtDungeonKeyPickupMessage(leaderId, result.session.mapId, id)','mtDungeonKeyPickupMessage(leaderId, result.session.mapId, id, t)'],
["'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.'","t('dungeon.missingDoorKey')"],
["'Déplacement refusé par le serveur.'","t('dungeon.moveRefused')"],
["'Événement traité par le serveur.'","t('dungeon.scenarioProcessed')"],
['`Vous avez récupéré ${result.goldAwarded} pièces d\'or !`',"t('dungeon.goldPickup', { amount: result.goldAwarded })"],
["'Ce trésor ne contient plus de pièces d’or.'","t('dungeon.goldEmpty')"]])page=once(page,a,b);
const test=`import {describe,expect,it} from 'vitest';
import fr from '../../../src/i18n/locales/FR.json';
import {mtDungeonKeyName,mtDungeonKeyPickupMessage,mtDungeonLockedDoorMessage,type MtDungeonTranslate} from '../../../src/components/dungeon/mtDungeonKeyNames.js';
const t:MtDungeonTranslate=(path,params={})=>{const value=path.split('.').reduce<unknown>((o,k)=>o&&typeof o==='object'?(o as Record<string,unknown>)[k]:undefined,fr);if(typeof value!=='string')throw Error('Missing '+path);return value.replace(/\\{(\\w+)\\}/g,(_,key:string)=>String(params[key]??''));};
describe('localized MT key names',()=>{
 it('keeps a stable localized name across stages',()=>{const name=mtDungeonKeyName(42,'stepp_0',3,t);expect(name).toMatch(/^Clé des /);expect(mtDungeonKeyName(42,'stepp_3',3,t)).toBe(name);});
 it('keeps names identical in pickup and locked door',()=>{const name=mtDungeonKeyName(42,'stepp_0',7,t);expect(mtDungeonKeyPickupMessage(42,'stepp_0',7,t)).toContain(name);expect(mtDungeonLockedDoorMessage(42,'stepp_2',7,t)).toContain(name);});
 it('uses localized invalid key name',()=>expect(mtDungeonKeyName(0,'stepp_0',2,t)).toBe('Clé n°2'));
});
`;
// Nothing is written until every source anchor has passed validation.
for(const [k,s] of Object.entries({keys,page,fr:JSON.stringify(fr,null,2)+'\n',test}))writeFileSync(resolve(process.cwd(),paths[k]),s,'utf8');
console.log('Step 41 i18n applied.');
