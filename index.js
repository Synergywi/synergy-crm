
const store = require('../shared/store');

module.exports = async function (context, req) {
  const id = (req.params && req.params.id) ? String(req.params.id) : null;
  const method = (req.method || 'GET').toUpperCase();
  context.log('contacts API', method, id || '');

  // CORS for Static Web Apps
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' };
  if(method === 'OPTIONS') {
    context.res = { status: 204, headers: cors };
    return;
  }

  try {
    if(method === 'GET') {
      if(id) {
        const item = store.get('contacts', id);
        context.res = { status: item?200:404, headers: cors, body: item || {error:'not found'} };
      } else {
        const list = store.list('contacts');
        context.res = { status: 200, headers: cors, body: list };
      }
      return;
    }
    if(method === 'POST' || method === 'PUT') {
      const body = req.body || {};
      // if PUT with id, enforce it
      if(method === 'PUT' && id) body.id = id;
      const saved = store.save('contacts', body);
      context.res = { status: 200, headers: cors, body: saved };
      return;
    }
    if(method === 'DELETE') {
      if(!id) { context.res = { status: 400, headers: cors, body: {error:'missing id'} }; return; }
      const ok = store.remove('contacts', id);
      context.res = { status: ok?204:404, headers: cors };
      return;
    }

    context.res = { status: 405, headers: cors, body: {error:'method not allowed'} };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, headers: cors, body: {error: String(e.message || e)} };
  }
};
