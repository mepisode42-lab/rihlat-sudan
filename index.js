const express = require('express');
const app = express();
app.use(express.json());

let users = [
  {phone:'0912345678', dailyName:'محمد عطبرة', father:'احمد محمد', state:'نهر النيل - عطبرة', role:'سائق', trips:24, rating:4.9, car:'تويوتا هايس 2022', password:'123'},
  {phone:'0911111111', dailyName:'أحمد الخرطوم', father:'علي حسن', state:'الخرطوم - بحري', role:'سائق', trips:18, rating:4.8, car:'بص سياحي', password:'123'},
  {phone:'0922222222', dailyName:'عبدالله كسلا', father:'محمد ادم', state:'كسلا - المدينة', role:'مسافر', trips:5, rating:5.0, car:'', password:'123'}
];

let trips = [
  {id:1, from:'عطبرة', to:'الخرطوم', driver:'محمد عطبرة', driverPhone:'0912345678', date:'اليوم 10:00 ص', price:'25,000 جنيه', seats:14, available:3, car:'هايس'},
  {id:2, from:'عطبرة', to:'بورتسودان', driver:'أحمد الخرطوم', driverPhone:'0911111111', date:'غداً 6:00 ص', price:'40,000 جنيه', seats:30, available:12, car:'بص'},
  {id:3, from:'الخرطوم', to:'عطبرة', driver:'محمد عطبرة', driverPhone:'0912345678', date:'اليوم 4:00 م', price:'25,000 جنيه', seats:14, available:7, car:'هايس'}
];

let bookings = [];

app.get('/api/users', (req,res)=>res.json(users));
app.get('/api/trips', (req,res)=>res.json(trips));
app.get('/api/bookings', (req,res)=>res.json(bookings));

app.post('/api/register', (req,res)=>{
  if(users.find(u=>u.phone==req.body.phone)) return res.json({ok:false, msg:'الرقم مسجل'});
  users.push({...req.body, trips:0, rating:5.0});
  res.json({ok:true});
});

app.post('/api/book', (req,res)=>{
  bookings.push({...req.body, id:Date.now(), status:'مؤكد'});
  let t = trips.find(x=>x.id==req.body.tripId);
  if(t) t.available--;
  res.json({ok:true});
});

