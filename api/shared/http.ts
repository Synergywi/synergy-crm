// api/shared/http.ts

// A tiny framework-agnostic response helper that works in SWA Functions.
// We keep legacy method names so older routes compile unchanged.

export type ResponseLike = {
  json: (body: any, status?: number) => any;
  ok: (body: any) => any;
  created: (body: any) => any;
  badRequest: (msg: string) => any;
  notFound: (msg?: string) => any;
  serverError: (msg?: string) => any;

  // --- legacy aliases (keep routes compiling) ---
  bad: (msg: string) => any;            // alias of badRequest
  notfound: (msg?: string) => any;      // alias of notFound
  servererror: (msg?: string) => any;   // alias of serverError
};

// internal helpers
const asJson = (status: number, body: any) => ({
  status,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const makeOk = (body: any) => asJson(200, body);
const makeCreated = (body: any) => asJson(201, body);
const makeBadReq = (msg: string) => asJson(400, { error: msg });
const makeNotFound = (msg = "Not found") => asJson(404, { error: msg });
const makeServerErr = (msg = "Server error") => asJson(500, { error: msg });

export const http: ResponseLike = {
  json: (body, status = 200) => asJson(status, body),
  ok: makeOk,
  created: makeCreated,
  badRequest: makeBadReq,
  notFound: makeNotFound,
  serverError: makeServerErr,

  // legacy aliases
  bad: makeBadReq,
  notfound: makeNotFound,
  servererror: makeServerErr,
};
