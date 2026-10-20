const express = require('express');
const app = express();
app.use(express.json());

let trips = [
  {id:"1",from:"الخرطوم",to:"نهر النيل",office:"بصات عطبرة الفاخر",price:25000,seats:12,time:"06:00 ص",type:"VIP",phone:"0910000001"},
  {id:"2",from:"الخرطوم",to:"البحر الأحمر",office:"الرفاعي",price:45000,seats:5,time:"19:30",type:"مكيف",phone:"0910000002"},
  {id:"3",from:"الجزيرة",to:"الخرطوم",office:"الجزيرة",price:15000,seats:20,time:"09:00 ص",type:"عادي",phone:"0910000003"},
  {id:"4",from:"نهر النيل",to:"الشمالية",office:"الشمال",price:30000,seats:8,time:"05:00 ص",type:"VIP",phone:"0910000004"},
];
let chats=[];

const STATES=[
{name:"الخرطوم",cap:"الخرطوم",color:"from-violet-600 to-indigo-600",emoji:"🏙️"},
{name:"الجزيرة",cap:"ود مدني",color:"from-emerald-500 to-teal-600",emoji:"🌾"},
{name:"البحر الأحمر",cap:"بورتسودان",color:"from-blue-500 to-cyan-500",emoji:"🌊"},
{name:"كسلا",cap:"كسلا",color:"from-amber-500 to-orange-600",emoji:"⛰️"},
{name:"القضارف",cap:"القضارف",color:"from-lime-500 to-green-600",emoji:"🌽"},
{name:"سنار",cap:"سنجة",color:"from-green-500 to-emerald-600",emoji:"🦁"},
{name:"النيل الأبيض",cap:"ربك",color:"from-sky-400 to-blue-600",emoji:"💧"},
{name:"النيل الأزرق",cap:"الدمازين",color:"from-blue-600 to-indigo-700",emoji:"💦"},
{name:"الشمالية",cap:"دنقلا",color:"from-yellow-500 to-amber-600",emoji:"🏜️"},
{name:"نهر النيل",cap:"عطبرة - الدامر",color:"from-slate-700 to-black",emoji:"🚂"},
{name:"شمال كردفان",cap:"الأبيض",color:"from-orange-400 to-red-500",emoji:"🐪"},
{name:"غرب كردفان",cap:"الفولة",color:"from-red-500 to-rose-600",emoji:"🛢️"},
{name:"جنوب كردفان",cap:"كادوقلي",color:"from-teal-500 to-emerald-600",emoji:"🏞️"},
{name:"شمال دارفور",cap:"الفاشر",color:"from-amber-600 to-yellow-700",emoji:"🏜️"},
{name:"غرب دارفور",cap:"الجنينة",color:"from-rose-500 to-pink-600",emoji:"🌴"},
{name:"جنوب دارفور",cap:"نيالا",color:"from-purple-500 to-pink-500",emoji:"🌅"},
{name:"شرق دارفور",cap:"الضعين",color:"from-indigo-500 to-purple-600",emoji:"🐎"},
{name:"وسط دارفور",cap:"زالنجي",color:"from-cyan-500 to-blue-600",emoji:"💚"},
];

app.get('/api/trips',(req,res)=>res.json(trips));
app.post('/api/trips',(req,res)=>{const t={id:Date.now().toString(),...req.body};trips.unshift(t);res.json(t);});
app.get('/api/chats',(req,res)=>{const{u1,u2}=req.query;let f=chats;if(u1&&u2)f=chats.filter(c=>(c.from===u1&&c.to===u2)||(c.from===u2&&c.to===u1));res.json(f);});
app.post('/api/chats',(req,res)=>{const m={id:Date.now().toString(),time:new Date().toLocaleTimeString('ar-SD'),...req.body};chats.push(m);res.json(m);});

app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>رحلات السودان</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"><style>*{font-family:Tajawal}</style></head><body>
<div id="auth" class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600">
<div class="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
<h1 class="text-3xl font-black text-center bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">رحلات السودان 🚌</h1><p class="text-center text-sm text-gray-500 mt-1">18 ولاية - اختيار اجباري</p>
<input id="n" placeholder="اسمك" class="w-full border-2 rounded-2xl px-4 py-3 mt-6">
<input id="p" placeholder="رقمك" class="w-full border-2 rounded-2xl px-4 py-3 mt-3">
<button onclick="login('client')" class="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl py-4 font-black">👤 دخول كـ عميل - لوحة فاتحة</button>
<button onclick="login('office')" class="w-full mt-3 bg-gradient-to-r from-zinc-900 to-black text-white rounded-2xl py-4 font-black border-2 border-amber-500">🏢 دخول كـ مكتب - لوحة غامقة</button>
</div></div>

