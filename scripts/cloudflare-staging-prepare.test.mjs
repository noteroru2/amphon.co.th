import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareCloudflareStaging, STAGING_WORKER, STAGING_HOST } from './cloudflare-staging-prepare.mjs';

function mockBuild(override = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-stage-54-'));
  fs.mkdirSync(path.join(dir, 'dist/client'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'dist/server'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'dist/client/_headers'),
    override.headers ?? [
      '/_astro/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '# GENERATED FROM vercel.json — PRODUCTION. Issue #54.',
      '/*',
      '  X-Content-Type-Options: nosniff',
      '',
    ].join('\n'));
  fs.writeFileSync(path.join(dir, 'dist/client/_redirects'),
    Array.from({length:260},(_,i) => '/old-'+i+' /new-'+i+' 308')
      .concat(['/*/ /:splat 308']).join('\n'));
  fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify({
    redirects: Array.from({length:260},(_,i) => ({
      source:'/old-'+i, destination:'/new-'+i, statusCode:308,
    })).concat([{source:'/:path+/',destination:'/:path+',statusCode:308}]),
  }));
  fs.writeFileSync(path.join(dir,'dist/server/wrangler.json'),
    JSON.stringify(override.config ?? { name:'amphon-co-th', main:'./entry.mjs',
      assets:{directory:'../client',binding:'ASSETS'}}));
  return dir;
}

test('staging converts guarded production artifact and only staging gets noindex', () => {
  const d=mockBuild();
  try {
    const report=prepareCloudflareStaging(d);
    assert.equal(report.stagingWorker,STAGING_WORKER);
    assert.equal(report.plannedStagingHost,STAGING_HOST);
    assert.equal(report.customDomainConfigured,false);
    const header=fs.readFileSync(path.join(d,'dist/client/_headers'),'utf8');
    assert.match(header,/^\/\*[\r\n]+  X-Robots-Tag: noindex, nofollow/m);
    assert.match(header,/X-Content-Type-Options: nosniff/);
    const config=JSON.parse(fs.readFileSync(path.join(d,'dist/server/wrangler.staging.json'),'utf8'));
    assert.equal(config.name,'amphon-co-th-staging');
    assert.equal(config.workers_dev,true);
    assert.equal(config.keep_vars,true);
    assert.ok(!config.routes && !config.route);
    assert.equal(config.assets.binding,'ASSETS');
  } finally {fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects Preview/noindex input so Production remains separately guarded',()=>{
  const d=mockBuild({headers:'/*\n  X-Robots-Tag: noindex\n# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n'});
  try{assert.throws(()=>prepareCloudflareStaging(d),/CLEAN Production candidate/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects worker identity/host-bound routes that might touch live DNS',()=>{
  const d=mockBuild({config:{name:'amphon-co-th',routes:[{pattern:'amphon.co.th/*'}]}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/routes must be absent/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects accidental reuse of another existing worker',()=>{
  const d=mockBuild({config:{name:'other-website'}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/Refusing to transform/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects staging run against missing Production marker',()=>{
  const d=mockBuild({headers:'/*\n  X-Content-Type-Options: nosniff\n'});
  try{assert.throws(()=>prepareCloudflareStaging(d),/guarded Production build/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});
