export const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
export const failure=(error,fallback='Request failed.')=>{console.error(error);return json({error:error?.message||fallback},500);};
