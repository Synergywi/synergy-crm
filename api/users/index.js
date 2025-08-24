// Basic HTTP function compatible with function.json (scriptFile=index.js)
module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = req.params && req.params.id;

  if (method === "GET") {
    // return an empty list or your real data
    context.res = {
      status: 200,
      jsonBody: { ok: true, users: [], id: id || null }
    };
    return;
  }

  // Echo for non-GET to prove it’s wired
  context.res = {
    status: 200,
    jsonBody: {
      ok: true,
      method,
      id: id || null,
      body: req.body || null
    }
  };
};