<div id="clientView" class="hidden min-h-screen bg-[#eef6ff]">
<header class="bg-white border-b sticky top-0 z-30"><div class="max-w-6xl mx-auto p-4 flex justify-between"><b class="text-blue-600">👤 لوحة العميل - رحلات السودان</b><button onclick="out()" class="text-xs bg-gray-100 px-3 py-2 rounded-xl">خروج</button></div></header>
<div class="max-w-6xl mx-auto p-4 grid md:grid-cols-[340px_1fr] gap-4">
<div class="space-y-4">
<div class="bg-white rounded-[1.5rem] p-5 shadow border"><h2 class="font-black mb-3 text-blue-700">🔍 وين ماشي؟ * اجباري</h2><select id="cFrom" class="w-full border-2 border-blue-100 rounded-2xl p-3 bg-blue-50 font-bold mb-3"><option value="">من ولاية؟</option></select><select id="cTo" class="w-full border-2 border-sky-100 rounded-2xl p-3 bg-sky-50 font-bold"><option value="">الى ولاية؟</option></select><p class="text-xs text-red-500 mt-2">لازم تختار من 18 ولاية الى 18 ولاية</p></div>
<div class="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-[1.5rem] p-5 text-white"><h3 class="font-black">✈️ حجوزاتي</h3><p class="text-sm opacity-90 mt-2" id="myBooks">0 حجز</p></div>
</div>
<div><h2 class="font-black text-xl mb-3" id="cCount"></h2><div id="cList" class="space-y-3"></div></div>
</div>
</div>

<div id="officeView" class="hidden min-h-screen bg-[#111] text-white">
<header class="bg-[#1a1a1a] border-b border-amber-500/20 sticky top-0 z-30"><div class="max-w-6xl mx-auto p-4 flex justify-between"><b class="text-amber-400">🏢 لوحة المكتب - ادارة الاسطول</b><button onclick="out()" class="text-xs bg-zinc-800 px-3 py-2 rounded-xl">خروج</button></div></header>
<div class="max-w-6xl mx-auto p-4 grid md:grid-cols-[360px_1fr] gap-4">
<div class="space-y-4">
<div class="bg-zinc-900 rounded-[1.5rem] p-5 border border-amber-500/20"><h2 class="font-black mb-3 text-amber-400">🎯 انشاء رحلة - 18 ولاية * اجباري</h2><select id="oFrom" class="w-full bg-black border border-zinc-700 rounded-2xl p-3 mb-3 text-white"><option value="">من ولاية؟</option></select><select id="oTo" class="w-full bg-black border border-zinc-700 rounded-2xl p-3 mb-3 text-white"><option value="">الى ولاية؟</option></select><input id="oPrice" type="number" placeholder="السعر" class="w-full bg-black border border-zinc-700 rounded-2xl p-3 mb-3"><input id="oSeats" type="number" placeholder="المقاعد" value="30" class="w-full bg-black border border-zinc-700 rounded-2xl p-3 mb-3"><button onclick="create()" class="w-full bg-amber-500 text-black rounded-2xl py-3 font-black">+ نشر الرحلة</button></div>
<div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[1.5rem] p-5 text-black"><h3 class="font-black">💰 الارباح اليوم</h3><p class="text-2xl font-black mt-1" id="earn">0 ج</p></div>
<div class="grid grid-cols-3 gap-2" id="oGrid"></div>
</div>
<div><h2 class="font-black text-xl mb-3 text-amber-400" id="oCount"></h2><div id="oList" class="space-y-3"></div></div>
</div>
</div>

