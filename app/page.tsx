"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Grade, learningOrder, lists, SightWord, words } from "./words";

type Mode = "read" | "choice" | "spell";
type View = "home" | "mission" | "collection" | "parent";
type Progress = { stage:number; due:number; attempts:number; correct:number; modes:Mode[]; mastered:boolean };
type Save = { name:string; stars:number; sessions:number; sound:boolean; progress:Record<string,Progress> };
type Card = { word:SightWord; mode:Mode; retry?:boolean };

const DAY=86_400_000, intervals=[0,1,3,7,14,30,60];
const fresh:Save={name:"Explorer",stars:0,sessions:0,sound:true,progress:{}};
const shuffle=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5);

function makeMission(progress:Save["progress"]):Card[]{
  const now=Date.now();
  const due=words.filter(w=>progress[w.word]?.due<=now).sort((a,b)=>progress[a.word].due-progress[b.word].due).slice(0,5);
  const included=new Set(due.map(w=>w.word));
  const newWords=learningOrder.filter((w,i,a)=>a.indexOf(w)===i).filter(w=>!progress[w]&&!included.has(w)).slice(0,3).map(n=>words.find(w=>w.word===n)!).filter(Boolean);
  const modes:Mode[]=["choice","read","spell"];
  const cards:Card[]=[...due,...newWords].map((word,i)=>({word,mode:modes[i%3]}));
  let i=0;
  while(cards.length<8&&newWords.length){const word=newWords[i%newWords.length];const used=cards.filter(c=>c.word.word===word.word).map(c=>c.mode);cards.push({word,mode:modes.find(m=>!used.includes(m))??modes[i%3]});i++}
  return cards.slice(0,10);
}
function say(text:string,on=true){if(!on||typeof window==="undefined"||!("speechSynthesis" in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.78;u.pitch=1.05;speechSynthesis.speak(u)}
function Creature({small=false}:{small?:boolean}){return <div className={"creature "+(small?"small":"")} aria-hidden="true"><i className="ear l"/><i className="ear r"/><i className="eye l"/><i className="eye r"/><i className="smile"/>{!small&&<b>✦</b>}</div>}

export default function Page(){
  const [save,setSave]=useState<Save>(fresh),[ready,setReady]=useState(false),[view,setView]=useState<View>("home"),[cards,setCards]=useState<Card[]>([]),[index,setIndex]=useState(0),[feedback,setFeedback]=useState<{ok:boolean;answer:string}|null>(null),[typed,setTyped]=useState(""),[filter,setFilter]=useState<Grade|"All">("All");
  useEffect(()=>{const raw=localStorage.getItem("wordling-rescue-v1");if(raw)try{setSave({...fresh,...JSON.parse(raw)})}catch{}setReady(true);if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})},[]);
  useEffect(()=>{if(ready)localStorage.setItem("wordling-rescue-v1",JSON.stringify(save))},[save,ready]);
  const current=cards[index],mastered=Object.values(save.progress).filter(p=>p.mastered).length,learning=Object.values(save.progress).filter(p=>!p.mastered).length,due=Object.values(save.progress).filter(p=>p.due<=Date.now()).length;
  const choices=useMemo(()=>current?.mode==="choice"?shuffle([current.word,...shuffle(words.filter(w=>w.grade===current.word.grade&&w.word!==current.word.word)).slice(0,2)]):[],[current]);

  function start(){setCards(makeMission(save.progress));setIndex(0);setFeedback(null);setTyped("");setView("mission")}
  function answer(ok:boolean){if(!current||feedback)return;const name=current.word.word,old=save.progress[name]??{stage:0,due:Date.now(),attempts:0,correct:0,modes:[],mastered:false};const stage=ok?Math.min(6,old.stage+1):Math.max(0,old.stage-1),modes=Array.from(new Set([...old.modes,current.mode]));setSave(s=>({...s,stars:s.stars+(ok?3:1),progress:{...s.progress,[name]:{stage,due:ok?Date.now()+intervals[stage]*DAY:Date.now(),attempts:old.attempts+1,correct:old.correct+(ok?1:0),modes,mastered:stage>=5&&modes.length>=3}}}));if(!ok&&!current.retry&&cards.length<12)setCards(c=>[...c,{word:current.word,mode:"read",retry:true}]);setFeedback({ok,answer:name});if(ok)say("Great remembering!",save.sound)}
  function next(){if(index+1>=cards.length){setSave(s=>({...s,sessions:s.sessions+1}));setCards([]);setView("home");return}setIndex(i=>i+1);setFeedback(null);setTyped("")}
  function check(e:FormEvent){e.preventDefault();if(typed.trim())answer(typed.trim().toLowerCase()===current.word.word)}

  return <main className={"app "+view}>
    <header><button className="brand" onClick={()=>setView("home")}><Creature small/><span>Wordling <b>Rescue</b></span></button><div className="tools"><span className="stars">★ {save.stars}</span><button className="round" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?"♪":"×"}</button><button className="avatar" onClick={()=>setView("parent")}>{save.name[0]?.toUpperCase()||"E"}</button></div></header>

    {view==="home"&&<div className="home">
      <section className="hero"><div className="copy"><small className="eyebrow">● &nbsp; TODAY&apos;S WORD QUEST</small><h1>Words are<br/><em>magic.</em></h1><p>Help a lost Wordling find its way home—one remembered word at a time.</p><button className="primary" onClick={start}>▶ &nbsp; Start today&apos;s mission</button><div className="meta">◷ About 5 minutes &nbsp; · &nbsp; ✦ {due||3} words ready</div></div><div className="art"><span className="bubble a">better</span><span className="bubble b">around</span><span className="bubble c">because</span><div className="portal"><Creature/></div></div></section>
      <section className="stats"><article><i>◇</i><b>{learning}</b><span>Words growing</span></article><article><i>★</i><b>{mastered}</b><span>Words mastered</span></article><article><i>↗</i><b>{save.sessions}</b><span>Missions complete</span></article></section>
      <section className="journey"><div className="title"><div><small className="eyebrow">YOUR JOURNEY</small><h2>Explore the word worlds</h2></div><button onClick={()=>setView("collection")}>View collection →</button></div><div className="worlds">{(["First","Second","Third"] as Grade[]).map((grade,i)=>{const n=lists[grade].filter(w=>save.progress[w]).length;return <article key={grade} className={"world w"+i}><div className="scene">{i===0?"♧":i===1?"◇":"△"}</div><div><small>{grade.toUpperCase()} GRADE</small><h3>{i===0?"Whispering Woods":i===1?"Crystal Caves":"Skyward Peaks"}</h3><div className="track"><i style={{width:Math.max(4,n/lists[grade].length*100)+"%"}}/></div><p>{n} of {lists[grade].length} words discovered</p></div></article>})}</div></section>
    </div>}

    {view==="mission"&&current&&<section className="mission"><div className="missionbar"><button onClick={()=>setView("home")}>×</button><div><i style={{width:(index+(feedback?1:0))/cards.length*100+"%"}}/></div><b>{index+1}/{cards.length}</b></div><div className="stage"><div className="coach"><Creature small/>{current.retry?"Let’s give this word another boost!":current.mode==="read"?"Say this word out loud.":current.mode==="choice"?"Listen, then find the word.":"Spell the word you hear."}</div>
      {current.mode==="read"&&<div className="flash"><small>{current.word.grade} grade</small><strong>{current.word.word}</strong><button onClick={()=>say(current.word.word)}>♪ Hear the word</button></div>}
      {current.mode==="choice"&&<div className="question"><button className="listen" onClick={()=>say(current.word.word)}>♪ &nbsp; Hear the word</button><div className="choices">{choices.map(w=><button disabled={!!feedback} onClick={()=>answer(w.word===current.word.word)} key={w.word}>{w.word}</button>)}</div></div>}
      {current.mode==="spell"&&<form className="question spelling" onSubmit={check}><button type="button" className="listen" onClick={()=>say(current.word.word)}>♪ &nbsp; Hear the word</button><label htmlFor="spell">Type the word</label><input id="spell" autoCapitalize="none" autoComplete="off" value={typed} onChange={e=>setTyped(e.target.value)} disabled={!!feedback}/>{!feedback&&<button className="primary" disabled={!typed.trim()}>Check my word</button>}</form>}
      {!feedback&&current.mode==="read"&&<div className="selfcheck"><button onClick={()=>answer(false)}>Show me</button><button className="primary" onClick={()=>answer(true)}>I knew it!</button></div>}
      {feedback&&<div className={"feedback "+(feedback.ok?"good":"help")} role="status"><div><b>{feedback.ok?"Brilliant remembering!":"Let’s map it together."}</b><span>{feedback.ok?"“"+feedback.answer+"” grew stronger.":"The word is “"+feedback.answer+"”. Say it, then trace the letters."}</span></div><button className="primary" onClick={next}>{index+1>=cards.length?"Finish mission":"Next word"} →</button></div>}
    </div></section>}

    {view==="collection"&&<section className="subpage"><div className="subhead"><div><small className="eyebrow">WORDLING COLLECTION</small><h1>Every word has a home.</h1><p>Practice across different days to help each Wordling grow.</p></div><Creature/></div><div className="filters">{(["All","First","Second","Third"] as const).map(f=><button className={filter===f?"on":""} onClick={()=>setFilter(f)} key={f}>{f}{f==="All"?" words":" grade"}</button>)}</div><div className="collection">{words.filter(w=>filter==="All"||w.grade===filter).map(w=>{const p=save.progress[w.word];return <article className={p?.mastered?"mastered":p?"learning":"locked"} key={w.word}><i>{p?.mastered?"★":p?"✦":"·"}</i><b>{p?w.word:"???"}</b><small>{p?.mastered?"Mastered":p?"Level "+p.stage:w.grade}</small></article>})}</div></section>}

    {view==="parent"&&<section className="subpage parent"><small className="eyebrow">GROWN-UP AREA</small><h1>Learning at a glance</h1><p>Progress stays on this device. Review timing adapts after every answer.</p><div className="parentgrid"><article><h2>Explorer settings</h2><label>Player name<input value={save.name} maxLength={18} onChange={e=>setSave(s=>({...s,name:e.target.value||"Explorer"}))}/></label><label className="toggle">Sound and spoken words<input type="checkbox" checked={save.sound} onChange={e=>setSave(s=>({...s,sound:e.target.checked}))}/></label></article><article><h2>Current picture</h2><div className="numbers"><span><b>{mastered}</b>mastered</span><span><b>{learning}</b>learning</span><span><b>{due}</b>due now</span></div><div className="track"><i style={{width:mastered/words.length*100+"%"}}/></div><small>{mastered} of {words.length} Dolch words securely learned</small></article><article className="wide"><h2>Words needing a little help</h2><div className="trouble">{Object.entries(save.progress).filter(([,p])=>p.attempts-p.correct>0).sort((a,b)=>(b[1].attempts-b[1].correct)-(a[1].attempts-a[1].correct)).slice(0,8).map(([word,p])=><span key={word}><b>{word}</b>{p.correct}/{p.attempts} correct</span>)}{!Object.values(save.progress).some(p=>p.attempts-p.correct>0)&&<p>Missed words will appear here after a mission.</p>}</div></article></div><button className="reset" onClick={()=>{if(confirm("Reset all progress on this device?"))setSave(fresh)}}>Reset progress</button></section>}

    {view!=="mission"&&<nav><button className={view==="home"?"on":""} onClick={()=>setView("home")}><b>⌂</b>Home</button><button onClick={start}><b>▶</b>Play</button><button className={view==="collection"?"on":""} onClick={()=>setView("collection")}><b>◇</b>Wordlings</button><button className={view==="parent"?"on":""} onClick={()=>setView("parent")}><b>▦</b>Grown-ups</button></nav>}
  </main>
}

