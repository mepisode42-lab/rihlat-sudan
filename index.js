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
<style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap');body{font-family:Cairo}.hide{display:none}.fb-cover{background: linear-gradient(180deg,#0b2a4a 0%,#dbeafe 100%)}</style>
</head>
<body class="bg-[#f0f2f5] min-h-screen">

<header class="bg-gradient-to-r from-[#0b2a4a] to-[#145ea8] text-white p-4 sticky top-0 z-50 shadow-lg">
  <div class="max-w-md mx-auto flex justify-between items-center"><h1 class="font-black text-[20px]">رحلات السودان</h1><div onclick="openProfile(currentUser.phone)" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"><img id="headerAvatar" class="w-9 h-9 rounded-full object-cover"></div></div>
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
    <div class="bg-white rounded-2xl p-3 flex justify-between items-center mt-2 border shadow-sm">
      <div class="flex items-center gap-3 cursor-pointer" onclick="openProfile(currentUser.phone)">
        <img id="myAvatar" src="" class="w-10 h-10 rounded-full bg-gray-200 object-cover border"><div><div id="myName" class="font-black text-[14px]"></div><div id="myRole" class="text-[11px] text-gray-500"></div></div>
      </div>
      <button onclick="logout()" class="text-xs bg-[#f0f2f5] px-3 py-1.5 rounded-full font-bold">خروج</button>
    </div>

    <div id="officePanel" class="bg-white rounded-[22px] p-5 shadow border mt-4 hide">
      <h3 class="font-black mb-3">نشر رحلة جديدة 🚌</h3>
      <div class="grid grid-cols-2 gap-2"><div><label class="text-[11px] font-bold">من وين؟</label><select id="from" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div><div><label class="text-[11px] font-bold">لوين؟</label><select id="to" class="w-full border-2 rounded-xl p-3 bg-white text-sm"></select></div></div>
      <div class="grid grid-cols-2 gap-2 mt-2"><div><label class="text-[11px] font-bold">التاريخ</label><input id="tripDate" type="date" class="w-full border-2 rounded-xl p-3 text-sm"></div><div><label class="text-[11px] font-bold">الزمن</label><input id="tripTime" type="time" class="w-full border-2 rounded-xl p-3 text-sm"></div></div>
      <div class="grid grid-cols-2 gap-2 mt-2"><div><label class="text-[11px] font-bold">السعر</label><input id="tripPrice" type="number" placeholder="25000" class="w-full border-2 rounded-xl p-3 text-sm"></div><div><label class="text-[11px] font-bold">مقاعد</label><input id="tripSeats" type="number" placeholder="4" class="w-full border-2 rounded-xl p-3 text-sm"></div></div>
      <button onclick="publishTrip()" class="w-full bg-blue-600 text-white rounded-xl py-3 font-black mt-3">نشر الرحلة</button>
    </div>

    <div class="bg-white rounded-[22px] p-4 shadow-sm border mt-4">
      <h3 class="font-black text-[13px] mb-2">🔍 البحث عن الرحلات</h3>
      <div class="flex gap-2"><div class="flex-1"><select id="searchFrom" class="w-full border rounded-xl p-3 bg-[#f0f2f5] text-sm"></select></div><div class="flex-1"><select id="searchTo" class="w-full border rounded-xl p-3 bg-[#f0f2f5] text-sm"></select></div><button onclick="loadTrips()" class="bg-black text-white px-5 rounded-xl font-black text-sm">بحث</button></div>
    </div>

    <div id="tripsList" class="space-y-3 mt-3"></div>

    <!-- شات فيسبوك -->
    <div class="bg-white rounded-[22px] shadow border mt-6 overflow-hidden">
      <div class="p-3 flex gap-2 border-b bg-white">
        <button onclick="switchChatTab('chats')" id="chatTabBtn" class="flex-1 bg-black text-white py-2 rounded-full font-black text-[12px]">المحادثات</button>
        <button onclick="switchChatTab('contacts')" id="contactTabBtn" class="flex-1 bg-[#f0f2f5] py-2 rounded-full font-black text-[12px]">جهات الاتصال</button>
      </div>
      <div id="contactsList" class="hide max-h-[250px] overflow-y-auto"></div>
      <div id="chatArea">
        <div class="p-3 bg-gray-50 border-b flex justify-between items-center"><div class="flex items-center gap-2"><img id="chatAvatar" class="w-8 h-8 rounded-full bg-gray-200 hidden"><span id="chatTarget" class="text-[12px] font-bold">اختر شخص من جهات الاتصال</span><span id="onlineDot" class="w-2 h-2 bg-green-500 rounded-full hidden"></span></div><button onclick="closeChat()" class="text-[11px] bg-gray-200 px-2 py-1 rounded-full">إغلاق</button></div>
        <div id="chatBox" class="h-[320px] overflow-y-auto p-3 space-y-2 bg-white"></div>
        <div class="p-2 flex gap-2 border-t bg-white"><input id="chatInput" placeholder="Aa" class="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2.5 text-sm outline-none"><button onclick="sendMsg()" class="bg-blue-600 text-white w-10 h-10 rounded-full font-black">➤</button></div>
      </div>
    </div>
  </div>
