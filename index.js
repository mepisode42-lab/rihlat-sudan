const express = require('express');
const app = express();
app.use(express.json());
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,x-owner-key');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});
let users=[],trips=[{id:"1",from:"Khartoum",to:"Kassala",office:"Atbara Buses",price:35000,phone:"0900000000",owner:"0900000000"}],chats=[],bookings=[];
const OWNER_KEY="RihlatOwner2026@Sudan";
function norm(p){p=(p||"").toString().replace(/[^0-9]/g,'');if(p.startsWith('249'))p='0'+p.slice(3);if(p.length==9)p='0'+p;return p;}
function maskPhone(p){p=(p||"").toString();return p.length<7?p:p.slice(0,3)+"****"+p.slice(-2);}
app.post('/api/register',(req,res)=>{let {phone,password,name,role,state}=req.body;if(!phone||!password||!name||!state)return res.status(400).json({error:"Missing"});phone=norm(phone);if(users.find(u=>u.phone===phone))return res.status(400).json({error:"Already"});users.push({phone,password,name,role,state});res.json({ok:true,user:{phone,name,role,state}});});
app.post('/api/login',(req,res)=>{let {phone,password}=req.body;phone=norm(phone);let u=users.find(x=>x.phone===phone);if(!u)return res.status(404).json({error:"Not found"});if(u.password!==password)return res.status(401).json({error:"Wrong pass"});res.json({ok:true,user:u});});
app.get('/api/trips',(req,res)=>res.json(trips));
app.post('/api/trips',(req,res)=>{let t={id:Date.now().toString(),owner:req.body.phone,...req.body};trips.unshift(t);res.json(t);});
app.post('/api/book',(req,res)=>{let b={id:Date.now().toString(),commission:Math.floor((req.body.price||0)*0.1),...req.body};bookings.push(b);res.json(b);});
app.get('/api/chats',(req,res)=>{if(req.query.tripId)return res.json(chats.filter(c=>c.tripId===req.query.tripId));res.json(chats);});
app.get('/api/inbox/:phone',(req,res)=>{let p=norm(req.params.phone);let myTrips=trips.filter(t=>t.owner===p).map(t=>t.id);res.json(chats.filter(c=>c.to===p||myTrips.includes(c.tripId)));});
app.post('/api/chats',(req,res)=>{let m={id:Date.now().toString(),...req.body,from:norm(req.body.from),to:norm(req.body.to)};chats.push(m);res.json(m);});
app.get('/',(req,res)=>{res.setHeader('Content-Type','text/html');res.send('<h1 style="text-align:center;padding:50px;font-family:sans-serif">Rihlat Sudan - Working ✅<br><br>Bus Booking Platform<br><br>API: /api/trips<br>Owner: /owner-panel-secret-2026</h1>');});
app.get('/owner-panel-secret-2026',(req,res)=>{res.setHeader('Content-Type','text/html');res.send('<h1>Owner Panel - Profit: '+(bookings.reduce((a,b)=>a+(b.commission||0),0))+' - Users: '+users.length)+'</h1>');});
const PORT=process.env.PORT||3000;
if(process.env.VERCEL!==undefined){} else {app.listen(PORT,()=>console.log('ready'))}
module.exports=app;
