// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const SUPABASE_URL="https://jswukfohohtiwuhskyaw.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd3VrZm9ob2h0aXd1aHNreWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTYzMjIsImV4cCI6MjA5ODQzMjMyMn0.p9L5JtemTlaHoZ2kewIy8Y-ZDxmKSCw9RcoAtiGc_Kc";
const NTFY="https://ntfy.sh/rodney-longgame-7x4k";
const TARGETS={cal:1850,calMin:1750,calMax:1950,prot:160,water:80};
const VTHRESH={prot:10,cal:100};
const MEALS=[
  {id:"breakfast",label:"Breakfast",time:"8:05 AM",tMin:485,cal:450,prot:45},
  {id:"lunch",label:"Lunch",time:"12:30 PM",tMin:750,cal:500,prot:45},
  {id:"snack",label:"Snack",time:"3:30 PM",tMin:930,cal:250,prot:30},
  {id:"dinner",label:"Dinner",time:"6:30 PM",tMin:1110,cal:500,prot:40},
];
const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_FULL={Sun:"Sunday",Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday"};
const WORKOUTS={
  Mon:{
    title:"TRX full body + evening bike",
    evening:"30 min zone 2 bike (60-70% max HR, 80-90 RPM)",
    exercises:[
      {id:"trx-squat",    name:"TRX Squat",          sets:3, reps:"12",    rest:60,  type:"strength", cue:"Sit back through heels, knees out, squeeze glutes at top"},
      {id:"trx-row",      name:"TRX Row",             sets:3, reps:"10",    rest:60,  type:"strength", cue:"Lean 45°, pull chest to handles, squeeze shoulder blades, 3-count lower"},
      {id:"trx-chest",    name:"TRX Chest Press",     sets:3, reps:"10",    rest:60,  type:"strength", cue:"Elbows at 45°, body rigid, lean 30-40° forward"},
      {id:"trx-plank",    name:"TRX Plank Hold",      sets:3, reps:"20-30s",rest:45,  type:"hold",     cue:"Feet in straps, squeeze glutes and abs throughout"},
      {id:"kb-deadlift",  name:"KB Deadlift",         sets:2, reps:"15",    rest:45,  type:"strength", cue:"Hip hinge — push hips back, chest tall, squeeze glutes at top. 10 lb KB."},
    ]
  },
  Tue:{
    title:"Rowing intervals + core",
    evening:"Rest",
    exercises:[
      {id:"row-warmup",   name:"Warm-up Row",         sets:1, reps:"2 min", rest:0,   type:"cardio",   cue:"Rate 18-20 SPM. Drive sequence: legs then lean then arms. Easy pace."},
      {id:"row-intervals",name:"Rowing Intervals",     sets:6, reps:"1 min", rest:60,  type:"interval", cue:"1 min moderate (22-24 SPM) / 1 min easy. Focus on rhythm not max output."},
      {id:"dead-bug",     name:"Dead Bug",             sets:2, reps:"10/side",rest:30, type:"core",     cue:"Lower back flat to floor the entire time. Slow and controlled."},
      {id:"bird-dog",     name:"Bird Dog",             sets:2, reps:"10/side",rest:30, type:"core",     cue:"Hold 2 sec at top. Keep hips level — don't let them rotate."},
      {id:"glute-bridge", name:"Glute Bridge",         sets:2, reps:"15",    rest:30,  type:"core",     cue:"2 sec squeeze at top. Drive through heels, not toes."},
    ]
  },
  Wed:{
    title:"TRX upper body + evening bike",
    evening:"30 min zone 2 bike (60-70% max HR, 80-90 RPM)",
    exercises:[
      {id:"trx-bicep",    name:"TRX Bicep Curl",      sets:3, reps:"12",    rest:60,  type:"strength", cue:"Elbows high and fixed, 3-count lower. Don't let elbows drop."},
      {id:"trx-tricep",   name:"TRX Tricep Press",    sets:3, reps:"12",    rest:60,  type:"strength", cue:"Arms overhead, elbows close to head. Body stays rigid."},
      {id:"trx-face",     name:"TRX Face Pull",       sets:3, reps:"12",    rest:60,  type:"strength", cue:"Hands beside ears at top, hold 1 sec. Critical for shoulder health."},
      {id:"trx-rollout",  name:"TRX Ab Rollout",      sets:3, reps:"8-10",  rest:60,  type:"core",     cue:"Pull back with core only — do not arch lower back."},
      {id:"kb-halo",      name:"KB Halo",             sets:2, reps:"8/dir", rest:45,  type:"mobility", cue:"Circle KB around head slowly. Hips completely stable. 10 lb KB."},
    ]
  },
  Thu:{
    title:"Active recovery — mobility",
    evening:"20 min mobility",
    exercises:[
      {id:"hip-flexor",   name:"Hip Flexor Stretch",  sets:1, reps:"2 min/side",rest:0,  type:"stretch", cue:"Kneeling lunge, push hips gently forward. Feel the front hip, not the knee."},
      {id:"thoracic",     name:"Thoracic Rotation",   sets:1, reps:"10/side",   rest:0,  type:"mobility",cue:"Hand behind head, rotate upper back open. Keep hips still."},
      {id:"knee-chest",   name:"Knee-to-Chest Hold",  sets:1, reps:"60s/side",  rest:0,  type:"stretch", cue:"Releases lower back tension. Breathe into the stretch."},
      {id:"childs-pose",  name:"Child's Pose + Side Reach",sets:1,reps:"60s/side",rest:0,type:"stretch", cue:"Reach arm long, feel the lat. Don't rush."},
      {id:"doorway",      name:"Doorway Chest Stretch",sets:1,reps:"60s/arm",   rest:0,  type:"stretch", cue:"Opens tight pec muscles from desk posture. Arm at 90°, lean through gently."},
    ]
  },
  Fri:{
    title:"Rowing + kettlebell circuit",
    evening:"Optional 30 min bike",
    exercises:[
      {id:"circuit",      name:"Full Circuit",        sets:4, reps:"4 rounds",  rest:90, type:"circuit", cue:"Complete all 4 exercises back to back, then rest 90 sec. Repeat 4 rounds total.",
       components:[
         {name:"Row 250m",        cue:"~1:45-2:00 pace, moderate effort"},
         {name:"KB Swings x15",   cue:"Hip hinge — explosive drive, arms float to chest height, squeeze glutes at top"},
         {name:"Bodyweight Squat x12", cue:"Full depth, controlled tempo"},
         {name:"Push-up x8",      cue:"Modify to incline on chair if needed — keep body completely rigid"},
       ]
      },
    ]
  },
  Sat:{
    title:"Long bike ride",
    evening:"Full rest — afternoon and evening",
    exercises:[
      {id:"bike-warmup",  name:"Bike Warm-up",        sets:1, reps:"10 min",  rest:0,   type:"cardio",  cue:"Easy spin, gradually bring HR up. 80-90 RPM target."},
      {id:"bike-zone2",   name:"Zone 2 Steady Ride",  sets:1, reps:"30-40 min",rest:0,  type:"cardio",  cue:"60-70% max HR. Conversational pace. 80-90 RPM. Week 1 goal: 45 min total."},
      {id:"bike-cooldown",name:"Cooldown",             sets:1, reps:"10 min",  rest:0,   type:"cardio",  cue:"Easy spin, let HR come down gradually."},
    ]
  },
  Sun:{
    title:"Full rest + meal prep",
    evening:"Rest",
    exercises:[
      {id:"rest",         name:"Rest day",             sets:0, reps:"",       rest:0,   type:"rest",    cue:"Your body consolidates the entire week's work on rest days. They are not optional."},
    ]
  },
};

const SUPPS=[
  {id:"fishoil-am",label:"Fish oil — 2 softgels",time:"8:05 AM",tMin:485,week:1},
  {id:"d3k2",label:"Vitamin D3/K2 — drops",time:"8:05 AM",tMin:485,week:1},
  {id:"collagen",label:"Collagen peptides — 1 scoop",time:"2:00 PM",tMin:840,week:1},
  {id:"fishoil-pm",label:"Fish oil — 2 softgels",time:"6:30 PM",tMin:1110,week:1},
  {id:"mag",label:"Magnesium glycinate — 2 caps",time:"9:00 PM",tMin:1260,week:1},
  {id:"glutamine",label:"L-glutamine — 5g empty stomach",time:"6:15 AM",tMin:375,week:2},
  {id:"probiotic",label:"Seed DS-01 — 2 capsules",time:"8:05 AM",tMin:485,week:2},
  {id:"psyllium",label:"Psyllium husk — in 10oz water",time:"12:30 PM",tMin:750,week:2},
  {id:"berberine-l",label:"Berberine — 500mg",time:"12:30 PM",tMin:750,week:3},
  {id:"berberine-d",label:"Berberine — 500mg",time:"6:30 PM",tMin:1110,week:3},
  {id:"coq10",label:"CoQ10 ubiquinol — 1 softgel",time:"6:30 PM",tMin:1110,week:3},
  {id:"creatine",label:"Creatine monohydrate — 5g",time:"8:05 AM",tMin:485,week:4},
  {id:"zinc",label:"Zinc picolinate — 15-30mg",time:"6:30 PM",tMin:1110,week:4},
];
const SNACKS=[
  {id:"nuts-apple",label:"Mixed cashews & walnuts + apple",cal:200,prot:5},
  {id:"yogurt-berry",label:"Greek yogurt + berries + almond butter",cal:220,prot:12},
  {id:"whey-nuts",label:"Whey protein shake + 1oz cashews",cal:300,prot:33},
  {id:"turkey-veg",label:"Turkey slices + cucumber + celery + nuts",cal:220,prot:26},
  {id:"yogurt-nuts",label:"Greek yogurt + cashews + cinnamon",cal:230,prot:11},
];
const PROTEINS_ALL=[
  {id:"chicken",label:"Chicken breast",unit:"lbs",freezer:true},
  {id:"turkey",label:"Ground turkey (93%)",unit:"lbs",freezer:true},
  {id:"ahi",label:"Ahi tuna fillets",unit:"fillets",freezer:true},
  {id:"filet",label:"Filet mignon",unit:"steaks",freezer:true},
  {id:"ribeye",label:"Ribeye",unit:"steaks",freezer:true},
  {id:"ribs",label:"Pork ribs",unit:"lbs",freezer:true},
  {id:"salmon",label:"Salmon fillet",unit:"fillets",freezer:false},
  {id:"shrimp",label:"Shrimp (large)",unit:"lbs",freezer:false},
  {id:"pork_tenderloin",label:"Pork tenderloin",unit:"lbs",freezer:false},
  {id:"lamb",label:"Lamb chops",unit:"chops",freezer:false},
  {id:"cod",label:"Cod / white fish",unit:"fillets",freezer:false},
  {id:"scallops",label:"Scallops",unit:"lbs",freezer:false},
];
const RECIPES={
  chicken_baked:{label:"Baked chicken breast + roasted veg",prot:"chicken",cal:380,rprot:52,ing:{produce:["broccoli","bell peppers","zucchini"],pantry:["olive oil","garlic powder","smoked paprika"]}},
  chicken_taco:{label:"Chicken taco bowl",prot:"chicken",cal:310,rprot:48,ing:{produce:["romaine","cherry tomatoes","avocado","lime"],pantry:["cumin","chili powder","coconut aminos","black beans (canned)"]}},
  turkey_stirfry:{label:"Ground turkey stir-fry + cauliflower rice",prot:"turkey",cal:320,rprot:38,ing:{produce:["cauliflower","bell peppers","fresh ginger","garlic"],pantry:["coconut aminos","sesame oil","cumin"]}},
  turkey_bowl:{label:"Ground turkey power bowl",prot:"turkey",cal:300,rprot:36,ing:{produce:["avocado","lime","romaine"],pantry:["black beans (canned)","brown rice","coconut aminos"]}},
  ahi_seared:{label:"Seared ahi + roasted veg & salad",prot:"ahi",cal:350,rprot:50,ing:{produce:["mixed greens","broccoli","bell pepper","lime"],pantry:["sesame oil","coconut aminos","avocado oil","sesame seeds"]}},
  ahi_poke:{label:"Ahi poke bowl",prot:"ahi",cal:520,rprot:52,ing:{produce:["avocado","shredded cabbage","edamame (frozen)","green onion"],pantry:["brown rice","coconut aminos","rice vinegar","sesame oil","sesame seeds"]}},
  filet_roasted:{label:"Filet mignon + roasted veg & salad",prot:"filet",cal:420,rprot:46,ing:{produce:["broccoli","mixed greens","cherry tomatoes","lemon"],pantry:["olive oil","garlic","rosemary"]}},
  ribeye_salad:{label:"Ribeye + roasted broccoli & salad",prot:"ribeye",cal:540,rprot:40,ing:{produce:["broccoli","romaine","cherry tomatoes","avocado"],pantry:["olive oil","garlic powder"]}},
  ribs_dry:{label:"Dry-rub pork ribs with slaw",prot:"ribs",cal:480,rprot:36,ing:{produce:["shredded cabbage","shredded carrots","lime"],pantry:["smoked paprika","cumin","apple cider vinegar","rice vinegar"]}},
  salmon_teriyaki:{label:"Salmon teriyaki + bok choy",prot:"salmon",cal:380,rprot:42,ing:{produce:["bok choy","garlic","fresh ginger","green onion"],pantry:["coconut aminos","rice vinegar","sesame oil","brown rice","sesame seeds"]}},
  salmon_lemon:{label:"Lemon herb salmon + asparagus",prot:"salmon",cal:360,rprot:44,ing:{produce:["asparagus","lemon","garlic"],pantry:["olive oil","capers (optional)"]}},
  salmon_blackened:{label:"Blackened salmon + cauliflower rice",prot:"salmon",cal:340,rprot:43,ing:{produce:["cauliflower","avocado","lime"],pantry:["smoked paprika","cumin","cayenne","olive oil"]}},
  shrimp_garlic:{label:"Garlic butter shrimp + zucchini noodles",prot:"shrimp",cal:310,rprot:38,ing:{produce:["zucchini (3)","garlic","lemon","fresh parsley"],pantry:["olive oil","red pepper flakes"],dairy:["grass-fed butter (1 tbsp)"]}},
  shrimp_cajun:{label:"Cajun shrimp + roasted veg",prot:"shrimp",cal:290,rprot:36,ing:{produce:["bell peppers","broccoli","lemon"],pantry:["smoked paprika","cayenne","garlic powder","olive oil"]}},
  pork_herb:{label:"Herb-crusted pork tenderloin + sweet potato",prot:"pork_tenderloin",cal:400,rprot:44,ing:{produce:["sweet potatoes (2)","fresh rosemary","fresh thyme","garlic"],pantry:["olive oil","dijon mustard"]}},
  pork_apple:{label:"Apple-glazed pork tenderloin + Brussels sprouts",prot:"pork_tenderloin",cal:420,rprot:42,ing:{produce:["Brussels sprouts","apple","garlic"],pantry:["apple cider vinegar","coconut aminos","olive oil","cinnamon"]}},
  lamb_rosemary:{label:"Rosemary garlic lamb chops + roasted veg",prot:"lamb",cal:460,rprot:40,ing:{produce:["broccoli","bell peppers","garlic","lemon","fresh rosemary"],pantry:["olive oil"]}},
  cod_lemon:{label:"Lemon herb baked cod + asparagus",prot:"cod",cal:280,rprot:40,ing:{produce:["asparagus","lemon","garlic","fresh parsley"],pantry:["olive oil","paprika"]}},
  cod_tacos:{label:"Fish tacos with cabbage slaw",prot:"cod",cal:350,rprot:38,ing:{produce:["shredded cabbage","avocado","lime","cilantro"],pantry:["cumin","smoked paprika","olive oil","hot sauce"],dairy:["Greek yogurt (sauce)"]}},
  scallops_seared:{label:"Pan-seared scallops + cauliflower puree",prot:"scallops",cal:340,rprot:36,ing:{produce:["cauliflower","mixed greens","garlic","lemon"],pantry:["olive oil","avocado oil"],dairy:["grass-fed butter (1 tbsp)"]}},
};
const DEFAULT_DINNER_PLAN={Mon:"chicken_baked",Tue:"ahi_seared",Wed:"turkey_stirfry",Thu:"filet_roasted",Fri:"salmon_lemon",Sat:"ribeye_salad",Sun:"turkey_bowl"};
const PANTRY_STAPLES={
  produce:["broccoli","bell peppers (mixed)","cauliflower","zucchini","baby spinach","romaine lettuce","mixed greens","cherry tomatoes","avocado","cucumber","sweet potato","blueberries/berries","bananas","lemons","limes","garlic","celery","shredded carrots","shredded cabbage"],
  pantry:["rolled oats","brown rice","quinoa","black beans (canned)","chickpeas (canned)","edamame (frozen)","raw cashews","walnuts","almond butter","chia seeds","nutritional yeast","olive oil","avocado oil","sesame oil","apple cider vinegar","coconut aminos","rice vinegar","everything bagel seasoning","cumin","chili powder","smoked paprika","garlic powder","salt","pepper","sesame seeds"],
  dairy:["eggs (2 dozen)","Greek yogurt — plain full-fat 32oz","unsweetened almond milk"],
  beverages:["sparkling water — LaCroix/Bubly (2 cases)","LMNT electrolyte packets (1 box)","bone broth — Kettle & Fire (4-6 cartons)"],
  supplements:["magnesium glycinate (local — Meijer/Target)","psyllium husk powder plain (local)","Vital Proteins collagen peptides (local/Amazon)"],
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
// Date keys are LOCAL-date, not UTC. toISOString() would file an 8pm-ET entry under tomorrow's key.
function fmtLocalDate(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function todayKey(){return fmtLocalDate(new Date())}
function weekKey(){var d=new Date();d.setDate(d.getDate()-d.getDay());return fmtLocalDate(d)}
function dayAbbr(){return DAYS[new Date().getDay()]}
function nowMin(){var d=new Date();return d.getHours()*60+d.getMinutes()}
function h(tag,attrs,children){
  var el=document.createElement(tag);
  if(attrs)Object.keys(attrs).forEach(function(k){
    if(k==="style"&&typeof attrs[k]==="object"){Object.assign(el.style,attrs[k]);}
    else if(k.startsWith("on")){el.addEventListener(k.slice(2).toLowerCase(),attrs[k]);}
    else{el.setAttribute(k,attrs[k]);}
  });
  if(children){
    (Array.isArray(children)?children:[children]).forEach(function(c){
      if(c==null||c===false)return;
      el.appendChild(typeof c==="string"?document.createTextNode(c):c);
    });
  }
  return el;
}
function div(cls,children,style){return h("div",{class:cls||"",style:style||{}},children)}

// ── MEAL MODEL ───────────────────────────────────────────────────────────────
// Canonical (live Supabase) shape per meal: {status:"planned"|"eaten", actualCal, actualProtein}.
// We also carry an optional `name` (ignored by the other app version) to keep the food-diary feature.
function blankMeal(){return {status:"planned",actualCal:null,actualProtein:null};}
function mealEaten(e){return !!e&&e.status==="eaten";}
function mealCal(e,m){return mealEaten(e)&&e.actualCal!=null?e.actualCal:m.cal;}
function mealProt(e,m){return mealEaten(e)&&e.actualProtein!=null?e.actualProtein:m.prot;}
function mealName(e){return e&&e.name?e.name:null;}
function setMealEaten(dl,id,cal,prot,name){var meal={status:"eaten",actualCal:cal,actualProtein:prot};if(name)meal.name=name;dl.meals[id]=meal;}
function clearMeal(dl,id){dl.meals[id]=blankMeal();}

// ── SYNC GATE ────────────────────────────────────────────────────────────────
// Only the real HTTPS deploy writes to the shared production Supabase row. Local dev /
// preview (localhost or a private-LAN IP, incl. iPhone-over-WiFi testing) never pushes,
// so testing can't corrupt live data. Pulling is read-only and always allowed.
function syncEnabled(){
  var host=location.hostname;
  if(host==="localhost"||host==="127.0.0.1"||host==="")return false;
  if(/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))return false;
  return true;
}

// ── STORAGE ────────────────────────────────────────────────────────────────────
function lsGet(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

// ── AUTH ─────────────────────────────────────────────────────────────────────
// Hand-rolled email+password auth (Supabase GoTrue). Cloud data access requires a session; the app
// stays usable offline with local data (soft gate). The anon key is used only for auth endpoints.
var SESSION=null;        // {access_token, refresh_token, expires_at(ms), user:{id,email}}
var refreshPromise=null; // de-dupes concurrent token refreshes
function loadSession(){SESSION=lsGet("tlg-auth")||null;}
function saveSession(s){SESSION=s;lsSet("tlg-auth",s);}
function clearSession(){SESSION=null;try{localStorage.removeItem("tlg-auth");}catch(e){}}
function sessionValid(){return !!(SESSION&&SESSION.access_token);}
function sessionEmail(){return SESSION&&SESSION.user?SESSION.user.email:null;}
function parseJwtExp(token){try{var p=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));return p.exp?p.exp*1000:0;}catch(e){return 0;}}
function buildSession(d){
  var exp=d.expires_in?Date.now()+d.expires_in*1000:parseJwtExp(d.access_token);
  return {access_token:d.access_token,refresh_token:d.refresh_token,expires_at:exp,user:d.user?{id:d.user.id,email:d.user.email}:(SESSION&&SESSION.user)};
}
async function authSignIn(email,password){
  var r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  var d=await r.json();
  if(!r.ok)throw new Error(d.error_description||d.msg||d.error||"Sign-in failed");
  saveSession(buildSession(d));
  return SESSION;
}
// Only these responses mean the refresh token is definitively dead and we should sign the user out.
// Anything else (network blip, 5xx, unexpected shape) leaves the session in place so a later retry works.
function isRefreshTokenDead(status,d){
  if(status!==400&&status!==401)return false;
  var code=(d&&(d.error_code||d.error||d.msg))||"";
  return /invalid_grant|refresh_token_not_found|refresh_token_already_used|refresh_token_revoked/i.test(code);
}
function authRefresh(){
  if(refreshPromise)return refreshPromise;
  if(!SESSION||!SESSION.refresh_token)return Promise.resolve(null);
  refreshPromise=(async function(){
    try{
      var r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:SESSION.refresh_token})});
      var d={};try{d=await r.json();}catch(e){}
      if(r.ok&&d.access_token){saveSession(buildSession(d));return SESSION.access_token;}
      if(isRefreshTokenDead(r.status,d)){clearSession();return null;}
      return null; // transient: keep session, retry later
    }catch(e){return null;} // network error: keep session
  })();
  refreshPromise.finally(function(){refreshPromise=null;});
  return refreshPromise;
}
async function getAccessToken(){
  if(!SESSION||!SESSION.access_token)return null;
  if((SESSION.expires_at||0)-Date.now()<60000)await authRefresh();
  return SESSION?SESSION.access_token:null;
}
// Fetch wrapper for /rest data endpoints: injects the session bearer, refreshes once on 401.
// Never falls back to the anon key for data — a missing session returns a no-session sentinel.
async function authedFetch(url,opts){
  opts=opts||{};
  var token=await getAccessToken();
  if(!token)return {ok:false,status:401,_noSession:true,json:async function(){return null;}};
  function withAuth(t){return Object.assign({},opts,{headers:Object.assign({},opts.headers,{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+t})});}
  var res=await fetch(url,withAuth(token));
  if(res.status===401){
    var nt=await authRefresh();
    if(nt)res=await fetch(url,withAuth(nt));
    // if refresh failed but session is still around, authRefresh already decided whether to clear it —
    // don't nuke it here just because one request 401'd (could be a transient server issue)
  }
  return res;
}
async function authSignOut(){
  try{await authedFetch(SUPABASE_URL+"/auth/v1/logout",{method:"POST"});}catch(e){}
  clearSession();setSyncStatus("signedout");render();
}

