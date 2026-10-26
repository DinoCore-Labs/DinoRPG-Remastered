import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const page = resolve(root, 'app/client/src/pages/DungeonPage.vue');
if (!existsSync(page)) throw new Error('Run from DinoRPG monorepo root');
const source=readFileSync(page,'utf8');
let result=source;
const obsoleteCss = `.mt-test__header {\n\ttext-align: center;\n}\n.mt-test__header h2 {\n\tmargin: 0.65rem 0 0.25rem;\n\tfont-size: 1.3rem;\n}\n.mt-test__header p {\n\tfont-size: 0.8rem;\n\tmargin: 0.25rem 0 0.55rem;\n}\n.mt-test__status {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tjustify-content: center;\n\tgap: 0.4rem 0.85rem;\n\tfont-size: 0.75rem;\n}\n`;
if (!result.includes(obsoleteCss)) throw new Error('CSS anchor changed; no edits applied');
if (/class=["'][^"']*mt-test__(header|status)/.test(result)) throw new Error('Obsolete CSS still used; no edits applied');
result=result.replace(obsoleteCss,'');
// Remove step markers in end-of-line comments and standalone comment lines.
result=result.replace(/; \/\/ STEP_20R_MT_BOUNDARIES/g,';')
 .replace(/; \/\/ STEP_20O_MT_DUNGEON/g,';')
 .replace(/\n\s*\/\/ STEP_20O_MT_DUNGEON\r?\n/g,'\n')
 .replace(/\n\s*\/\/ STEP_27_EXIT_ON_DINOZ[^\r\n]*\r?\n/g,'\n');
const langs=['FR','EN','ES','DE'];
const flat=(obj,prefix='')=>Object.entries(obj).flatMap(([k,v])=>typeof v==='string'?[prefix+k]:v&&typeof v==='object'?flat(v,prefix+k+'.'):[]).sort();
const data=langs.map(lang=>{let p=resolve(root,`app/client/src/i18n/locales/${lang}.json`);if(!existsSync(p))throw new Error(`Missing ${lang}`);let o=JSON.parse(readFileSync(p,'utf8'));if(!o.dungeon)throw new Error(`Missing ${lang}.dungeon`);return {lang,strings:flat(o.dungeon),data:o.dungeon};});
const reference=data[0].strings;
for(const {lang,strings} of data.slice(1)){const missing=reference.filter(k=>!strings.includes(k)),extra=strings.filter(k=>!reference.includes(k));if(missing.length||extra.length)throw new Error(`${lang} dungeon mismatch: missing=${missing.join(',')} extra=${extra.join(',')}`);}
const placeholders=s=>[...s.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(m=>m[1]).sort().join('|');
const get=(o,key)=>key.split('.').reduce((v,k)=>v[k],o);
for(let key of reference){let expected=placeholders(get(data[0].data,key));for(let {lang,data:obj} of data.slice(1))if(placeholders(get(obj,key))!==expected)throw new Error(`${lang} placeholder mismatch: ${key}`);}
// Write only after every validation succeeds.
if(result!==source)writeFileSync(page,result,'utf8');
console.log(`Step 42: removed unused dungeon CSS and stale markers; checked ${reference.length} i18n keys across 4 locales.`);