</div>

<!-- بروفايل فيسبوك -->
<div id="profileModal" class="fixed inset-0 bg-black/60 z-[100] hidden items-start justify-center p-0 overflow-y-auto">
  <div class="bg-[#f0f2f5] w-full max-w-md min-h-screen">
    <div class="bg-white shadow-sm">
      <div class="fb-cover h-[180px] relative"><button onclick="closeProfile()" class="absolute top-3 left-3 bg-black/50 text-white w-9 h-9 rounded-full">✕</button></div>
      <div class="px-4 pb-4">
        <div class="flex items-end gap-4 -mt-10">
          <img id="pAvatar" src="" class="w-[88px] h-[88px] rounded-full border-[4px] border-white object-cover bg-gray-200 shadow">
          <div class="pb-2"><div id="pName" class="font-black text-[20px] leading-6"></div><div id="pFather" class="text-[13px] text-gray-600"></div></div>
        </div>
        <div class="flex gap-2 mt-4">
          <button id="pChatBtn" class="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-black text-sm">💬 مراسلة</button>
          <button class="flex-1 bg-[#e4e6eb] rounded-lg py-2.5 font-black text-sm">👤 صديق</button>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div class="bg-[#f0f2f5] rounded-xl p-2"><div id="pTripCount" class="font-black">0</div><div class="text-[10px] text-gray-500">رحلة</div></div>
          <div class="bg-[#f0f2f5] rounded-xl p-2"><div id="pState" class="font-black text-[11px]"></div><div class="text-[10px] text-gray-500">السكن</div></div>
          <div class="bg-[#f0f2f5] rounded-xl p-2"><div id="pRole" class="font-black text-[11px]"></div><div class="text-[10px] text-gray-500">النوع</div></div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="flex gap-2 text-[13px]"><span>📞</span><span id="pPhone" class="font-bold"></span></div>
          <div class="flex gap-2 text-[13px]"><span>🏠</span><span>يعيش في <b id="pState2"></b></span></div>
        </div>
      </div>
    </div>
    <div class="bg-white mt-2 p-3">
      <h4 class="font-black text-sm mb-2">الرحلات المنشورة</h4>
      <div id="pTrips" class="space-y-2"></div>
    </div>
  </div>
</div>

<script>
const socket = io();
let currentUser = JSON.parse(localStorage.getItem('user')||'null');
let currentChatUser = null;
let currentChatPhone = null;
let allTrips = [];
let allUsersCache = [];

const SUDAN_STATES = ["الخرطوم","نهر النيل - عطبرة","الشمالية - دنقلا","البحر الأحمر - بورتسودان","كسلا","القضارف","الجزيرة - ود مدني","سنار","النيل الأبيض - كوستي","النيل الأزرق - الدمازين","شمال كردفان - الأبيض","جنوب كردفان - كادوقلي","غرب كردفان - الفولة","شمال دارفور - الفاشر","جنوب دارفور - نيالا","غرب دارفور - الجنينة","وسط دارفور - زالنجي","شرق دارفور - الضعين"];

