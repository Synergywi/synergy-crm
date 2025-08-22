import type { HttpResponseInit } from "@azure/functions";

type Json =
  | null
  | string
  | number
  | boolean
  | Record<string, any>
  | Array<any>;

const json = (
  status: number,
  body: Json,
  headers: Record<string, string> = {}
): HttpResponseInit => ({
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers },
  jsonBody: body,
});

const ok = (body: Json = { ok: true }): HttpResponseInit => json(200, body);
const created = (body: Json = {}): HttpResponseInit => json(201, body);
const badRequest = (msg: string): HttpResponseInit => json(400, { error: msg });
const notFound = (msg = "Not found"): HttpResponseInit => json(404, { error: msg });
const serverError = (msg = "Internal Server Error"): HttpResponseInit =>
  json(500, { error: msg });

export const http = { json, ok, created, badRequest, notFound, serverError };
export type { HttpResponseInit };
