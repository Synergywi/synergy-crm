// api/shared/http.ts

// Minimal response shape the SWA Functions runtime understands
export type ResponseLike = {
  status?: number;
  headers?: Record<string, string>;
  jsonBody?: any;
  body?: any;
};

// Overloads: json(body) or json(status, body)
export function json(body: any): ResponseLike;
export function json(status: number, body: any): ResponseLike;
export function json(a: any, b?: any): ResponseLike {
  if (b === undefined) {
    return { status: 200, headers: { "content-type": "application/json" }, jsonBody: a };
  }
  return { status: a, headers: { "content-type": "application/json" }, jsonBody: b };
}

export const http = {
  json,
  ok: (body: any = { ok: true }): ResponseLike =>
    ({ status: 200, headers: { "content-type": "application/json" }, jsonBody: body }),
  created: (body: any = {}): ResponseLike =>
    ({ status: 201, headers: { "content-type": "application/json" }, jsonBody: body }),
  badRequest: (msg: string): ResponseLike =>
    ({ status: 400, headers: { "content-type": "application/json" }, jsonBody: { error: msg } }),
  notFound: (msg = "Not found"): ResponseLike =>
    ({ status: 404, headers: { "content-type": "application/json" }, jsonBody: { error: msg } }),
  serverError: (msg = "Internal Server Error"): ResponseLike =>
    ({ status: 500, headers: { "content-type": "application/json" }, jsonBody: { error: msg } }),
};
