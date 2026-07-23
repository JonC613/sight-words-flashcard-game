import assert from "node:assert/strict";
import test from "node:test";
test("renders the finished Wordling Rescue experience",async()=>{const u=new URL("../dist/server/index.js",import.meta.url);u.searchParams.set("test",Date.now());const{default:w}=await import(u.href);const r=await w.fetch(new Request("http://localhost/"),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});assert.equal(r.status,200);const h=await r.text();assert.match(h,/Wordling Rescue/);assert.match(h,/Sight Word Adventures/);assert.match(h,/Find your starting trail/);assert.doesNotMatch(h,/codex-preview|Your site is taking shape/)});

