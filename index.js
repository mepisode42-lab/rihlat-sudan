const express = require('express');
const app = express();
app.use(express.json());
app.use((req,res,next)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE');res.setHeader('Access-Control-Allow-Headers','Content-Type');next();});

let users = [];
let trips = [{id:"1",from:"الخرطوم",to:"نهر النيل",office:"بصات عطبرة",price:25000,phone:"0910000001",owner:"0910000001"}];
let chats = [];
let bookings = [];
function isSudanese(p){return /^(?:\+?249|0)?(9[0-9]|1[0-9])[0-9]{8}$/.test(p.trim());}
function norm(p){p=p.trim();if(p.startsWith('+249'))return '0'+p.slice(4);if(p.startsWith('249'))return '0'+p.slice(3);return p;}

app.post('/api/register',(req,res)=>{
 let {phone,password,name,role,state}=req.body;
 if(!phone||!password||!name||!state) return res.status(400).json({error:"اكمل البيانات"});
 if(!isSudanese(phone)) return res.status(400).json({error:"رقم سوداني فقط 09xxxxxxxx"});
 phone=norm(phone);
 if(password.length<4) return res.status(400).json({error:"كلمة المرور 4+"});
 if(users.find(u=>u.phone===phone)) return res.status(400).json({error:"الرقم مسجل - سجل دخول"});
 users.push({phone,password,name,role,state});
 res.json({ok:true,user:{phone,name,role,state}});
});
app.post('/api/login',(req,res)=>{
 let {phone,password}=req.body;
 phone=norm(phone);
 let u=users.find(x=>x.phone===phone);
 if(!u) return res.status(404).json({error:"غير مسجل"});
 if(u.password!==password) return res.status(401).json({error:"كلمة المرور خطأ"});
 res.json({ok:true,user:u});
});
app.post('/api/forgot/reset',(req,res)=>{
 let {phone,state,newPassword}=req.body;
 phone=norm(phone);
 let u=users.find(x=>x.phone===phone);
 if(!u) return res.status(404).json({error:"غير مسجل"});
 if(u.state!==state) return res.status(401).json({error:"الولاية غير مطابقة"});
 u.password=newPassword;
 res.json({ok:true});
});
app.get('/api/trips',(req,res)=>res.json(trips));
app.post('/api/trips',(req,res)=>{let t={id:Date.now().toString(),owner:req.body.phone,...req.body};trips.unshift(t);res.json(t);});
app.delete('/api/trips/:id',(req,res)=>{trips=trips.filter(x=>x.id!==req.params.id);res.json({ok:true});});
app.post('/api/book',(req,res)=>{let b={id:Date.now().toString(),...req.body,commission:Math.floor(req.body.price*0.1),net:req.body.price-Math.floor(req.body.price*0.1)};bookings.push(b);res.json(b);});
app.get('/api/earnings/:phone',(req,res)=>{let p=norm(req.params.phone);let my=bookings.filter(b=>b.officePhone===p);res.json({total:my.reduce((a,b)=>a+b.net,0),comm:my.reduce((a,b)=>a+b.commission,0),count:my.length});});
app.get('/api/chats',(req,res)=>{if(req.query.tripId) return res.json(chats.filter(c=>c.tripId===req.query.tripId));res.json(chats);});
app.get('/api/inbox/:phone',(req,res)=>{let p=norm(req.params.phone);let myTrips=trips.filter(t=>t.owner===p).map(t=>t.id);res.json(chats.filter(c=>c.to===p||myTrips.includes(c.tripId)||c.officePhone===p));});
app.post('/api/chats',(req,res)=>{let m={id:Date.now().toString(),time:new Date().toLocaleTimeString('ar-SD'),...req.body,from:norm(req.body.from),to:norm(req.body.to)};chats.push(m);res.json(m);});

app.get('/',(req,res)=>{
 res.sendFile(__dirname+'/page.html');
});

app.get('/page.html',(req,res)=>{
 res.send(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>رحلات السودان</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"><style>*{font-family:Tajawal}</style></head><body class="bg-[#f8f7ff]">
<div id="auth" class="min-h-screen flex items-center justify-center p-4"><div class="bg-white rounded-[2rem] p-7 w-full max-w-md shadow-2xl border">
<div class="flex bg-zinc-100 p-1 rounded-full mb-6"><button id="bL" onclick="mode='login';tab()" class="flex-1 py-2.5 rounded-full font-black bg-white shadow">دخول</button><button id="bR" onclick="mode='register';tab()" class="flex-1 py-2.5 rounded-full font-black text-zinc-500">تسجيل</button></div>
<h1 class="text-2xl font-black">رحلات السودان 🚌</h1><p class="text-xs text-zinc-500">رقم سوداني + كلمة مرور • 18 ولاية</p>
<div class="mt-6 space-y-3">
<select id="role" class="w-full border-2 rounded-2xl px-4 py-3 font-bold"><option value="client">عميل</option><option value="office">مكتب</option></select>
<input id="name" placeholder="الاسم" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<input id="phone" placeholder="09xxxxxxxx" class="w-full border-2 rounded-2xl px-4 py-3 font-bold bg-amber-50" dir="ltr">
<input id="pass" type="password" placeholder="كلمة المرور" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<select id="state" class="w-full border-2 rounded-2xl px-4 py-3 font-bold"><option value="">ولايتك؟</option></select>
<div id="err" class="hidden text-xs text-red-600 bg-red-50 p-2 rounded-xl font-bold"></div>
<button onclick="submitAuth()" id="submitBtn" class="w-full bg-blue-600 text-white rounded-2xl py-4 font-black">دخول</button>
<button onclick="openF()" class="w-full text-xs text-blue-600 font-bold">هل نسيت كلمة المرور؟</button>
</div>
</div></div>

<div id="forgot" class="fixed inset-0 z-50 hidden bg-black/60 flex items-center justify-center p-4"><div class="bg-white rounded-[2rem] p-6 w-full max-w-sm">
<h2 class="font-black">🔑 استعادة كلمة المرور</h2>
<div class="mt-4 space-y-3">
<input id="fPhone" placeholder="09xxxxxxxx" class="w-full border-2 rounded-2xl px-4 py-3 font-bold" dir="ltr">
<select id="fState" class="w-full border-2 rounded-2xl px-4 py-3 font-bold"><option value="">ولايتك؟</option></select>
<input id="fNew" type="password" placeholder="كلمة جديدة" class="w-full border-2 rounded-2xl px-4 py-3 font-bold">
<div id="fErr" class="hidden text-xs text-red-600 bg-red-50 p-2 rounded-xl"></div>
<div id="fOk" class="hidden text-xs text-green-600 bg-green-50 p-2 rounded-xl"></div>
<div class="flex gap-2"><button onclick="closeF()" class="flex-1 bg-zinc-100 rounded-2xl py-3 font-black">الغاء</button><button onclick="resetPass()" class="flex-1 bg-blue-600 text-white rounded-2xl py-3 font-black">تغيير</button></div>
</div>
</div></div>

<div id="clientView" class="hidden min-h-screen bg-[#eef4ff]"><header class="bg-white sticky top-0 border-b"><div class="max-w-6xl mx-auto px-4 py-3 flex justify-between"><div class="flex gap-3 items-center"><div class="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center">💬</div><div><div class="font-black text-sm">الشات لتلقي الرسائل</div><div id="cH" class="text-xs text-zinc-500"></div></div></div><button onclick="out()" class="text-xs bg-zinc-100 px-4 py-2 rounded-full font-bold">خروج</button></div></header><div class="max-w-6xl mx-auto p-3 grid md:grid-cols-[340px_1fr] gap-3"><div class="space-y-3"><div class="bg-white rounded-2xl p-4 border"><div class="font-black text-sm mb-3">من اين الى اين</div><select id="cFrom" class="w-full border rounded-xl p-3 font-bold bg-gray-50 mb-2"><option value="">من ولاية</option></select><select id="cTo" class="w-full border rounded-xl p-3 font-bold bg-gray-50"><option value="">الى ولاية</option></select></div><div class="bg-white rounded-2xl p-4 border"><div class="font-black text-sm">رسائلي</div><div id="cInbox" class="mt-3 space-y-2 max-h-[300px] overflow-y-auto"></div></div></div><div id="cList" class="space-y-3"></div></div></div>

<div id="officeView" class="hidden min-h-screen bg-black text-white"><header class="bg-[#141414] border-b border-white/10 sticky top-0"><div class="max-w-6xl mx-auto px-4 py-3 flex justify-between"><div id="oH" class="font-black text-sm"></div><button onclick="out()" class="text-xs bg-white/10 px-4 py-2 rounded-full">خروج</button></div></header><div class="max-w-6xl mx-auto p-3 grid md:grid-cols-[360px_1fr] gap-3"><div class="space-y-3"><div class="bg-[#151515] rounded-2xl p-4 border border-white/10"><div class="font-black text-sm mb-3 text-amber-400">من اين الى اين</div><select id="oFrom" class="w-full bg-black border border-zinc-800 rounded-xl p-3 font-bold mb-2"><option value="">من</option></select><select id="oTo" class="w-full bg-black border border-zinc-800 rounded-xl p-3 font-bold mb-2"><option value="">الى</option></select><input id="oPrice" type="number" placeholder="السعر" class="w-full bg-black border border-zinc-800 rounded-xl p-3 mb-2"><button onclick="createTrip()" class="w-full bg-amber-500 text-black rounded-xl py-3 font-black">نشر</button></div><div class="bg-[#151515] rounded-2xl p-4 border border-amber-500/20"><div class="text-xs text-zinc-400">ارباحك</div><div id="earn" class="text-2xl font-black text-amber-400">0 ج</div><div class="text-xs text-zinc-500"><span id="earnCount">0</span> حجز</div></div><div class="bg-[#151515] rounded-2xl p-4 border border-white/10"><div class="font-black text-sm text-amber-400">رسائل العملاء</div><div id="oInbox" class="mt-3 space-y-2 max-h-[380px] overflow-y-auto"></div></div></div><div id="oList" class="space-y-3"></div></div></div>

<div id="chat" class="fixed inset-0 z-50 hidden bg-black/50"><div class="absolute bottom-0 md:right-0 md:w-[420px] bg-white w-full h-[85vh] md:h-full flex flex-col"><div class="p-4 border-b flex justify-between"><div><div id="chatT" class="font-black"></div><div id="chatPhone" class="text-xs text-zinc-500"></div></div><button onclick="closeChat()" class="w-9 h-9 bg-zinc-100 rounded-full">✕</button></div><div id="chatM" class="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50"></div><div class="p-3 border-t flex gap-2"><input id="chatI" class="flex-1 bg-zinc-100 rounded-full px-4 py-3 outline-none" placeholder="رسالة..." onkeydown="if(event.key==='Enter')send()"><button onclick="send()" class="bg-blue-600 text-white px-6 rounded-full font-black">ارسال</button></div></div></div>

<script>
const STATES=["الخرطوم","الجزيرة","البحر الأحمر","كسلا","القضارف","سنار","النيل الأبيض","النيل الأزرق","الشمالية","نهر النيل","شمال كردفان","غرب كردفان","جنوب كردفان","شمال دارفور","غرب دارفور","جنوب دارفور","شرق دارفور","وسط دارفور"];
let mode='login',cur=null,allTrips=[],chatTripId=null,chatOfficePhone=null,iv=null,inboxIv=null;
function tab(){document.getElementById('bL').className=mode==='login'?'flex-1 py-2.5 rounded-full font-black bg-white shadow':'flex-1 py-2.5 rounded-full font-black text-zinc-500';document.getElementById('bR').className=mode==='register'?'flex-1 py-2.5 rounded-full font-black bg-white shadow':'flex-1 py-2.5 rounded-full font-black text-zinc-500';document.getElementById('submitBtn').innerText=mode==='login'?'دخول':'تسجيل جديد';}
function isSudanese(p){return /^(?:\\+?249|0)?(9[0-9]|1[0-9])[0-9]{8}$/.test(p.trim());}
function init(){STATES.forEach(s=>{let o=document.createElement('option');o.value=s;o.textContent=s;document.getElementById('state').appendChild(o);let o2=document.createElement('option');o2.value=s;o2.textContent=s;document.getElementById('fState').appendChild(o2);});['cFrom','cTo','oFrom','oTo'].forEach(id=>{STATES.forEach(s=>{let o=document.createElement('option');o.value=s;o.textContent=s;document.getElementById(id).appendChild(o);});});let ss=localStorage.getItem('rihlat_final');if(ss){cur=JSON.parse(ss);show();}tab();}
async function submitAuth(){let role=document.getElementById('role').value,name=document.getElementById('name').value.trim(),phone=document.getElementById('phone').value.trim(),pass=document.getElementById('pass').value.trim(),state=document.getElementById('state').value;let err=document.getElementById('err');err.classList.add('hidden');if(!name||!phone||!pass||!state){err.innerText='اكمل البيانات';err.classList.remove('hidden');return;}if(!isSudanese(phone)){err.innerText='رقم سوداني فقط 09xxxxxxxx';err.classList.remove('hidden');return;}let url=mode==='login'?'/api/login':'/api/register';let r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password:pass,name,role,state})});let d=await r.json();if(!r.ok){err.innerText=d.error;err.classList.remove('hidden');return;}cur=d.user;localStorage.setItem('rihlat_final',JSON.stringify(cur));show();}
function openF(){document.getElementById('forgot').classList.remove('hidden');}function closeF(){document.getElementById('forgot').classList.add('hidden');}
async function resetPass(){let phone=document.getElementById('fPhone').value.trim(),state=document.getElementById('fState').value,np=document.getElementById('fNew').value.trim();let fe=document.getElementById('fErr'),fo=document.getElementById('fOk');fe.classList.add('hidden');fo.classList.add('hidden');if(!phone||!state||!np){fe.innerText='اكمل البيانات';fe.classList.remove('hidden');return;}let r=await fetch('/api/forgot/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,state,newPassword:np})});let d=await r.json();if(!r.ok){fe.innerText=d.error;fe.classList.remove('hidden');return;}fo.innerText='تم تغيير كلمة المرور ✅';fo.classList.remove('hidden');setTimeout(closeF,1500);}
function show(){document.getElementById('auth').classList.add('hidden');if(cur.role==='client'){document.getElementById('clientView').classList.remove('hidden');document.getElementById('cH').innerText=cur.name+' • '+cur.phone;}else{document.getElementById('officeView').classList.remove('hidden');document.getElementById('oH').innerText=cur.name+' • '+cur.phone;}load();startInbox();}
function out(){localStorage.removeItem('rihlat_final');location.reload();}
async function load(){let r=await fetch('/api/trips');allTrips=await r.json();render();loadEarn();}
function render(){let f=cur.role==='client'?document.getElementById('cFrom').value:document.getElementById('oFrom').value;let t=cur.role==='client'?document.getElementById('cTo').value:document.getElementById('oTo').value;let filtered=allTrips.filter(x=>{if(f&&t)return x.from===f&&x.to===t;if(f)return x.from===f;if(t)return x.to===t;return true;});if(cur.role==='client'){document.getElementById('cList').innerHTML=filtered.map(tr=>'<div class="bg-white rounded-2xl p-4 border shadow-sm"><div class="flex justify-between"><div><div class="font-black text-sm">'+tr.from+' → '+tr.to+'</div><div class="text-xs text-zinc-500">'+tr.office+'</div></div><div class="font-black text-blue-600">'+tr.price.toLocaleString()+' ج</div></div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="book(\\''+tr.id+'\\',\\''+tr.phone+'\\')" class="bg-zinc-900 text-white rounded-full py-2.5 font-black text-xs">احجز</button><button onclick="openChat(\\''+tr.id+'\\',\\''+tr.phone+'\\',\\''+tr.from+' → '+tr.to+'\\',\\''+tr.office+'\\')" class="bg-blue-600 text-white rounded-full py-2.5 font-black text-xs">شات</button></div></div>').join('');}else{document.getElementById('oList').innerHTML=filtered.map(tr=>'<div class="bg-[#151515] rounded-2xl p-4 border border-white/10"><div class="flex justify-between"><div class="font-black text-sm">'+tr.from+' → '+tr.to+'</div><div class="font-black text-amber-400 text-sm">'+tr.price.toLocaleString()+' ج</div></div><div class="text-xs text-zinc-500">'+tr.office+'</div></div>').join('');}}
async function loadEarn(){if(cur.role!=='office')return;let r=await fetch('/api/earnings/'+cur.phone);let d=await r.json();document.getElementById('earn').innerText=d.total.toLocaleString()+' ج';document.getElementById('earnCount').innerText=d.count;}
async function book(id,officePhone){let tr=allTrips.find(x=>x.id===id);await fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:tr.from,to:tr.to,price:tr.price,clientPhone:cur.phone,officePhone:officePhone,tripId:id})});openChat(id,officePhone,tr.from+' → '+tr.to,tr.office);}
async function createTrip(){let f=document.getElementById('oFrom').value,t=document.getElementById('oTo').value;if(!f||!t||f===t){alert('حدد من و الى');return;}let price=+document.getElementById('oPrice').value;if(!price){alert('السعر');return;}let nt={from:f,to:t,office:cur.name,price,phone:cur.phone,owner:cur.phone};await fetch('/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(nt)});load();}
function openChat(tripId,officePhone,title,officeName){chatTripId=tripId;chatOfficePhone=officePhone;document.getElementById('chat').classList.remove('hidden');document.getElementById('chatT').innerText=officeName;document.getElementById('chatPhone').innerText=title;loadChat();if(iv)clearInterval(iv);iv=setInterval(loadChat,1500);}
function closeChat(){document.getElementById('chat').classList.add('hidden');if(iv)clearInterval(iv);chatTripId=null;}
async function loadChat(){if(!chatTripId)return;let r=await fetch('/api/chats?tripId='+chatTripId);let ms=(await r.json()).filter(m=>m.tripId===chatTripId);let box=document.getElementById('chatM');if(!ms.length){box.innerHTML='<div class="text-center mt-20 text-zinc-400 text-sm">ابدأ</div>';return;}box.innerHTML=ms.map(m=>'<div class="max-w-[80%] rounded-2xl px-4 py-2.5 '+(m.from===cur.phone?'bg-blue-600 text-white ml-auto':'bg-white border mr-auto')+'"><div class="text-xs font-bold mt-0.5">'+m.msg+'</div></div>').join('');box.scrollTop=box.scrollHeight;}
async function send(){let i=document.getElementById('chatI');let m=i.value.trim();if(!m||!chatTripId)return;await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:cur.phone,to:chatOfficePhone,msg:m,tripId:chatTripId,officePhone:chatOfficePhone})});i.value='';loadChat();}
async function startInbox(){if(inboxIv)clearInterval(inboxIv);inboxIv=setInterval(async()=>{try{let r=await fetch('/api/inbox/'+cur.phone);let msgs=await r.json();if(cur.role==='office'){document.getElementById('oInbox').innerHTML=msgs.slice(-20).reverse().map(m=>'<div class="bg-black rounded-xl p-3 border border-white/10"><div class="text-amber-400 font-black text-xs">'+m.from+'</div><div class="text-white text-xs mt-1">'+m.msg+'</div></div>').join('')||'لا رسائل';}else{document.getElementById('cInbox').innerHTML=msgs.slice(-10).reverse().map(m=>'<div class="bg-blue-50 border rounded-xl p-2.5 text-xs font-bold">'+m.msg+'</div>').join('')||'لا رسائل';}}catch(e){}},2000);}
['cFrom','cTo','oFrom','oTo'].forEach(id=>{document.getElementById(id)?.addEventListener('change',render);});
window.onload=init;
</script></body></html>
`);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('fixed'));
module.exports=app;
