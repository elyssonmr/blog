-- Quizzes, their answer keys and the certificates issued.
CREATE TABLE quizzes (
  id         TEXT PRIMARY KEY,              -- matches the `id` of the quiz shortcode
  title      TEXT NOT NULL,                 -- printed on the certificate
  min_score  REAL NOT NULL DEFAULT 0.7      -- 0..1
);

CREATE TABLE questions (
  quiz_id    TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  id         TEXT NOT NULL,                 -- matches the `id` of the mcq shortcode
  answer     INTEGER NOT NULL,              -- correct option, 1-based
  PRIMARY KEY (quiz_id, id)
);

CREATE TABLE certificates (
  id         TEXT PRIMARY KEY,              -- UUID, used in the download/verification URL
  quiz_id    TEXT NOT NULL REFERENCES quizzes(id),
  name       TEXT NOT NULL,
  score      REAL NOT NULL,
  issued_at  TEXT NOT NULL,                 -- ISO 8601, UTC
  revoked    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_certificates_quiz ON certificates(quiz_id);
