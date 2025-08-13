import config from "../config.js";
function guid(){return (typeof crypto!=="undefined" && crypto.randomUUID)?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);});}
export default async function (context, req) {
  try{
    const body=req.body||{};
    if(!body.id) body.id=guid();
    body.type="case";
    if(!body.fileNumber || !String(body.fileNumber).trim()){
      context.res={status:400,body:{error:"Case ID (fileNumber) is required"}};return;
    }
    const {resource}=await config.container.items.upsert(body,{disableAutomaticIdGeneration:true});
    context.res={status:200,headers:{"content-type":"application/json"},body:resource};
  }catch(err){
    const status=err.code===409?409:500;
    context.log("cases-upsert error",err);
    context.res={status,body:{error:err.message||String(err)}};
  }
}