<div id="chat" class="fixed inset-0 z-50 hidden bg-black/60"><div class="absolute left-0 md:right-0 md:left-auto w-full max-w-[420px] bg-white h-full flex flex-col"><div class="p-4 text-white bg-gradient-to-r from-violet-600 to-indigo-600 flex justify-between"><div><b id="chatT"></b><div class="text-xs opacity-80">الشات شغال 100% - يحدث تلقائي</div></div><button onclick="closeChat()" class="bg-white/20 w-9 h-9 rounded-xl">✕</button></div><div id="chatM" class="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f9f7ff]"></div><div class="p-3 flex gap-2 border-t"><input id="chatI" class="flex-1 bg-gray-100 rounded-xl px-4 py-3" placeholder="رسالة..." onkeydown="if(event.key==='Enter')send()"><button onclick="send()" class="bg-violet-600 text-white px-6 rounded-xl font-black">ارسال</button></div></div></div>

<script>
const STATES=${JSON.stringify(STATES)};
let cur=null;let allTrips=[];let chatWith=null;let iv=null;
function init(){
 let s=localStorage.getItem('rihlat_u');if(s){cur=JSON.parse(s);show();}
 let cf=document.getElementById('cFrom'),ct=document.getElementById('cTo'),of=document.getElementById('oFrom'),ot=document.getElementById('oTo');
 STATES.forEach(x=>{let o='<option value="'+x.name+'">'+x.emoji+' '+x.name+'</option>';cf.innerHTML+=o;ct.innerHTML+=o;of.innerHTML+=o;ot.innerHTML+=o;});
 document.getElementById('oGrid').innerHTML=STATES.map(x=>'<div class="rounded-xl p-2 text-center text-[10px] font-bold bg-zinc-800 border border-zinc-700">'+x.emoji+'<br>'+x.name+'</div>').join('');
}
function login(role){let n=document.getElementById('n').value.trim(),p=document.getElementById('p').value.trim();if(!n||!p){alert('اكتب اسم ورقم');return;}cur={name:n,phone:p,role};localStorage.setItem('rihlat_u',JSON.stringify(cur));show();}
function show(){document.getElementById('auth').classList.add('hidden');if(cur.role==='client'){document.getElementById('clientView').classList.remove('hidden');document.getElementById('officeView').classList.add('hidden');}else{document.getElementById('officeView').classList.remove('hidden');document.getElementById('clientView').classList.add('hidden');}load();}
function out(){localStorage.removeItem('rihlat_u');location.reload();}
async function load(){let r=await fetch('/api/trips');allTrips=await r.json();render();}
function meta(n){return STATES.find(s=>s.name===n)||STATES[0];}
function render(){
 let cF=document.getElementById('cFrom')?.value||document.getElementById('oFrom')?.value; let cT=document.getElementById('cTo')?.value||document.getElementById('oTo')?.value;
 let f=document.getElementById('cFrom').value||document.getElementById('oFrom').value; let t=document.getElementById('cTo').value||document.getElementById('oTo').value;
 // use active view filter
 let activeFrom = cur.role==='client'?document.getElementById('cFrom').value:document.getElementById('oFrom').value;
 let activeTo = cur.role==='client'?document.getElementById('cTo').value:document.getElementById('oTo').value;
 let filtered=allTrips.filter(x=>{
   if(activeFrom&&activeTo) return x.from===activeFrom&&x.to===activeTo;
   if(activeFrom) return x.from===activeFrom;
   if(activeTo) return x.to===activeTo;
   return true;
 });
 if(cur.role==='client'){
   document.getElementById('cCount').innerText='الرحلات ('+filtered.length+') - من '+ (activeFrom||'كل الولايات')+' الى '+(activeTo||'كل الولايات');
   document.getElementById('cList').innerHTML=filtered.map(tr=>{let fm=meta(tr.from),tm=meta(tr.to);return '<div class="bg-white rounded-[1.5rem] p-4 shadow border border-blue-100"><div class="flex justify-between"><div class="flex items-center gap-2"><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+fm.color+' flex items-center justify-center text-white">'+fm.emoji+'</div><span>→</span><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+tm.color+' flex items-center justify-center text-white">'+tm.emoji+'</div><div><div class="font-black">'+tr.from+' → '+tr.to+'</div><div class="text-xs text-gray-500">'+tr.office+' • '+tr.type+'</div></div></div><div class="font-black text-blue-600">'+tr.price.toLocaleString()+' ج</div></div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="openChat(\\''+tr.phone+'\\',\\''+tr.from+'→'+tr.to+'\\')" class="bg-blue-600 text-white rounded-xl py-3 font-bold">💬 شات مباشر</button><button onclick="book(\\''+tr.id+'\\')" class="bg-sky-100 text-blue-700 rounded-xl py-3 font-bold">🎫 احجز</button></div></div>';}).join('');
 }else{
   document.getElementById('oCount').innerText='رحلاتي ('+filtered.filter(x=>x.phone===cur.phone).length+') / الكل ('+filtered.length+')';
   document.getElementById('oList').innerHTML=filtered.map(tr=>{let fm=meta(tr.from),tm=meta(tr.to);return '<div class="bg-zinc-900 rounded-[1.5rem] p-4 border border-zinc-800"><div class="flex justify-between"><div class="flex items-center gap-2"><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+fm.color+' flex items-center justify-center text-white">'+fm.emoji+'</div><span class="text-zinc-600">→</span><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+tm.color+' flex items-center justify-center text-white">'+tm.emoji+'</div><div><div class="font-black text-white">'+tr.from+' → '+tr.to+'</div><div class="text-xs text-zinc-400">'+tr.office+' • '+tr.type+'</div></div></div><div class="font-black text-amber-400">'+tr.price.toLocaleString()+' ج</div></div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="openChat(\\''+tr.phone+'\\',\\''+tr.from+'→'+tr.to+'\\')" class="bg-zinc-800 text-white rounded-xl py-3 font-bold border border-zinc-700">💬 رسائل</button><button onclick="delTrip(\\''+tr.id+'\\')" class="bg-red-900/30 text-red-400 rounded-xl py-3 font-bold">حذف</button></div></div>';}).join('');
   let earn=filtered.filter(x=>x.phone===cur.phone).reduce((a,b)=>a+b.price*2,0);document.getElementById('earn').innerText=earn.toLocaleString()+' ج';
 }
}
function book(id){let b=parseInt(localStorage.getItem('books')||'0')+1;localStorage.setItem('books',b);document.getElementById('myBooks').innerText=b+' حجز';alert('تم الحجز ✅ تواصل عبر الشات');}
async function create(){let f=document.getElementById('oFrom').value,t=document.getElementById('oTo').value;if(!f||!t){alert('اختار من و الى اجباري من 18 ولاية!');return;}if(f===t){alert('ما ينفع نفس الولاية');return;}let price=parseInt(document.getElementById('oPrice').value);if(!price){alert('اكتب السعر');return;}let nt={from:f,to:t,office:cur.name,price:price,seats:30,time:"08:00 ص",type:"VIP",phone:cur.phone};await fetch('/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(nt)});load();alert('تم النشر ✅');}
async function delTrip(id){allTrips=allTrips.filter(x=>x.id!==id);render();}

function openChat(phone,title){chatWith=phone;document.getElementById('chat').classList.remove('hidden');document.getElementById('chatT').innerText=title+' - '+phone;loadChat();if(iv)clearInterval(iv);iv=setInterval(loadChat,1200);}
function closeChat(){document.getElementById('chat').classList.add('hidden');if(iv)clearInterval(iv);chatWith=null;}
async function loadChat(){if(!chatWith)return;let r=await fetch('/api/chats?u1='+cur.phone+'&u2='+chatWith);let ms=await r.json();let box=document.getElementById('chatM');if(ms.length===0){box.innerHTML='<div class="text-center text-sm text-gray-500 mt-10">الشات شغال ✅ اكتب رسالة</div>';return;}box.innerHTML=ms.map(m=>'<div class="max-w-[80%] rounded-2xl px-4 py-2 '+(m.from===cur.phone?'bg-violet-600 text-white mr-auto':'bg-white border ml-auto')+'"><div class="text-[10px] opacity-70">'+m.from+' • '+m.time+'</div><div class="text-sm font-bold">'+m.msg+'</div></div>').join('');box.scrollTop=box.scrollHeight;}
async function send(){let i=document.getElementById('chatI');let m=i.value.trim();if(!m||!chatWith)return;await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:cur.phone,to:chatWith,msg:m})});i.value='';loadChat();setTimeout(async()=>{await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:chatWith,to:cur.phone,msg:cur.role==='client'?'تم تأكيد حجزك ✅':'مرحبا، متى تصل؟'})});loadChat();},900);}

document.getElementById('cFrom').addEventListener('change',render);document.getElementById('cTo').addEventListener('change',render);document.getElementById('oFrom').addEventListener('change',render);document.getElementById('oTo').addEventListener('change',render);
window.onload=init;
<\/script></body></html>`);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('Running '+PORT));
module.exports=app;