function fillSelects(){
  const opts = SUDAN_STATES.map(s=>\`<option>\${s}</option>\`).join('');
  const optsWithAll = '<option value="">الكل</option>' + opts;
  document.getElementById('rState').innerHTML = opts;
  document.getElementById('from').innerHTML = opts;
  document.getElementById('to').innerHTML = opts;
  document.getElementById('searchFrom').innerHTML = optsWithAll;
  document.getElementById('searchTo').innerHTML = optsWithAll;
  document.getElementById('rState').value = "نهر النيل - عطبرة";
}
function showTab(t){
  loginBox.classList.toggle('hide', t!=='login'); registerBox.classList.toggle('hide', t!=='register');
  tabLogin.className = t=='login' ? 'flex-1 py-2.5 rounded-full font-black bg-black text-white text-sm' : 'flex-1 py-2.5 rounded-full font-black text-gray-500 text-sm';
  tabReg.className = t=='register' ? 'flex-1 py-2.5 rounded-full font-black bg-black text-white text-sm' : 'flex-1 py-2.5 rounded-full font-black text-gray-500 text-sm';
}
function checkAuth(){
  if(currentUser){
    authScreen.classList.add('hide'); mainScreen.classList.remove('hide');
    const av = currentUser.avatar;
    document.getElementById('myName').innerText = currentUser.dailyName;
    document.getElementById('myRole').innerText = currentUser.role + ' - ' + currentUser.state;
    document.getElementById('myAvatar').src = av;
    document.getElementById('headerAvatar').src = av;
    if(currentUser.role==='مكتب') officePanel.classList.remove('hide');
    fillSelects(); loadTrips(); loadContacts();
  } else { fillSelects(); }
}
checkAuth();

async function register(){
  if(rPass.value!==rPass2.value) return alert('كلمة السر غير متطابقة');
  if(!rPhone.value||!rDailyName.value||!rFather.value) return alert('أكمل البيانات');
  let role = document.querySelector('input[name="role"]:checked').value;
  let avatar = 'https://ui-avatars.com/api/?name='+encodeURIComponent(rDailyName.value)+'&background=0b2a4a&color=fff&size=200';
  let data={phone:rPhone.value,dailyName:rDailyName.value,father:rFather.value,avatar:avatar,state:rState.value,role:role,pass:rPass.value};
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
    return \`<div class="bg-white p-3 rounded-2xl border shadow-sm flex justify-between items-center">
      <div class="flex gap-3 items-center">
        <img onclick="openProfile('\${t.phone}')" src="\${t.officeAvatar}" class="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white shadow">
        <div><div class="font-black text-[13px] cursor-pointer" onclick="openProfile('\${t.phone}')">\${t.from} → \${t.to}</div><div class="text-[11px] text-gray-500"><span class="underline cursor-pointer" onclick="openProfile('\${t.phone}')">\${t.office}</span> • \${t.date}</div></div>
      </div>
      <div class="text-left flex flex-col gap-1 items-end">
        <div class="font-black text-blue-600 text-[13px]">\${t.price} ج</div>
        \${!isBooked ? \`<button onclick="bookTrip('\${t.id}')" class="text-[11px] bg-[#e4e6eb] px-4 py-1.5 rounded-full font-bold">إضافة</button>\` : \`<div class="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">تمت ✓</div><button onclick="cancelTrip('\${t.id}')" class="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-bold">إلغاء</button>\`}
      </div>
    </div>\`;
  }).join('');
}

function switchChatTab(tab){
  if(tab==='contacts'){ contactsList.classList.remove('hide'); chatArea.classList.add('hide'); contactTabBtn.className='flex-1 bg-black text-white py-2 rounded-full font-black text-[12px]'; chatTabBtn.className='flex-1 bg-[#f0f2f5] py-2 rounded-full font-black text-[12px]'; }
  else{ contactsList.classList.add('hide'); chatArea.classList.remove('hide'); chatTabBtn.className='flex-1 bg-black text-white py-2 rounded-full font-black text-[12px]'; contactTabBtn.className='flex-1 bg-[#f0f2f5] py-2 rounded-full font-black text-[12px]'; }
}

async function loadContacts(){
  let res = await fetch('/api/users'); allUsersCache = await res.json();
  let others = allUsersCache.filter(u=>u.phone!==currentUser.phone);
  contactsList.innerHTML = others.map(u=>\`<div onclick="openProfile('\${u.phone}')" class="flex gap-3 items-center p-3 hover:bg-[#f0f2f5] cursor-pointer border-b">
    <div class="relative"><img src="\${u.avatar}" class="w-12 h-12 rounded-full object-cover"><span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span></div>
    <div class="flex-1"><div class="font-black text-[13px]">\${u.dailyName}</div><div class="text-[11px] text-gray-500">\${u.role} • \${u.state}</div></div>
    <button onclick="event.stopPropagation(); startChat('\${u.dailyName}','\${u.phone}','\${u.avatar}')" class="bg-[#e4e6eb] w-8 h-8 rounded-full">💬</button>
  </div>\`).join('') || '<div class="p-6 text-center text-sm text-gray-400">لا يوجد مستخدمين</div>';
}

async function openProfile(phone){
  let res = await fetch('/api/users'); allUsersCache = await res.json();
  let user = allUsersCache.find(u=>u.phone==phone);
  if(!user) return alert('الملف غير موجود');
  let tr = await fetch('/api/trips'); let tripsData = await tr.json();
  let myTrips = tripsData.filter(t=>t.phone==phone);
  document.getElementById('pAvatar').src = user.avatar;
  document.getElementById('pName').innerText = user.dailyName;
  document.getElementById('pFather').innerText = user.father + ' - ابن';
  document.getElementById('pState').innerText = user.state;
  document.getElementById('pState2').innerText = user.state;
  document.getElementById('pRole').innerText = user.role;
  document.getElementById('pPhone').innerText = user.phone;
  document.getElementById('pTripCount').innerText = myTrips.length;
  document.getElementById('pTrips').innerHTML = myTrips.length ? myTrips.map(t=>\`<div class="border rounded-xl p-3 text-[12px] flex justify-between"><span>\${t.from} → \${t.to}</span><span class="font-black text-blue-600">\${t.price} ج</span></div>\`).join('') : '<div class="text-center text-xs text-gray-400">لم ينشر أي رحلة</div>';
  document.getElementById('pChatBtn').onclick = ()=>{ closeProfile(); startChat(user.dailyName, user.phone, user.avatar); };
  profileModal.classList.remove('hidden'); profileModal.classList.add('flex');
}
function closeProfile(){ profileModal.classList.add('hidden'); profileModal.classList.remove('flex'); }

function startChat(name, phone, avatar){
  currentChatUser = name; currentChatPhone = phone;
  document.getElementById('chatTarget').innerText = name;
  if(avatar){ document.getElementById('chatAvatar').src=avatar; document.getElementById('chatAvatar').classLi
