-- Answer key for content/quiz/rabbitmq-fundamentos/index.md
-- Idempotent: safe to run again after editing the answers.
INSERT INTO quizzes (id, title, min_score) VALUES
  ('rabbitmq-fundamentos', 'Fundamentos de Mensageria com RabbitMQ', 0.7)
ON CONFLICT(id) DO UPDATE SET title = excluded.title, min_score = excluded.min_score;

DELETE FROM questions WHERE quiz_id = 'rabbitmq-fundamentos';
INSERT INTO questions (quiz_id, id, answer) VALUES
  ('rabbitmq-fundamentos', 'q1', 2),
  ('rabbitmq-fundamentos', 'q2', 3),
  ('rabbitmq-fundamentos', 'q3', 1),
  ('rabbitmq-fundamentos', 'q4', 4),
  ('rabbitmq-fundamentos', 'q5', 2);