async function cloudPush(state){
  if(!syncEnabled())return; // never write to the production row from local dev/preview
  if(!sessionValid()){setSyncStatus("signedout");return;}
  try{
    var r=await authedFetch(SUPABASE_URL+"/rest/v1/app_sync",{method:"POST",headers:{"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},body:JSON.stringify({user_id:"rodney",state:state,updated_at:new Date().toISOString()})});
    if(r&&r._noSession)setSyncStatus("signedout");
  }
  catch(e){console.warn("Cloud push failed",e);}
}
// Build the canonical live-schema object to persist (drops runtime-only fields like planWeek/UI).
function serializeState(){
  return {days:APP.days,weeks:APP.weeks,checkIns:APP.checkIns,groceryState:APP.groceryState,planStartDate:APP.planStartDate,planWeeks:APP.planWeeks,activePlan:APP.activePlan,updatedAt:APP.updatedAt};
}

// ── CONFLICT-FREE MERGE ───────────────────────────────────────────────────────
// Merge two full states so concurrent edits on different devices don't clobber each other.
function unionKeys(a,b){var s={};Object.keys(a||{}).forEach(function(k){s[k]=1;});Object.keys(b||{}).forEach(function(k){s[k]=1;});return Object.keys(s);}
function mergeByTs(a,b){ // per-key, larger .ts wins (missing ts ⇒ 0, tie → a/local)
  a=a||{};b=b||{};var out={};
  unionKeys(a,b).forEach(function(k){
    if(!(k in a)){out[k]=b[k];return;}
    if(!(k in b)){out[k]=a[k];return;}
    out[k]=((b[k]&&b[k].ts)||0)>((a[k]&&a[k].ts)||0)?b[k]:a[k];
  });
  return out;
}
function mergeDay(a,b){
  if(!a)return b;if(!b)return a;
  var at=a.ts||0,bt=b.ts||0,newer=at>=bt?a:b;
  var day={ts:Math.max(at,bt)};
  day.meals={};
  ["breakfast","lunch","snack","dinner"].forEach(function(id){
    var ma=a.meals&&a.meals[id],mb=b.meals&&b.meals[id];
    if(!ma&&!mb){day.meals[id]=blankMeal();return;}
    if(!ma){day.meals[id]=mb;return;}
    if(!mb){day.meals[id]=ma;return;}
    var ea=ma.status==="eaten",eb=mb.status==="eaten";
    day.meals[id]=(ea&&!eb)?ma:(eb&&!ea)?mb:(newer===a?ma:mb); // eaten beats planned; else newer
  });
  day.water=Math.max(a.water||0,b.water||0);
  day.deskBreaksTaken=Math.max(a.deskBreaksTaken||0,b.deskBreaksTaken||0);
  day.supplements={};
  unionKeys(a.supplements,b.supplements).forEach(function(k){day.supplements[k]=!!((a.supplements&&a.supplements[k])||(b.supplements&&b.supplements[k]));});
  day.workoutLog={};
  unionKeys(a.workoutLog,b.workoutLog).forEach(function(ex){
    var la=(a.workoutLog&&a.workoutLog[ex])||{},lb=(b.workoutLog&&b.workoutLog[ex])||{};
    day.workoutLog[ex]={};
    unionKeys(la,lb).forEach(function(si){
      var sa=la[si],sb=lb[si];
      if(!sa){day.workoutLog[ex][si]=sb;return;}
      if(!sb){day.workoutLog[ex][si]=sa;return;}
      var pick=newer===a?sa:sb,other=newer===a?sb:sa;
      day.workoutLog[ex][si]={done:!!(sa.done||sb.done),reps:pick.reps||other.reps||"",weight:pick.weight||other.weight||"",notes:pick.notes||other.notes||""};
    });
  });
  day.workoutDone=!!(a.workoutDone||b.workoutDone);
  return day;
}
function mergeState(local,cloud){
  if(!cloud)return local;
  if(!local)return cloud;
  var out={days:{}};
  unionKeys(local.days,cloud.days).forEach(function(d){out.days[d]=mergeDay(local.days&&local.days[d],cloud.days&&cloud.days[d]);});
  out.planWeeks=Object.assign({},cloud.planWeeks,local.planWeeks); // frozen/immutable union
  out.checkIns=mergeByTs(local.checkIns,cloud.checkIns);
  out.weeks=mergeByTs(local.weeks,cloud.weeks);
  var src=new Date(local.updatedAt||0)>=new Date(cloud.updatedAt||0)?local:cloud; // singletons → last-write-wins
  out.activePlan=src.activePlan;
  out.planStartDate=src.planStartDate||local.planStartDate||cloud.planStartDate;
  out.groceryState=src.groceryState;
  out.updatedAt=new Date().toISOString();
  return out;
}
// Copy a resolved state into APP + refresh the GS/CI mirrors. Shared by init and sync.
function adoptState(s){
  APP.days=s.days||{};APP.weeks=s.weeks||{};APP.checkIns=s.checkIns||{};
  APP.groceryState=s.groceryState||null;APP.planStartDate=s.planStartDate||todayKey();
  APP.planWeeks=s.planWeeks||{};APP.activePlan=s.activePlan||null;APP.updatedAt=s.updatedAt||APP.updatedAt;
  if(APP.groceryState)GS=Object.assign({},APP.groceryState);
  var wk=weekKey();
  CI=(APP.checkIns&&APP.checkIns[wk])?Object.assign({},APP.checkIns[wk]):{};
}
async function cloudPull(){
  try{
    var r=await authedFetch(SUPABASE_URL+"/rest/v1/app_sync?user_id=eq.rodney&select=state,updated_at",{});
    if(!r||!r.ok)return null;
    var rows=await r.json();if(rows&&rows.length)return{state:rows[0].state,ts:rows[0].updated_at};
  }
  catch(e){console.warn("Cloud pull failed",e);}
  return null;
}
async function loadBest(){
  var local=lsGet("tlg");
  var cloud=await cloudPull();
  if(!cloud)return local;
  if(!local)return cloud.state;
  return new Date(cloud.ts)>new Date(local.updatedAt||0)?cloud.state:local;
}
// Local write is instant + offline-safe; cloud merge-push is debounced so a tap never waits on the network.
var saveChain=Promise.resolve();
var syncTimer=null;
function saveAll(){
  freezeCurrentWeekIfNeeded(); // stamp the plan in effect for this week before persisting
  var tk=todayKey();if(APP.days[tk])APP.days[tk].ts=Date.now();
  var wk=weekKey();if(APP.weeks[wk])APP.weeks[wk].ts=Date.now();
  APP.updatedAt=new Date().toISOString();
  lsSet("tlg",serializeState());
  setSyncStatus(!syncEnabled()?"local":(!sessionValid()?"signedout":"…"));
  scheduleCloudSync();
}
function scheduleCloudSync(){
  if(!syncEnabled())return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(flushCloudSync,1500);
}
function flushCloudSync(){
  clearTimeout(syncTimer);syncTimer=null;
  saveChain=saveChain.then(doCloudSync).catch(function(){});
  return saveChain;
}
// Pull → merge → push. Re-renders only if the merge pulled in changes from another device.
async function doCloudSync(){
  if(!syncEnabled()||!sessionValid())return;
  try{
    var cloud=await cloudPull();
    var merged=cloud?mergeState(serializeState(),cloud.state):serializeState();
    var before=JSON.stringify([APP.days,APP.checkIns,APP.weeks,APP.groceryState,APP.activePlan,APP.planStartDate]);
    adoptState(merged);
    var after=JSON.stringify([APP.days,APP.checkIns,APP.weeks,APP.groceryState,APP.activePlan,APP.planStartDate]);
    lsSet("tlg",merged);
    await cloudPush(merged);
    setSyncStatus("synced");
    if(before!==after)render(); // reflect merged-in changes without clobbering active input on no-ops
  }catch(e){setSyncStatus("offline");}
}

// ── NTFY ───────────────────────────────────────────────────────────────────────
// NOTE: ntfy reminders are now scheduled server-side by a single daily GitHub Actions job
// (scripts/schedule-notifications.mjs). The client no longer posts to ntfy — doing so per-device
// caused duplicate reminders. In-app Web Notifications (desk-break, rest timer) are unaffected.
function scheduleDay(){ /* intentionally a no-op — see scripts/schedule-notifications.mjs */ }

// ── APP STATE ──────────────────────────────────────────────────────────────────
var APP={
  days:{},weeks:{},checkIns:{},groceryState:null,
  planStartDate:todayKey(),planWeek:1,
  planWeeks:{},activePlan:null,
  updatedAt:null
};
var UI={tab:"today",snackDismissed:{},breakfastDismissed:{},lunchDismissed:{},acceptedSug:{}};
var CI={};

function computePlanWeek(){
  var start=new Date(APP.planStartDate);
  var days=Math.floor((new Date()-start)/(86400000));
  return Math.min(4,Math.max(1,Math.floor(days/7)+1));
}

// ── PLAN MODEL ────────────────────────────────────────────────────────────────
// The plan (targets, meals, supplements, workouts, dinner rotation) resolves per week:
//   frozen snapshot (history)  →  activePlan (latest import/edit) + auto-progression  →  code defaults.
// The hardcoded constants remain the built-in default plan; nothing is deleted.
var initSynced=false; // freezing is gated until the initial cloud sync settles (avoids stale freezes)

function deepClone(o){return JSON.parse(JSON.stringify(o));}
function parseTime(str){
  if(typeof str!=="string")return 0;
  var m=str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if(!m)return 0;
  var h=parseInt(m[1],10),mn=parseInt(m[2],10),ap=m[3]?m[3].toUpperCase():null;
  if(ap==="PM"&&h!==12)h+=12;
  if(ap==="AM"&&h===12)h=0;
  return h*60+mn;
}
function weekStartOf(dateStr){var d=new Date(dateStr+"T00:00:00Z");d.setUTCDate(d.getUTCDate()-d.getUTCDay());return d.toISOString().slice(0,10);}
function nextSundayKey(){var d=new Date();d.setDate(d.getDate()-d.getDay()+7);return fmtLocalDate(d);}

// Uncapped program-week number (1,2,3,…) for a given week-Sunday key, measured from planStartDate's week.
function programWeek(wk){
  var startSunday=weekStartOf(APP.planStartDate);
  var ms=Date.parse((wk||weekKey())+"T00:00:00Z")-Date.parse(startSunday+"T00:00:00Z");
  return Math.max(1,Math.round(ms/(7*86400000))+1);
}
function waterForWeek(pw){return Math.min(120,80+(Math.max(1,pw)-1)*10);}

// Built-in default plan, assembled from the hardcoded constants (the week-1 baseline).
function DEFAULT_PLAN(){
  return {
    schemaVersion:1,
    meta:{source:"default"},
    targets:{cal:TARGETS.cal,calMin:TARGETS.calMin,calMax:TARGETS.calMax,prot:TARGETS.prot,water:TARGETS.water},
    meals:MEALS.map(function(m){return {id:m.id,label:m.label,time:m.time,tMin:m.tMin,cal:m.cal,prot:m.prot};}),
    supplements:SUPPS.map(function(s){return {id:s.id,label:s.label,time:s.time,tMin:s.tMin,introWeek:s.week};}),
    workouts:deepClone(WORKOUTS),
    dinnerPlan:Object.assign({},DEFAULT_DINNER_PLAN)
  };
}

// Apply auto-progression (water ramp, supplement phase-in) to a base plan for a given week.
function applyProgression(base,wk){
  var pw=programWeek(wk);
  var plan=deepClone(base);
  plan.meta=plan.meta||{};
  if(!plan.meta.waterPinned)plan.targets.water=waterForWeek(pw);
  plan.supplements=(plan.supplements||[]).filter(function(s){return (s.introWeek||1)<=pw;});
  return plan;
}

// Resolve the effective plan for a week: frozen snapshot wins, else base + progression.
function resolvePlan(wk){
  wk=wk||weekKey();
  if(APP.planWeeks&&APP.planWeeks[wk])return APP.planWeeks[wk];
  return applyProgression(APP.activePlan||DEFAULT_PLAN(),wk);
}
// Current-week resolved plan. render() sets PLAN once; other reads fall back to a fresh resolve.
var PLAN=null;
function curPlan(){return PLAN||resolvePlan(weekKey());}
// Resolve a recipe by id: the current plan's imported recipes win, else the built-in recipe book.
function getRecipe(rid){var p=curPlan();return (p&&p.recipes&&p.recipes[rid])||RECIPES[rid];}
// All recipes available for selection (built-ins + any imported this week).
function allRecipes(){var p=curPlan();return Object.assign({},RECIPES,(p&&p.recipes)||{});}

// Freeze the current week's resolved plan the first time we persist within that week (history).
function freezeCurrentWeekIfNeeded(){
  if(!initSynced)return false;
  var wk=weekKey();
  if(!APP.planWeeks)APP.planWeeks={};
  if(APP.planWeeks[wk])return false;
  APP.planWeeks[wk]=deepClone(applyProgression(APP.activePlan||DEFAULT_PLAN(),wk));
  return true;
}

// Section-wise merge of an import doc onto a base plan (present sections replace, absent carry).
function mergePlan(base,doc){
  var merged=deepClone(base);
  merged.meta=merged.meta||{};
  merged.meta.source="import";
  if(doc.note)merged.meta.note=doc.note;
  if(doc.targets){
    merged.targets=Object.assign({},merged.targets,doc.targets);
    if(doc.targets.water!=null)merged.meta.waterPinned=true;
  }
  if(Array.isArray(doc.meals))merged.meals=doc.meals.map(function(m){return {id:m.id,label:m.label,time:m.time,tMin:(m.tMin!=null?m.tMin:parseTime(m.time)),cal:m.cal,prot:m.prot};});
  if(Array.isArray(doc.supplements))merged.supplements=doc.supplements.map(function(s){return {id:s.id,label:s.label,time:s.time,tMin:(s.tMin!=null?s.tMin:parseTime(s.time)),introWeek:(s.introWeek!=null?s.introWeek:1)};});
  if(doc.workouts&&typeof doc.workouts==="object"){
    merged.workouts=Object.assign({},merged.workouts);
    Object.keys(doc.workouts).forEach(function(day){merged.workouts[day]=doc.workouts[day];});
  }
  if(doc.dinnerPlan&&typeof doc.dinnerPlan==="object")merged.dinnerPlan=Object.assign({},merged.dinnerPlan,doc.dinnerPlan);
  if(doc.recipes&&typeof doc.recipes==="object")merged.recipes=Object.assign({},merged.recipes||{},doc.recipes);
  return merged;
}

// Validate a pasted import document. Returns {ok, doc?, errors[]}. No mutation.
function parsePlanImport(text){
  var doc;
  try{doc=JSON.parse(text);}catch(e){return {ok:false,errors:["Not valid JSON — "+e.message]};}
  if(!doc||typeof doc!=="object"||Array.isArray(doc))return {ok:false,errors:["Expected a JSON object."]};
  var errors=[];
  if(doc.tlgPlan!==1)errors.push('Missing or unsupported "tlgPlan" version (expected 1).');
  if(doc.targetWeek!=null&&!(doc.targetWeek==="next"||doc.targetWeek==="current"||/^\d{4}-\d{2}-\d{2}$/.test(doc.targetWeek)))
    errors.push('targetWeek must be "next", "current", or a YYYY-MM-DD date.');
  var DSET=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  if(doc.workouts!=null){
    if(typeof doc.workouts!=="object")errors.push("workouts must be an object keyed by weekday.");
    else Object.keys(doc.workouts).forEach(function(day){
      if(DSET.indexOf(day)===-1)errors.push('workouts: unknown weekday "'+day+'".');
      else if(!doc.workouts[day]||!Array.isArray(doc.workouts[day].exercises))errors.push("workouts."+day+" needs an exercises array.");
    });
  }
  if(doc.dinnerPlan!=null){
    if(typeof doc.dinnerPlan!=="object")errors.push("dinnerPlan must be an object keyed by weekday.");
    else Object.keys(doc.dinnerPlan).forEach(function(day){
      if(DSET.indexOf(day)===-1)errors.push('dinnerPlan: unknown weekday "'+day+'".');
      else{var rid=doc.dinnerPlan[day];if(!RECIPES[rid]&&!(doc.recipes&&doc.recipes[rid]))errors.push('dinnerPlan.'+day+': unknown recipe "'+rid+'".');}
    });
  }
  if(doc.supplements!=null){
    if(!Array.isArray(doc.supplements))errors.push("supplements must be an array.");
    else doc.supplements.forEach(function(s,i){if(!s||!s.id)errors.push("supplements["+i+"] missing id.");});
  }
  if(doc.recipes!=null){
    if(typeof doc.recipes!=="object"||Array.isArray(doc.recipes))errors.push("recipes must be an object keyed by recipe id.");
    else Object.keys(doc.recipes).forEach(function(rid){
      var rec=doc.recipes[rid];
      if(!rec||typeof rec!=="object")errors.push('recipes.'+rid+' must be an object.');
      else if(!rec.label)errors.push('recipes.'+rid+' needs a "label".');
    });
  }
  if(doc.targets!=null&&(typeof doc.targets!=="object"||Array.isArray(doc.targets)))errors.push("targets must be an object.");
  if(errors.length)return {ok:false,errors:errors};
  return {ok:true,doc:doc};
}

function resolveTargetWeek(doc){
  var t=doc.targetWeek||"next";
  if(t==="current")return weekKey();
  if(t==="next")return nextSundayKey();
  return t;
}

// Apply a validated import: freeze the current week under the OLD plan, set activePlan, and for a
// current/past target stamp the frozen snapshot. A future target freezes when that week arrives.
function applyPlanImport(doc){
  var wk=resolveTargetWeek(doc);
  freezeCurrentWeekIfNeeded();
  var merged=mergePlan(APP.activePlan||DEFAULT_PLAN(),doc);
  if(doc.generatedAt)merged.meta.generatedAt=doc.generatedAt;
  APP.activePlan=merged;
  if(!APP.planWeeks)APP.planWeeks={};
  if(wk<=weekKey())APP.planWeeks[wk]=deepClone(applyProgression(merged,wk));
  saveAll();
  render();
}

function getDayLog(){
  var k=todayKey();
  if(!APP.days[k])APP.days[k]={meals:{breakfast:blankMeal(),lunch:blankMeal(),snack:blankMeal(),dinner:blankMeal()},water:0,supplements:{},workoutDone:false,deskBreaksTaken:0,workoutLog:{}};
  var d=APP.days[k];
  if(!d.meals)d.meals={};
  ["breakfast","lunch","snack","dinner"].forEach(function(id){if(!d.meals[id])d.meals[id]=blankMeal();});
  if(!d.supplements)d.supplements={};
  if(!d.workoutLog)d.workoutLog={};
  if(d.deskBreaksTaken==null)d.deskBreaksTaken=0;
  if(d.water==null)d.water=0;
  return d;
}
function getWeekState(){
  var k=weekKey();
  var resolvedDinnerPlan=resolvePlan(k).dinnerPlan;
  if(!APP.weeks[k]){APP.weeks[k]={ts:Date.now(),dinnerPlan:Object.assign({},resolvedDinnerPlan)};}
  // dinnerPlan here is a pure derived cache (never user-edited) — resync it whenever a later plan
  // import changes the resolved dinnerPlan, so "This week's dinners" doesn't keep showing stale data.
  else if(JSON.stringify(APP.weeks[k].dinnerPlan)!==JSON.stringify(resolvedDinnerPlan)){
    APP.weeks[k].dinnerPlan=Object.assign({},resolvedDinnerPlan);
    APP.weeks[k].ts=Date.now();
  }
  return APP.weeks[k];
}

function computeTotals(){
  var MEALS=curPlan().meals; // resolved meal slots for the current week
  var dl=getDayLog();
  var cal=0,prot=0;
  MEALS.forEach(function(m){
    var e=dl.meals[m.id];
    if(mealEaten(e)){cal+=mealCal(e,m);prot+=mealProt(e,m);}
  });
  return{cal:cal,prot:prot};
}

// Sum eaten meals across the current week (Sunday start → +6 days).
function computeWeekTotals(){
  var MEALS=curPlan().meals; // resolved meal slots (fallback cal/prot only)
  var start=new Date(weekKey()+"T00:00:00");
  var cal=0,prot=0,days=0;
  Object.keys(APP.days).forEach(function(dk){
    var diff=(new Date(dk+"T00:00:00")-start)/86400000;
    if(diff<0||diff>6)return;
    var day=APP.days[dk];
    if(!day||!day.meals)return;
    var counted=false;
    MEALS.forEach(function(m){
      var e=day.meals[m.id];
      if(mealEaten(e)){cal+=mealCal(e,m);prot+=mealProt(e,m);counted=true;}
    });
    if(counted)days++;
  });
  return{cal:cal,prot:prot,days:days};
}

function computeAdjusted(){
  var MEALS=curPlan().meals; // resolved meal slots for the current week
  var dl=getDayLog();
  var adj={};
  MEALS.forEach(function(m){adj[m.id]={cal:m.cal,prot:m.prot};});
  var pd=0,cd=0;
  MEALS.forEach(function(m){
    var e=dl.meals[m.id];
    if(mealEaten(e)){
      var ap=mealProt(e,m);
      var ac=mealCal(e,m);
      if(Math.abs(m.prot-ap)>=VTHRESH.prot)pd+=m.prot-ap;
      if(Math.abs(m.cal-ac)>=VTHRESH.cal)cd+=m.cal-ac;
    }
  });
  var rem=MEALS.filter(function(m){return !mealEaten(dl.meals[m.id]);});
  if(rem.length){
    rem.forEach(function(m){
      adj[m.id]={prot:Math.max(0,Math.round(m.prot+pd/rem.length)),cal:Math.max(0,Math.round(m.cal+cd/rem.length))};
    });
  }
  return adj;
}

// Pure pick — the best snack given what's been eaten (no time/dismissal gates).
function recommendSnack(){
  var MEALS=curPlan().meals,TARGETS=curPlan().targets;
  var dl=getDayLog();
  var cp=0,cc=0;
  ["breakfast","lunch"].forEach(function(id){
    var e=dl.meals[id];if(!mealEaten(e))return;
    var m=MEALS.find(function(x){return x.id===id;});
    cp+=mealProt(e,m);
    cc+=mealCal(e,m);
  });
  var dinnerProt=MEALS[3].prot,dinnerCal=MEALS[3].cal;
  var remCal=TARGETS.calMax-cc-dinnerCal;
  var needProt=TARGETS.prot-cp-dinnerProt;
  var viable=SNACKS.filter(function(s){return s.cal<=Math.max(remCal,150);});
  if(!viable.length)return null;
  viable.sort(function(a,b){return Math.abs(a.prot-needProt)-Math.abs(b.prot-needProt);});
  return{snack:viable[0],needProt:Math.round(needProt),remCal:Math.round(remCal)};
}
function suggestSnack(){
  var dl=getDayLog();
  var today=todayKey();
  if(UI.snackDismissed[today])return null;
  if(!mealEaten(dl.meals.lunch)||mealEaten(dl.meals.snack))return null;
  return recommendSnack();
}

// ── BREAKFAST & LUNCH OPTION POOLS ────────────────────────────────────────────

const BREAKFAST_OPTIONS=[
  {id:"eggs-sausage-yogurt", label:"Scrambled eggs + sausage + Greek yogurt",    cal:440,prot:44,carb:"low",  note:"Fastest — under 8 min, all from prep"},
  {id:"egg-muffins-yogurt",  label:"2 turkey egg muffins + Greek yogurt + berries",cal:450,prot:45,carb:"low",  note:"Zero cooking — grab from fridge"},
  {id:"protein-oats",        label:"High-protein oats + whey + banana",           cal:450,prot:42,carb:"high", note:"Best on heavy workout mornings"},
  {id:"overnight-oats",      label:"Overnight oats + whey + berries",             cal:470,prot:43,carb:"high", note:"Prep the night before — zero morning effort"},
  {id:"4-egg-scramble",      label:"4-egg veggie scramble + sausage",             cal:450,prot:46,carb:"low",  note:"Low-carb option — good after high-carb dinner"},
];

const LUNCH_OPTIONS=[
  {id:"standard-bowl",    label:"Prepped chicken bowl + rice + veg + avocado", cal:490,prot:50,note:"Default Sunday prep container — grab and go"},
  {id:"turkey-bowl",      label:"Ground turkey power bowl + black beans",        cal:510,prot:46,note:"Good Tuesday–Wednesday variety"},
  {id:"protein-salad",    label:"Big protein salad + chicken + chickpeas",       cal:500,prot:52,note:"Highest fiber — good Thursday–Friday"},
  {id:"cold-ahi-salad",   label:"Cold ahi avocado salad (from Tuesday dinner)",  cal:380,prot:50,note:"Wednesday only — sear extra ahi Tuesday night"},
  {id:"turkey-egg-wrap",  label:"Turkey slices + 2 egg muffins + veg",           cal:420,prot:46,note:"Quick assembly, no heating needed"},
];

// ── MEAL SUGGESTION ENGINE ─────────────────────────────────────────────────────

// Pure pick — the best breakfast for today's schedule (no time/dismissal gates).
function recommendBreakfast(){
  var day=dayAbbr();
  var isWorkoutDay=["Mon","Wed","Fri"].indexOf(day)!==-1;
  var isRecoveryDay=day==="Thu"||day==="Sun";

  // Score each option based on the day's needs
  var scored=BREAKFAST_OPTIONS.map(function(opt){
    var score=0;
    // Workout days benefit from higher-carb options
    if(isWorkoutDay&&opt.carb==="high") score-=10;
    if(isRecoveryDay&&opt.carb==="low") score-=10;
    // Prefer quick options on busy mornings (Mon/Wed/Fri)
    if(isWorkoutDay&&(opt.id==="egg-muffins-yogurt")) score-=5;
    return{opt:opt,score:score};
  });
  scored.sort(function(a,b){return a.score-b.score;});
  var pick=scored[0].opt;

  var reason=isWorkoutDay?
    "It's a "+DAY_FULL[day]+" workout day — "+( pick.carb==="high"?"higher carbs fuel your morning session.":"a solid protein start sets up your energy."):
    isRecoveryDay?
    "Recovery day — a lower-carb, high-protein breakfast keeps energy steady without spiking insulin.":
    "Good balanced option for today's schedule.";

  return{option:pick,reason:reason,isWorkoutDay:isWorkoutDay};
}
function suggestBreakfast(){
  var dl=getDayLog();
  var today=todayKey();
  // Don't suggest if already eaten or dismissed
  if(mealEaten(dl.meals.breakfast))return null;
  if(UI.breakfastDismissed&&UI.breakfastDismissed[today])return null;
  // Only suggest after 7:35 AM (post-walk window) and before 9 AM
  var nm=nowMin();
  if(nm<455||nm>540)return null;
  return recommendBreakfast();
}

// Pure pick — the best lunch given breakfast intake (no time/dismissal gates).
function recommendLunch(){
  var MEALS=curPlan().meals,TARGETS=curPlan().targets;
  var dl=getDayLog();
  // Calculate protein consumed at breakfast
  var bEntry=dl.meals.breakfast;
  var bProt=0,bCal=0;
  if(mealEaten(bEntry)){
    bProt=mealProt(bEntry,MEALS[0]);
    bCal=mealCal(bEntry,MEALS[0]);
  }

  // What's needed across lunch + snack + dinner to hit daily targets
  var remainProt=TARGETS.prot-bProt;
  var remainCal=TARGETS.calMax-bCal;
  var snackProt=MEALS[2].prot,snackCal=MEALS[2].cal;
  var dinnerProt=MEALS[3].prot,dinnerCal=MEALS[3].cal;
  var lunchProtTarget=remainProt-snackProt-dinnerProt;
  var lunchCalTarget=remainCal-snackCal-dinnerCal;

  // Wednesday — cold ahi salad is available if Tuesday was ahi dinner
  var day=dayAbbr();
  var viable=LUNCH_OPTIONS.filter(function(opt){
    if(opt.id==="cold-ahi-salad"&&day!=="Wed")return false;
    return true;
  });

  // Pick closest match to protein target without blowing calories
  viable.sort(function(a,b){return Math.abs(a.prot-lunchProtTarget)-Math.abs(b.prot-lunchProtTarget);});
  var pick=viable[0];

  var protGap=Math.round(lunchProtTarget);
  var reason=protGap>40?
    "You need ~"+protGap+"g protein from lunch — this is your highest-protein prep option.":
    protGap>25?
    "You're on track — this keeps your protein building steadily toward your "+TARGETS.prot+"g target.":
    "You're ahead on protein today — a moderate lunch leaves room for a good dinner.";

  return{option:pick,reason:reason,protTarget:protGap,calTarget:Math.round(lunchCalTarget)};
}
function suggestLunch(){
  var dl=getDayLog();
  var today=todayKey();
  // Don't suggest if already eaten or dismissed
  if(mealEaten(dl.meals.lunch))return null;
  if(UI.lunchDismissed&&UI.lunchDismissed[today])return null;
  // Only suggest between 11:30 AM and 1 PM
  var nm=nowMin();
  if(nm<690||nm>780)return null;
  return recommendLunch();
}

// The specific planned meal for each slot today: dinner from the weekly dinner plan,
// breakfast/lunch/snack from the day-aware recommendation engines.
function plannedMeal(m,ws,today){
  if(m.id==="dinner"){
    var r=getRecipe(ws.dinnerPlan[today]);
    return r?{name:r.label,cal:r.cal,prot:r.rprot}:null;
  }
  if(m.id==="breakfast"){var b=recommendBreakfast();return b?{name:b.option.label,cal:b.option.cal,prot:b.option.prot}:null;}
  if(m.id==="lunch"){var l=recommendLunch();return l?{name:l.option.label,cal:l.option.cal,prot:l.option.prot}:null;}
  if(m.id==="snack"){var s=recommendSnack();return s?{name:s.snack.label,cal:s.snack.cal,prot:s.snack.prot}:null;}
  return null;
}

var lastSyncStatus="…";
function setSyncStatus(s){
  lastSyncStatus=s;
  var dot=document.getElementById("sync-dot");
  var lbl=document.getElementById("sync-lbl");
  if(!dot)return;
  dot.style.background=s==="synced"?"var(--sage)":(s==="offline"||s==="signedout")?"var(--warm)":"var(--muted)";
  lbl.textContent=s==="synced"?"Synced":s==="offline"?"Offline":s==="local"?"Local only":s==="signedout"?"Sign in to sync":"…";
  lbl.style.cursor=s==="signedout"?"pointer":"default";
  lbl.style.textDecoration=s==="signedout"?"underline":"none";
  lbl.onclick=s==="signedout"?function(){UI.tab="login";render();}:null;
}

// ── RENDER ─────────────────────────────────────────────────────────────────────
function render(){
  var app=document.getElementById("app");
  app.innerHTML="";

  var today=dayAbbr();
  PLAN=resolvePlan(weekKey()); // resolve the current week's plan once for this render
  var pw=programWeek(weekKey()); // real, uncapped program-week number
  var ws=getWeekState();
  var dl=getDayLog();
  var totals=computeTotals();
  var adj=computeAdjusted();
  var nm=nowMin();
  APP.planWeek=computePlanWeek();
  var activeSupps=PLAN.supplements; // already phase-filtered by the resolver
  var snackSug=suggestSnack();
  var breakfastSug=suggestBreakfast();
  var lunchSug=suggestLunch();
  var isSat=new Date().getDay()===6;

  // ── HEADER ──
  var header=h("div",{class:"header"},[
    h("div",{},[
      h("div",{style:{fontSize:"12px",letterSpacing:".1em",color:"var(--muted)",textTransform:"uppercase",fontFamily:"var(--font-d)"}},DAY_FULL[today]||""),
      h("h1",{style:{fontFamily:"var(--font-d)",fontSize:"28px",margin:"2px 0 8px",color:"var(--text)"}},"The Long Game"),
      h("div",{style:{fontSize:"10px",color:"var(--muted)",marginBottom:"4px"}},"v4 \u00b7 Workout tab active"),
    ]),
    h("div",{style:{display:"flex",alignItems:"center",marginTop:"6px"}},[
      h("span",{id:"sync-dot",class:"sync-dot",style:{background:"var(--muted)"}},""),
      h("span",{id:"sync-lbl",style:{fontSize:"11px",color:"var(--muted)"}},"…"),
    ]),
  ]);

  // ── TAB BAR ──
  var tabDefs=[
    {id:"today",label:"Today"},
    {id:"workout",label:"Workout"},
    {id:"checkin",label:"Check-In"},
    {id:"progress",label:"Progress"},
    {id:"grocery",label:"Grocery",badge:isSat&&new Date().getHours()>=17},
  ];
  var tabBar=h("div",{class:"tab-bar"},tabDefs.map(function(t){
    var btn=h("button",{class:"tab-btn"+(UI.tab===t.id?" active":""),onclick:function(){UI.tab=t.id;render();}},t.label);
    if(t.badge)btn.appendChild(h("span",{class:"tab-badge"},""));
    return btn;
  }));

  var sticky=h("div",{style:{position:"sticky",top:0,zIndex:20,background:"var(--bg)"}},[header,tabBar]);
  app.appendChild(sticky);
  setSyncStatus(lastSyncStatus); // keep the sync indicator consistent across re-renders

  var wrap=h("div",{class:"wrap"},[]);
  app.appendChild(wrap);

  // ── LOGIN ──
  if(UI.tab==="login"){
    wrap.appendChild(makeLoginScreen());
    return;
  }

  // ── TODAY TAB ──
  if(UI.tab==="today"){
    // Stats
    var statRow=h("div",{style:{display:"flex",gap:"14px",marginBottom:"22px"}},[
      makeStatBlock("Protein",totals.prot,PLAN.targets.prot,"g","var(--warm)"),
      makeStatBlock("Calories",totals.cal,PLAN.targets.cal,"","var(--sage)"),
    ]);
    wrap.appendChild(statRow);

    // Due today
    wrap.appendChild(h("div",{class:"sec-label"},"Due today"));
    wrap.appendChild(makeDueCard(activeSupps,dl,nm,snackSug));

    // Snack suggestion
    if(snackSug)wrap.appendChild(makeSnackCard(snackSug));

    // Breakfast suggestion
    if(breakfastSug)wrap.appendChild(makeMealSugCard("breakfast",breakfastSug.option,breakfastSug.reason,breakfastSug.option.cal,breakfastSug.option.prot,function(){if(!UI.breakfastDismissed)UI.breakfastDismissed={};UI.breakfastDismissed[todayKey()]=true;render();}));

    // Lunch suggestion
    if(lunchSug)wrap.appendChild(makeMealSugCard("lunch",lunchSug.option,lunchSug.reason,lunchSug.option.cal,lunchSug.option.prot,function(){if(!UI.lunchDismissed)UI.lunchDismissed={};UI.lunchDismissed[todayKey()]=true;render();}));

    // Week dinners
    wrap.appendChild(h("div",{class:"sec-label"},"This week's dinners"));
    wrap.appendChild(makeWeekStrip(ws,today));

    // Meals
    wrap.appendChild(h("div",{class:"sec-label"},"Today's meals"));
    PLAN.meals.forEach(function(m){wrap.appendChild(makeMealCard(m,dl,adj,ws,today));});

    // Hydration
    wrap.appendChild(h("div",{class:"sec-label"},"Hydration"));
    wrap.appendChild(makeHydrationCard(dl));

    // Desk breaks
    wrap.appendChild(h("div",{class:"sec-label"},"Desk breaks"));
    wrap.appendChild(makeBreakCard(dl));

    // Workout
    wrap.appendChild(h("div",{class:"sec-label"},"Today's workout"));
    var wo=PLAN.workouts[today]||PLAN.workouts["Sun"];
    var woCard=h("div",{class:"card"},[
      h("div",{style:{fontFamily:"var(--font-d)",fontSize:"16px",color:"var(--text)",marginBottom:"8px"}},wo.title),
      h("ul",{style:{margin:0,padding:0,listStyle:"none"}},wo.exercises.map(function(ex,i){
        var label=ex.sets>1?ex.sets+"x"+ex.reps+" "+ex.name:ex.name+" — "+ex.reps;
        return h("li",{style:{fontSize:"13.5px",color:"var(--muted)",padding:"5px 0",borderTop:i>0?"1px solid var(--line)":"none"}},label);
      })),
      h("div",{style:{fontSize:"12.5px",color:"var(--warm)",marginTop:"10px"}},"Evening: "+wo.evening),
    ]);
    wrap.appendChild(woCard);

    // Supplements
    wrap.appendChild(h("div",{class:"sec-label"},"Supplements"));
    wrap.appendChild(h("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",flexWrap:"wrap"}},[
      h("span",{style:{fontFamily:"var(--font-d)",fontSize:"12px",letterSpacing:".06em",textTransform:"uppercase",color:"var(--sage)",background:"var(--card)",border:"1px solid var(--line)",borderRadius:"8px",padding:"5px 10px"}},"Week "+pw),
      h("label",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"var(--muted)"}},[
        "Plan started ",
        makeInput("date",APP.planStartDate,function(v){APP.planStartDate=v;saveAll();render();},{width:"130px"}),
      ]),
    ]));
    var suppList=activeSupps.slice().sort(function(a,b){return a.tMin-b.tMin;});
    var suppCard=h("div",{class:"card",style:{padding:"10px 18px"}},suppList.map(function(s,i){
      var checked=!!(dl.supplements&&dl.supplements[s.id]);
      var lbl=h("label",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",fontSize:"13.5px",color:"var(--text)",cursor:"pointer",borderTop:i>0?"1px solid var(--line)":"none"}},[
        makeCheckbox(checked,function(v){if(!dl.supplements)dl.supplements={};dl.supplements[s.id]=v;saveAll();}),
        h("span",{style:{flex:1}},s.label),
        h("span",{style:{fontSize:"11.5px",color:"var(--muted)",flexShrink:0}},s.time),
      ]);
      return lbl;
    }));
    wrap.appendChild(suppCard);

    var week=computeWeekTotals();
    wrap.appendChild(h("footer",{},"This week ("+week.days+(week.days===1?" day":" days")+" logged): "+Math.round(week.prot)+"g protein · "+Math.round(week.cal)+" calories"));
  }

  // ── WORKOUT TAB ──
  else if(UI.tab==="workout"){
    wrap.appendChild(makeWorkoutTab(dl,today));
  }

  // ── CHECK-IN TAB ──
  else if(UI.tab==="checkin"){
    wrap.appendChild(makeCheckinTab());
  }

  // ── PROGRESS TAB ──
  else if(UI.tab==="progress"){
    wrap.appendChild(makeProgressTab());
  }

  // ── GROCERY TAB ──
  else if(UI.tab==="grocery"){
    if(isSat&&new Date().getHours()>=17){
      wrap.appendChild(h("div",{style:{background:"rgba(199,107,74,.15)",border:"1px solid var(--warm)",borderRadius:"12px",padding:"12px 16px",marginBottom:"16px",fontSize:"13px",color:"var(--warm)"}},"Saturday reminder — plan your groceries tonight so you're ready to shop before Sunday prep."));
    }
    wrap.appendChild(makeGroceryTab());
  }
}

