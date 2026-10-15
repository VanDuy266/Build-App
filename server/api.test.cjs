const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {mkdtempSync,rmSync}=require('node:fs');
const os=require('node:os');const path=require('node:path');
test('registration, authentication, order isolation, pricing and password revocation',async()=>{
 const tmp=mkdtempSync(path.join(os.tmpdir(),'vanduy-test-'));const port=19361;
 const child=spawn(process.execPath,[path.join(__dirname,'index.cjs')],{env:{...process.env,PORT:String(port),DATABASE_PATH:path.join(tmp,'store.db')},stdio:['ignore','pipe','pipe']});
 try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timed out')),10000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code));});});
 const request=async(route,data,token,method)=>{const r=await fetch('http://127.0.0.1:'+port+route,{method:method||(data?'POST':'GET'),headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,...await r.json()};};
 assert.equal((await request('/orders')).status,401);
 assert.equal((await request('/auth/register',{name:'An',email:'an@example.test',password:'short'})).status,400);
 assert.equal((await request('/auth/register',{name:'An',email:'an@example.test',password:'ExamplePass123'})).status,201);
 assert.equal((await request('/auth/register',{name:'An',email:'an@example.test',password:'ExamplePass123'})).status,409);
 assert.equal((await request('/auth/login',{email:'an@example.test',password:'WrongPass123'})).status,401);
 const login=await request('/auth/login',{email:'an@example.test',password:'ExamplePass123'});assert.equal(login.status,200);const token=login.token;
 const products=(await request('/products')).products;
 assert.ok(products.length>0);
 const order=await request('/orders',{name:'An',phone:'0901234567',address:'12 Nguyễn Huệ, TP.HCM',items:[{id:1,quantity:2,price:1}],total:2},token);
 assert.equal(order.status,201);assert.equal(order.order.total,products[0].price*2);
 assert.equal((await request('/orders',undefined,token)).orders.length,1);
 assert.equal((await request('/orders',{name:'An',phone:'0901234567',address:'12 Nguyễn Huệ, TP.HCM',items:[{id:1,quantity:999}]},token)).status,400);
 await request('/auth/register',{name:'Binh',email:'binh@example.test',password:'ExamplePass123'});
 const second=await request('/auth/login',{email:'binh@example.test',password:'ExamplePass123'});
 assert.equal((await request('/orders',undefined,second.token)).orders.length,0);
 assert.equal((await request('/auth/password',{currentPassword:'wrong',password:'NewExample123'},token)).status,400);
 assert.equal((await request('/auth/password',{currentPassword:'ExamplePass123',password:'NewExample123'},token)).status,200);
 assert.equal((await request('/orders',undefined,token)).status,401);
 assert.equal((await request('/auth/login',{email:'an@example.test',password:'ExamplePass123'})).status,401);
 const next=await request('/auth/login',{email:'an@example.test',password:'NewExample123'});assert.equal(next.status,200);
 assert.equal((await request('/orders',undefined,next.token)).orders.length,1);
 assert.equal((await request('/auth/logout',{},next.token)).status,200);
 assert.equal((await request('/orders',undefined,next.token)).status,401);
 const blocked=await fetch('http://127.0.0.1:'+port+'/products',{headers:{Origin:'https://untrusted.example'}});assert.equal(blocked.status,403);
 }finally{child.kill();await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));rmSync(tmp,{recursive:true,force:true});}
});
