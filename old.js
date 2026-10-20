const express = require('express');
const app = express();
app.use(express.json());

let users = [
  {phone:'0912345678', dailyName:'محمد عطبرة', father:'احمد', state:'نهر النيل - عطبرة', role:'سائق', password:'123'}
];

app.get('/api/users', (req,res)=>res.json(users));
app.post('/api/register', (req,res)=>{ users.push(req.body); res.json({ok:true}); });
app.post('/api/login', (req,res)=>{
  let u=users.find(x=>x.phone==req.body.phone);
  if(u) res.json({ok:true, user:u}); else res.json({ok:false});
});

app.get('/', (req,res)=>{
res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><title>سفرني</title></head>
<body class="bg-[#f8f9fa] p-4"><div class="max-w-md mx-auto">
<h1 class="text-2xl font-black text-center mb-6">🚌 سفرني - Rihlat Sudan</h1>
<div id="profileModal" class="bg-white rounded-[24px] p-6 shadow border">
<div id="pAvatar" class="w-20 h-20 bg-[#0b2a4a] text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto">م</div>
<h2 id="pName" class="font-black text-center mt-2 text-xl">محمد</h2>
<p id="pFather" class="text-center text-sm text-gray-600"></p>
<p id="pState" class="text-center text-sm"></p>
<p id="pState2" class="hidden"></p>
<p id="pRole" class="text-center text-xs bg-gray-100 rounded-full px-3 py-1 w-fit mx-auto mt-1"></p>
<p id="pPhone" class="text-center text-sm font-bold mt-2"></p>
<p id="pTripCount" class="text-center font-bold mt-3"></p>
<div id="pTrips" class="mt-3"></div>
<button id="pChatBtn" class="w-full bg-green-600 text-white rounded-xl py-3 mt-4 font-bold">مراسلة</button>
<button onclick="closeProfile()" class="w-full bg-gray-200 rounded-xl py-3 mt-2">إغلاق</button>
</div>
<div id="usersList" class="mt-6"></div>
</div>
<script>
function closeProfile(){document.getElementById('profileModal').classList.add('hidden');}
function startChat(name,phone,avatar){alert('مراسلة '+name);}
async function openProfile(phone){
  let res=await fetch('/api/users'); let users=await res.json(); let user=users.find(u=>u.phone==phone);
  document.getElementById('pFather').innerText=user.father;
  document.getElementById('pState').innerText=user.state;
  document.getElementById('pState2').innerText=user.state;
  document.getElementById('pRole').innerText=user.role;
  document.getElementById('pPhone').innerText=user.phone;
  document.getElementById('pTripCount').innerText='الرحلات: 0';
  document.getElementById('pTrips').innerHTML='';
  document.getElementById('pAvatar').innerText=user.dailyName[0];
  document.getElementById('pName').innerText=user.dailyName;
  document.getElementById('profileModal').classList.remove('hidden');
}
async function load(){let r=await fetch('/api/users');let d=await r.json();document.getElementById('usersList').innerHTML=d.map(u=>'<div onclick="openProfile(\\''+u.phone+'\\')" class="bg-white p-4 rounded-xl border mb-2 flex gap-3"><div class="w-12 h-12 bg-[#0b2a4a] text-white rounded-full flex items-center justify-center font-black">'+u.dailyName[0]+'</div><div><div class="font-bold">'+u.dailyName+'</div><div class="text-xs text-gray-500">'+u.state+'</div></div></div>').join('');}
load();
</script>
</body></html>
`);
});

module.exports = app;