// ── COMPONENT BUILDERS ─────────────────────────────────────────────────────────

function makeStatBlock(label,value,target,unit,color){
  var pct=Math.min(100,Math.round((value/target)*100));
  return h("div",{style:{flex:1,minWidth:0}},[
    h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px"}},[
      h("span",{style:{fontFamily:"var(--font-d)",fontSize:"12px",letterSpacing:".06em",color:"var(--muted)",textTransform:"uppercase"}},label),
      h("span",{style:{fontFamily:"var(--font-d)",fontSize:"12px",color:"var(--text)"}},Math.round(value)+unit+" / "+target+unit),
    ]),
    h("div",{class:"progress-bar"},[h("div",{class:"progress-fill",style:{width:pct+"%",background:color}},"")])
  ]);
}

function makeDueCard(activeSupps,dl,nm,snackSug){
  var items=activeSupps.map(function(s){
    return{key:"s-"+s.id,label:s.label,time:s.time,due:s.tMin<=nm,done:!!(dl.supplements&&dl.supplements[s.id]),kind:"supp",id:s.id};
  });
  var snack=curPlan().meals[2];
  items.push({key:"snack",label:"Snack time — "+snack.prot+"g protein target",time:snack.time,due:snack.tMin<=nm,done:mealEaten(dl.meals.snack),kind:"snack"});
  var pending=items.filter(function(i){return !i.done;});
  if(!pending.length){
    return h("div",{class:"card",style:{marginBottom:"16px"}},[h("div",{style:{fontSize:"13px",color:"var(--sage)"}},"All caught up — nothing due right now.")]);
  }
  return h("div",{class:"card",style:{padding:"14px 18px",marginBottom:"16px"}},pending.map(function(r,i){
    return h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:i>0?"1px solid var(--line)":"none"}},[
      h("div",{style:{display:"flex",alignItems:"center",gap:"10px"}},[
        h("span",{style:{width:"8px",height:"8px",borderRadius:"50%",background:r.due?"var(--warm)":"var(--muted)",flexShrink:0,display:"inline-block"}},""),
        h("div",{},[
          h("div",{style:{fontSize:"13.5px",color:"var(--text)"}},r.label),
          h("div",{style:{fontSize:"11.5px",color:"var(--muted)"}},r.time),
        ]),
      ]),
      h("button",{class:r.due?"btn-warm":"btn-ghost",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){
        if(r.kind==="snack"){
          UI.tab="today";
          setTimeout(function(){var el=document.getElementById("snack-anchor");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},100);
        } else {
          if(!dl.supplements)dl.supplements={};
          dl.supplements[r.id]=true;saveAll();render();
        }
      }},r.kind==="snack"?"Log it":"Took it"),
    ]);
  }));
}

