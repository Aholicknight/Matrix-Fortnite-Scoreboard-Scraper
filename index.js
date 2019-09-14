const {Client,TextChannel, Message, Attachment} = require("discord.js");
const bot = new Client();
const {readFileSync,existsSync,writeFile} = require("fs");
const config = require("./config");

const NAMEREG = /(?:Name:) (.*?) (?: Account:)/;
const ACCOUNTREG = /(?:Account:) (.*?) (?:Kills:)/;
const KILLREG = /(?:Kills:) (.*?) (?:Score:)/;
const SCOREREG = /(?:Score: )(\d.*)/;//catches the score too

class Entry{
    /**
     *
     * @param {string} account
     * @param {string || Array<string>} names
     */
    constructor(account,names){
        /**
         * @type {string}
         */
        this.account = account;
        /**
         *
         * @type {Array<string>}
         */
        this.names = names instanceof Array ? names : [names];
        this.kills = 0;
        this.score = 0;
    }

    /**
     * @returns string
     */
    toString(){
        return `Entry(account="${this.account}, name="${this.names}, kills="${this.kills}", score="${this.score}"`
    }

    /**
     * @returns Object
     */
    toJSON(){
        return {
            account: this.account,
            names: this.names,
            kills: this.kills,
            score: this.score
        }
    }
}


//do it by account
let db = {

};

/**function loadJSON(){
    if (existsSync("./fortnite_scoreboard.json")) {
        let de = JSON.parseAndDisplay(readFileSync("./").toString("UTF-8"));
        for (let entry in de){
            db[entry.account] = new Entry(entry.account,entry.names)
        }

    }
}*/
function convertToJSON(space=0){
    console.log("currently converting",Object.keys(db).length);
    let eyeeye = JSON.stringify(db,null,space);
    if (space == 0) eyeeye = eyeeye.replace("\n","");
    return Buffer.from(eyeeye);
}
function saveJSON(callback){
    writeFile(config.location,convertToJSON(),(err)=>{
        if (err) console.error(err);
        else {
            console.log("saved the scoreboard");
            callback();
        }
    })
}

/**
 *
 * @param {string} account
 */
function saveOrCreateEntry(account,name,kills,score){
    if (db[account] !== null || db[account] !== undefined)db[account] = new Entry(account,name);
    db[account].names.push(name);
    db[account].kills += kills;
    db[account].score += score;
    return db[account];
}

let scrapeChannel;

/**
 *
 * @param {Message} msg
 */
function handleMessage(msg,yes){
    if (msg.cleanContent.startsWith("**New Match Found!")&&msg.channel.id === "585114929519132692"){
        saveOrCreateEntry(msg.content.match(NAMEREG)[1],msg.content.match(ACCOUNTREG)[1].replace(/\s/,""),
            parseInt(msg.content.match(KILLREG)[1]),parseInt(msg.content.match(SCOREREG)[1]));
        if (yes !== null) saveJSON(()=>{

        })
    }
    let check = `<@${bot.user.id}> give me the `;
    if ((msg.content.toLowerCase().startsWith(check) ||
        (msg.content.toLowerCase().startsWith(check.substring(3+bot.user.id.length).toLowerCase())
            && msg.channel.type === "dm")) && config.people.includes(msg.author.id)){
        switch (msg.content.toString().substring(check.length)){
            case "potatoes":
                saveJSON(()=>{
                    let ms = "Well, that wasn't too bad.";
                    setTimeout(()=>{
                        msg.channel.send(ms);
                    },300*ms.length);
                });
                break;
            case "salt":
                msg.channel.send("I've changed the flavor of your favorite juice to **s a l t**.",
                    new Attachment(convertToJSON(4),"favorite_juice.salty"));
                break;
            default:
                msg.channel.send("No, I don't want that!");
                break;
        }
    }
}
bot.on("ready",async ()=>{
    scrapeChannel = bot.guilds.find((m)=>m.name==="Matrix Gaming").channels.find((m)=>m.name==="fortnite-matches");
    if (scrapeChannel.type!=="text"&&!(scrapeChannel instanceof TextChannel)) bot.destroy();
    else {
        let lastOne = "";
        let doneGetting = false;
        while (!doneGetting){
            let messages = await scrapeChannel.fetchMessages(lastOne === ""?{limit: 100}:{limit:100,after:lastOne});
            messages.forEach((msg) => {
                handleMessage(msg,null);
                lastOne = msg.id;
            });
            if (messages.size < 100) doneGetting = true;
        }
        console.log("done fetching")
    }
});
bot.on("message",(msg)=>{
    if (msg.webhookID != null)console.log(msg.content);
    handleMessage(msg,true);
});
bot.login(config.token);