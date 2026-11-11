// Public DNS snapshot, READ ONLY. Does not reveal Cloudflare proxy flag or modify records.
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
const names=['amphon.co.th','www.amphon.co.th','cf-test.amphon.co.th'];
async function lookup(host,method) {
 try{return await dns[method](host)}
 catch(e){if(['ENODATA','ENOTFOUND','ENOTIMP','ENOTSUPPORTED','ESERVFAIL'].includes(e.code))return [];
   return {error:e.code||String(e.message)}}
}
const hosts=[];
for(const name of names){
 const [A,AAAA,CNAME]=await Promise.all(['resolve4','resolve6','resolveCname'].map(x=>lookup(name,x)));
 hosts.push({name,A,AAAA,CNAME});
}
const [NS,MX,TXT,CAA]=await Promise.all(['resolveNs','resolveMx','resolveTxt','resolveCaa'].map(x=>lookup('amphon.co.th',x)));
const result={checkedAt:new Date().toISOString(),
 source:'Public DNS resolver, NOT Cloudflare zone API. Proxy status / Cloudflare internal CNAME cannot be determined.',
 hosts,zone:{NS,MXRecordCount:Array.isArray(MX)?MX.length:null,
 TXTRecordCount:Array.isArray(TXT)?TXT.length:null,
 CAARecordCount:Array.isArray(CAA)?CAA.length:null}};
fs.mkdirSync('artifacts/cloudflare-migration',{recursive:true});
fs.writeFileSync('artifacts/cloudflare-migration/rc-public-dns.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