function makeSnackCard(sug){
  var today=todayKey();
  return h("div",{style:{background:"var(--card-strong)",border:"1px solid var(--sage)",borderRadius:"14px",padding:"18px 20px",marginBottom:"16px"}},[
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",color:"var(--sage)",marginBottom:"6px"}},"Snack suggestion"),
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"18px",color:"var(--text)",marginBottom:"4px"}},sug.snack.label),
    h("div",{style:{fontSize:"13px",color:"var(--muted)",marginBottom:"4px"}},sug.snack.cal+" cal \u00b7 "+sug.snack.prot+"g protein"),
    h("div",{style:{fontSize:"13px",color:"var(--text)",marginBottom:"14px"}},
      sug.needProt>20?"You need ~"+sug.needProt+"g more protein before dinner \u2014 this gets you closest.":
      sug.needProt>0?"You're slightly behind on protein \u2014 a moderate snack keeps you on track.":
      "You're ahead on protein today \u2014 a lighter snack keeps calories in range."),
    h("button",{class:"btn-primary",style:{flex:"none",padding:"8px 16px"},onclick:function(){
      UI.snackDismissed[today]=true;
      UI.acceptedSug[today+"-snack"]={name:sug.snack.label,cal:sug.snack.cal,prot:sug.snack.prot};
      render();
    }},"\u2713 Got it — I\u2019ll have this"),
  ]);
}

