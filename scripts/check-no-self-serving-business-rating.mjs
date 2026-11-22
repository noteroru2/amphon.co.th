/**
 * Safety gate for self-serving Google reviews:
 * business-controlled reviews are fine to visibly display, but they must
 * not be used as Organization/LocalBusiness star rich-result markup.
 * https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.join(process.cwd(),'dist/client');
assert.ok(fs.existsSync(root),'Run the Astro Cloudflare build first');
let pages=0,graphNodes=0,entities=0,violations=[];
const orgTypes=new Set(['Organization','LocalBusiness','ProfessionalService','Store','ElectronicsStore','Corporation']);
const visit=(node,file)=>{
 if(Array.isArray(node)){for(const v of node)visit(v,file);return;}
 if(!node||typeof node!=='object')return;
 if(node['@type']){
  graphNodes++;
  const types=Array.isArray(node['@type'])?node['@type']:[node['@type']];
  if(types.some(t=>orgTypes.has(String(t)))){
   entities++;
   if(Object.hasOwn(node,'aggregateRating')||Object.hasOwn(node,'review'))
    violations.push({file,type:types,issue:'Self-serving business rating in structured data'});
  }
 }
 for(const val of Object.values(node))if(val&&typeof val==='object')visit(val,file);
};
function scan(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,ent.name);
  if(ent.isDirectory())scan(file);
  else if(ent.name.endsWith('.html')){
   pages++;
   const html=fs.readFileSync(file,'utf8');
   for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)){
    try{visit(JSON.parse(m[1]),path.relative(root,file));}
    catch(e){violations.push({file:path.relative(root,file),issue:'Invalid JSON-LD: '+String(e).slice(0,140)})}
   }
  }
 }
}
scan(root);
assert.ok(pages>=1189,'Not all static HTML pages were built');
assert.ok(entities>0,'No Organization/LocalBusiness structured data found; validator may be ineffective');
console.log('AMPHON_SELF_SERVING_BUSINESS_REVIEW_SCHEMA_QA '+JSON.stringify({html_pages:pages,graph_nodes:graphNodes,business_nodes:entities,violations:violations.slice(0,12)}));
assert.equal(violations.length,0,'Self-serving Business Review rich result markup or invalid JSON-LD detected');
