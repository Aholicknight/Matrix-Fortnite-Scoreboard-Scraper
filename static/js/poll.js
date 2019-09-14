const jsonLocation = "../fortnite_scoreboard.json";
const refreshRate = 30;//in seconds
let refreshTimeout;
/**
 * @type {HTMLTableSectionElement}
 */
let table;
/**
 * @type {HTMLElement}
 */
let killsort;
/**
 * @type {HTMLElement}
 */
let scoresort;
let latestjson
let sort = window.localStorage.getItem("sortby") || false;
let sortup = window.localStorage.getItem("sortup") || false;

///todo: add sorting to the list
function setShouldSortScore(shouldSortScore){
    sort = shouldSortScore;
    sortup = !sortup;
    if (sort){
        killsort.className = "fas fa-sort";
        scoresort.className = sortup ? "fas fa-sort-up" : "fas fa-sort-down";
    }else {
        scoresort.className = "fas fa-sort";
        killsort.className = sortup ? "fas fa-sort-up" : "fas fa-sort-down";
    }
    window.localStorage.setItem("sortby",sort);
    window.localStorage.setItem("sortup",sortup);
    return clickRefresh();
}
async function doacheck(){
    let neat = await fetch(jsonLocation);
    if (neat.status !== 200) {
        alert("Couldn't refresh");
        throw new Error("Status was not 200!");
    }
    return await neat.json();
}
async function parseAndDisplay(json){
    while (table.firstChild)table.removeChild(table.firstChild);
    /**
     * @type {Array<HTMLTableRowElement>}
     */
    let trs = [];
    for (let j of Object.values(json)) {
        let bruh = document.createElement("tr");
        /**
         * @type {Array<HTMLTableCellElement>}
         */
        let es= [];
        for (let i=0;i<4;i++)es[i]=document.createElement("td");
        es[0].appendChild((()=>{
            let a =document.createElement("a");
            a.href = "https://fortnitetracker.com/profile/all/"+j.account;
            a.innerText = j.account;
            return a
        })());
        es[1].innerText = j.names.join(", ");
        es[2].innerText = j.kills;
        es[2].id = "kills";
        es[3].innerText = j.score;
        es[3].id = "score";
        for (let i=0;i<4;i++)bruh.appendChild(es[i]);
        trs.push(bruh);
    }
    trs.sort((a, b)=>{
        if (sortup)return parseInt(a.children.namedItem(sort?"score":"kills").textContent)-parseInt(b.children.namedItem(sort?"score":"kills").textContent);
        else return parseInt(b.children.namedItem(sort?"score":"kills").textContent)-parseInt(a.children.namedItem(sort?"score":"kills").textContent);
    })
    trs.forEach((b)=>table.appendChild(b));
}
async function beginRefresh(){
    try {
        let noot = await doacheck();
        latestjson = noot;
        await parseAndDisplay(noot);
        refreshTimeout = setTimeout(beginRefresh,refreshRate*1000)
    }catch(e){
        console.error(e);
    }
}
function clickRefresh(){
    clearTimeout(refreshTimeout);
    return beginRefresh();
}
document.addEventListener("DOMContentLoaded",async ()=>{
    table = document.getElementById("tb");
    killsort = document.getElementById("sort_kills");
    scoresort = document.getElementById("sort_score");
    return beginRefresh();
});