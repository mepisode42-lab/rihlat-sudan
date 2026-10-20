const express = require('express');
const app = express();
app.use(express.json());
app.use((req,res,next)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE');res.setHeader('Access-Control-Allow-Headers','Content-Type');next();});

let users = [];
let trips = [
  {id:"1",from:"الخرطوم",to:"نهر النيل",office:"بصات عطبرة",price:25000,seats:12,time:"06:00 ص",type:"VIP",phone:"0910000001",owner:"0910000001"},
  {id:"2",from:"الخرطوم",to:"البحر الأحمر",office:"الرفاعي",price:45000,seats:5,time:"19:30",type:"مكيف",phone:"0910000002",owner:"0910000002"},
  {id:"3",from:"كسلا",to:"القضارف",office:"ابراهيم محمد",price:25000,seats:10,time:"07:00 ص",type:"VIP",phone:"0910000003",owner:"0910000003"},
];
let chats = [];
let bookings = [];

function isSudanesePhone(phone){return /^(?:\+?249|0)?(9[0-9]|1[0-9])[0-9]{8}$/.test(phone.trim());}
function normalizePhone(phone){phone=phone.trim();if(phone.startsWith('+249'))return '0'+phone.slice(4);if(phone.startsWith('249'))return '0'+phone.slice(3);return phone;}

app.post('/api/register',(req,res)=>{
  let {phone,password,name,role,state}=req.body;
  if(!phone||!password||!name||!state) return res.status(400).json({error:"اكمل كل البيانات"});
  if(!isSudanesePhone(phone)) return res.status(400).json({error:"الرقم لازم يكون سوداني: 09xxxxxxxx"});
  phone=normalizePhone(phone);
  if(password.length<4) return res.status(400).json({error:"كلمة المرور 4 احرف على الاقل"});
  if(users.find(u=>u.phone===phone)) return res.status(400).json({error:"الرقم مسجل من قبل - سجل دخول"});
  users.push({phone,password,name,role,state,created:new Date()});
  res.json({ok:true,user:{phone,name,role,state}});
});
app.post('/api/login',(req,res)=>{
  let {phone,password}=req.body;
  if(!phone||!password) return res.status(400).json({error:"رقم وكلمة مرور"});
  phone=normalizePhone(phone);
  if(!isSudanesePhone(phone)) return res.status(400).json({error:"رقم سوداني فقط"});
  const user=users.find(u=>u.phone===phone);
  if(!user) return res.status(404).json({error:"الرقم غير مسجل - سجل اولاً"});
  if(user.password!==password) return res.status(401).json({error:"كلمة المرور خطأ"});
  res.json({ok:true,user:{phone:user.phone,name:user.name,role:user.role,state:user.state}});
});
app.post('/api/forgot/reset',(req,res)=>{
  let {phone,state,newPassword}=req.body;
  phone=normalizePhone(phone);
  const user=users.find(u=>u.phone===phone);
  if(!user) return res.status(404).json({error:"الرقم غير مسجل"});
  if(user.state!==state) return res.status(401).json({error:"الولاية غير مطابقة - للامان"});
  if(newPassword.length<4) return res.status(400).json({error:"كلمة المرور قصيرة"});
  user.password=newPassword;
  res.json({ok:true});
});

app.get('/api/trips',(req,res)=>res.json(trips));
app.post('/api/trips',(req,res)=>{const t={id:Date.now().toString(),owner:req.body.phone,...req.body};trips.unshift(t);res.json(t);});
app.delete('/api/trips/:id',(req,res)=>{trips=trips.filter(x=>x.id!==req.params.id);res.json({ok:true});});
app.post('/api/book',(req,res)=>{
  const {from,to,price,clientPhone,officePhone,tripId}=req.body;
  const commission=Math.floor(price*0.1);
  const net=price-commission;
  const b={id:Date.now().toString(),from,to,price,net,commission,clientPhone:normalizePhone(clientPhone),officePhone:normalizePhone(officePhone),tripId,date:new Date().toLocaleDateString('ar-SD')};
  bookings.push(b);res.json(b);
});
app.get('/api/bookings/:phone',(req,res)=>{const p=normalizePhone(req.params.phone);res.json(bookings.filter(b=>b.clientPhone===p||b.officePhone===p));});
app.get('/api/earnings/:phone',(req,res)=>{const p=normalizePhone(req.params.phone);const my=bookings.filter(b=>b.officePhone===p);res.json({total:my.reduce((a,b)=>a+b.net,0),comm:my.reduce((a,b)=>a+b.commission,0),count:my.length,bookings:my});});
app.get('/api/chats',(req,res)=>{const {tripId}=req.query;if(tripId)return res.json(chats.filter(c=>c.tripId===tripId));res.json(chats);});
app.get('/api/inbox/:phone',(req,res)=>{const p=normalizePhone(req.params.phone);const myTrips=trips.filter(t=>t.owner===p||t.phone===p).map(t=>t.id);res.json(chats.filter(c=>c.to===p||myTrips.includes(c.tripId)||c.officePhone===p));});
app.post('/api/chats',(req,res)=>{const m={id:Date.now().toString(),time:new Date().toLocaleTimeString('ar-SD'),...req.body,from:normalizePhone(req.body.from),to:normalizePhone(req.body.to),officePhone:normalizePhone(req.body.officePhone)};chats.push(m);res.json(m);});

app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>رحلات السودان - تطبيق حقيقي</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"><style>*{font-family:Tajawal}</style></head><body class="bg-[#f8f7ff]">
<div id="auth" class="min-h-screen flex items-center justify-center p-4"><div class="bg-white rounded-[2rem] p-7 w-full max-w-md shadow-2xl border">
<div class="flex bg-zinc-100 p-1 rounded-full mb-6"><button id="bL" onclick="mode='login';tabAuth()" class="flex-1 py-2.5 rounded-full font-black bg-white shadow">دخول</button><button id="bR" onclick="mode='register';tabAuth()" class="flex-1 py-2.5 rounded-full font-black text-zinc-500">تسجيل</button></div>
<h1 class="text-2xl font-black">رحلات السودان 🚌</h1><p class="text-xs text-zinc-500 mt-1">18 ولاية • رقم سوداني + كلمة مرور • ارباح حقيقية</p>
<div class="mt-6 space-y-3">
<select id="role" class="w-full border-2 rounded-2xl px-4 py-3 font-bold"><option value="client">عميل - اريد حجز</option><option value="office">مكتب سفريات - اريد ارباح</option></select>
<input id="name" placeholder="الاسم / اسم المكتب" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<input id="phone" placeholder="رقم سوداني: 09xxxxxxxx" class="w-full border-2 rounded-2xl px-4 py-3 font-bold bg-amber-50" dir="ltr">
<input id="pass" type="password" placeholder="كلمة المرور (4+)" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<select id="state" class="w-full border-2 rounded-2xl px-4 py-3 font-bold bg-gray-50"><option value="">ولايتك؟ (18 ولاية)</option></select>
<div id="err" class="text-xs text-red-600 font-bold hidden bg-red-50 p-2 rounded-xl"></div>
<button onclick="submitAuth()" id="submitBtn" class="w-full bg-blue-600 text-white rounded-2xl py-4 font-black">دخول</button>
<button onclick="openForgot()" class="w-full text-xs text-blue-600 font-bold mt-2">هل نسيت كلمة المرور؟</button>
</div>
</div></div>

<div id="forgot" class="fixed inset-0 z-50 hidden bg-black/60 backdrop-blur flex items-center justify-center p-4"><div class="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
<h2 class="font-black text-lg">🔑 استعادة كلمة المرور</h2><p class="text-xs text-zinc-500 mt-1">ادخل رقمك والولاية المسجلة</p>
<div class="mt-4 space-y-3">
<input id="fPhone" placeholder="09xxxxxxxx" class="w-full border-2 rounded-2xl px-4 py-3 font-bold" dir="ltr">
<select id="fState" class="w-full border-2 rounded-2xl px-4 py-3 font-bold"><option value="">ولايتك المسجلة؟</option></select>
<input id="fNewPass" type="password" placeholder="كلمة مرور جديدة" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<div id="fErr" class="text-xs text-red-600 font-bold hidden bg-red-50 p-2 rounded-xl"></div>
<div id="fOk" class="text-xs text-green-600 font-bold hidden bg-green-50 p-2 rounded-xl"></div>
<div class="flex gap-2"><button onclick="closeForgot()" class="flex-1 bg-zinc-100 rounded-2xl py-3 font-black">الغاء</button><button onclick="resetPass()" class="flex-1 bg-blue-600 text-white rounded-2xl py-3 font-black">تغيير</button></div>
</div>
</div></div>

<div id="clientView" class="hidden min-h-screen bg-[#eef4ff]"><header class="bg-white/80 backdrop-blur sticky top-0 z-30 border-b"><div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">💬</div><div><div class="font-black text-[14px]">الشات لتلقي الرسائل</div><div class="text-[11px] text-zinc-500" id="cH"></div></div></div><button onclick="out()" class="text-xs font-bold bg-zinc-100 px-4 py-2 rounded-full">خروج</button></div></header><div class="max-w-6xl mx-auto p-3 grid md:grid-cols-[340px_1fr] gap-3"><div class="space-y-3"><div class="bg-white rounded-[1.6rem] p-4 border shadow-sm"><div class="font-black text-sm mb-3">من اين الى اين</div><select id="cFrom" class="w-full border rounded-xl p-3 font-bold bg-gray-50 mb-2"><option value="">من ولاية</option></select><select id="cTo" class="w-full border rounded-xl p-3 font-bold bg-gray-50"><option value="">الى ولاية</option></select></div><div class="bg-white rounded-[1.6rem] p-4 border shadow-sm"><div class="font-black text-sm">رسائلي</div><div id="cInbox" class="mt-3 space-y-2 max-h-[300px] overflow-y-auto"></div></div><div class="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[1.6rem] p-4 text-white"><div class="font-black text-sm">حجوزاتي</div><div id="myBooks" class="mt-2 text-sm"></div></div></div><div id="cList" class="space-y-3"></div></div></div>

<div id="officeView" class="hidden min-h-screen bg-[#0a0a0a] text-white"><header class="bg-[#141414] border-b border-white/10 sticky top-0 z-30"><div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center font-black">🏢</div><div><div class="font-black text-[14px]" id="oH"></div><div class="text-[11px] text-zinc-400">ارباح حقيقية • عمولة 10%</div></div></div><button onclick="out()" class="text-xs font-bold bg-white/10 px-4 py-2 rounded-full">خروج</button></div></header><div class="max-w-6xl mx-auto p-3 grid md:grid-cols-[360px_1fr] gap-3"><div class="space-y-3"><div class="bg-[#151515] rounded-[1.6rem] p-4 border border-white/10"><div class="font-black text-sm mb-3 text-amber-400">من اين الى اين</div><select id="oFrom" class="w-full bg-black border border-zinc-800 rounded-xl p-3 font-bold mb-2"><option value="">من ولاية</option></select><select id="oTo" class="w-full bg-black border border-zinc-800 rounded-xl p-3 font-bold mb-2"><option value="">الى ولاية</option></select><input id="oPrice" type="number" placeholder="السعر" class="w-full bg-black border border-zinc-800 rounded-xl p-3 mb-2"><input id="oSeats" type="number" value="30" placeholder="مقاعد" class="w-full bg-black border border-zinc-800 rounded-xl p-3 mb-3"><button onclick="createTrip()" class="w-full bg-amber-500 text-black rounded-xl py-3 font-black">نشر الرحلة</button></div><div class="bg-[#151515] rounded-[1.6rem] p-4 border border-amber-500/20"><div class="text-xs text-zinc-400">صافي ارباحك</div><div class="text-2xl font-black text-amber-400 mt-1" id="earn">0 ج</div><div class="text-xs text-zinc-500 mt-1">عمولة المنصة: <span id="earnComm">0 ج</span> • <span id="earnCount">0</span> حجز</div></div><div class="bg-[#151515] rounded-[1.6rem] p-4 border border-white/10"><div class="font-black text-sm text-amber-400">رسائل العملاء</div><div id="oInbox" class="mt-3 space-y-2 max-h-[380px] overflow-y-auto"></div></div></div><div id="oList" class="space-y-3"></div></div></div>

<div id="chat" class="fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm"><div class="absolute bottom-0 md:bottom-auto md:top-0 inset-x-0 md:inset-x-auto md:right-0 md:w-[420px] bg-white md:h-full h-[85vh] rounded-t-[1.8rem] md:rounded-none flex flex-col shadow-2xl"><div class="p-4 border-b flex justify-between items-center"><div><div id="chatT" class="font-black"></div><div id="chatPhone" class="text-[11px] text-zinc-500"></div></div><button onclick="closeChat()" class="w-9 h-9 rounded-full bg-zinc-100">✕</button></div><div id="chatM" class="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50"></div><div class="p-3 border-t bg-white flex gap-2"><input id="chatI" class="flex-1 bg-zinc-100 rounded-full px-4 py-3 outline-none" placeholder="رسالة..." onkeydown="if(event.key==='Enter')send()"><button onclick="send()" class="bg-blue-600 text-white px-6 rounded-full font-black">ارسال</button></div></div></div>

<script>
const STATES=[
{name:"الخرطوم",c:"from-violet-500 to-indigo-600",e:"🏙️"},
{name:"الجزيرة",c:"from-emerald-500 to-teal-600",e:"🌾"},
{name:"البحر الأحمر",c:"from-blue-500 to-cyan-500",e:"🌊"},
{name:"كسلا",c:"from-amber-500 to-orange-600",e:"⛰️"},
{name:"القضارف",c:"from-lime-500 to-green-600",e:"🌽"},
{name:"سنار",c:"from-green-500 to-emerald-600",e:"🦁"},
{name:"النيل الأبيض",c:"from-sky-400 to-blue-600",e:"💧"},
{name:"النيل الأزرق",c:"from-blue-600 to-indigo-700",e:"💦"},
{name:"الشمالية",c:"from-yellow-500 to-amber-600",e:"🏜️"},
{name:"نهر النيل",c:"from-slate-700 to-black",e:"🚂"},
{name:"شمال كردفان",c:"from-orange-400 to-red-500",e:"🐪"},
{name:"غرب كردفان",c:"from-red-500 to-rose-600",e:"🛢️"},
{name:"جنوب كردفان",c:"from-teal-500 to-emerald-600",e:"🏞️"},
{name:"شمال دارفور",c:"from-amber-600 to-yellow-700",e:"🏜️"},
{name:"غرب دارفور",c:"from-rose-500 to-pink-600",e:"🌴"},
{name:"جنوب دارفور",c:"from-purple-500 to-pink-500",e:"🌅"},
{name:"شرق دارفور",c:"from-indigo-500 to-purple-600",e:"🐎"},
{name:"وسط دارفور",c:"from-cyan-500 to-blue-600",e:"💚"},
];
let mode='login',cur=null,allTrips=[],chatTripId=null,chatOfficePhone=null,iv=null,inboxIv=null;
function tabAuth(){document.getElementById('bL').className=mode==='login'?'flex-1 py-2.5 rounded-full font-black bg-white shadow':'flex-1 py-2.5 rounded-full font-black text-zinc-500';document.getElementById('bR').className=mode==='register'?'flex-1 py-2.5 rounded-full font-black bg-white shadow':'flex-1 py-2.5 rounded-full font-black text-zinc-500';document.getElementById('submitBtn').innerText=mode==='login'?'دخول':'تسجيل جديد';}
function isSudanese(p){return /^(?:\\+?249|0)?(9[0-9]|1[0-9])[0-9]{8}$/.test(p.trim());}
function init(){
 STATES.forEach(s=>{let o=document.createElement('option');o.value=s.name;o.textContent=s.e+' '+s.name;document.getElementById('state').appendChild(o);let o2=document.createElement('option');o2.value=s.name;o2.textContent=s.e+' '+s.name;document.getElementById('fState').appendChild(o2);});
 ['cFrom','cTo','oFrom','oTo'].forEach(id=>{STATES.forEach(s=>{let o=document.createElement('option');o.value=s.name;o.textContent=s.e+' '+s.name;document.getElementById(id).appendChild(o);});});
 let ss=localStorage.getItem('rihlat_final'); if(ss){cur=JSON.parse(ss); show();} tabAuth();
}
async function submitAuth(){
 let role=document.getElementById('role').value, name=document.getElementById('name').value.trim(), phone=document.getElementById('phone').value.trim(), pass=document.getElementById('pass').value.trim(), state=document.getElementById('state').value;
 let err=document.getElementById('err'); err.classList.add('hidden');
 if(!name||!phone||!pass||!state){err.innerText='اكمل كل البيانات - رقم سوداني + كلمة مرور + ولاية';err.classList.remove('hidden');return;}
 if(!isSudanese(phone)){err.innerText='الرقم لازم يكون سوداني: 09xxxxxxxx او +2499xxxxxxxx';err.classList.remove('hidden');return;}
 if(pass.length<4){err.innerText='كلمة المرور 4 احرف على الاقل';err.classList.remove('hidden');return;}
 const url=mode==='login'?'/api/login':'/api/register';
 const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password:pass,name,role,state})});
 const d=await r.json();
 if(!r.ok){err.innerText=d.error||'خطأ';err.classList.remove('hidden');return;}
 cur=d.user; localStorage.setItem('rihlat_final',JSON.stringify(cur)); show();
}
function openForgot(){document.getElementById('forgot').classList.remove('hidden');}
function closeForgot(){document.getElementById('forgot').classList.add('hidden');}
async function resetPass(){
 let phone=document.getElementById('fPhone').value.trim(), state=document.getElementById('fState').value, np=document.getElementById('fNewPass').value.trim();
 let fe=document.getElementById('fErr'), fo=document.getElementById('fOk'); fe.classList.add('hidden'); fo.classList.add('hidden');
 if(!phone||!state||!np){fe.innerText='اكمل البيانات';fe.classList.remove('hidden');return;}
 if(!isSudanese(phone)){fe.innerText='رقم سوداني فقط';fe.classList.remove('hidden');return;}
 let r=await fetch('/api/forgot/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,state,newPassword:np})});
 let d=await r.json();
 if(!r.ok){fe.innerText=d.error;fe.classList.remove('hidden');return;}
 fo.innerText='تم تغيير كلمة المرور ✅ سجل دخول الان'; fo.classList.remove('hidden'); setTimeout(closeForgot,1500);
}
function show(){document.getElementById('auth').classList.add('hidden');if(cur.role==='client'){document.getElementById('clientView').classList.remove('hidden');document.getElementById('cH').innerText=cur.name+' • '+cur.phone+' • '+cur.state;}else{document.getElementById('officeView').classList.remove('hidden');document.getElementById('oH').innerText=cur.name+' • '+cur.phone;}load();startInbox();}
function out(){localStorage.removeItem('rihlat_final');location.reload();}
async function load(){let r=await fetch('/api/trips');allTrips=await r.json();render();loadEarn();}
function meta(n){return STATES.find(s=>s.name===n)||STATES[0];}
function render(){
 let f=cur.role==='client'?document.getElementById('cFrom').value:document.getElementById('oFrom').value;
 let t=cur.role==='client'?document.getElementById('cTo').value:document.getElementById('oTo').value;
 let filtered=allTrips.filter(x=>{if(f&&t)return x.from===f&&x.to===t;if(f)return x.from===f;if(t)return x.to===t;return true;});
 if(cur.role==='client'){
   document.getElementById('cList').innerHTML=filtered.map(tr=>{let a=meta(tr.from),b=meta(tr.to);return '<div class="bg-white rounded-[1.6rem] p-4 border shadow-sm"><div class="flex justify-between items-center"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+a.c+' flex items-center justify-center text-white">'+a.e+'</div><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+b.c+' flex items-center justify-center text-white">'+b.e+'</div><div><div class="font-black text-[13px]">'+tr.from+' → '+tr.to+'</div><div class="text-[11px] text-zinc-500">'+tr.office+'</div></div></div><div class="font-black text-blue-600 text-[14px]">'+tr.price.toLocaleString()+' ج</div></div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="book(\\''+tr.id+'\\',\\''+tr.phone+'\\')" class="bg-zinc-900 text-white rounded-full py-2.5 font-black text-[13px]">احجز</button><button onclick="openChat(\\''+tr.id+'\\',\\''+tr.phone+'\\',\\''+tr.from+' → '+tr.to+'\\',\\''+tr.office+'\\')" class="bg-blue-600 text-white rounded-full py-2.5 font-black text-[13px]">شات</button></div></div>';}).join('');
 }else{
   let my=filtered.filter(x=>x.owner===cur.phone||x.phone===cur.phone);
   document.getElementById('oList').innerHTML=filtered.map(tr=>{let a=meta(tr.from);return '<div class="bg-[#151515] rounded-[1.6rem] p-4 border border-white/10"><div class="flex justify-between items-center"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-gradient-to-br '+a.c+' flex items-center justify-center text-white text-xs">'+a.e+'</div><div class="font-black text-sm">'+tr.from+' → '+tr.to+'</div></div><div class="font-black text-amber-400 text-sm">'+tr.price.toLocaleString()+' ج</div></div><div class="text-[11px] text-zinc-500 mt-1">'+tr.office+'</div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="openChat(\\''+tr.id+'\\',\\''+tr.phone+'\\',\\''+tr.from+'→'+tr.to+'\\',\\''+tr.office+'\\')" class="bg-white/10 rounded-full py-2 text-sm font-bold">رسائل</button><button onclick="delTrip(\\''+tr.id+'\\')" class="bg-red-500/10 text-red-400 rounded-full py-2 text-sm">حذف</button></div></div>';}).join('');
 }
}
async function loadEarn(){if(cur.role!=='office')return; let r

