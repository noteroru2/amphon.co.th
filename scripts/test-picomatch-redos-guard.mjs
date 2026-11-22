import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const root=process.cwd();
const require=createRequire(import.meta.url);
const copies=[
  {name:'root picomatch 4.0.7',file:path.join(root,'node_modules/picomatch/index.js')},
  {name:'nested picomatch 2.3.2',file:path.join(root,'node_modules/anymatch/node_modules/picomatch/index.js')}
];
const attacks=['+(*)','+(*a)','*(*a)','+(a*)','*(a*)','+(a*b)','+(a*|b)','*(*.js)','x+(*a)y','+(+(*a))','+(foo*(bar))'];
const safe=[
  ['example.js','*.js',true],['src/lib/index.js','src/**/*.js',true],
  ['file.ts','*.js',false],['bar','@(foo|bar)',true],
  ['foofoo','+(foo|bar)',true],['file.ts','@(*.js|*.ts)',true],
  ['ordinary.txt','ordinary.txt',true]
];
for(const {name,file} of copies){
  const pm=require(file);
  test(name+' rejects ReDoS globs before compiling RegExp',()=>{
    for(const pattern of attacks){
      assert.throws(()=>pm.makeRe(pattern),/AMPHON_PICOMATCH_REDOS_PATTERN_REJECTED/,
        name+' pattern '+pattern);
    }
  });
  test(name+' preserves typical Astro and Vite matcher patterns',()=>{
    for(const [input,glob,expected] of safe){
      assert.equal(pm.isMatch(input,glob),expected,name+' '+input+' '+glob);
    }
    assert.doesNotThrow(()=>pm.makeRe('+(foo\\*bar)'));
  });
  test(name+' cannot turn off protection with maxExtglobRecursion=false',()=>{
    assert.throws(()=>pm.makeRe('+(*a)',{maxExtglobRecursion:false}),
      /AMPHON_PICOMATCH_REDOS_PATTERN_REJECTED/);
  });
}
test('pathological pattern and input are handled in a bounded subprocess',()=>{
  const code=[
    "const assert=require('node:assert/strict');",
    'const paths='+JSON.stringify(copies.map(x=>x.file))+';',
    "for(const p of paths){const pm=require(p);",
    "for(const glob of ['+(*)','+(*a)','*(*a)','+(a*|b)']){",
    "assert.throws(()=>pm.isMatch('a'.repeat(1000)+'!',glob),/AMPHON_PICOMATCH_REDOS_PATTERN_REJECTED/);",
    "}}"
  ].join('\n');
  const out=spawnSync(process.execPath,['-e',code],{timeout:3000,encoding:'utf8'});
  assert.equal(out.error,undefined,out.error?.message);
  assert.equal(out.status,0,out.stderr||out.stdout);
});
test('patch verification proves both locked picomatch copies are hardened',()=>{
  const out=spawnSync(process.execPath,['scripts/apply-picomatch-redos-guard.mjs','--verify'],
    {cwd:root,timeout:3000,encoding:'utf8'});
  assert.equal(out.status,0,out.stderr);
  assert.equal((out.stdout.match(/PICOMATCH_REDOS_GUARD /g)||[]).length,2);
});