function makeMealSugCard(mealType,option,reason,cal,prot,onDismiss){
  var label=mealType==="breakfast"?"Breakfast suggestion":"Lunch suggestion";
  var color=mealType==="breakfast"?"#7BAFC4":"var(--sage)";
  var today=todayKey();
  return h("div",{style:{background:"var(--card-strong)",border:"1px solid "+color,borderRadius:"14px",padding:"18px 20px",marginBottom:"16px"}},[
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",color:color,marginBottom:"6px"}},label),
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"18px",color:"var(--text)",marginBottom:"4px"}},option.label),
    h("div",{style:{fontSize:"13px",color:"var(--muted)",marginBottom:"6px"}},cal+" cal \u00b7 "+prot+"g protein"),
    h("div",{style:{fontSize:"13px",color:"var(--muted)",fontStyle:"italic",marginBottom:"6px"}},option.note),
    h("div",{style:{fontSize:"13px",color:"var(--text)",marginBottom:"14px",lineHeight:"1.5"}},reason),
    h("button",{class:"btn-primary",style:{flex:"none",padding:"8px 16px"},onclick:function(){
      UI.acceptedSug[today+"-"+mealType]={name:option.label,cal:cal,prot:prot};
      onDismiss();
    }},"\u2713 Got it \u2014 I\u2019ll have this"),
  ]);
}

// Popup showing a dinner recipe's macros + ingredients. Appended to <body> so render() can't clobber it.
function showRecipeModal(rid){
  var r=getRecipe(rid);
  if(!r)return;
  var existing=document.getElementById("recipe-modal");if(existing)existing.remove();
  function close(){var m=document.getElementById("recipe-modal");if(m)m.remove();}
  var proteinObj=PROTEINS_ALL.find(function(p){return p.id===r.prot;});
  var proteinLabel=proteinObj?proteinObj.label:r.prot;
  var catLabels={produce:"Produce",pantry:"Pantry",dairy:"Dairy"};
  var sections=[];
  ["produce","pantry","dairy"].forEach(function(cat){
    if(r.ing&&r.ing[cat]&&r.ing[cat].length){
      sections.push(h("div",{style:{marginTop:"14px"}},[
        h("div",{style:{fontFamily:"var(--font-d)",fontSize:"12px",letterSpacing:".06em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"6px"}},catLabels[cat]||cat),
        h("ul",{style:{margin:0,paddingLeft:"18px"}},r.ing[cat].map(function(item){return h("li",{style:{fontSize:"13.5px",color:"var(--text)",padding:"2px 0",lineHeight:"1.35"}},item);})),
      ]));
    }
  });
  var macros=proteinLabel+" · "+r.cal+" cal · "+r.rprot+"g protein"+(r.servings?" · "+r.servings:"");
  var stepsEl=(Array.isArray(r.steps)&&r.steps.length)?h("div",{},[
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"12px",letterSpacing:".06em",textTransform:"uppercase",color:"var(--sage)",marginTop:"20px"}},"Method"),
    h("ol",{style:{margin:"8px 0 0",paddingLeft:"20px"}},r.steps.map(function(st){return h("li",{style:{fontSize:"13.5px",color:"var(--text)",padding:"3px 0",lineHeight:"1.45"}},st);})),
  ]):"";
  var tipEl=r.tip?h("div",{style:{marginTop:"16px",background:"rgba(124,148,115,0.1)",borderRadius:"8px",padding:"10px 12px",fontSize:"13px",color:"var(--text)",lineHeight:"1.45"}},"💡 "+r.tip):"";
  var card=h("div",{style:{background:"var(--card)",border:"1px solid var(--line)",borderRadius:"16px",padding:"20px",maxWidth:"440px",width:"92%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 12px 40px rgba(0,0,0,.5)"},onclick:function(e){e.stopPropagation();}},[
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}},[
      h("div",{style:{fontFamily:"var(--font-d)",fontSize:"20px",color:"var(--text)",lineHeight:"1.2"}},r.label),
      h("button",{style:{flexShrink:0,background:"none",border:"none",color:"var(--muted)",fontSize:"26px",cursor:"pointer",lineHeight:"1",padding:"0 4px"},onclick:close},"×"),
    ]),
    h("div",{style:{fontSize:"13px",color:"var(--sage)",marginTop:"6px"}},macros),
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"12px",letterSpacing:".06em",textTransform:"uppercase",color:"var(--sage)",marginTop:"18px"}},"Ingredients"),
    h("div",{},sections.length?sections:[h("div",{style:{fontSize:"13px",color:"var(--muted)",marginTop:"8px"}},"No ingredient list for this recipe.")]),
    stepsEl,
    tipEl,
  ]);
  var overlay=h("div",{id:"recipe-modal",style:{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"200",padding:"16px"},onclick:close},[card]);
  document.body.appendChild(overlay);
}

function makeWeekStrip(ws,today){
  var days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return h("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"4px",marginBottom:"16px"}},days.map(function(day){
    var rid=ws.dinnerPlan[day];
    var r=getRecipe(rid);
    var isToday=day===today;
    return h("div",{style:{minWidth:"92px",background:isToday?"var(--card-strong)":"var(--card)",border:isToday?"1px solid var(--sage)":"1px solid var(--line)",borderRadius:"10px",padding:"10px",flexShrink:0,cursor:r?"pointer":"default"},onclick:r?function(){showRecipeModal(rid);}:null},[
      h("div",{style:{fontSize:"11px",color:"var(--muted)",marginBottom:"4px"}},day),
      h("div",{style:{fontSize:"12.5px",color:"var(--text)",lineHeight:"1.3"}},r?r.label:"—"),
      r?h("div",{style:{fontSize:"10px",color:"var(--sage)",marginTop:"6px"}},"View recipe ›"):"",
    ]);
  }));
}

function makeMealCard(m,dl,adj,ws,todayAbbr){
  var entry=dl.meals[m.id];
  var eaten=mealEaten(entry);
  var a=adj[m.id];
  var diff=a.prot-m.prot;
  var today=todayKey();
  var accepted=UI.acceptedSug[today+"-"+m.id]; // suggested meal user accepted

  var card=h("div",{class:"card",id:m.id==="snack"?"snack-anchor":""});

  // Header row — meal name, time, targets
  var top=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"}},[
    h("div",{},[
      h("div",{style:{fontFamily:"var(--font-d)",fontSize:"18px",color:"var(--text)"}},m.label),
      h("div",{style:{fontSize:"13px",color:"var(--muted)"}},m.time),
    ]),
    h("div",{style:{textAlign:"right"}},[
      h("div",{style:{fontFamily:"var(--font-d)",fontSize:"15px",color:"var(--text)"}},a.cal+" cal \u00b7 "+a.prot+"g"),
      diff!==0?h("div",{style:{fontSize:"11px",color:diff>0?"var(--warm)":"var(--sage)"}},diff>0?"+"+diff+"g to cover earlier shortfall":diff+"g, you're ahead"):"",
    ]),
  ]);
  card.appendChild(top);

  if(eaten){
    // Show what was actually eaten — name if recorded, plus numbers
    var loggedCal=mealCal(entry,m);
    var loggedProt=mealProt(entry,m);
    var loggedName=mealName(entry);
    var info=h("div",{style:{marginTop:"10px"}});
    if(loggedName){
      info.appendChild(h("div",{style:{fontSize:"13.5px",color:"var(--text)",marginBottom:"2px"}},loggedName));
    }
    var nums=h("div",{style:{fontSize:"13px",color:"var(--sage)"}},"Logged \u2014 "+loggedCal+" cal \u00b7 "+loggedProt+"g protein");
    var undo=h("button",{style:{marginLeft:"10px",background:"none",border:"none",color:"var(--muted)",textDecoration:"underline",cursor:"pointer",fontSize:"12px"},onclick:function(){
      clearMeal(dl,m.id);
      delete UI.acceptedSug[today+"-"+m.id];
      saveAll();render();
    }},"undo");
    nums.appendChild(undo);
    info.appendChild(nums);
    card.appendChild(info);

  } else if(accepted){
    // Suggestion was accepted — show specific food with "I had this" button
    card.appendChild(h("div",{style:{marginTop:"12px",background:"rgba(124,148,115,0.1)",borderRadius:"8px",padding:"10px 12px"}},[
      h("div",{style:{fontSize:"12px",color:"var(--sage)",marginBottom:"4px"}},"Suggested for you"),
      h("div",{style:{fontSize:"14px",color:"var(--text)",marginBottom:"2px"}},accepted.name),
      h("div",{style:{fontSize:"12px",color:"var(--muted)"}},accepted.cal+" cal \u00b7 "+accepted.prot+"g protein"),
    ]));
    card.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
      h("button",{class:"btn-primary",style:{flex:1},onclick:function(){
        setMealEaten(dl,m.id,accepted.cal,accepted.prot,accepted.name);
        saveAll();render();
      }},"I had this"),
      h("button",{class:"btn-ghost",style:{flex:"none"},onclick:function(){showEditMeal(card,m,dl,a);}},"\u270e Log different"),
    ]));

  } else {
    var planned=plannedMeal(m,ws,todayAbbr);
    if(planned){
      // Dinner's planned meal is a recipe — make its name tap to open the recipe popup.
      var dinnerRid=(m.id==="dinner"&&ws&&ws.dinnerPlan)?ws.dinnerPlan[todayAbbr]:null;
      var hasRecipe=dinnerRid&&getRecipe(dinnerRid);
      var nameEl=hasRecipe
        ? h("div",{style:{fontSize:"14px",color:"var(--text)",marginBottom:"2px",cursor:"pointer"},onclick:function(){showRecipeModal(dinnerRid);}},[planned.name+" ",h("span",{style:{color:"var(--sage)",fontSize:"12px"}},"· recipe ›")])
        : h("div",{style:{fontSize:"14px",color:"var(--text)",marginBottom:"2px"}},planned.name);
      // Show the specific planned meal for today — "Ate as planned" logs it by name.
      card.appendChild(h("div",{style:{marginTop:"12px",background:"rgba(124,148,115,0.08)",borderRadius:"8px",padding:"10px 12px"}},[
        h("div",{style:{fontSize:"12px",color:"var(--sage)",marginBottom:"4px"}},"Planned for today"),
        nameEl,
        h("div",{style:{fontSize:"12px",color:"var(--muted)"}},planned.cal+" cal · "+planned.prot+"g protein"),
      ]));
      card.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
        h("button",{class:"btn-primary",style:{flex:1},onclick:function(){
          setMealEaten(dl,m.id,planned.cal,planned.prot,planned.name);
          saveAll();render();
        }},"Ate as planned"),
        h("button",{class:"btn-ghost",style:{flex:"none"},onclick:function(){showEditMeal(card,m,dl,a);}},"✎ Log different"),
      ]));
    } else {
      // Fallback — no planned option resolved: generic buttons plus optional name field
      var nameIn=makeInput("text","",null,{width:"100%",marginBottom:"8px",placeholder:"What did you have? (optional)"});
      card.appendChild(h("div",{style:{marginTop:"12px"}},[nameIn]));
      card.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"8px"}},[
        h("button",{class:"btn-primary",style:{flex:1},onclick:function(){
          var name=nameIn.value.trim();
          setMealEaten(dl,m.id,a.cal,a.prot,name||null);
          saveAll();render();
        }},"Ate as planned"),
        h("button",{class:"btn-ghost",style:{flex:"none"},onclick:function(){showEditMeal(card,m,dl,a,nameIn);}},"✎ Log different"),
      ]));
    }
  }
  return card;
}

function showEditMeal(card,m,dl,a,existingNameIn){
  var editRow=card.querySelector(".edit-row");
  if(editRow){editRow.remove();return;}
  var nameIn=existingNameIn||makeInput("text","",null,{width:"100%",marginBottom:"6px",placeholder:"What did you have?"});
  var calIn=makeInput("number",String(a.cal),null,{width:"70px"});
  var protIn=makeInput("number",String(a.prot),null,{width:"70px"});
  var row=h("div",{class:"edit-row",style:{marginTop:"12px"}},[
    nameIn,
    h("div",{style:{display:"flex",gap:"8px",alignItems:"flex-end"}},[
      h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"flex",flexDirection:"column",gap:"4px"}},["Calories",calIn]),
      h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"flex",flexDirection:"column",gap:"4px"}},["Protein (g)",protIn]),
      h("button",{class:"btn-primary",onclick:function(){
        var name=nameIn.value.trim();
        setMealEaten(dl,m.id,parseInt(calIn.value)||a.cal,parseInt(protIn.value)||a.prot,name||null);
        saveAll();render();
      }},"Save"),
    ]),
  ]);
  card.appendChild(row);
}

function makeHydrationCard(dl){
  var TARGETS=curPlan().targets; // resolved water goal for the current week
  var pct=Math.min(100,Math.round((dl.water/TARGETS.water)*100));
  return h("div",{class:"card",style:{marginBottom:"16px"}},[
    h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"8px"}},[
      h("span",{style:{fontFamily:"var(--font-d)",fontSize:"16px",color:"var(--text)"}},dl.water+" oz"),
      h("span",{style:{fontSize:"12px",color:"var(--muted)"}},"goal "+TARGETS.water+" oz"),
    ]),
    h("div",{class:"progress-bar"},[h("div",{class:"progress-fill",style:{width:pct+"%",background:"var(--sage)"}},"")] ),
    h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
      h("button",{class:"btn-primary",style:{flex:1},onclick:function(){dl.water+=16;saveAll();render();}},"+16 oz"),
      h("button",{class:"btn-ghost",onclick:function(){dl.water+=8;saveAll();render();}},"+8 oz"),
      h("button",{class:"btn-ghost",onclick:function(){dl.water=Math.max(0,dl.water-8);saveAll();render();}},"-8 oz"),
    ]),
  ]);
}

