// Classic Node v3 style handler (matches function.json)
module.exports = async function (context, req) {
  const id = (req.params && req.params.id) || null;
  context.res = {
    status: 200,
    headers: { "content-type": "application/json" },
    body: { ok: true, id }
  };
};
