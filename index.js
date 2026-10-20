const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
app.use(express.json());

let users = fs.existsSync('users.json') ? JSON.parse(fs.readFileSync('users.json')) : [];
let trips = fs.existsSync('trips.json') ? JSON.parse(fs.readFileSync('trips.json')) : [];
let messages = fs.existsSync('messages.json') ? JSON.parse(fs.readFileSync('messages.json')) : [];
const save = () => {
  fs.writeFileSync('users.json', JSON.stringify(users));
  fs.writeFileSync('trips.json', JSON.stringify(trips));
  fs.writeFileSync('messages.json', JSON.stringify(messages));
}

app.get('/', (req,res)=>{
res.send(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>رحلات السودان</title><script src="https://cdn.tailwindcss.com"></script><script src="/socket.io/socket.io.js"></script>
<style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&display=swap');body{font-family:Cairo}.hide{display:none}</style>
</head>
<body class="bg-[#eef3f7] min-h-screen">

<header class="bg-gradient-to-r from-[#0b2a4a] to-[#145ea8] text-white p-4 sticky top-0 z-50 shadow-lg">
  <div class="max-w-md mx-auto text-center"><h1 class="font-black text-[22px]">رحلات السودان</h1><p class="text-[12px] opacity-90 -mt-1">نحو مستقبل أفضل</p></div>
</header>

<div class="max-w-md mx-auto p-3">
  <div id="authScreen" class="mt-4">
    <div class="bg-white rounded-[24px] p-6 shadow border text-center">
      <div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black mb-3">S</div>
      <h2 class="font-black text-xl">مرحبا بك</h2><p class="text-xs text-gray-500 mb-5">سجل دخولك أو أنشئ حساب جديد</p>
      <div class="flex bg-gray-100 rounded-full p-1">
        <button onclick="showTab('login')" id="tabLogin" class="flex-1 py-2.5 rounded-full font-black bg-black text-white text-sm">تسجيل دخول</button>
        <button onclick="showTab('register')" id="tabReg" class="flex-1 py-2.5 rounded-full font-black text-gray-500 text-sm">حساب جديد</button>
      </div>
    </div>
    <div id="loginBox" class="bg-white rounded-[24px] p-6 shadow border mt-4">
      <h3 class="font-black mb-4">تسجيل الدخول</h3>
      <label class="text-[12px] font-bold block mb-1">رقم الهاتف</label><input id="lPhone" placeholder="09xxxxxxxx" class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">كلمة السر</label><input id="lPass" type="password" placeholder="••••••••" class="w-full border-2 rounded-xl p-3.5 mb-4">
      <button onclick="login()" class="w-full bg-[#0b2a4a] text-white rounded-xl py-4 font-black">دخول</button>
    </div>
    <div id="registerBox" class="bg-white rounded-[24px] p-6 shadow border mt-4 hide">
      <h3 class="font-black mb-4">إنشاء حساب جديد</h3>
      <label class="text-[12px] font-bold block mb-1">رقم الهاتف *</label><input id="rPhone" placeholder="09xxxxxxxx" class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">الاسم اليومي *</label><input id="rDailyName" placeholder="مثلا: أحمد" class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">اسم الأب *</label><input id="rFather" placeholder="اسم الوالد" class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">رابط الصورة الشخصية</label><input id="rAvatar" placeholder="https://..." class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">السكن - الولاية *</label><select id="rState" class="w-full border-2 rounded-xl p-3.5 bg-white mb-3"></select>
      <label class="text-[12px] font-bold block mb-1">نوع الحساب *</label>
      <div class="flex gap-2 mb-3">
        <label class="flex-1 border-2 rounded-xl p-3 flex items-center gap-2 cursor-pointer"><input type="radio" name="role" value="عميل" checked> <span class="font-bold text-sm">عميل</span></label>
        <label class="flex-1 border-2 rounded-xl p-3 flex items-center gap-2 cursor-pointer"><input type="radio" name="role" value="مكتب"> <span class="font-bold text-sm">مكتب</span></label>
      </div>
      <label class="text-[12px] font-bold block mb-1">كلمة السر *</label><input id="rPass" type="password" class="w-full border-2 rounded-xl p-3.5 mb-3">
      <label class="text-[12px] font-bold block mb-1">تأكيد كلمة السر *</label><input id="rPass2" type="password" class="w-full border-2 rounded-xl p-3.5 mb-4">
      <button onclick="register()" class="w-full bg-green-600 text-white rounded-xl py-4 font-black">إنشاء الحساب</button>
    </div>
  </div>

  <div id="mainScreen" class="hide">
    <div class="bg-white rounded-2xl p-4 flex justify-between items-center mt-2 border">
      <div class="flex items-center gap-3 cursor-pointer" onclick="openProfile(currentUser.phone)">
        <img id="myAvatar" src="" class="w-10 h-10 rounded-full bg-gray-200 object-cover"><div><div id="myName" class="font-black text-sm"></div><div id="myRole" class="text-[11px] text-gray-500"></div></div>
      </div>
      <button onclick="logout()" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-bold">خروج</button>
    </div>

    <div id="officePanel" class="bg-white rounded-[22px] p-5 shadow border mt-4 hide">
      <h3 class="font-black mb-3">نشر رحلة جديدة 🚌</h3>
      <div class="grid grid-cols-2 gap-2"><div><label class="text-[11px] font-bold">من وين؟</label><select id="from" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div><div><label class="text-[11px] font-bold">لوين؟</label><select id="to" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div></div>
      <div class="grid grid-cols-2 gap-2 mt-2"><div><label class="text-[11px] font-bold">التاريخ</label><input id="tripDate" type="date" class="w-full border-2 rounded-xl p-3 text-sm"></div><div><label class="text-[11px] font-bold">الزمن</label><input id="tripTime" type="time" class="w-full border-2 rounded-xl p-3 text-sm"></div></div>
      <div class="grid grid-cols-2 gap-2 mt-2"><div><label class="text-[11px] font-bold">السعر</label><input id="tripPrice" type="number" placeholder="25000" class="w-full border-2 rounded-xl p-3 text-sm"></div><div><label class="text-[11px] font-bold">مقاعد</label><input id="tripSeats" type="number" placeholder="4" class="w-full border-2 rounded-xl p-3 text-sm"></div></div>
      <button onclick="publishTrip()" class="w-full bg-blue-600 text-white rounded-xl py-3 font-black mt-3">نشر الرحلة</button>
    </div>

    <div class="bg-white rounded-[22px] p-4 shadow border mt-4">
      <h3 class="font-black text-[13px] mb-2">🔍 البحث عن الرحلات</h3>
      <div class="flex gap-2"><div class="flex-1"><label class="text-[10px] font-bold">من اين؟</label><select id="searchFrom" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div><div class="flex-1"><label class="text-[10px] font-bold">الى اين؟</label><select id="searchTo" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div><button onclick="loadTrips()" class="bg-black text-white px-5 rounded-xl font-black text-sm h-[48px] mt-[18px]">بحث</button></div>
    </div>

    <div id="tripsList" class="space-y-3 mt-3"></div>

    <div class="bg-white rounded-[22px] p-0 shadow border mt-6 overflow-hidden">
      <div class="p-4 bg-gray-50 border-b flex justify-between"><span class="font-black text-sm">💬 المراسلات</span><span id="chatTarget" class="text-[11px] text-gray-500">اختر شخص للمراسلة</span></div>
      <div id="chatBox" class="h-[300px] overflow-y-auto p-3 space-y-2 bg-[#f8fbff]"></div>
      <div class="p-2 flex gap-2 border-t"><input id="chatInput" placeholder="اكتب رسالة..." class="flex-1 border-2 rounded-full px-4 py-2.5 text-sm"><button onclick="sendMsg()" class="bg-black text-white px-5 rounded-full font-black text-sm">إرسال</button></div>
    </div>
  </div>
</div>

<!-- مودال الملف الشخصي -->
<div id="profileModal" class="fixed inset-0 bg-black/60 z-[100] hidden flex items-center justify-center p-4">
  <div class="bg-white rounded-[24px] p-6 w-full max-w-sm">
    <div class="flex justify-between"><h3 class="font-black">الملف الشخصي</h3><button onclick="closeProfile()" class="bg-gray-100 w-8 h-8 rounded-full">✕</button></div>
    <div class="text-center mt-4">
      <img id="pAvatar" src="" class="w-24 h-24 rounded-full mx-auto object-cover bg-gray-200 border-4 border-blue-100">
      <div id="pName" class="font-black text-lg mt-3"></div>
      <div id="pFather" class="text-sm text-gray-500"></div>
      <div id="pState" class="text-xs bg-blue-50 text-blue-600 inline-block px-3 py-1 rounded-full mt-2"></div>
      <div id="pRole" class="text-xs bg-black text-white inline-block px-3 py-1 rounded-full mt-1 mr-1"></div>
      <div id="pPhone" class="text-sm font-bold mt-3"></div>
    </div>
    <button id="pChatBtn" class="w-full bg-blue-600 text-white rounded-xl py-3 font-black mt-5">💬 مراسلة</button>
  </div>
</div>

<script>
const socket = io();
let currentUser = JSON.parse(localStorage.getItem('user')||'null');
let currentChatUser = null;
let allTrips = [];
let allUsersCache = [];

const SUDAN_STATES = ["الخرطوم","نهر النيل - عطبرة","الشمالية - دنقلا","البحر الأحمر - بورتسودان","كسلا","القضارف","الجزيرة - ود مدني","سنار","النيل الأبيض - كوستي","النيل الأزرق - الدمازين","شمال كردفان - الأبيض","جنوب كردفان - كادوقلي","غرب كردفان - الفولة","شمال دارفور - الفاشر","جنوب دارفور - نيالا","غرب دارفور - الجنينة","وسط دارفور - زالنجي","شرق دارفور - الضعين"];

function fillSelects(){
  const opts = SUDAN_STATES.map(s=>\`<option>\${s}</option>\`).join('');
  const optsWithAll = '<option value="">الكل</option>' + opts;
  rState.innerHTML = opts; from.innerHTML = opts; to.innerHTML = opts; searchFrom.innerHTML = optsWithAll; searchTo.innerHTML = optsWithAll;
  rState.value = "نهر النيل - عطبرة";
}
function showTab(t){
  loginBox.classList.toggle('hide', t!=='login'); registerBox.classList.toggle('hide', t!=='register');
  tabLogin.className = t=='login' ? 'flex-1 py-2.5 rounded-full font-black bg-black text-white text-sm' : 'flex-1 py-2.5 rounded-full font-black text-gray-500 text-sm';
  tabReg.className = t=='register' ? 'flex-1 py-2.5 rounded-full font-black bg-black text-white text-sm' : 'flex-1 py-2.5 rounded-full font-black text-gray-500 text-sm';
}
function checkAuth(){
  if(currentUser){ authScreen.classList.add('hide'); mainScreen.classList.remove('hide'); myName.innerText = currentUser.dailyName; myRole.innerText = currentUser.role + ' - ' + currentUser.state; myAvatar.src = currentUser.avatar || 'https://ui-avatars.com/api/?name='+currentUser.dailyName+'&background=0b2a4a&color=fff'; if(currentUser.role==='مكتب') officePanel.classList.remove('hide'); fillSelects(); loadTrips(); } else { fillSelects(); }
}
checkAuth();

async function register(){
  if(rPass.value!==rPass2.value) return alert('كلمة السر غير متطابقة');
  if(!rPhone.value||!rDailyName.value||!rFather.value) return alert('أكمل البيانات');
  let role = document.querySelector('input[name="role"]:checked').value;
  let data={phone:rPhone.value,dailyName:rDailyName.value,father:rFather.value,avatar:rAvatar.value,state:rState.value,role:role,pass:rPass.value};
  let res=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  let txt=await res.text(); alert(txt); if(res.ok) showTab('login');
}
async function login(){
  let res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:lPhone.value,pass:lPass.value})});
  let data=await res.json(); if(data.ok){ localStorage.setItem('user',JSON.stringify(data.user)); location.reload(); } else alert(data.msg);
}
function logout(){ localStorage.removeItem('user'); location.reload(); }
async function publishTrip(){
  let data={from:from.value,to:to.value,date:tripDate.value,time:tripTime.value,price:tripPrice.value,seats:tripSeats.value,office:currentUser.dailyName,phone:currentUser.phone,officeAvatar:currentUser.avatar};
  await fetch('/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); loadTrips();
}

function getBooked(){ return JSON.parse(localStorage.getItem('bookedTrips')||'[]'); }
function setBooked(arr){ localStorage.setItem('bookedTrips', JSON.stringify(arr)); }
function bookTrip(id){ let b=getBooked(); if(!b.includes(id)){ b.push(id); setBooked(b);} loadTrips(); }
function cancelTrip(id){ let b=getBooked().filter(x=>x!=id); setBooked(b); loadTrips(); }

async function loadTrips(){
  let r=await fetch('/api/trips'); allTrips=await r.json();
  let sf = searchFrom.value || ''; let st = searchTo.value || '';
  let filtered = allTrips.filter(t=>{ if(sf && !t.from.includes(sf) && !sf.includes(t.from)) return false; if(st && !t.to.includes(st) && !st.includes(t.to)) return false; return true; });
  let booked = getBooked();
  if(filtered.length==0){ tripsList.innerHTML='<div class="bg-white p-6 rounded-2xl border text-center text-sm text-gray-500">لا توجد رحلات</div>'; return; }
  tripsList.innerHTML=filtered.map(t=>{
    const isBooked = booked.includes(t.id);
    return \`<div class="bg-white p-4 rounded-2xl border flex justify-between items-center">
      <div class="flex gap-3 items-center">
        <img onclick="openProfile('\${t.phone}')" src="\${t.officeAvatar || 'https://ui-avatars.com/api/?name='+t.office+'&background=0b2a4a&color=fff'}" class="w-10 h-10 rounded-full object-cover cursor-pointer border">
        <div><div class="font-black text-sm cursor-pointer" onclick="openProfile('\${t.phone}')">\${t.from} → \${t.to}</div><div class="text-[11px] text-gray-500">\${t.date} \${t.time} | <span class="underline cursor-pointer" onclick="openProfile('\${t.phone}')">\${t.office}</span> - \${t.phone}</div></div>
      </div>
      <div class="text-left flex flex-col gap-1">
        <div class="font-black text-blue-600 text-[14px]">\${t.price} ج</div>
        \${!isBooked ? \`<button onclick="bookTrip('\${t.id}')" class="text-[11px] bg-black text-white px-4 py-1.5 rounded-full font-bold">إضافة</button>\` : \`<div class="text-[11px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black text-center">تمت الإضافة ✓</div><button onclick="cancelTrip('\${t.id}')" class="text-[11px] bg-red-500 text-white px-4 py-1.5 rounded-full font-bold">إلغاء</button>\`}
      </div>
    </div>\`;
  }).join('');
}

// الملف الشخصي
async function openProfile(phone){
  let res = await fetch('/api/users'); allUsersCache = await res.json();
  let user = allUsersCache.find(u=>u.phone==phone);
  if(!user) return alert('الملف غير موجود');
  pAvatar.src = user.avatar || 'https://ui-avatars.com/api/?name='+user.dailyName+'&background=0b2a4a&color=fff';
  pName.innerText = user.dailyName; pFather.innerText = 'ابن: ' + user.father; pState.innerText = user.state; pRole.innerText = user.role; pPhone.innerText = user.phone;
  pChatBtn.onclick = ()=>{ closeProfile(); startChat(user.dailyName, user.phone); };
  profileModal.classList.remove('hidden'); profileModal.classList.add('flex');
}
function closeProfile(){ profileModal.classList.add('hidden'); profileModal.classList.remove('flex'); }

function startChat(name, phone){
  currentChatUser = name;
  chatTarget.innerText = 'تتحدث مع: ' + name + ' ('+phone+')';
  loadMessages();
  document.getElementById('chatBox').scrollIntoView({behavior:'smooth'});
}
function loadMessages(){
  if(!currentChatUser) return;
  fetch('/api/messages').then(r=>r.json()).then(ms=>{
    let filtered = ms.filter(m=> (m.from===currentUser.dailyName && m.to===currentChatUser) || (m.to===currentUser.dailyName && m.from===currentChatUser));
    chatBox.innerHTML = filtered.map(m=>\`<div class="\${m.from===currentUser.dailyName?'bg-blue-600 text-white ml-8':'bg-white border mr-8'} p-2.5 rounded-2xl text-[13px]"><b class="text-[10px] block opacity-70">\${m.from}</b>\${m.text}</div>\`).join('') || '<div class="text-center text-xs text-gray-400 mt-10">ابدأ المحادثة الآن</div>';
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
function sendMsg(){
  if(!currentChatUser) return alert('افتح ملف شخصي واضغط مراسلة أولا');
  if(!chatInput.value) return;
  let msg={from:currentUser.dailyName,to:currentChatUser,text:chatInput.value,time:Date.now()};
  socket.emit('chat',msg); chatInput.value=''; setTimeout(loadMessages,300);
}
socket.on('chat', ()=>{ loadMessages(); });
</script>
</body></html>`);
});

app.post('/api/register',(req,res)=>{
  let u=users.find(x=>x.phone==req.body.phone);
  if(u) return res.status(400).send('رقم الهاتف مسجل مسبقا');
  users.push(req.body); save(); res.send('تم إنشاء الحساب بنجاح');
});
app.post('/api/login',(req,res)=>{
  let u=users.find(x=>x.phone==req.body.phone && x.pass==req.body.pass);
  if(!u) return res.json({ok:false,msg:'رقم أو كلمة سر خطأ'});
  res.json({ok:true,user:u});
});
app.get('/api/users',(req,res)=>res.json(users));
app.get('/api/trips',(req,res)=>res.json(trips.slice().reverse()));
app.post('/api/trips',(req,res)=>{ const newTrip = { id: Date.now().toString(), ...req.body }; trips.push(newTrip); save(); res.json({ok:true}); });
app.get('/api/messages',(req,res)=>res.json(messages));
io.on('connection',socket=>{ socket.on('chat',msg=>{ io.emit('chat',msg); messages.push(msg); save(); }); });
http.listen(3000,()=>console.log('رحلات السودان شغال - ملفات شخصية + مراسلة'));

