const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const {mkdirSync} = require('node:fs');
const {join} = require('node:path');
const output = process.argv[3] || 'captures';
mkdirSync(output, {recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1280,height:840},reducedMotion:'reduce'});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.argv[2] || 'http://127.0.0.1:4173/');
await page.click('.open-studio');
await page.waitForSelector('.studio-floor.rendered canvas'); await page.waitForTimeout(400);
await page.locator('dialog').screenshot({path:join(output,'estudio.png')});
await page.click('.studio-choices button:nth-child(3)');
await page.waitForSelector('.hero[data-flavor=blueberry]');
await page.click('.view-toggle');await page.waitForSelector('.model-view canvas');
for(const [i,id] of ['strawberry','mango','blueberry','lime'].entries()){
await page.locator('#flavor-picker button').nth(i).click();
await page.waitForSelector('.hero[data-flavor='+id+']');
for(const view of ['front','quarter','side','back','top','bottom','macro','']){
await page.selectOption('#inspection-view',view);await page.waitForTimeout(200);
await page.locator(view ? '.model-view canvas' : '.stage').screenshot({path:join(output,id+'-'+(view || 'scene')+'.png')});
}}
await page.click('.view-toggle');
for(const sel of ['.exploration','.collection','.taste-guide','.manifesto','.finale','.footer']){
await page.locator(sel).screenshot({path:join(output,sel.slice(1)+'.png')});
}
assert.deepEqual(errors,[]);
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