var breakTimer=null,breakSecs=50*60,breakRunning=false;
function makeBreakCard(dl){
  var mins=Math.floor(breakSecs/60),secs=breakSecs%60;
  var card=h("div",{class:"card",style:{marginBottom:"16px"}},[
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},[
      h("div",{},[
        h("div",{style:{fontFamily:"var(--font-d)",fontSize:"16px",color:"var(--text)"}},"Desk break timer"),
        h("div",{style:{fontSize:"12px",color:"var(--muted)"}},dl.deskBreaksTaken+" breaks today"),
      ]),
      h("div",{id:"break-timer",style:{fontFamily:"var(--font-d)",fontSize:"26px",color:breakRunning?"var(--sage)":"var(--muted)"}},
        mins+":"+(secs<10?"0":"")+secs),
    ]),
    h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
      h("button",{class:"btn-primary",style:{flex:1},onclick:function(){
        breakRunning=!breakRunning;
        if(breakRunning){
          clearInterval(breakTimer);
          breakTimer=setInterval(function(){
            breakSecs--;
            if(breakSecs<=0){
              breakSecs=50*60;
              var d=getDayLog();d.deskBreaksTaken++;saveAll();
              if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
                new Notification("Stand up!",{body:"5 min walk, march in place, or 10 squats."});
              }
            }
            var t=document.getElementById("break-timer");
            if(t){var m2=Math.floor(breakSecs/60),s2=breakSecs%60;t.textContent=m2+":"+(s2<10?"0":"")+s2;t.style.color="var(--sage)";}
          },1000);
        } else {
          clearInterval(breakTimer);
          var t2=document.getElementById("break-timer");if(t2)t2.style.color="var(--muted)";
        }
        render();
      }},breakRunning?"Pause":"Start"),
      h("button",{class:"btn-ghost",onclick:function(){var d=getDayLog();d.deskBreaksTaken++;breakSecs=50*60;breakRunning=false;clearInterval(breakTimer);saveAll();render();}},"Took a break now"),
    ]),
  ]);
  return card;
}

// ── WORKOUT TAB ───────────────────────────────────────────────────────────────

var restTimer=null,restSecs=0,restRunning=false,restExId=null;

// The evening activity string, if it's a real thing to check off (not a rest evening).
function eveningActivity(wo){
  if(!wo||!wo.evening)return null;
  var e=wo.evening.trim();
  if(/^rest$/i.test(e)||/^full rest/i.test(e))return null;
  return e;
}
function eveningDone(log){return !!(log&&log["evening"]&&log["evening"][0]&&log["evening"][0].done);}

// Keep the canonical `workoutDone` boolean in sync with the detailed set log.
function updateWorkoutDone(dl,today){
  var wo=curPlan().workouts[today]||curPlan().workouts["Sun"];
  var log=dl.workoutLog||{};
  var total=0,done=0;
  wo.exercises.forEach(function(ex){
    if(ex.type==="rest")return;
    var sets=ex.sets||1;total+=sets;
    for(var i=0;i<sets;i++){if(log[ex.id]&&log[ex.id][i]&&log[ex.id][i].done)done++;}
  });
  if(eveningActivity(wo)){total+=1;if(eveningDone(log))done+=1;}
  dl.workoutDone=total>0&&done===total;
}

function makeWorkoutTab(dl,today){
  var wo=curPlan().workouts[today]||curPlan().workouts["Sun"];
  var log=dl.workoutLog||{};
  var wrap2=h("div",{});

  // Header
  wrap2.appendChild(h("div",{style:{marginBottom:"16px"}},[
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"20px",color:"var(--text)",marginBottom:"4px"}},wo.title),
    h("div",{style:{fontSize:"13px",color:"var(--warm)"}},"Evening: "+wo.evening),
  ]));

  // Rest day
  if(today==="Sun"){
    wrap2.appendChild(h("div",{class:"card",style:{textAlign:"center",padding:"32px 18px"}},[
      h("div",{style:{fontSize:"32px",marginBottom:"12px"}},"\uD83D\uDECF"),
      h("div",{style:{fontFamily:"var(--font-d)",fontSize:"18px",color:"var(--text)",marginBottom:"8px"}},"Rest Day"),
      h("div",{style:{fontSize:"13px",color:"var(--muted)",lineHeight:"1.6"}},"Your body consolidates the entire week's work today. Meal prep session at 10:00 AM."),
    ]));
    return wrap2;
  }

  // Progress summary bar
  var totalSets=0,doneSets=0;
  wo.exercises.forEach(function(ex){
    if(ex.type==="rest")return;
    var sets=ex.sets||1;
    totalSets+=sets;
    for(var i=0;i<sets;i++){
      if(log[ex.id]&&log[ex.id][i]&&log[ex.id][i].done)doneSets++;
    }
  });
  var evAct=eveningActivity(wo);
  if(evAct){totalSets+=1;if(eveningDone(log))doneSets+=1;}
  if(totalSets>0){
    var pct=Math.round((doneSets/totalSets)*100);
    wrap2.appendChild(h("div",{style:{marginBottom:"16px"}},[
      h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"6px"}},[
        h("span",{style:{fontSize:"13px",color:"var(--muted)"}},"Workout progress"),
        h("span",{style:{fontFamily:"var(--font-d)",fontSize:"13px",color:pct===100?"var(--sage)":"var(--text)"}},doneSets+"/"+totalSets+" sets"+(pct===100?" \u2713 Done!":"")),
      ]),
      h("div",{class:"progress-bar"},[h("div",{class:"progress-fill",style:{width:pct+"%",background:pct===100?"var(--sage)":"var(--warm)"}},"")])
    ]));
  }

  // Exercise cards
  wo.exercises.forEach(function(ex){
    if(ex.type==="rest")return;
    var typeColor={strength:"var(--sage)",cardio:"#7BAFC4",core:"var(--warm)",circuit:"var(--warm)",interval:"#7BAFC4",hold:"var(--sage)",mobility:"var(--muted)",stretch:"var(--muted)"}[ex.type]||"var(--muted)";
    var exCard=h("div",{class:"card",style:{marginBottom:"12px"}});

    exCard.appendChild(h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}},[
      h("div",{},[
        h("div",{style:{fontFamily:"var(--font-d)",fontSize:"17px",color:"var(--text)"}},ex.name),
        h("div",{style:{fontSize:"11px",color:typeColor,textTransform:"uppercase",letterSpacing:".06em",marginTop:"2px"}},ex.type+(ex.rest>0?" \u00b7 "+ex.rest+"s rest":"")),
      ]),
      ex.sets>1?h("div",{style:{fontFamily:"var(--font-d)",fontSize:"13px",color:"var(--muted)"}},ex.sets+" sets \u00d7 "+ex.reps):"",
    ]));

    exCard.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",fontStyle:"italic",marginBottom:"12px",lineHeight:"1.5"}},ex.cue));

    // Circuit components list
    if(ex.components){
      exCard.appendChild(h("div",{style:{background:"var(--bg)",borderRadius:"8px",padding:"10px 12px",marginBottom:"12px"}},
        ex.components.map(function(c,i){
          return h("div",{style:{padding:"6px 0",borderTop:i>0?"1px solid var(--line)":"none"}},[
            h("div",{style:{fontSize:"13.5px",color:"var(--text)",fontWeight:600}},c.name),
            h("div",{style:{fontSize:"12px",color:"var(--muted)",marginTop:"2px"}},c.cue),
          ]);
        })
      ));
    }

    // Sets
    if(ex.sets>0){
      var setsContainer=h("div",{style:{display:"flex",flexDirection:"column",gap:"8px"}});
      for(var si=0;si<ex.sets;si++){
        (function(setIdx){
          var setLog=(log[ex.id]&&log[ex.id][setIdx])||{done:false,reps:"",weight:"",notes:""};
          var isDone=setLog.done;
          var setRow=h("div",{style:{background:isDone?"rgba(124,148,115,0.1)":"var(--bg)",border:"1px solid "+(isDone?"var(--sage)":"var(--line)"),borderRadius:"10px",padding:"10px 12px"}});

          setRow.appendChild(h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isDone?"4px":"10px"}},[
            h("span",{style:{fontFamily:"var(--font-d)",fontSize:"13px",color:isDone?"var(--sage)":"var(--muted)"}},"Set "+(setIdx+1)+(ex.type==="interval"?" ("+ex.reps+")":" \u2014 "+ex.reps+" reps")),
            h("div",{style:{display:"flex",gap:"6px",alignItems:"center"}},[
              isDone&&ex.rest>0?h("button",{style:{fontSize:"11px",padding:"3px 8px",background:"transparent",border:"1px solid var(--line)",borderRadius:"6px",color:"var(--muted)",cursor:"pointer"},onclick:function(){startRestTimer(ex.rest);render();}},"Rest "+ex.rest+"s"):"",
              h("button",{style:{fontSize:"12px",padding:"4px 10px",background:isDone?"var(--sage)":"transparent",color:isDone?"var(--bg)":"var(--muted)",border:"1px solid "+(isDone?"var(--sage)":"var(--line)"),borderRadius:"6px",cursor:"pointer",fontWeight:600},onclick:function(){
                if(!log[ex.id])log[ex.id]={};
                if(!log[ex.id][setIdx])log[ex.id][setIdx]={done:false,reps:"",weight:"",notes:""};
                log[ex.id][setIdx].done=!log[ex.id][setIdx].done;
                updateWorkoutDone(dl,today);
                saveAll();render();
              }},isDone?"\u2713 Done":"Mark done"),
            ]),
          ]));

          if(isDone){
            var parts=[];
            if(setLog.reps)parts.push(setLog.reps+" reps");
            if(setLog.weight)parts.push(setLog.weight);
            if(setLog.notes)parts.push(setLog.notes);
            if(parts.length)setRow.appendChild(h("div",{style:{fontSize:"12px",color:"var(--sage)"}},parts.join(" \u00b7 ")));
          } else {
            var repsIn=makeInput("text",setLog.reps||"",null,{width:"70px",placeholder:"Reps"});
            var weightIn=makeInput("text",setLog.weight||"",null,{width:"100px",placeholder:"Weight/band"});
            var notesIn=makeInput("text",setLog.notes||"",null,{width:"100%",placeholder:"Notes (optional)"});
            setRow.appendChild(h("div",{style:{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}},[
              h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"flex",flexDirection:"column",gap:"3px"}},["Reps",repsIn]),
              h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"flex",flexDirection:"column",gap:"3px"}},["Weight / resistance",weightIn]),
            ]));
            setRow.appendChild(h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"flex",flexDirection:"column",gap:"3px",marginBottom:"8px"}},["Notes",notesIn]));
            setRow.appendChild(h("button",{class:"btn-primary",style:{padding:"7px 14px",fontSize:"12px"},onclick:function(){
              if(!log[ex.id])log[ex.id]={};
              log[ex.id][setIdx]={done:true,reps:repsIn.value,weight:weightIn.value,notes:notesIn.value};
              updateWorkoutDone(dl,today);
              if(ex.rest>0)startRestTimer(ex.rest);
              saveAll();render();
            }},"\u2713 Complete set"+(ex.rest>0?" + rest timer":"")));
          }
          setsContainer.appendChild(setRow);
        })(si);
      }
      exCard.appendChild(setsContainer);
    }
    wrap2.appendChild(exCard);
  });

  // Evening activity (e.g. zone-2 bike) — checkable like an exercise.
  if(evAct){
    var evDone=eveningDone(log);
    var evCard=h("div",{class:"card",style:{marginBottom:"12px",borderColor:evDone?"var(--sage)":"var(--line)"}});
    evCard.appendChild(h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}},[
      h("div",{},[
        h("div",{style:{fontFamily:"var(--font-d)",fontSize:"17px",color:"var(--text)"}},"Evening activity"),
        h("div",{style:{fontSize:"11px",color:"#7BAFC4",textTransform:"uppercase",letterSpacing:".06em",marginTop:"2px"}},"Evening"),
      ]),
      h("button",{style:{fontSize:"12px",padding:"4px 10px",background:evDone?"var(--sage)":"transparent",color:evDone?"var(--bg)":"var(--muted)",border:"1px solid "+(evDone?"var(--sage)":"var(--line)"),borderRadius:"6px",cursor:"pointer",fontWeight:600,flexShrink:0},onclick:function(){
        if(!log["evening"])log["evening"]={};
        if(!log["evening"][0])log["evening"][0]={done:false};
        log["evening"][0].done=!log["evening"][0].done;
        updateWorkoutDone(dl,today);
        saveAll();render();
      }},evDone?"✓ Done":"Mark done"),
    ]));
    evCard.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",marginTop:"8px",lineHeight:"1.5"}},evAct));
    wrap2.appendChild(evCard);
  }

  // Floating rest timer
  if(restSecs>0){
    var rm=Math.floor(restSecs/60),rs=restSecs%60;
    wrap2.appendChild(h("div",{style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",background:"var(--card-strong)",border:"1px solid var(--sage)",borderRadius:"16px",padding:"14px 24px",display:"flex",alignItems:"center",gap:"16px",boxShadow:"0 8px 24px rgba(0,0,0,.5)",zIndex:100}},[
      h("div",{},[
        h("div",{style:{fontSize:"11px",color:"var(--muted)",marginBottom:"2px"}},"Rest timer"),
        h("div",{"data-rest-timer":"1",style:{fontFamily:"var(--font-d)",fontSize:"28px",color:restSecs<10?"var(--warm)":"var(--sage)"}},rm+":"+(rs<10?"0":"")+rs),
      ]),
      h("button",{class:"btn-ghost",style:{padding:"8px 14px",fontSize:"12px"},onclick:function(){
        clearInterval(restTimer);restTimer=null;restSecs=0;restRunning=false;render();
      }},"Skip"),
    ]));
  }

  return wrap2;
}

function startRestTimer(secs){
  clearInterval(restTimer);
  restSecs=secs;restRunning=true;
  restTimer=setInterval(function(){
    restSecs--;
    var el=document.querySelector("[data-rest-timer]");
    if(el){
      var rm=Math.floor(restSecs/60),rs=restSecs%60;
      el.textContent=rm+":"+(rs<10?"0":"")+rs;
      el.style.color=restSecs<10?"var(--warm)":"var(--sage)";
    }
    if(restSecs<=0){
      clearInterval(restTimer);restTimer=null;restRunning=false;restSecs=0;
      if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
        new Notification("Rest complete",{body:"Time for your next set!"});
      }
      render();
    }
  },1000);
}

