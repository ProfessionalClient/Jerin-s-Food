'use strict';
const express = require('express');
const session = require('express-session');
const pg = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && /supabase|render\.com/i.test(process.env.DATABASE_URL)
    ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const menu = [
  {id:'porotta', name:'കേരള പൊറോട്ട', en:'Kerala Porotta', category:'ബ്രെഡ്', price:18, desc:'ഒരു പൊറോട്ട', img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=85'},
  {id:'chapathi', name:'ചപ്പാത്തി', en:'Chapathi', category:'ബ്രെഡ്', price:15, desc:'ഒരു ചപ്പാത്തി', img:'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=700&q=85'},
  {id:'beeffry', name:'ബീഫ് ഫ്രൈ', en:'Kerala Beef Fry', category:'ബീഫ്', price:200, desc:'കേരള സ്റ്റൈൽ മസാല ബീഫ്', img:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=85'},
  {id:'beefroast', name:'ബീഫ് റോസ്റ്റ്', en:'Beef Roast', category:'ബീഫ്', price:190, desc:'മസാല ഗ്രേവിയോടുകൂടി', img:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=85'},
  {id:'beefbiriyani', name:'ബീഫ് ബിരിയാണി', en:'Beef Biriyani', category:'ബിരിയാണി', price:220, desc:'ബീഫ് ബിരിയാണി, അച്ചാർ, സാലഡ്', img:'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=85'},
  {id:'chickenbiriyani', name:'ചിക്കൻ ബിരിയാണി', en:'Chicken Biriyani', category:'ബിരിയാണി', price:190, desc:'ചിക്കൻ ബിരിയാണി, അച്ചാർ, സാലഡ്', img:'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=85'},
  {id:'eggbiriyani', name:'എഗ് ബിരിയാണി', en:'Egg Biriyani', category:'ബിരിയാണി', price:150, desc:'മുട്ട ചേർത്ത ബിരിയാണി', img:'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=85'},
  {id:'chickencurry', name:'നാടൻ ചിക്കൻ കറി', en:'Kerala Chicken Curry', category:'ചിക്കൻ', price:160, desc:'കേരള മസാല ചിക്കൻ കറി', img:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=85'},
  {id:'chickenfry', name:'ചിക്കൻ ഫ്രൈ', en:'Chicken Fry', category:'ചിക്കൻ', price:190, desc:'മസാല മാരിനേറ്റ് ചെയ്ത് ഫ്രൈ ചെയ്തത്', img:'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=85'},
  {id:'chickenfriedrice', name:'ചിക്കൻ ഫ്രൈഡ് റൈസ്', en:'Chicken Fried Rice', category:'റൈസ്', price:170, desc:'ചിക്കൻ, മുട്ട, പച്ചക്കറികൾ', img:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85'},
  {id:'eggfriedrice', name:'എഗ് ഫ്രൈഡ് റൈസ്', en:'Egg Fried Rice', category:'റൈസ്', price:140, desc:'മുട്ടയും പച്ചക്കറികളും', img:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85'},
  {id:'vegfriedrice', name:'വെജ് ഫ്രൈഡ് റൈസ്', en:'Veg Fried Rice', category:'റൈസ്', price:130, desc:'പച്ചക്കറികൾ ചേർത്ത ഫ്രൈഡ് റൈസ്', img:'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85'},
  {id:'meals', name:'കേരള മീൽസ്', en:'Kerala Meals', category:'മീൽസ്', price:130, desc:'ചോറ്, കറികൾ, അച്ചാർ', img:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85'},
  {id:'omelette', name:'ഓംലെറ്റ്', en:'Omelette', category:'സ്നാക്ക്സ്', price:30, desc:'മുട്ട ഓംലെറ്റ്', img:'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=85'},
  {id:'tea', name:'ചായ', en:'Tea', category:'പാനീയങ്ങൾ', price:15, desc:'ചൂട് ചായ', img:'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=700&q=85'},
  {id:'coffee', name:'കാപ്പി', en:'Coffee', category:'പാനീയങ്ങൾ', price:20, desc:'ചൂട് കാപ്പി', img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=85'},
  {id:'lime', name:'ലൈം ജ്യൂസ്', en:'Lime Juice', category:'പാനീയങ്ങൾ', price:30, desc:'നാരങ്ങാ വെള്ളം', img:'https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=700&q=85'},
  {id:'water', name:'മിനറൽ വാട്ടർ', en:'Bottled Water', category:'പാനീയങ്ങൾ', price:20, desc:'ഒരു ബോട്ടിൽ', img:'https://images.unsplash.com/photo-1523362628745-0c100150bca3?auto=format&fit=crop&w=700&q=85'}
];

const sessionSecret = process.env.SESSION_SECRET;
if (!process.env.DATABASE_URL) console.warn('WARNING: DATABASE_URL is missing. Set it in your hosting environment.');
if (!sessionSecret) console.warn('WARNING: SESSION_SECRET is missing. Set a long random secret before public deployment.');
if (!process.env.ADMIN_PASSWORD) console.warn('WARNING: ADMIN_PASSWORD is missing. Admin login will be unavailable.');
app.use(session({
  name: 'jk_admin_session',
  secret: sessionSecret || crypto.randomBytes(48).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 }
}));

async function initDb() {
  if (!process.env.DATABASE_URL) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(40) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seat VARCHAR(40) NOT NULL,
    customer VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(30) NOT NULL DEFAULT '',
    note VARCHAR(500) NOT NULL DEFAULT '',
    items JSONB NOT NULL,
    total INTEGER NOT NULL CHECK (total >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'പുതിയത്'
  )`);
  await pool.query('CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC)');
}
function requireDb(req,res,next){ if(!process.env.DATABASE_URL) return res.status(503).json({error:'ഡാറ്റാബേസ് കണക്ഷൻ സെറ്റ് ചെയ്തിട്ടില്ല. DATABASE_URL ചേർക്കുക.'}); next(); }
function requireAdmin(req,res,next){ if(req.session && req.session.isAdmin) return next(); return res.status(401).json({error:'Admin login ആവശ്യമാണ്.'}); }
function makeCode(){
  const date = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}).replaceAll('-','');
  return `JK-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}
function safeOrder(row){
  return {code:row.code,date:row.created_at,seat:row.seat,customer:row.customer,phone:row.phone,note:row.note,items:row.items,total:row.total,status:row.status};
}
app.get('/health', (req,res)=>res.json({ok:true,service:'Jerinte Kada POS'}));
app.get('/api/menu',(req,res)=>res.json(menu));
app.post('/api/orders', requireDb, async (req,res)=>{
  try {
    const {seat,customer='',phone='',note='',items:requested}=req.body||{};
    const validSeats = ['Table 1','Table 2','Table 3','Table 4','Table 5','Takeaway','Online delivery'];
    if(!validSeats.includes(seat)) return res.status(400).json({error:'ടേബിൾ / ഓർഡർ തരം ശരിയല്ല.'});
    if(!Array.isArray(requested)||!requested.length||requested.length>50) return res.status(400).json({error:'ഓർഡറിൽ ഭക്ഷണങ്ങൾ ചേർക്കുക.'});
    const items=[];
    for(const r of requested){
      const product=menu.find(m=>m.id===String(r.id));
      const qty=Number(r.qty);
      if(!product || !Number.isInteger(qty) || qty<1 || qty>99) return res.status(400).json({error:'ഓർഡറിലെ ഒരു ഭക്ഷണത്തിന്റെ വിവരങ്ങൾ ശരിയല്ല.'});
      items.push({id:product.id,name:product.name,en:product.en,price:product.price,qty,lineTotal:product.price*qty});
    }
    const total=items.reduce((sum,i)=>sum+i.lineTotal,0);
    const clean={customer:String(customer).trim().slice(0,100),phone:String(phone).trim().slice(0,30),note:String(note).trim().slice(0,500)};
    let code, result;
    for(let tries=0;tries<4;tries++){
      code=makeCode();
      try { result=await pool.query('INSERT INTO orders (code,seat,customer,phone,note,items,total) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[code,seat,clean.customer,clean.phone,clean.note,JSON.stringify(items),total]); break; }
      catch(e){if(e.code!=='23505') throw e;}
    }
    if(!result) throw new Error('Could not generate a unique order code');
    res.status(201).json({order:safeOrder(result.rows[0])});
  } catch(e){ console.error('create order:',e); res.status(500).json({error:'ഓർഡർ സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഇന്റർനെറ്റ്/ഡാറ്റാബേസ് പരിശോധിക്കുക.'}); }
});
app.get('/api/orders/:code', requireDb, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM orders WHERE code=$1',[String(req.params.code).trim().toUpperCase()]); if(!r.rowCount) return res.status(404).json({error:'ഈ ഓർഡർ കോഡ് കണ്ടെത്തിയില്ല.'}); res.json({order:safeOrder(r.rows[0])}); }
  catch(e){console.error(e);res.status(500).json({error:'ഓർഡർ കണ്ടെത്താൻ കഴിഞ്ഞില്ല.'});}
});
app.post('/api/admin/login', (req,res)=>{
  const supplied=String((req.body||{}).password||''); const expected=String(process.env.ADMIN_PASSWORD||'');
  if(!expected) return res.status(503).json({error:'ADMIN_PASSWORD hosting settings-ൽ ചേർത്തിട്ടില്ല.'});
  const a=Buffer.from(supplied), b=Buffer.from(expected);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return res.status(401).json({error:'പാസ്‌വേഡ് ശരിയല്ല.'});
  req.session.regenerate(err=>{if(err)return res.status(500).json({error:'Login പരാജയപ്പെട്ടു.'});req.session.isAdmin=true;res.json({ok:true});});
});
app.post('/api/admin/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/admin/me',(req,res)=>res.json({loggedIn:!!(req.session&&req.session.isAdmin)}));
app.get('/api/admin/orders', requireDb, requireAdmin, async (req,res)=>{
  try {const limit=Math.min(Math.max(Number(req.query.limit)||100,1),500);const r=await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1',[limit]);res.json({orders:r.rows.map(safeOrder)});}
  catch(e){console.error(e);res.status(500).json({error:'ഓർഡറുകൾ ലോഡ് ചെയ്യാനായില്ല.'});}
});
app.patch('/api/admin/orders/:code/status', requireDb, requireAdmin, async (req,res)=>{
  const allowed=['പുതിയത്','തയ്യാറാക്കുന്നു','പൂർത്തിയായി','റദ്ദാക്കി']; const status=String((req.body||{}).status||'');
  if(!allowed.includes(status)) return res.status(400).json({error:'Status ശരിയല്ല.'});
  try {const r=await pool.query('UPDATE orders SET status=$1 WHERE code=$2 RETURNING *',[status,String(req.params.code).toUpperCase()]);if(!r.rowCount)return res.status(404).json({error:'ഓർഡർ കണ്ടെത്തിയില്ല.'});res.json({order:safeOrder(r.rows[0])});}
  catch(e){console.error(e);res.status(500).json({error:'Status മാറ്റാനായില്ല.'});}
});
app.use(express.static(path.join(__dirname,'public'),{extensions:['html']}));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

const port=Number(process.env.PORT)||3000;
initDb().then(()=>app.listen(port,'0.0.0.0',()=>console.log(`Jerinte Kada POS listening on ${port}`))).catch(err=>{console.error('Database initialization failed:',err);process.exit(1);});
