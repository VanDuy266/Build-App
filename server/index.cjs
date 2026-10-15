const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'store.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, hash TEXT NOT NULL); CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, details TEXT NOT NULL, created_at TEXT NOT NULL);`);
const sessions = new Map();
const attempts = new Map();
const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081,http://localhost:8080,http://127.0.0.1:8080').split(',');
const hashPassword = (password) => { const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex'); };
const verify = (password, hash) => {const [salt,key]=hash.split(':');return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(password,salt,64));};
const products = [
 {id:1,name:'Xe máy điện — mẫu minh họa A',brand:'Đức Tú',category:'Xe máy điện',price:15900000,oldPrice:17900000,stock:12,specs:['Giá thử nghiệm','Chờ thông số thực tế','Chờ ảnh từ cửa hàng'],image:''},
 {id:2,name:'Xe máy điện — mẫu minh họa B',brand:'Đức Tú',category:'Xe máy điện',price:18900000,oldPrice:20900000,stock:8,specs:['Giá thử nghiệm','Chờ thông số thực tế','Chờ ảnh từ cửa hàng'],image:''},
 {id:3,name:'Xe đạp điện — mẫu minh họa A',brand:'Đức Tú',category:'Xe đạp điện',price:9900000,oldPrice:10900000,stock:6,specs:['Giá thử nghiệm','Chờ thông số thực tế','Chờ ảnh từ cửa hàng'],image:''},
 {id:4,name:'Xe đạp điện — mẫu minh họa B',brand:'Đức Tú',category:'Xe đạp điện',price:11900000,oldPrice:12900000,stock:10,specs:['Giá thử nghiệm','Chờ thông số thực tế','Chờ ảnh từ cửa hàng'],image:''}
];
function fail(status,message){const e=new Error(message);e.status=status;throw e;}
function userFor(req){const token=(req.headers.authorization||'').replace(/^Bearer /,'');const session=sessions.get(token);if(!session||session.expires<Date.now()){sessions.delete(token);fail(401,'Vui lòng đăng nhập lại.');}return {...session,token};}
function publicUser(id){return db.prepare('SELECT id,name,email FROM users WHERE id=?').get(id);}
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>20000)fail(413,'Dữ liệu quá lớn.');}try{return JSON.parse(data||'{}')}catch{fail(400,'Dữ liệu không hợp lệ.')}}
const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin;
 if(origin&&!origins.includes(origin)){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Origin không được phép.'}));return;}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 const send=(value,status=200)=>{res.writeHead(status);res.end(JSON.stringify(value));};
 try{
 const route=req.url.split('?')[0];
 if(route==='/health'&&req.method==='GET')return send({ok:true});
 if(route==='/products'&&req.method==='GET')return send({products});
 if(req.method==='POST'&&['/auth/login','/auth/register','/auth/password'].includes(route)){
 const key=req.socket.remoteAddress;const now=Date.now();const previous=attempts.get(key);const entry=previous&&previous.until>now?previous:{count:0,until:now+60000};entry.count++;attempts.set(key,entry);if(entry.count>20)fail(429,'Thử lại sau một phút.');
 }
 if(route==='/auth/register'&&req.method==='POST'){
 const b=await body(req);if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>80||typeof b.email!=='string'||!/^\S+@\S+\.\S+$/.test(b.email)||b.email.length>254||typeof b.password!=='string'||b.password.length<8||b.password.length>128)fail(400,'Nhập tên, email hợp lệ và mật khẩu từ 8 đến 128 ký tự.');
 const email=b.email.trim().toLowerCase();if(db.prepare('SELECT id FROM users WHERE email=?').get(email))fail(409,'Email đã được sử dụng.');
 const result=db.prepare('INSERT INTO users(name,email,hash) VALUES(?,?,?)').run(b.name.trim(),email,hashPassword(b.password));return send({user:publicUser(Number(result.lastInsertRowid))},201);
 }
 if(route==='/auth/login'&&req.method==='POST'){
 const b=await body(req);if(typeof b.email!=='string'||typeof b.password!=='string'||b.password.length>128)fail(400,'Thông tin không hợp lệ.');const u=db.prepare('SELECT * FROM users WHERE email=?').get(b.email.trim().toLowerCase());const valid=verify(b.password,u?u.hash:dummyHash);if(!u||!valid)fail(401,'Email hoặc mật khẩu không đúng.');const token=randomBytes(32).toString('hex');sessions.set(token,{id:u.id,expires:Date.now()+24*60*60*1000});return send({token,user:publicUser(u.id)});
 }
 if(route==='/auth/logout'&&req.method==='POST'){const u=userFor(req);sessions.delete(u.token);return send({ok:true});}
 if(route==='/auth/password'&&req.method==='POST'){
 const u=userFor(req),b=await body(req);if(typeof b.currentPassword!=='string'||b.currentPassword.length>128||typeof b.password!=='string'||b.password.length<8||b.password.length>128)fail(400,'Mật khẩu mới cần từ 8 đến 128 ký tự.');const stored=db.prepare('SELECT hash FROM users WHERE id=?').get(u.id);if(!verify(b.currentPassword,stored.hash))fail(400,'Mật khẩu hiện tại không đúng.');db.prepare('UPDATE users SET hash=? WHERE id=?').run(hashPassword(b.password),u.id);for(const [token,s] of sessions)if(s.id===u.id)sessions.delete(token);return send({ok:true});
 }
 if(route==='/orders'&&req.method==='GET'){const u=userFor(req);return send({orders:db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(u.id).map(o=>({id:o.id,createdAt:o.created_at,...JSON.parse(o.details)}))});}
 if(route==='/orders'&&req.method==='POST'){
 const u=userFor(req),b=await body(req);if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.address!=='string'||b.address.trim().length<8||b.address.length>500||typeof b.phone!=='string'||!/^(0|\+84)\d{9,10}$/.test(b.phone)||!Array.isArray(b.items)||b.items.length===0||b.items.length>20)fail(400,'Kiểm tra tên, số điện thoại, địa chỉ và giỏ hàng.');
 const seen=new Set();const items=b.items.map(i=>{const p=products.find(p=>p.id===i.id);if(!p||seen.has(i.id)||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>p.stock)fail(400,'Sản phẩm hoặc số lượng không hợp lệ.');seen.add(i.id);return {id:p.id,name:p.name,quantity:i.quantity,price:p.price};});
 const details={name:b.name.trim(),phone:b.phone,address:b.address.trim(),items,total:items.reduce((a,i)=>a+i.price*i.quantity,0),status:'Đơn thử nghiệm',payment:'COD mô phỏng'};const id='VD'+randomBytes(6).toString('hex').toUpperCase();const createdAt=new Date().toISOString();db.prepare('INSERT INTO orders VALUES(?,?,?,?)').run(id,u.id,JSON.stringify(details),createdAt);return send({order:{id,createdAt,...details}},201);
 }
 fail(404,'Không tìm thấy chức năng.');
 }catch(e){if(!e.status)console.error('Server error:',e.message);send({error:e.status?e.message:'Máy chủ gặp lỗi.'},e.status||500);}
});
const dummyHash=hashPassword(randomBytes(32).toString('hex'));
const cleanup=setInterval(()=>{const now=Date.now();for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);},60000);cleanup.unref();
server.listen(Number(process.env.PORT||3001),process.env.HOST||'127.0.0.1',()=>console.log('VanDuy API ready on port '+(process.env.PORT||3001)));