app.get('/', (req,res)=>{
res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"><title>رحلات السودان - Rihlat Sudan</title><style>*{font-family:'Tajawal',sans-serif} .hide-scroll::-webkit-scrollbar{display:none}</style></head>
<body class="bg-[#f0f2f5]">
<div class="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl relative pb-20">
<header class="bg-[#0b2a4a] text-white p-5 rounded-b-[28px]">
<div class="flex justify-between items-center"><div><h1 class="text-[24px] font-black leading-none">رحلات السودان</h1><p class="text-[13px] opacity-80 mt-1 tracking-wider">RIHLAT SUDAN 🚌</p></div><div class="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-xl">🇸🇩</div></div>
<div class="mt-5 bg-white rounded-[18px] p-3 flex gap-2"><input id="fromInput" placeholder="من: عطبرة" class="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-black"><input id="toInput" placeholder="إلى: الخرطوم" class="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-black"><button onclick="searchTrips()" class="bg-[#0b2a4a] px-5 rounded-xl text-white">🔍</button></div>
</header>

<div class="p-4">
<div class="grid grid-cols-3 gap-2 mb-6 text-center"><div class="bg-[#e8f5e9] rounded-2xl p-3"><p class="font-black text-[#2e7d32] text-lg">\${users.length}+</p><p class="text-[11px] text-gray-600">مستخدم</p></div><div class="bg-[#e3f2fd] rounded-2xl p-3"><p class="font-black text-[#1565c0] text-lg">\${trips.length}+</p><p class="text-[11px] text-gray-600">رحلة يومياً</p></div><div class="bg-[#fff3e0] rounded-2xl p-3"><p class="font-black text-[#ef6c00] text-lg">24/7</p><p class="text-[11px] text-gray-600">دعم</p></div></div>

<div class="flex gap-2 mb-4 overflow-x-auto hide-scroll"><button onclick="setTab('trips')" id="tabTrips" class="bg-[#0b2a4a] text-white px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap">🚌 الرحلات</button><button onclick="setTab('users')" id="tabUsers" class="bg-gray-100 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap">👥 السائقين</button><button onclick="setTab('my')" id="tabMy" class="bg-gray-100 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap">🎫 حجوزاتي</button></div>

<div id="tripsView"><div id="tripsList" class="space-y-3"></div></div>
<div id="usersView" class="hidden"><div id="usersList" class="space-y-3"></div></div>
<div id="myView" class="hidden"><div id="myList" class="text-center py-16 text-gray-400 text-sm">لا توجد حجوزات<br><span class="text-xs">احجز رحلتك الآن</span></div></div>
</div>

<div id="profileModal" class="fixed inset-0 bg-black/60 hidden z-50 flex items-end justify-center backdrop-blur-sm">
<div class="bg-white w-full max-w-[480px] rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto">
<div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
<div class="text-center">
<div id="pAvatar" class="w-24 h-24 bg-[#0b2a4a] text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-lg">م</div>
<h2 id="pName" class="font-black text-[22px] mt-4">محمد عطبرة</h2>
<p id="pFather" class="text-sm text-gray-500 mt-1">ابن احمد محمد</p>
<div class="flex justify-center gap-2 mt-3"><span id="pState" class="bg-[#e3f2fd] text-[#0b2a4a] px-4 py-1.5 rounded-full text-xs font-bold"></span><span id="pRole" class="bg-[#e8f5e9] text-green-700 px-4 py-1.5 rounded-full text-xs font-bold"></span></div>
<p id="pPhone" class="font-bold mt-3 text-[#0b2a4a] tracking-widest"></p>
<div class="grid grid-cols-3 gap-3 mt-6"><div class="bg-gray-50 rounded-2xl p-3"><p id="pTripCount" class="font-black text-lg">24</p><p class="text-[11px] text-gray-500">رحلة</p></div><div class="bg-gray-50 rounded-2xl p-3"><p class="font-black text-lg">⭐ 4.9</p><p class="text-[11px] text-gray-500">تقييم</p></div><div class="bg-gray-50 rounded-2xl p-3"><p id="pCar" class="font-black text-[12px]">هايس</p><p class="text-[11px] text-gray-500">المركبة</p></div></div>
<div id="pTrips" class="mt-4"></div>
<button id="pChatBtn" class="w-full bg-[#1faa59] text-white rounded-2xl py-4 mt-6 font-black text-[16px] shadow-lg shadow-green-200">💬 مراسلة واتساب</button>
<button onclick="closeProfile()" class="w-full bg-gray-100 rounded-2xl py-4 mt-3 font-bold">إغلاق</button>
</div>
</div>
</div>

<div id="bookModal" class="fixed inset-0 bg-black/60 hidden z-50 flex items-end justify-center"><div class="bg-white w-full max-w-[480px] rounded-t-[32px] p-6"><div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div><h2 class="font-black text-xl">تأكيد الحجز</h2><p id="bookInfo" class="text-sm text-gray-600 mt-2"></p><input id="bookName" placeholder="اسمك الكامل" class="w-full mt-4 bg-gray-100 rounded-xl px-4 py-4 text-sm outline-none"><input id="bookPhone" placeholder="رقم تلفونك" class="w-full mt-3 bg-gray-100 rounded-xl px-4 py-4 text-sm outline-none"><button onclick="confirmBook()" class="w-full bg-[#0b2a4a] text-white rounded-2xl py-4 mt-5 font-black">تأكيد الحجز 🎫</button><button onclick="closeBook()" class="w-full bg-gray-100 rounded-2xl py-4 mt-3 font-bold">إلغاء</button></div></div>

</div>

<script>
let allUsers=[], allTrips=[], myBookings=[], currentBookTrip=null, currentTab='trips';
function closeProfile(){document.getElementById('profileModal').classList.add('hidden');}
function closeBook(){document.getElementById('bookModal').classList.add('hidden');}
function setTab(t){
  currentTab=t;
  document.getElementById('tabTrips').className=t=='trips'?'bg-[#0b2a4a] text-white px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap':'bg-gray-100 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap';
  document.getElementById('tabUsers').className=t=='users'?'bg-[#0b2a4a] text-white px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap':'bg-gray-100 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap';
  document.getElementById('tabMy').className=t=='my'?'bg-[#0b2a4a] text-white px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap':'bg-gray-100 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap';
  document.getElementById('tripsView').classList.toggle('hidden',t!='trips');
  document.getElementById('usersView').classList.toggle('hidden',t!='users');
  document.getElementById('myView').classList.toggle('hidden',t!='my');
}
function searchTrips(){
  let f=document.getElementById('fromInput').value.trim(), tt=document.getElementById('toInput').value.trim();
  if(!f && !tt){renderTrips(allTrips); return;}
  let filtered=allTrips.filter(x=>(!f||x.from.includes(f)) && (!tt||x.to.includes(tt)));
  renderTrips(filtered);
}
function renderTrips(list){
  document.getElementById('tripsList').innerHTML=list.map(t=>\`
  <div class="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
    <div class="flex justify-between items-start"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-[#0b2a4a] text-white rounded-full flex items-center justify-center font-black">\${t.from[0]}\${t.to[0]}</div><div><div class="font-black text-[15px]">\${t.from} → \${t.to}</div><div class="text-xs text-gray-500 mt-0.5">\${t.date} • \${t.car} • \${t.available} مقعد متبقي</div></div></div><div class="text-left"><div class="font-black text-[#0b2a4a] text-[13px]">\${t.price}</div><div class="text-[11px] text-gray-400">للمقعد</div></div></div>
    <div class="flex items-center gap-2 mt-3 bg-gray-50 rounded-xl p-2.5"><div class="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-xs border">\${t.driver[0]}</div><div class="flex-1"><div class="text-xs font-bold">\${t.driver}</div><div class="text-[11px] text-gray-500">\${t.driverPhone}</div></div><button onclick="openProfile('\${t.driverPhone}')" class="text-xs bg-white border px-3 py-1.5 rounded-full">الملف</button></div>
    <button onclick="openBook(\${t.id})" class="w-full mt-3 bg-[#0b2a4a] text-white py-3.5 rounded-xl font-black text-sm">احجز الآن - \${t.available} مقاعد</button>
  </div>\`).join('') || '<p class="text-center py-10 text-gray-400">لا توجد رحلات مطابقة</p>';
}
function renderUsers(){
  document.getElementById('usersList').innerHTML=allUsers.map(u=>\`
  <div onclick="openProfile('\${u.phone}')" class="bg-white border rounded-[20px] p-4 flex gap-3 items-center active:scale-[0.98] transition cursor-pointer"><div class="w-14 h-14 bg-[#0b2a4a] text-white rounded-full flex items-center justify-center font-black text-lg">\${u.dailyName[0]}</div><div class="flex-1"><div class="font-bold text-[15px]">\${u.dailyName}</div><div class="text-xs text-gray-500">\${u.state} • \${u.role}</div><div class="text-xs mt-1">⭐ \${u.rating} • \${u.trips} رحلة • \${u.car||'مسافر'}</div></div><div class="text-gray-300">›</div></div>\`).join('');
}
function openProfile(phone){
  let u=allUsers.find(x=>x.phone==phone); if(!u) return;
  document.getElementById('pAvatar').innerText=u.dailyName[0];
  document.getElementById('pName').innerText=u.dailyName;
  document.getElementById('pFather').innerText='ابن '+u.father;
  document.getElementById('pState').innerText=u.state;
  document.getElementById('pRole').innerText=u.role;
  document.getElementById('pPhone').innerText=u.phone;
  document.getElementById('pTripCount').innerText=u.trips;
  document.getElementById('pCar').innerText=u.car||'مسافر';
  document.getElementById('pChatBtn').onclick=()=>{window.open('https://wa.me/249'+u.phone.slice(1),'_blank');};
  document.getElementById('profileModal').classList.remove('hidden');
}
function openBook(id){
  currentBookTrip=allTrips.find(t=>t.id==id);
  document.getElementById('bookInfo').innerText=currentBookTrip.from+' → '+currentBookTrip.to+' | '+currentBookTrip.price+' | '+currentBookTrip.date;
  document.getElementById('bookModal').classList.remove('hidden');
}
async function confirmBook(){
  let name=document.getElementById('bookName').value, phone=document.getElementById('bookPhone').value;
  if(!name||!phone){alert('اكتب اسمك ورقمك'); return;}
  await fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tripId:currentBookTrip.id, name, phone, trip:currentBookTrip.from+'→'+currentBookTrip.to, price:currentBookTrip.price})});
  myBookings.push({name, trip:currentBookTrip.from+'→'+currentBookTrip.to});
  alert('تم الحجز بنجاح 🎉');
  closeBook(); load();
}
async function load(){
  let ru=await fetch('/api/users'); allUsers=await ru.json();
  let rt=await fetch('/api/trips'); allTrips=await rt.json();
  renderTrips(allTrips); renderUsers();
  let rb=await fetch('/api/bookings'); let b=await rb.json();
  if(b.length){document.getElementById('myList').innerHTML=b.map(x=>'<div class="bg-white border rounded-2xl p-4 text-right mb-2"><b>'+x.trip+'</b><br><span class="text-xs">'+x.name+' - '+x.phone+'</span></div>').join('');}
}
load();
</script>
</body></html>
`);
});

module.exports = app;
