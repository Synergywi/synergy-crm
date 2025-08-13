
// Simple in-memory store for demo. Cold starts reset the data.
let DB = {
  companies: [{"id": "C-001", "name": "Sunrise Mining Pty Ltd", "folders": {"General": []}}, {"id": "C-002", "name": "City of Melbourne", "folders": {"General": []}}, {"id": "C-003", "name": "Queensland Health (Metro North)", "folders": {"General": []}}],
  contacts: [{"id": "ct-alex", "name": "Alex Ng", "email": "alex@synergy.com", "companyId": "C-001", "notes": ""}, {"id": "ct-priya", "name": "Priya Menon", "email": "priya@synergy.com", "companyId": "C-003", "notes": ""}, {"id": "ct-chris", "name": "Chris Rice", "email": "chris@synergy.com", "companyId": "C-002", "notes": ""}]
};

function list(kind){ return DB[kind] || []; }
function get(kind, id){ return (DB[kind]||[]).find(x => String(x.id) === String(id)) || null; }
function save(kind, item){
  DB[kind] = DB[kind] || [];
  if(!item.id){
    item.id = kind.slice(0,2) + "-" + Math.random().toString(36).slice(2,8);
    DB[kind].push(item);
    return item;
  }
  const idx = DB[kind].findIndex(x => String(x.id) === String(item.id));
  if(idx === -1){ DB[kind].push(item); return item; }
  DB[kind][idx] = item; return item;
}
function remove(kind, id){
  DB[kind] = DB[kind] || [];
  const before = DB[kind].length;
  DB[kind] = DB[kind].filter(x => String(x.id) !== String(id));
  return DB[kind].length < before;
}

module.exports = { list, get, save, remove };
