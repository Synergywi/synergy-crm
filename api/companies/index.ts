module.exports = async function (context, req) {
  if (req.method === "GET") {
    context.res = {
      status: 200,
      body: [{ id: 1, name: "Synergy Test Company" }]
    };
    return;
  }

  if (req.method === "POST") {
    const body = req.body || {};
    context.res = {
      status: 201,
      body: { id: Date.now(), ...body }
    };
    return;
  }

  context.res = { status: 405, body: { error: "Method not allowed" } };
};
