import { renderCertificate } from "./certificate.js";
import { gradeAnswers, isPassing, isValidAnswers, normalizeName } from "./grading.js";

/**
 * Routes
 *   POST /quizzes/:quizId/submit        grade answers, issue a certificate when passing
 *   GET  /certificates/:id              certificate PDF (also proves it is genuine)
 *   GET  /certificates/:id/verify       certificate data as JSON
 */
const SUBMIT_ROUTE = /^\/quizzes\/([\w-]{1,64})\/submit$/;
const CERT_ROUTE = /^\/certificates\/([0-9a-f-]{36})(\/verify)?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      let match;
      if (request.method === "POST" && (match = url.pathname.match(SUBMIT_ROUTE))) {
        return await submit(match[1], request, env, url, cors);
      }
      if (request.method === "GET" && (match = url.pathname.match(CERT_ROUTE))) {
        return await certificate(match[1], Boolean(match[2]), env, url, cors);
      }
      return json({ error: "not_found" }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: "internal_error" }, 500, cors);
    }
  },
};

async function submit(quizId, request, env, url, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400, cors);
  }

  const name = normalizeName(body?.name);
  if (!name) return json({ error: "invalid_name" }, 400, cors);
  if (!isValidAnswers(body?.answers)) return json({ error: "invalid_answers" }, 400, cors);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(body?.turnstile, request, env);
    if (!ok) return json({ error: "captcha_failed" }, 403, cors);
  }

  const quiz = await env.DB.prepare("SELECT id, title, min_score FROM quizzes WHERE id = ?")
    .bind(quizId)
    .first();
  if (!quiz) return json({ error: "quiz_not_found" }, 404, cors);

  const { results: questions } = await env.DB.prepare("SELECT id, answer FROM questions WHERE quiz_id = ?")
    .bind(quizId)
    .all();
  if (questions.length === 0) return json({ error: "quiz_without_questions" }, 500, cors);

  // Only the score goes back, never which questions were wrong: it would make guessing trivial.
  const { total, correct, score } = gradeAnswers(questions, body.answers);
  const result = { passed: isPassing(score, quiz.min_score), score, correct, total, minScore: quiz.min_score };
  if (!result.passed) return json(result, 200, cors);

  const certId = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO certificates (id, quiz_id, name, score, issued_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(certId, quizId, name, score, new Date().toISOString())
    .run();

  return json({ ...result, certificateId: certId, certificateUrl: `${url.origin}/certificates/${certId}` }, 201, cors);
}

async function certificate(certId, asJson, env, url, cors) {
  const cert = await env.DB.prepare(
    `SELECT c.id, c.name, c.score, c.issued_at, c.revoked, q.title AS quiz_title
       FROM certificates c JOIN quizzes q ON q.id = c.quiz_id
      WHERE c.id = ?`,
  )
    .bind(certId)
    .first();

  if (!cert || cert.revoked) return json({ valid: false }, 404, cors);

  if (asJson) {
    return json(
      { valid: true, id: cert.id, name: cert.name, quiz: cert.quiz_title, score: cert.score, issuedAt: cert.issued_at },
      200,
      cors,
    );
  }

  const pdf = await renderCertificate({
    id: cert.id,
    name: cert.name,
    quizTitle: cert.quiz_title,
    score: cert.score,
    issuedAt: cert.issued_at,
    blogUrl: env.BLOG_URL,
    verifyUrl: `${url.origin}/certificates/${cert.id}/verify`,
  });

  return new Response(pdf, {
    headers: {
      ...cors,
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificado-${cert.id}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

async function verifyTurnstile(token, request, env) {
  if (typeof token !== "string" || token.length === 0) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = await res.json();
  return data.success === true;
}

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
  const origin = request.headers.get("Origin");
  const headers = { Vary: "Origin" };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function json(data, status, headers) {
  return Response.json(data, { status, headers });
}