// ── CHECK-IN TAB ──
// Email + password sign-in screen (soft gate — the app still works offline without it).
function makeLoginScreen(){
  var wrap2=h("div",{});
  wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 16px"}},"Sign in to sync"));
  var card=h("div",{class:"card"});
  card.appendChild(h("div",{style:{fontSize:"13px",color:"var(--muted)",marginBottom:"14px",lineHeight:"1.5"}},"Sign in to sync your data across your devices. Your data stays on this device even when you're signed out."));
  card.appendChild(h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"block",marginBottom:"4px"}},"Email"));
  var emailIn=makeInput("email",UI.loginEmail||sessionEmail()||"rodney.l.weathers@gmail.com",function(v){UI.loginEmail=v;},{width:"100%",marginBottom:"12px"});
  emailIn.setAttribute("autocomplete","username");
  card.appendChild(emailIn);
  card.appendChild(h("label",{style:{fontSize:"11px",color:"var(--muted)",display:"block",marginBottom:"4px"}},"Password"));
  var pwIn=makeInput("password",UI.loginPw||"",function(v){UI.loginPw=v;},{width:"100%",marginBottom:"12px"});
  pwIn.setAttribute("autocomplete","current-password");
  card.appendChild(pwIn);
  if(UI.authError)card.appendChild(h("div",{style:{fontSize:"12px",color:"var(--warm)",marginBottom:"10px"}},UI.authError));
  var signInBtn=h("button",{class:"btn-primary",style:{width:"100%",padding:"12px",fontSize:"14px"}});
  signInBtn.textContent="Sign in";
  signInBtn.addEventListener("click",function(){
    var em=(UI.loginEmail||emailIn.value||"").trim(),pw=(UI.loginPw||pwIn.value||"");
    if(!em||!pw){UI.authError="Enter your email and password.";render();return;}
    signInBtn.textContent="Signing in…";signInBtn.disabled=true;
    authSignIn(em,pw).then(function(){
      UI.authError=null;UI.loginPw="";UI.tab="today";setSyncStatus("…");render();flushCloudSync();
    }).catch(function(e){
      UI.authError=e.message||"Sign-in failed — check your email and password.";render();
    });
  });
  card.appendChild(signInBtn);
  wrap2.appendChild(card);
  wrap2.appendChild(h("button",{class:"btn-ghost",style:{width:"100%",padding:"10px",marginTop:"10px",fontSize:"13px"},onclick:function(){UI.tab="today";UI.authError=null;render();}},"Not now — keep using offline"));
  return wrap2;
}

// Logged-adherence stats for a week (Sunday key): from the daily meal/workout logs.
function weekDailyStats(wkKey){
  var start=Date.parse(wkKey+"T00:00:00Z");
  var cal=0,prot=0,daysLogged=0,workoutsDone=0;
  Object.keys(APP.days).forEach(function(dk){
    var diff=(Date.parse(dk+"T00:00:00Z")-start)/86400000;
    if(diff<0||diff>6)return;
    var day=APP.days[dk];if(!day)return;
    var any=false;
    ["breakfast","lunch","snack","dinner"].forEach(function(id){
      var e=day.meals&&day.meals[id];
      if(e&&e.status==="eaten"){cal+=e.actualCal||0;prot+=e.actualProtein||0;any=true;}
    });
    if(any)daysLogged++;
    if(day.workoutDone)workoutsDone++;
  });
  return {daysLogged:daysLogged,avgProt:daysLogged?Math.round(prot/daysLogged):0,avgCal:daysLogged?Math.round(cal/daysLogged):0,workoutsDone:workoutsDone};
}

// Plain-text check-in + adherence summary to paste into Claude for next week's plan.
function buildCheckinExport(){
  var weeks=Object.keys(APP.checkIns||{}).sort().reverse();
  var out=["THE LONG GAME — CHECK-IN SUMMARY","Program week "+programWeek(weekKey())+" · Plan started "+APP.planStartDate,"Generated "+todayKey(),""];
  if(!weeks.length)out.push("(No check-ins recorded yet.)");
  weeks.slice(0,12).forEach(function(wk){
    var c=APP.checkIns[wk]||{},st=weekDailyStats(wk);
    out.push("WEEK OF "+wk+(wk===weekKey()?" (current)":""));
    if(c.weight)out.push("• Weight: "+c.weight+" lbs");
    var ratings=[];
    if(c.sleep)ratings.push("Sleep "+c.sleep+"/5");
    if(c.energy)ratings.push("Energy "+c.energy+"/5");
    if(c.gut)ratings.push("Gut "+c.gut+"/5");
    if(ratings.length)out.push("• "+ratings.join(" · "));
    if(c.workouts!=null&&c.workouts!=="")out.push("• Workouts completed (self-report): "+c.workouts);
    if(c.protein)out.push("• Hit protein target: "+c.protein);
    out.push("• Logged: "+st.daysLogged+" days"+(st.daysLogged?" · avg "+st.avgProt+"g protein · avg "+st.avgCal+" cal/day":"")+" · workout days done: "+st.workoutsDone);
    if(c.notes)out.push("• Notes: "+c.notes);
    out.push("");
  });
  return out.join("\n");
}

// Share/copy text — native share sheet on iOS (send to Notes/Messages) with a clipboard fallback.
function shareText(title,text,copiedMsg){
  if(navigator.share){navigator.share({title:title,text:text}).catch(function(){});}
  else if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){alert(copiedMsg||"Copied.");}).catch(function(){alert(text);});}
  else{alert(text);}
}

// Export card — copy check-ins for Claude.
function makeExportCard(){
  return h("div",{class:"card",style:{marginBottom:"16px"}},[
    h("div",{style:{fontFamily:"var(--font-d)",fontSize:"14px",color:"var(--text)",marginBottom:"6px"}},"Share check-ins with Claude"),
    h("div",{style:{fontSize:"12px",color:"var(--muted)",marginBottom:"10px",lineHeight:"1.5"}},"Copy your check-in history and logged adherence, then paste it to Claude when building next week's plan."),
    h("button",{class:"btn-primary",style:{width:"100%",padding:"10px",fontSize:"13px"},onclick:function(){shareText("The Long Game check-ins",buildCheckinExport(),"Check-in summary copied — paste it to Claude.");}},"Copy / share check-ins"),
  ]);
}

// Paste-to-import a Claude-generated plan JSON. Validate → preview → apply.
function makeImportCard(){
  var card=h("div",{class:"card",style:{marginBottom:"16px"}});
  card.appendChild(h("div",{style:{fontFamily:"var(--font-d)",fontSize:"14px",color:"var(--text)",marginBottom:"6px"}},"Import a plan"));
  card.appendChild(h("div",{style:{fontSize:"12px",color:"var(--muted)",marginBottom:"10px",lineHeight:"1.5"}},"Paste the plan JSON from Claude. It sets the target week and syncs across devices. Past weeks stay frozen."));
  var ta=h("textarea",{style:{width:"100%",minHeight:"92px",background:"var(--bg)",border:"1px solid var(--line)",borderRadius:"6px",color:"var(--text)",padding:"8px",fontFamily:"monospace",fontSize:"12px",resize:"vertical"},placeholder:'{ "tlgPlan":1, "targetWeek":"next", ... }'});
  ta.value=UI.importText||"";
  ta.addEventListener("input",function(){UI.importText=ta.value;});
  card.appendChild(ta);

  if(UI.importErrors&&UI.importErrors.length){
    card.appendChild(h("div",{style:{marginTop:"8px",fontSize:"12px",color:"var(--warm)"}},[
      h("div",{style:{marginBottom:"4px"}},"Couldn't apply — fix these:"),
      h("ul",{style:{margin:"0 0 0 16px",padding:0}},UI.importErrors.map(function(e){return h("li",{style:{marginBottom:"2px"}},e);})),
    ]));
  }
  if(UI.importPreview){
    var p=UI.importPreview;
    card.appendChild(h("div",{style:{marginTop:"8px",background:"var(--card-strong)",border:"1px solid var(--sage)",borderRadius:"8px",padding:"10px 12px"}},[
      h("div",{style:{fontSize:"12px",color:"var(--sage)",marginBottom:"4px"}},"Ready to apply"),
      h("div",{style:{fontSize:"13px",color:"var(--text)"}},"Target: week of "+p.wk+(p.isCurrent?" (this week)":"")),
      h("div",{style:{fontSize:"12px",color:"var(--muted)",marginTop:"2px"}},"Updates: "+p.sections.join(", ")+(p.note?' — "'+p.note+'"':"")),
      p.isCurrent?h("div",{style:{fontSize:"12px",color:"var(--warm)",marginTop:"6px"}},"Note: this overwrites the current week's plan; your logged data is untouched."):"",
    ]));
  }
  card.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"10px"}},[
    h("button",{class:"btn-ghost",onclick:function(){
      var res=parsePlanImport(UI.importText||"");
      if(!res.ok){UI.importErrors=res.errors;UI.importPreview=null;render();return;}
      var wk=resolveTargetWeek(res.doc);
      var sections=["targets","supplements","workouts","dinnerPlan","meals"].filter(function(k){return res.doc[k]!=null;});
      UI.importErrors=null;
      UI.importPreview={doc:res.doc,wk:wk,isCurrent:wk===weekKey(),sections:sections.length?sections:["(nothing — carries forward)"],note:res.doc.note};
      render();
    }},"Validate"),
    UI.importPreview?h("button",{class:"btn-primary",onclick:function(){
      var doc=UI.importPreview.doc;
      UI.importText="";UI.importPreview=null;UI.importErrors=null;UI.importApplied=true;
      applyPlanImport(doc); // persists + re-renders
    }},"Apply plan"):"",
    (UI.importText||UI.importPreview||UI.importErrors)?h("button",{class:"btn-ghost",onclick:function(){UI.importText="";UI.importPreview=null;UI.importErrors=null;render();}},"Clear"):"",
  ]));
  if(UI.importApplied){card.appendChild(h("div",{style:{marginTop:"8px",fontSize:"12px",color:"var(--sage)"}},"✓ Plan applied."));UI.importApplied=false;}
  return card;
}

function makeCheckinTab(){
  var wk=weekKey();
  if(APP.checkIns[wk])CI=Object.assign({},APP.checkIns[wk]);
  var saved=!!APP.checkIns[wk];
  var wrap2=h("div",{});
  wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 16px"}},"Weekly Check-In"));
  wrap2.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",marginBottom:"20px"}},saved?"\u2713 This week is saved.":"Fill in what you can — nothing is required."));
  wrap2.appendChild(makeExportCard());
  wrap2.appendChild(makeImportCard());

  function field(label,content){
    return h("div",{class:"card",style:{marginBottom:"12px"}},[
      h("div",{style:{fontSize:"13px",color:"var(--muted)",marginBottom:"10px"}},label),
      content,
    ]);
  }
  function ratingRow(key){
    return h("div",{style:{display:"flex",gap:"6px"}},
      [1,2,3,4,5].map(function(n){
        var btn=h("button",{class:"star-btn"+(CI[key]>=n?" on":""),onclick:function(){CI[key]=n;saveCI();}},String(n));
        return btn;
      })
    );
  }
  function saveCI(){CI.ts=Date.now();APP.checkIns[wk]=Object.assign({},CI);saveAll();render();}

  var wIn=makeInput("number",CI.weight,function(v){CI.weight=v;},{width:"100px"});
  wrap2.appendChild(field("Weight (lbs)",h("div",{style:{display:"flex",alignItems:"center",gap:"8px"}},[wIn,h("span",{style:{fontSize:"13px",color:"var(--muted)"}},"lbs")])));
  wrap2.appendChild(field("Sleep quality (1-5)",ratingRow("sleep")));
  wrap2.appendChild(field("Energy level (1-5)",ratingRow("energy")));
  wrap2.appendChild(field("Gut / digestion (1-5)",ratingRow("gut")));
  var woIn=makeInput("number",CI.workouts,function(v){CI.workouts=v;},{width:"80px"});
  wrap2.appendChild(field("Workouts completed",h("div",{style:{display:"flex",alignItems:"center",gap:"8px"}},[woIn,h("span",{style:{fontSize:"13px",color:"var(--muted)"}},"days")])));
  wrap2.appendChild(field("Hit protein target most days?",h("div",{style:{display:"flex",gap:"8px"}},
    ["Yes","No","Mostly"].map(function(opt){
      return h("button",{class:CI.protein===opt?"btn-primary":"btn-ghost",onclick:function(){CI.protein=opt;saveCI();}},opt);
    })
  )));
  var notesEl=h("textarea",{style:{width:"100%",background:"var(--bg)",border:"1px solid var(--line)",borderRadius:"6px",color:"var(--text)",padding:"8px",fontFamily:"var(--font-b)",fontSize:"13px",resize:"vertical"},rows:"3",placeholder:"Anything worth capturing…"},CI.notes||"");
  notesEl.addEventListener("input",function(){CI.notes=notesEl.value;});
  wrap2.appendChild(field("Issues or notes",notesEl));
  wrap2.appendChild(h("button",{class:"btn-primary",style:{width:"100%",padding:"12px",fontSize:"14px",marginTop:"4px"},onclick:function(){saveCI();}},"Save check-in"));
  // Account / sign-out
  wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"24px 0 10px"}},"Account"));
  if(sessionValid()){
    wrap2.appendChild(h("div",{class:"card",style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},[
      h("div",{style:{fontSize:"12.5px",color:"var(--muted)"}},"Signed in as "+(sessionEmail()||"you")),
      h("button",{class:"btn-ghost",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){authSignOut();}},"Sign out"),
    ]));
    wrap2.appendChild(h("div",{class:"card",style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px"}},[
      h("div",{style:{fontSize:"12.5px",color:"var(--muted)"}},"Local data out of sync? Clear it and re-pull from cloud."),
      h("button",{class:"btn-ghost",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){
        if(!confirm("Clear this device's saved data and re-download from the cloud? Any unsynced offline changes will be lost."))return;
        try{localStorage.removeItem("tlg");}catch(e){}
        window.location.reload();
      }},"Reset local"),
    ]));
  } else {
    wrap2.appendChild(h("div",{class:"card",style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},[
      h("div",{style:{fontSize:"12.5px",color:"var(--muted)"}},"Not signed in — syncing is off"),
      h("button",{class:"btn-primary",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){UI.tab="login";render();}},"Sign in"),
    ]));
  }
  return wrap2;
}

// ── PROGRESS TAB ──
function makeProgressTab(){
  var history=Object.entries(APP.checkIns).sort(function(a,b){return a[0].localeCompare(b[0]);}).slice(-12);
  if(!history.length){
    return h("div",{style:{padding:"20px 0",color:"var(--muted)",fontSize:"13px"}},"No check-ins yet — complete your first Sunday check-in to start seeing progress here.");
  }
  var wrap2=h("div",{});
  wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 16px"}},"Progress over time"));
  function chart(title,data,color,unit,mn,mx){
    var vals=data.map(Number).filter(function(v){return !isNaN(v)&&v>0;});
    if(!vals.length)return "";
    var minV=mn!=null?mn:Math.min.apply(null,vals);
    var maxV=mx!=null?mx:Math.max.apply(null,vals);
    var range=maxV-minV||1;
    var W=280,H=80,PAD=6;
    var pts=data.map(function(v,i){
      var x=PAD+(i/(data.length-1||1))*(W-PAD*2);
      var y=Number(v)>0?H-PAD-((Number(v)-minV)/range)*(H-PAD*2):null;
      return{x:x,y:y,v:v};
    });
    var pathPts=pts.filter(function(p){return p.y!==null;});
    var d=pathPts.map(function(p,i){return(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1);}).join(" ");
    var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("width","100%");svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.style.overflow="visible";
    function svgEl(tag,attrs){var el=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.keys(attrs).forEach(function(k){el.setAttribute(k,attrs[k]);});return el;}
    svg.appendChild(svgEl("line",{x1:PAD,y1:PAD,x2:PAD,y2:H-PAD,stroke:"var(--line)",strokeWidth:1}));
    svg.appendChild(svgEl("line",{x1:PAD,y1:H-PAD,x2:W-PAD,y2:H-PAD,stroke:"var(--line)",strokeWidth:1}));
    if(d)svg.appendChild(svgEl("path",{d:d,fill:"none",stroke:color,"stroke-width":"2.5","stroke-linecap":"round","stroke-linejoin":"round"}));
    pts.filter(function(p){return p.y!==null;}).forEach(function(p,i){
      svg.appendChild(svgEl("circle",{cx:p.x,cy:p.y,r:4,fill:color}));
      var tl=svgEl("text",{x:p.x,y:H-1,"text-anchor":"middle","font-size":9,fill:"var(--muted)"});tl.textContent="W"+(i+1);svg.appendChild(tl);
      if(i===pts.length-1){var tv=svgEl("text",{x:p.x,y:p.y-8,"text-anchor":"middle","font-size":9,fill:color});tv.textContent=p.v+unit;svg.appendChild(tv);}
    });
    return h("div",{class:"card",style:{marginBottom:"12px"}},[
      h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"10px"}},[
        h("span",{style:{fontFamily:"var(--font-d)",fontSize:"14px",color:"var(--text)"}},title),
        h("span",{style:{fontFamily:"var(--font-d)",fontSize:"14px",color:color}},vals[vals.length-1]+unit),
      ]),
      svg,
    ]);
  }
  function get(f){return history.map(function(e){return e[1][f]||0;});}
  wrap2.appendChild(chart("Weight",get("weight"),"var(--warm)","lbs",150,250));
  wrap2.appendChild(chart("Sleep quality",get("sleep"),"var(--sage)","",1,5));
  wrap2.appendChild(chart("Energy level",get("energy"),"#7BAFC4","",1,5));
  wrap2.appendChild(chart("Gut health",get("gut"),"#A87FC4","",1,5));
  wrap2.appendChild(chart("Workouts / week",get("workouts"),"var(--sage)"," days",0,7));
  var withNotes=history.filter(function(e){return e[1].notes;}).reverse().slice(0,5);
  if(withNotes.length){
    wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"20px 0 10px"}},"Notes history"));
    withNotes.forEach(function(e){
      wrap2.appendChild(h("div",{class:"card",style:{marginBottom:"10px"}},[
        h("div",{style:{fontSize:"11px",color:"var(--muted)",marginBottom:"4px"}},"Week of "+e[0]),
        h("div",{style:{fontSize:"13.5px",color:"var(--text)"}},e[1].notes),
      ]));
    });
  }
  return wrap2;
}

