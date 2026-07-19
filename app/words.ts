export type Grade = "First" | "Second" | "Third";
export type SightWord = { word: string; grade: Grade };

export const lists: Record<Grade, string[]> = {
  First: ["after","again","an","any","as","ask","by","could","every","fly","from","give","going","had","has","her","him","his","how","just","know","let","live","may","of","old","once","open","over","put","round","some","stop","take","thank","them","then","think","walk","were","when"],
  Second: ["always","around","because","been","before","best","both","buy","call","cold","does","don't","fast","first","five","found","gave","goes","green","its","made","many","off","or","pull","read","right","sing","sit","sleep","tell","their","these","those","upon","us","use","very","wash","which","why","wish","work","would","write","your"],
  Third: ["about","better","bring","carry","clean","cut","done","draw","drink","eight","fall","far","full","got","grow","hold","hot","hurt","if","keep","kind","laugh","light","long","much","myself","never","only","own","pick","seven","shall","show","six","small","start","ten","today","together","try","warm"],
};
export const words: SightWord[] = (Object.keys(lists) as Grade[]).flatMap(grade => lists[grade].map(word => ({ word, grade })));
export const learningOrder = ["after","because","better","around","write","carry","their","together","could","always","laugh","when","would","about","every","which","never","think","before","today",...words.map(w => w.word)];

