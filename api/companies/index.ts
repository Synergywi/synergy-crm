module.exports = async function (context, req) {
  if (req.method === "GET") {
    return { status: 200, body: [{ id: 1, name: "Synergy Widgets" }] };
  }
  if (req.method === "POST") {
    const body = req.body || {};
    return { status: 201, body: { id: Date.now(), ...body } };
  }
  return { status: 405, body: { error: "Not allowed" } };
};
