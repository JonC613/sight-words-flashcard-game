import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("renders the finished Wordling Rescue experience",async()=>{const u=new URL("../dist/server/index.js",import.meta.url);u.searchParams.set("test",Date.now());const{default:w}=await import(u.href);const r=await w.fetch(new Request("http://localhost/"),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});assert.equal(r.status,200);const h=await r.text();assert.match(h,/Wordling Rescue/);assert.match(h,/Sight Word Adventures/);assert.match(h,/Find your starting trail/);assert.match(h,/Preview Adventure Map/);assert.match(h,/>Map</);assert.doesNotMatch(h,/codex-preview|Your site is taking shape/)});
test("collection view class cannot collide with the word-card grid",()=>{
  const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
  assert.match(page,/className="wordCollection"/);
  assert.doesNotMatch(page,/className="collection"/);
  assert.doesNotMatch(css,/\.collection(?![A-Za-z0-9_-])/);
});
