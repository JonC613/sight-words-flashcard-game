"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AdventureMapView from "./adventure-map-view";
import { chooseWorld, completeMission, markStoryViewed, normalizeAdventureMap, recordPlacementSuggestion, resolvePlacementSuggestion, selectAdventureMap } from "./adventure-map.js";
import { COMPLETION_BONUS, summarizeMission } from "./mission-finale";
import { Grade, learningOrder, lists, SightWord, words } from "./words";

type Mode = "read" | "choice" | "spell";
type View = "home" | "map" | "mission" | "finale" | "placement" | "collection" | "parent";
type Progress = { stage:number; due:number; attempts:number; correct:number; modes:Mode[]; mastered:boolean };
type Placement = { completed:boolean; completedAt:number; startingGrade:Grade; attempts:number; correct:number };
type Rescue = { id:string; world:Grade; rescuedAt:number };
type Save = { name:string; stars:number; sessions:number; sound:boolean; progress:Record<string,Progress>; placement?:Placement; rescues?:Rescue[]; adventureMap?:unknown };
type Card = { word:SightWord; mode:Mode; retry?:boolean };
type PlacementAnswer = { word:SightWord; mode:Mode; ok:boolean };
type MissionAnswer = { word:string; ok:boolean };
type MissionResult = { strengthened:string[]; practiceSoon:string[]; starsEarned:number; rescue:Rescue };

