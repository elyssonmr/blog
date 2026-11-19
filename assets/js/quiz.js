/*
 * Sends the quiz answers to the Cloudflare Worker (quiz-worker/) and shows the result.
 * Grading happens on the Worker: this page never knows the correct answers.
 */
(function () {
  "use strict";

  var ERRORS = {
    invalid_name: "Informe um nome entre 3 e 80 caracteres.",
    invalid_answers: "Não foi possível ler suas respostas. Recarregue a página e tente novamente.",
    captcha_failed: "Não conseguimos confirmar que você não é um robô. Tente novamente.",
    quiz_not_found: "Este quiz não está disponível no momento.",
  };
  var GENERIC_ERROR = "Algo deu errado ao enviar suas respostas. Tente novamente em instantes.";

  function percent(score) {
    return Math.round(score * 100) + "%";
  }

  function showResult(box, state, text, link) {
    box.hidden = false;
    box.className = "quiz__result quiz__result--" + state;
    box.textContent = text;
    if (link) {
      var a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Baixar certificado (PDF)";
      box.appendChild(document.createElement("br"));
      box.appendChild(a);
    }
  }

  function collectAnswers(form) {
    var answers = {};
    form.querySelectorAll("[data-question-id]").forEach(function (fieldset) {
      var checked = fieldset.querySelector("input[type=radio]:checked");
      if (checked) answers[fieldset.dataset.questionId] = Number(checked.value);
    });
    return answers;
  }

  function resetCaptcha(form) {
    var widget = form.querySelector(".cf-turnstile");
    if (widget && window.turnstile) window.turnstile.reset(widget);
  }

  function init(form) {
    var button = form.querySelector(".quiz__submit");
    var result = form.querySelector(".quiz__result");
    var endpoint = form.dataset.endpoint.replace(/\/+$/, "");
    var url = endpoint + "/quizzes/" + encodeURIComponent(form.dataset.quizId) + "/submit";

    // Fires only after the browser validated the form (all questions answered, name filled).
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var captcha = form.querySelector('[name="cf-turnstile-response"]');
      var payload = {
        name: form.elements.namedItem("name").value,
        answers: collectAnswers(form),
        turnstile: captcha ? captcha.value : undefined,
      };

      button.disabled = true;
      showResult(result, "pending", "Enviando suas respostas...");

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (r) {
          var data = r.data;
          if (!r.ok) {
            showResult(result, "error", ERRORS[data.error] || GENERIC_ERROR);
          } else if (data.passed) {
            showResult(
              result,
              "passed",
              "Parabéns! Você acertou " + data.correct + " de " + data.total +
                " (" + percent(data.score) + ") e foi aprovado.",
              data.certificateUrl
            );
          } else {
            showResult(
              result,
              "failed",
              "Você acertou " + data.correct + " de " + data.total + " (" + percent(data.score) +
                "). É preciso pelo menos " + percent(data.minScore) +
                " para receber o certificado. Revise os artigos e tente novamente!"
            );
          }
        })
        .catch(function () {
          showResult(result, "error", GENERIC_ERROR);
        })
        .finally(function () {
          button.disabled = false;
          resetCaptcha(form); // Turnstile tokens are single use.
        });
    });
  }

  document.querySelectorAll("form.quiz").forEach(init);
})();
