import { Platform } from 'react-native';
export type Product = {id:number;name:string;brand:string;category:string;price:number;oldPrice:number;stock:number;specs:string[];image:string;images?:string[];frames360?:string[];sourceUrl?:string;priceCheckedAt?:string};
export type User = {id:number;name:string;email:string};
export type Order = {id:string;createdAt:string;total:number;status:string;items:{name:string;quantity:number;price:number}[]};
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS==='web'?'http://localhost:3001':'');
export async function api<T>(path:string, method='GET', data?:unknown, token?:string):Promise<T>{
 if(!API_URL)throw Error('Cần đặt EXPO_PUBLIC_API_URL thành địa chỉ API máy tính để dùng trên điện thoại.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{const r=await fetch(API_URL+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:controller.signal});const result=await r.json();if(!r.ok)throw Error(result.error||'Yêu cầu thất bại.');return result;}catch(e){if(e instanceof TypeError||(e as Error).name==='AbortError')throw Error('Không kết nối được máy chủ. Hãy chạy npm run server và kiểm tra địa chỉ API.');throw e;}finally{clearTimeout(timer);}
}
