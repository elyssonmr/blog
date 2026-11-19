import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswers, isPassing, isValidAnswers, normalizeName } from "../src/grading.js";

const KEY = [
  { id: "q1", answer: 2 },
  { id: "q2", answer: 3 },
  { id: "q3", answer: 1 },
  { id: "q4", answer: 4 },
];

test("all correct gives full score", () => {
  assert.deepEqual(gradeAnswers(KEY, { q1: 2, q2: 3, q3: 1, q4: 4 }), { total: 4, correct: 4, score: 1 });
});

test("total comes from the answer key, not from the submission", () => {
  const r = gradeAnswers(KEY, { q1: 2 });
  assert.equal(r.total, 4);
  assert.equal(r.score, 0.25);
});

test("unknown question ids are ignored", () => {
  assert.equal(gradeAnswers(KEY, { q1: 2, hack: 1, q99: 3 }).correct, 1);
});

test("pass threshold is inclusive", () => {
  assert.equal(isPassing(0.7, 0.7), true);
  assert.equal(isPassing(0.69, 0.7), false);
});

test("name is trimmed and whitespace collapsed", () => {
  assert.equal(normalizeName("  Maria   da  Silva \n"), "Maria da Silva");
});

test("invalid names are rejected", () => {
  assert.equal(normalizeName("ab"), null);
  assert.equal(normalizeName("x".repeat(81)), null);
  assert.equal(normalizeName(42), null);
  assert.equal(normalizeName(undefined), null);
});

test("answers payload must be an object of id -> positive integer", () => {
  assert.equal(isValidAnswers({ q1: 2, "q-2": 1 }), true);
  assert.equal(isValidAnswers({}), true);
  assert.equal(isValidAnswers([1, 2]), false);
  assert.equal(isValidAnswers(null), false);
  assert.equal(isValidAnswers({ q1: "2" }), false);
  assert.equal(isValidAnswers({ q1: 0 }), false);
  assert.equal(isValidAnswers({ "bad key!": 1 }), false);
});