// ── GROCERY TAB ──
var GS={step:1,inventory:{},dinnerPlan:Object.assign({},DEFAULT_DINNER_PLAN),pantryHave:{},checked:{}};
function makeGroceryTab(){
  if(APP.groceryState)GS=Object.assign({},APP.groceryState);
  function saveGS(){APP.groceryState=Object.assign({},GS);saveAll();}
  var wrap2=h("div",{});

  if(GS.step===1){
    wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 6px"}},"Step 1 of 4 — What proteins do you have?"));
    wrap2.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",marginBottom:"16px"}},"Check everything on hand. Flag anything running low."));
    PROTEINS_ALL.forEach(function(p){
      var have=!!(GS.inventory[p.id]&&GS.inventory[p.id].have);
      var low=!!(GS.inventory[p.id]&&GS.inventory[p.id].low);
      var card=h("div",{class:"card",style:{marginBottom:"8px",padding:"12px 16px"}});
      var row=h("div",{style:{display:"flex",alignItems:"center",gap:"12px"}},[
        makeCheckbox(have,function(v){if(!GS.inventory[p.id])GS.inventory[p.id]={};GS.inventory[p.id].have=v;if(!v)GS.inventory[p.id].low=false;saveGS();render();}),
        h("div",{style:{flex:1}},[
          h("div",{style:{fontSize:"14px",color:"var(--text)"}},p.label),
          h("div",{style:{fontSize:"11px",color:"var(--muted)"}},p.freezer?"In your freezer":"Fresh / needs purchasing"),
        ]),
      ]);
      if(have){
        var lowBtn=h("button",{class:low?"btn-warm":"btn-ghost",style:{flex:"none",padding:"4px 10px",fontSize:"11px"},onclick:function(){GS.inventory[p.id].low=!low;saveGS();render();}},low?"\u26a0 Low":"Good");
        row.appendChild(lowBtn);
      }
      card.appendChild(row);
      wrap2.appendChild(card);
    });
    wrap2.appendChild(h("button",{class:"btn-primary",style:{width:"100%",padding:"12px",marginTop:"8px",fontSize:"14px"},onclick:function(){GS.step=2;saveGS();render();}},"Next \u2014 Build this week\u2019s menu \u2192"));
  }

  else if(GS.step===2){
    var have=new Set(Object.keys(GS.inventory).filter(function(k){return GS.inventory[k].have&&!GS.inventory[k].low;}));
    var low2=new Set(Object.keys(GS.inventory).filter(function(k){return GS.inventory[k].have&&GS.inventory[k].low;}));
    var recipeList=Object.entries(allRecipes()).map(function(e){return{id:e[0],r:e[1]};}).sort(function(a,b){
      var as=have.has(a.r.prot)?0:low2.has(a.r.prot)?1:2;
      var bs=have.has(b.r.prot)?0:low2.has(b.r.prot)?1:2;
      return as-bs;
    });
    wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 6px"}},"Step 2 of 4 \u2014 Build this week\u2019s dinners"));
    wrap2.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",marginBottom:"16px"}},"Proteins you have are listed first. Pick any meal for each night."));
    ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach(function(day){
      var rid=GS.dinnerPlan[day];
      var r=getRecipe(rid);
      var dayHave=r&&have.has(r.prot);
      var dayLow=r&&low2.has(r.prot);
      var card=h("div",{class:"card",style:{marginBottom:"8px",padding:"12px 16px"}});
      var dayFull={Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday"}[day];
      var sel=h("select",{style:{width:"100%",marginTop:"8px"}});
      recipeList.forEach(function(item){
        var opt=h("option",{value:item.id},item.r.label+(have.has(item.r.prot)?" \u2713":low2.has(item.r.prot)?" \u26a0":""));
        if(item.id===rid)opt.selected=true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change",function(){GS.dinnerPlan[day]=sel.value;saveGS();});
      var tag2=dayHave?"\u2713 Have":dayLow?"\u26a0 Low":"Need to buy";
      var tagColor=dayHave?"var(--sage)":dayLow?"var(--warm)":"var(--muted)";
      card.appendChild(h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"}},[
        h("div",{},[
          h("div",{style:{fontSize:"11px",color:"var(--muted)"}},dayFull),
          h("div",{style:{fontSize:"14px",color:"var(--text)",fontWeight:600}},r?r.label:"\u2014"),
        ]),
        h("span",{class:"tag",style:{background:"rgba(0,0,0,.2)",color:tagColor}},tag2),
      ]));
      card.appendChild(sel);
      wrap2.appendChild(card);
    });
    wrap2.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
      h("button",{class:"btn-ghost",style:{flex:"none",padding:"10px 16px"},onclick:function(){GS.step=1;saveGS();render();}},"\u2190 Back"),
      h("button",{class:"btn-primary",style:{flex:1,padding:"12px",fontSize:"14px"},onclick:function(){GS.step=3;saveGS();render();}},"Next \u2014 Check your pantry \u2192"),
    ]));
  }

  else if(GS.step===3){
    var needed={produce:new Set(),pantry:new Set(),dairy:new Set(),beverages:new Set(),supplements:new Set()};
    Object.values(GS.dinnerPlan).forEach(function(rid){
      var r=getRecipe(rid);if(!r)return;
      Object.keys(r.ing).forEach(function(cat){r.ing[cat].forEach(function(item){if(needed[cat])needed[cat].add(item);});});
    });
    Object.keys(PANTRY_STAPLES).forEach(function(cat){PANTRY_STAPLES[cat].forEach(function(item){if(needed[cat])needed[cat].add(item);});});
    var allNeeded={"\uD83E\uDD66 Produce":[...needed.produce].sort(),"\uD83E\uDED9 Pantry":[...needed.pantry].sort(),"\uD83E\uDD5B Dairy & eggs":[...needed.dairy,...PANTRY_STAPLES.dairy].filter(function(v,i,a){return a.indexOf(v)===i;}).sort(),"\uD83E\uDD64 Beverages":[...PANTRY_STAPLES.beverages],"\uD83D\uDC8A Supplements":[...PANTRY_STAPLES.supplements]};
    wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 6px"}},"Step 3 of 4 \u2014 What do you already have?"));
    wrap2.appendChild(h("div",{style:{fontSize:"12.5px",color:"var(--muted)",marginBottom:"16px"}},"Check everything you already have \u2014 these won\u2019t go on the list."));
    Object.entries(allNeeded).forEach(function(entry){
      var cat=entry[0],items=entry[1];
      if(!items.length)return;
      wrap2.appendChild(h("div",{style:{fontSize:"13px",color:"var(--text)",fontWeight:600,marginBottom:"8px"}},cat));
      var card=h("div",{class:"card",style:{padding:"8px 16px",marginBottom:"16px"}});
      items.forEach(function(item,i){
        var lbl=h("label",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",fontSize:"13.5px",color:"var(--text)",cursor:"pointer",borderTop:i>0?"1px solid var(--line)":"none"}},[
          makeCheckbox(!!GS.pantryHave[item],function(v){GS.pantryHave[item]=v;saveGS();}),
          item,
        ]);
        card.appendChild(lbl);
      });
      wrap2.appendChild(card);
    });
    wrap2.appendChild(h("div",{style:{display:"flex",gap:"8px",marginTop:"12px"}},[
      h("button",{class:"btn-ghost",style:{flex:"none",padding:"10px 16px"},onclick:function(){GS.step=2;saveGS();render();}},"\u2190 Back"),
      h("button",{class:"btn-primary",style:{flex:1,padding:"12px",fontSize:"14px"},onclick:function(){GS.step=4;saveGS();render();}},"Generate my list \u2192"),
    ]));
  }

  else if(GS.step===4){
    var haveP=new Set(Object.keys(GS.inventory).filter(function(k){return GS.inventory[k].have&&!GS.inventory[k].low;}));
    var finalSections={"\uD83E\uDD69 Proteins":[]};
    Object.values(GS.dinnerPlan).forEach(function(rid){
      var r=getRecipe(rid);if(!r)return;
      if(!haveP.has(r.prot)){
        var p=PROTEINS_ALL.find(function(x){return x.id===r.prot;});
        if(p){var lbl=p.label+" (for dinner)";if(finalSections["\uD83E\uDD69 Proteins"].indexOf(lbl)===-1)finalSections["\uD83E\uDD69 Proteins"].push(lbl);}
      }
    });
    var ingNeeded={produce:new Set(),pantry:new Set(),dairy:new Set(),beverages:new Set(),supplements:new Set()};
    Object.values(GS.dinnerPlan).forEach(function(rid){
      var r=getRecipe(rid);if(!r)return;
      Object.keys(r.ing).forEach(function(cat){r.ing[cat].forEach(function(item){if(!GS.pantryHave[item]&&ingNeeded[cat])ingNeeded[cat].add(item);});});
    });
    Object.keys(PANTRY_STAPLES).forEach(function(cat){PANTRY_STAPLES[cat].forEach(function(item){if(!GS.pantryHave[item]&&ingNeeded[cat])ingNeeded[cat].add(item);});});
    finalSections["\uD83E\uDD66 Produce"]=[...ingNeeded.produce].sort();
    finalSections["\uD83E\uDED9 Pantry & dry"]=[...ingNeeded.pantry].sort();
    finalSections["\uD83E\uDD5B Dairy & eggs"]=[...ingNeeded.dairy].sort();
    finalSections["\uD83E\uDD64 Beverages"]=[...ingNeeded.beverages].sort();
    finalSections["\uD83D\uDC8A Supplements"]=[...ingNeeded.supplements].sort();

    var totalItems=Object.values(finalSections).reduce(function(a,b){return a+b.length;},0);
    var checkedCount=Object.values(finalSections).reduce(function(a,sec){
      return a+sec.filter(function(item){return GS.checked&&GS.checked[item];}).length;
    },0);

    var plainText="GROCERY LIST \u2014 The Long Game\nWeek of "+new Date().toLocaleDateString()+"\n\n"+
      Object.entries(finalSections).filter(function(e){return e[1].length;}).map(function(e){
        return e[0]+"\n"+e[1].map(function(i){return"  \u2610 "+i;}).join("\n");
      }).join("\n\n");

    wrap2.appendChild(h("div",{class:"sec-label",style:{margin:"0 0 6px"}},"Your grocery list"));
    wrap2.appendChild(h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}},[
      h("div",{style:{fontSize:"12.5px",color:"var(--muted)"}},totalItems+" items \u00b7 "+checkedCount+" checked off"),
      h("div",{style:{display:"flex",gap:"8px"}},[
        h("button",{class:"btn-ghost",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){
          if(navigator.share){navigator.share({title:"Grocery List",text:plainText}).catch(function(){});}
          else{navigator.clipboard&&navigator.clipboard.writeText(plainText).then(function(){alert("Copied! Paste into Notes to share or print.");}).catch(function(){alert(plainText);});}
        }},"Share / Copy"),
        h("button",{class:"btn-ghost",style:{flex:"none",padding:"6px 12px",fontSize:"12px"},onclick:function(){GS={step:1,inventory:{},dinnerPlan:Object.assign({},DEFAULT_DINNER_PLAN),pantryHave:{},checked:{}};saveGS();render();}},"Start over"),
      ]),
    ]));

    Object.entries(finalSections).filter(function(e){return e[1].length;}).forEach(function(entry){
      var sec=entry[0],items=entry[1];
      wrap2.appendChild(h("div",{style:{fontSize:"13px",color:"var(--text)",fontWeight:600,marginBottom:"8px"}},sec));
      var card=h("div",{class:"card",style:{padding:"8px 16px",marginBottom:"16px"}});
      items.forEach(function(item,i){
        var done=!!(GS.checked&&GS.checked[item]);
        var lbl=h("label",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",fontSize:"13.5px",cursor:"pointer",color:done?"var(--muted)":"var(--text)","text-decoration":done?"line-through":"none",borderTop:i>0?"1px solid var(--line)":"none"}},[
          makeCheckbox(done,function(v){if(!GS.checked)GS.checked={};GS.checked[item]=v;saveGS();render();}),
          item,
        ]);
        card.appendChild(lbl);
      });
      wrap2.appendChild(card);
    });
    wrap2.appendChild(h("button",{class:"btn-ghost",style:{width:"100%",padding:"10px",marginTop:"4px",fontSize:"13px"},onclick:function(){GS.step=2;saveGS();render();}},"\u2190 Edit meal plan"));
  }
  return wrap2;
}

// ── UTILS ──────────────────────────────────────────────────────────────────────
function makeCheckbox(checked,onChange){
  var cb=h("input",{type:"checkbox",style:{width:"16px",height:"16px","accent-color":"var(--sage)"}});
  cb.checked=!!checked;
  cb.addEventListener("change",function(){onChange(cb.checked);});
  return cb;
}
function makeInput(type,val,onChange,style){
  var inp=h("input",{type:type,style:Object.assign({},style||{})});
  inp.value=val||"";
  if(onChange)inp.addEventListener("input",function(){onChange(inp.value);});
  return inp;
}

// ── INIT ───────────────────────────────────────────────────────────────────────
(async function(){
  loadSession();
  // Load local data immediately so app never hangs
  var hadLocal=false;
  try {
    var local = lsGet("tlg");
    if(local){
      hadLocal=!!(local.days&&Object.keys(local.days).length);
      APP.days=local.days||{};
      APP.weeks=local.weeks||{};
      APP.checkIns=local.checkIns||{};
      APP.groceryState=local.groceryState||null;
      APP.planStartDate=local.planStartDate||todayKey();
      APP.planWeeks=local.planWeeks||{};
      APP.activePlan=local.activePlan||null;
      APP.updatedAt=local.updatedAt||null;
      if(local.groceryState)GS=Object.assign({},local.groceryState);
      if(local.checkIns){
        var wk=weekKey();
        if(local.checkIns[wk])CI=Object.assign({},local.checkIns[wk]);
      }
    }
  } catch(e){ console.warn("Local load failed",e); }

  // Fresh device (no local data) that needs a login to pull → land on the sign-in screen.
  if(!hadLocal && syncEnabled() && !sessionValid()) UI.tab="login";

  // Render immediately with local data
  render();
  setSyncStatus(navigator.onLine?(!syncEnabled()?"local":(sessionValid()?"synced":"signedout")):"offline");

  // Then merge cloud in the background (read-only pull; merge never clobbers unsynced local edits)
  if(navigator.onLine && syncEnabled() && sessionValid()){
    try {
      var cloud = await cloudPull();
      if(cloud && cloud.state){
        var merged = mergeState(serializeState(), cloud.state);
        adoptState(merged);
        lsSet("tlg", merged);
        render(); // re-render with merged cloud data
        setSyncStatus("synced");
      } else {
        setSyncStatus("signedout");
      }
    } catch(e){ console.warn("Cloud sync failed",e); setSyncStatus("offline"); }
  }

  initSynced=true; // safe to freeze week snapshots now that local+cloud have settled
  // Flush any pending debounced sync when the app is backgrounded (iOS suspends PWAs quickly).
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flushCloudSync();});
  scheduleDay();
})();