const DAY=86_400_000, intervals=[0,1,3,7,14,30,60];
const fresh:Save={name:"Explorer",stars:0,sessions:0,sound:true,progress:{}};
const shuffle=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5);
const placementWords:Record<Grade,string[]>={First:["after","could","every","think"],Second:["because","around","their","write"],Third:["better","carry","together","laugh"]};
const placementModes:Mode[]=["choice","read","spell","choice"];
const worldName=(grade:Grade)=>grade==="First"?"Whispering Woods":grade==="Second"?"Crystal Caves":"Skyward Peaks";
function placementSet(grade:Grade):Card[]{return placementWords[grade].map((name,i)=>({word:words.find(w=>w.word===name)!,mode:placementModes[i]}))}

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
  const [placementPhase,setPlacementPhase]=useState<"intro"|"questions"|"result">("intro"),[placementCards,setPlacementCards]=useState<Card[]>([]),[placementIndex,setPlacementIndex]=useState(0),[placementAnswers,setPlacementAnswers]=useState<PlacementAnswer[]>([]),[placementFeedback,setPlacementFeedback]=useState<{ok:boolean;answer:string}|null>(null),[placementGrade,setPlacementGrade]=useState<Grade>("Second");
  const [missionAnswers,setMissionAnswers]=useState<MissionAnswer[]>([]),[missionResult,setMissionResult]=useState<MissionResult|null>(null),[storageNotice,setStorageNotice]=useState("");
  const [clock,setClock]=useState(0);
  const finalizing=useRef(false),missionId=useRef("");
  useEffect(()=>{let loaded:Save=fresh,notice="";try{const raw=localStorage.getItem("wordling-rescue-v1");if(raw)loaded={...fresh,...JSON.parse(raw)};loaded=normalizeAdventureMap(loaded) as Save}catch{notice="Your adventure is safe for this visit, but this browser could not open the saved copy."}queueMicrotask(()=>{setSave(loaded);setStorageNotice(notice);setClock(Date.now());if(!loaded.placement?.completed)setView("placement");setReady(true)});if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})},[]);
  useEffect(()=>{if(ready)try{localStorage.setItem("wordling-rescue-v1",JSON.stringify(save))}catch{queueMicrotask(()=>setStorageNotice("Your adventure is working, but this browser cannot save changes right now."))}},[save,ready]);
  const current=cards[index],mastered=Object.values(save.progress).filter(p=>p.mastered).length,learning=Object.values(save.progress).filter(p=>!p.mastered).length,due=Object.values(save.progress).filter(p=>p.due<=clock).length;
  const choices=useMemo(()=>current?.mode==="choice"?shuffle([current.word,...shuffle(words.filter(w=>w.grade===current.word.grade&&w.word!==current.word.word)).slice(0,2)]):[],[current]);
  const placementCurrent=placementCards[placementIndex];
  const placementChoices=useMemo(()=>placementCurrent?.mode==="choice"?shuffle([placementCurrent.word,...shuffle(words.filter(w=>w.grade===placementCurrent.word.grade&&w.word!==placementCurrent.word.word)).slice(0,2)]):[],[placementCurrent]);

  function start(){if(selectAdventureMap(save).requiresWorldChoice){setView("map");return}finalizing.current=false;missionId.current=globalThis.crypto?.randomUUID?.()??`mission-${Date.now()}-${Math.random()}`;setMissionAnswers([]);setMissionResult(null);setCards(makeMission(save.progress));setIndex(0);setFeedback(null);setTyped("");setView("mission")}
  function openPlacement(){setPlacementPhase("intro");setPlacementCards([]);setPlacementIndex(0);setPlacementAnswers([]);setPlacementFeedback(null);setTyped("");setView("placement")}
  function beginPlacement(){setPlacementCards(placementSet("Second"));setPlacementIndex(0);setPlacementAnswers([]);setPlacementFeedback(null);setTyped("");setPlacementPhase("questions")}
  function finishPlacement(answers:PlacementAnswer[],branch:Grade){const branchCorrect=answers.slice(4).filter(a=>a.ok).length;const grade:Grade=branch==="Third"?(branchCorrect>=3?"Third":"Second"):(branchCorrect>=3?"Second":"First"),now=Date.now();setSave(s=>{const progress={...s.progress};for(const a of answers){const old=progress[a.word.word];if(old){progress[a.word.word]={...old,due:a.ok?old.due:Math.min(old.due,now),attempts:old.attempts+1,correct:old.correct+(a.ok?1:0),modes:Array.from(new Set([...old.modes,a.mode]))}}else progress[a.word.word]={stage:a.ok?2:0,due:a.ok?now+DAY:now,attempts:1,correct:a.ok?1:0,modes:[a.mode],mastered:false}}const placed={...s,progress,placement:{completed:true,completedAt:now,startingGrade:grade,attempts:answers.length,correct:answers.filter(a=>a.ok).length}};return (s.adventureMap?recordPlacementSuggestion(placed,grade):normalizeAdventureMap(placed)) as Save});setPlacementGrade(grade);setPlacementPhase("result")}
  function answerPlacement(ok:boolean){if(!placementCurrent||placementFeedback)return;setPlacementAnswers(a=>[...a,{word:placementCurrent.word,mode:placementCurrent.mode,ok}]);setPlacementFeedback({ok,answer:placementCurrent.word.word})}
  function nextPlacement(){const nextIndex=placementIndex+1;if(nextIndex===4&&placementCards.length===4){const branch:Grade=placementAnswers.filter(a=>a.ok).length>=3?"Third":"First";setPlacementCards(c=>[...c,...placementSet(branch)])}if(nextIndex>=8){finishPlacement(placementAnswers,placementCards[4]?.word.grade??"First");return}setPlacementIndex(nextIndex);setPlacementFeedback(null);setTyped("")}
  function checkPlacement(e:FormEvent){e.preventDefault();if(typed.trim())answerPlacement(typed.trim().toLowerCase()===placementCurrent.word.word)}
  const placementComplete=!!save.placement?.completed;
  function answer(ok:boolean){if(!current||feedback)return;const name=current.word.word;setMissionAnswers(a=>[...a,{word:name,ok}]);const old=save.progress[name]??{stage:0,due:Date.now(),attempts:0,correct:0,modes:[],mastered:false};const stage=ok?Math.min(6,old.stage+1):Math.max(0,old.stage-1),modes=Array.from(new Set([...old.modes,current.mode]));setSave(s=>({...s,stars:s.stars+(ok?3:1),progress:{...s.progress,[name]:{stage,due:ok?Date.now()+intervals[stage]*DAY:Date.now(),attempts:old.attempts+1,correct:old.correct+(ok?1:0),modes,mastered:stage>=5&&modes.length>=3}}}));if(!ok&&!current.retry&&cards.length<12)setCards(c=>[...c,{word:current.word,mode:"read",retry:true}]);setFeedback({ok,answer:name});if(ok)say("Great remembering!",save.sound)}
  function finishMission(){if(finalizing.current)return;finalizing.current=true;const {strengthened,practiceSoon,starsEarned}=summarizeMission(missionAnswers),world=(selectAdventureMap(save).activeWorld??save.placement?.startingGrade??"First") as Grade,rescuedAt=Date.now(),rescue:Rescue={id:"rescue-"+missionId.current,world,rescuedAt};setMissionResult({strengthened,practiceSoon,starsEarned,rescue});setSave(s=>completeMission(s,{id:missionId.current,completedAt:rescuedAt,completionBonusStars:COMPLETION_BONUS,rescue}) as Save);setCards([]);setView("finale");say("Mission complete! A Wordling is home!",save.sound)}
  function next(){if(index+1>=cards.length){finishMission();return}setIndex(i=>i+1);setFeedback(null);setTyped("")}
  function check(e:FormEvent){e.preventDefault();if(typed.trim())answer(typed.trim().toLowerCase()===current.word.word)}

  return <main className={"app "+view}>
    <header><button className="brand" aria-label="Wordling Rescue home" onClick={()=>setView("home")}><Creature small/><span>Wordling <b>Rescue</b></span></button><div className="tools"><span className="stars">★ {save.stars}</span><button className="round" aria-label={save.sound?"Turn sound off":"Turn sound on"} onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?"♪":"×"}</button><button className="avatar" aria-label="Open grown-up area" onClick={()=>setView("parent")}>{save.name[0]?.toUpperCase()||"E"}</button></div></header>
    {storageNotice&&<p className="storageNotice" role="status">{storageNotice}</p>}

    {view==="home"&&<div className="home">
      <section className="hero"><div className="copy"><small className="eyebrow">● &nbsp; {placementComplete?"TODAY’S WORD QUEST":"YOUR FIRST ADVENTURE"}</small><h1>Words are<br/><em>magic.</em></h1><p>{placementComplete?"Help a lost Wordling find its way home—one remembered word at a time.":"Follow a few quick word clues so your Wordling can find the best trail for you."}</p><button className="primary" onClick={placementComplete?start:openPlacement}>▶ &nbsp; {placementComplete?"Start today’s mission":"Find your starting trail"}</button><div className="meta">{placementComplete?<>◷ About 5 minutes &nbsp; · &nbsp; ✦ {due||3} words ready</>:<>◷ 3–5 minute adventure &nbsp; · &nbsp; No scores</>}</div></div><div className="art"><span className="bubble a">better</span><span className="bubble b">around</span><span className="bubble c">because</span><div className="portal"><Creature/></div></div></section>
      <section className="stats"><article><i>◇</i><b>{learning}</b><span>Words growing</span></article><article><i>★</i><b>{mastered}</b><span>Words mastered</span></article><article><i>↗</i><b>{save.sessions}</b><span>Missions complete</span></article></section>
      <section className="journey"><div className="title"><div><small className="eyebrow">YOUR JOURNEY</small><h2>Explore the word worlds</h2></div><button onClick={()=>setView("map")}>{placementComplete?"Open Adventure Map":"Preview Adventure Map"} →</button></div><div className="worlds">{(["First","Second","Third"] as Grade[]).map((grade,i)=>{const n=lists[grade].filter(w=>save.progress[w]).length;return <article key={grade} className={"world w"+i}><div className="scene">{i===0?"♧":i===1?"◇":"△"}</div><div><small>{grade.toUpperCase()} GRADE</small><h3>{i===0?"Whispering Woods":i===1?"Crystal Caves":"Skyward Peaks"}</h3><div className="track"><i style={{width:Math.max(4,n/lists[grade].length*100)+"%"}}/></div><p>{n} of {lists[grade].length} words discovered</p></div></article>})}</div></section>
    </div>}

    {view==="map"&&<AdventureMapView save={save} onPlacement={openPlacement} onStart={start}
      onChooseWorld={world=>setSave(s=>chooseWorld(s,world) as Save)}
      onStoryViewed={storyId=>setSave(s=>markStoryViewed(s,storyId) as Save)}
      onResolvePlacement={choice=>setSave(s=>resolvePlacementSuggestion(s,choice) as Save)}
      onCollection={()=>setView("collection")}/>}

    {view==="placement"&&<section className="placementQuest">
      {placementPhase==="intro"&&<div className="placementIntro"><button className="placementClose" onClick={()=>setView(placementComplete?"home":"map")} aria-label={placementComplete?"Close":"Preview Adventure Map"}>×</button><div className="placementPortal"><Creature/></div><small className="eyebrow">PLACEMENT QUEST</small><h1>Find your starting trail</h1><p>A few quick word clues will help your Wordling choose the best place to begin. There are no scores—just clues.</p><div className="placementPromises"><span>◷ 3–5 minutes</span><span>✦ 8 word clues</span><span>♡ You can ask for help</span></div><button className="primary" onClick={beginPlacement}>Begin the quest →</button></div>}
      {placementPhase==="questions"&&placementCurrent&&<><div className="missionbar"><button aria-label="Leave Placement Quest" onClick={()=>placementComplete?setView("parent"):setPlacementPhase("intro")}>×</button><div><i style={{width:(placementIndex+(placementFeedback?1:0))/8*100+"%"}}/></div><b>{placementIndex+1}/8</b></div><div className="stage placementStage"><div className="coach"><Creature small/>{placementCurrent.mode==="read"?"Say this word out loud.":placementCurrent.mode==="choice"?"Listen, then find the word.":"Spell the word you hear."}</div>
        {placementCurrent.mode==="read"&&<div className="flash placementFlash"><small>WORD CLUE</small><strong>{placementCurrent.word.word}</strong><button onClick={()=>say(placementCurrent.word.word,save.sound)}>♪ Hear the word</button></div>}
        {placementCurrent.mode==="choice"&&<div className="question"><button className="listen" onClick={()=>say(placementCurrent.word.word,save.sound)}>♪ &nbsp; Hear the word</button><div className="choices">{placementChoices.map(w=><button disabled={!!placementFeedback} onClick={()=>answerPlacement(w.word===placementCurrent.word.word)} key={w.word}>{w.word}</button>)}</div></div>}
        {placementCurrent.mode==="spell"&&<form className="question spelling" onSubmit={checkPlacement}><button type="button" className="listen" onClick={()=>say(placementCurrent.word.word,save.sound)}>♪ &nbsp; Hear the word</button><label htmlFor="placement-spell">Type the word</label><input id="placement-spell" autoCapitalize="none" autoComplete="off" value={typed} onChange={e=>setTyped(e.target.value)} disabled={!!placementFeedback}/>{!placementFeedback&&<button className="primary" disabled={!typed.trim()}>Check my word</button>}</form>}
        {!placementFeedback&&placementCurrent.mode==="read"&&<div className="selfcheck"><button onClick={()=>answerPlacement(false)}>Show me</button><button className="primary" onClick={()=>answerPlacement(true)}>I knew it!</button></div>}
        {placementFeedback&&<div className={"feedback "+(placementFeedback.ok?"good":"help")} role="status"><div><b>{placementFeedback.ok?"Trail clue found!":"A useful clue!"}</b><span>{placementFeedback.ok?"Your Wordling is learning where to begin.":<>This word is “{placementFeedback.answer}.” We’ll practice it again later.</>}</span></div><button className="primary" onClick={nextPlacement}>{placementIndex===7?"Find my trail":"Next clue"} →</button></div>}
      </div></>}
      {placementPhase==="result"&&<div className="placementResult"><div className={"trailBadge trail"+placementGrade}><Creature/></div><small className="eyebrow">YOUR TRAIL IS READY</small><h1>{worldName(placementGrade)}</h1><p>Your Wordling found a great place to start. Daily missions will keep adjusting as you learn—so the trail always fits you.</p><div className="resultNote"><b>✦ Your first mission is ready</b><span>Words you know will return later. Words that need practice will return sooner.</span></div><button className="primary" onClick={()=>setView("map")}>Open my Adventure Map →</button></div>}
    </section>}

    {view==="mission"&&current&&<section className="mission"><div className="missionbar"><button aria-label="Leave mission" onClick={()=>setView("home")}>×</button><div><i style={{width:(index+(feedback?1:0))/cards.length*100+"%"}}/></div><b>{index+1}/{cards.length}</b></div><div className="stage"><div className="coach"><Creature small/>{current.retry?"Let’s give this word another boost!":current.mode==="read"?"Say this word out loud.":current.mode==="choice"?"Listen, then find the word.":"Spell the word you hear."}</div>
      {current.mode==="read"&&<div className="flash"><small>{current.word.grade} grade</small><strong>{current.word.word}</strong><button onClick={()=>say(current.word.word)}>♪ Hear the word</button></div>}
      {current.mode==="choice"&&<div className="question"><button className="listen" onClick={()=>say(current.word.word)}>♪ &nbsp; Hear the word</button><div className="choices">{choices.map(w=><button disabled={!!feedback} onClick={()=>answer(w.word===current.word.word)} key={w.word}>{w.word}</button>)}</div></div>}
      {current.mode==="spell"&&<form className="question spelling" onSubmit={check}><button type="button" className="listen" onClick={()=>say(current.word.word)}>♪ &nbsp; Hear the word</button><label htmlFor="spell">Type the word</label><input id="spell" autoCapitalize="none" autoComplete="off" value={typed} onChange={e=>setTyped(e.target.value)} disabled={!!feedback}/>{!feedback&&<button className="primary" disabled={!typed.trim()}>Check my word</button>}</form>}
      {!feedback&&current.mode==="read"&&<div className="selfcheck"><button onClick={()=>answer(false)}>Show me</button><button className="primary" onClick={()=>answer(true)}>I knew it!</button></div>}
      {feedback&&<div className={"feedback "+(feedback.ok?"good":"help")} role="status"><div><b>{feedback.ok?"Brilliant remembering!":"Let’s map it together."}</b><span>{feedback.ok?"“"+feedback.answer+"” grew stronger.":"The word is “"+feedback.answer+"”. Say it, then trace the letters."}</span></div><button className="primary" onClick={next}>{index+1>=cards.length?"Finish mission":"Next word"} →</button></div>}
    </div></section>}

    {view==="finale"&&missionResult&&<section className="missionFinale">
      <div className="finaleBurst" aria-hidden="true"><span>✦</span><span>★</span><span>✦</span></div>
      <div className={"finaleRescue trail"+missionResult.rescue.world}><Creature/></div>
      <small className="eyebrow">MISSION COMPLETE</small>
      <h1>A Wordling is home!</h1>
      <p>You followed every clue and made your trail stronger.</p>
      <div className="finaleReward"><span><b>+{missionResult.starsEarned}</b> stars earned</span><span><b>+1</b> Wordling rescued</span></div>
      <div className="learningSummary">
        <article><i>✦</i><div><small>GREW STRONGER</small><div className="wordChips">{missionResult.strengthened.length?missionResult.strengthened.map(word=><b key={word}>{word}</b>):<span>Every clue helped your trail grow.</span>}</div></div></article>
        <article><i>↻</i><div><small>PRACTICE COMING SOON</small><div className="wordChips">{missionResult.practiceSoon.length?missionResult.practiceSoon.map(word=><b key={word}>{word}</b>):<span>You’re all caught up for now.</span>}</div><p>These words will return sooner so they can grow.</p></div></article>
      </div>
      <div className="finaleActions"><button className="primary" onClick={()=>setView("map")}>See my new map step →</button><button onClick={()=>setView("collection")}>Visit my Wordlings</button></div>
    </section>}

    {view==="collection"&&<section className="subpage"><div className="subhead"><div><small className="eyebrow">WORDLING COLLECTION</small><h1>Every word has a home.</h1><p>Practice across different days to help each Wordling grow.</p></div><Creature/></div><div className="rescuedShelf"><div><small className="eyebrow">RESCUED WORDLINGS</small><h2>{save.rescues?.length??0} safe at home</h2></div><div className="rescueRow">{(save.rescues??[]).slice(-6).reverse().map(rescue=><div className={"miniRescue trail"+rescue.world} key={rescue.id}><Creature small/><span>{worldName(rescue.world)}</span></div>)}{!save.rescues?.length&&<p>Complete a mission to rescue your first Wordling.</p>}</div></div><div className="filters">{(["All","First","Second","Third"] as const).map(f=><button className={filter===f?"on":""} onClick={()=>setFilter(f)} key={f}>{f}{f==="All"?" words":" grade"}</button>)}</div><div className="wordCollection">{words.filter(w=>filter==="All"||w.grade===filter).map(w=>{const p=save.progress[w.word];return <article className={p?.mastered?"mastered":p?"learning":"locked"} key={w.word}><i>{p?.mastered?"★":p?"✦":"·"}</i><b>{p?w.word:"???"}</b><small>{p?.mastered?"Mastered":p?"Level "+p.stage:w.grade}</small></article>})}</div></section>}

    {view==="parent"&&<section className="subpage parent"><small className="eyebrow">GROWN-UP AREA</small><h1>Learning at a glance</h1><p>Progress stays on this device. Review timing adapts after every answer.</p><div className="parentgrid"><article><h2>Explorer settings</h2><label>Player name<input value={save.name} maxLength={18} onChange={e=>setSave(s=>({...s,name:e.target.value||"Explorer"}))}/></label><label className="toggle">Sound and spoken words<input type="checkbox" checked={save.sound} onChange={e=>setSave(s=>({...s,sound:e.target.checked}))}/></label><div className="placementSummary"><small>STARTING TRAIL</small><b>{save.placement?.completed?worldName(save.placement.startingGrade):"Not set yet"}</b><button onClick={openPlacement}>{save.placement?.completed?"Recheck starting level":"Start Placement Quest"}</button></div></article><article><h2>Current picture</h2><div className="numbers"><span><b>{mastered}</b>mastered</span><span><b>{learning}</b>learning</span><span><b>{due}</b>due now</span></div><div className="track"><i style={{width:mastered/words.length*100+"%"}}/></div><small>{mastered} of {words.length} Dolch words securely learned</small></article><article className="wide"><h2>Words needing a little help</h2><div className="trouble">{Object.entries(save.progress).filter(([,p])=>p.attempts-p.correct>0).sort((a,b)=>(b[1].attempts-b[1].correct)-(a[1].attempts-a[1].correct)).slice(0,8).map(([word,p])=><span key={word}><b>{word}</b>{p.correct}/{p.attempts} correct</span>)}{!Object.values(save.progress).some(p=>p.attempts-p.correct>0)&&<p>Missed words will appear here after a mission.</p>}</div></article></div><button className="reset" onClick={()=>{if(confirm("Reset all progress on this device?"))setSave(fresh)}}>Reset progress</button></section>}

    {view!=="mission"&&view!=="placement"&&view!=="finale"&&<nav><button className={view==="home"?"on":""} onClick={()=>setView("home")}><b>⌂</b>Home</button><button onClick={placementComplete?start:openPlacement}><b>▶</b>Play</button><button className={view==="map"?"on":""} onClick={()=>setView("map")}><b>⌁</b>Map</button><button className={view==="parent"?"on":""} onClick={()=>setView("parent")}><b>▦</b>Grown-ups</button></nav>}
  </main>
}

