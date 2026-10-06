const questions = [
  {
    id: "researcherProfile",
    title: "Researcher profile",
    prompt: "Who is this plan for, and what is their research maturity?",
    help: "Mention role, field, confidence level, and whether this is for a student project, conference paper, journal paper, or funded study.",
    type: "textarea",
    placeholder:
      "Example: New MSc student in Business Computing; interested in AI-enabled healthcare systems; needs a feasible 12-week empirical project.",
  },
  {
    id: "domain",
    title: "Domain and topic area",
    prompt: "What broad area should the paper sit in?",
    help: "Name the discipline, applied setting, target community, and any keywords you want the paper to connect with.",
    type: "textarea",
    placeholder:
      "Example: Human-AI interaction, educational technology, audio engineering, digital twins, computational optimisation...",
  },
  {
    id: "problem",
    title: "Problem and gap",
    prompt: "What problem should the paper solve or investigate?",
    help: "Focus on a clear pain point, limitation in existing work, or real-world decision that researchers currently struggle with.",
    type: "textarea",
    placeholder:
      "Example: Lecturers can generate lesson analytics, but they lack interpretable guidance for adapting learning activities across mixed-ability cohorts.",
  },
  {
    id: "paperType",
    title: "Paper type",
    prompt: "What kind of contribution should this become?",
    help: "Choose the closest fit. The final plan will adapt its structure and methodology.",
    type: "select",
    options: [
      "Empirical study",
      "Design science / artefact paper",
      "Computational experiment",
      "Case study",
      "Framework or model paper",
      "Mixed-methods study",
    ],
  },
  {
    id: "novelty",
    title: "Novel contribution",
    prompt: "What could make this paper new?",
    help: "Think beyond a generic application of AI. Novelty can be a method combination, dataset, context, evaluation protocol, theory, or deployable artefact.",
    type: "textarea",
    placeholder:
      "Example: A chained-question research planning framework that converts early ideas into structured research protocols and experiment prompts.",
  },
  {
    id: "data",
    title: "Data and resources",
    prompt: "What data, participants, software, devices, or documents can be used?",
    help: "Include what is already available, what can be collected ethically, and what can be simulated locally or with GenAI support.",
    type: "textarea",
    placeholder:
      "Example: Public datasets, lecturer/student interviews, GitHub repos, survey responses, local Python experiments, GenAI-generated protocols...",
  },
  {
    id: "method",
    title: "Methodology",
    prompt: "How should the work be carried out?",
    help: "Mention planned experiments, evaluation metrics, comparison baselines, qualitative coding, statistical tests, or validation steps.",
    type: "textarea",
    placeholder:
      "Example: Build prototype, run scenario-based evaluation with 20 participants, compare plan quality before/after tool use, analyse usability and output quality.",
  },
  {
    id: "ethics",
    title: "Ethics and risks",
    prompt: "What ethical, practical, or validity risks should be handled?",
    help: "Useful papers are clear about bias, consent, reproducibility, data privacy, overclaiming, and limitations.",
    type: "textarea",
    placeholder:
      "Example: Consent for participants, no sensitive data in prompts, avoid claiming AI authorship as research evidence, preregister evaluation criteria.",
  },
  {
    id: "target",
    title: "Target and timeline",
    prompt: "Where could this be submitted, and how much time is available?",
    help: "Mention target venue type, expected quality level, word count, and deadline if known.",
    type: "textarea",
    placeholder:
      "Example: 10-12 week pilot for a conference paper, then expanded journal submission to an HCI, education technology, or applied computing venue.",
  },
];

const state = {
  index: 0,
  answers: loadAnswers(),
};

const elements = {
  progressList: document.querySelector("#progressList"),
  stepCount: document.querySelector("#stepCount"),
  stepTitle: document.querySelector("#stepTitle"),
  questionPanel: document.querySelector("#questionPanel"),
  suggestions: document.querySelector("#suggestions"),
  backBtn: document.querySelector("#backBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  finalBtn: document.querySelector("#finalBtn"),
  useSuggestionBtn: document.querySelector("#useSuggestionBtn"),
  aiSuggestionBtn: document.querySelector("#aiSuggestionBtn"),
  aiFinalBtn: document.querySelector("#aiFinalBtn"),
  aiStatus: document.querySelector("#aiStatus"),
  starPrompt: document.querySelector("#starPrompt"),
  dismissStarPrompt: document.querySelector("#dismissStarPrompt"),
  outputText: document.querySelector("#outputText"),
  copyBtn: document.querySelector("#copyBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
};

const AI_MODEL = "liquid/lfm-2.5-1.2b-instruct:free";
const STAR_PROMPT_KEY = "researchPlanBuilderStarPromptDismissed";

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem("researchPlanBuilder") || "{}");
  } catch {
    return {};
  }
}

function saveAnswers() {
  localStorage.setItem("researchPlanBuilder", JSON.stringify(state.answers));
}

function initialiseStarPrompt() {
  if (localStorage.getItem(STAR_PROMPT_KEY) === "true") {
    elements.starPrompt.hidden = true;
    return;
  }

  elements.dismissStarPrompt.addEventListener("click", () => {
    localStorage.setItem(STAR_PROMPT_KEY, "true");
    elements.starPrompt.hidden = true;
  });
}

function currentQuestion() {
  return questions[state.index];
}

function getAnswer(id) {
  return state.answers[id] || "";
}

function setAnswer(id, value) {
  state.answers[id] = value;
  saveAnswers();
}

function renderProgress() {
  elements.progressList.innerHTML = questions
    .map((question, index) => {
      const isDone = Boolean(getAnswer(question.id).trim());
      const statusClass =
        index === state.index ? "active" : isDone ? "done" : "pending";

      return `
        <li class="progress-item ${statusClass}">
          <span class="progress-index">${index + 1}</span>
          <span>${question.title}</span>
        </li>
      `;
    })
    .join("");
}

function renderQuestion() {
  const question = currentQuestion();
  elements.stepCount.textContent = `Step ${state.index + 1} of ${questions.length}`;
  elements.stepTitle.textContent = question.title;
  elements.backBtn.disabled = state.index === 0;
  elements.nextBtn.textContent =
    state.index === questions.length - 1 ? "Review final plan" : "Next";

  const value = getAnswer(question.id);
  const input =
    question.type === "select"
      ? `<select id="answerInput">${question.options
          .map(
            (option) =>
              `<option value="${escapeHtml(option)}" ${
                option === value ? "selected" : ""
              }>${escapeHtml(option)}</option>`,
          )
          .join("")}</select>`
      : `<textarea id="answerInput" placeholder="${escapeHtml(
          question.placeholder,
        )}">${escapeHtml(value)}</textarea>`;

  elements.questionPanel.innerHTML = `
    <div class="field-grid">
      <label for="answerInput">${question.prompt}</label>
      <p class="question-copy">${question.help}</p>
      ${input}
      <p id="validationMessage" class="validation" hidden></p>
    </div>
  `;

  const answerInput = document.querySelector("#answerInput");
  if (!value && question.type === "select") {
    setAnswer(question.id, answerInput.value);
  }

  answerInput.addEventListener("input", (event) => {
    setAnswer(question.id, event.target.value);
    renderProgress();
    renderSuggestions();
  });

  renderSuggestions();
  renderProgress();
}

function renderSuggestions() {
  const suggestionSet = buildSuggestions();
  elements.suggestions.innerHTML = suggestionSet
    .map((suggestion) => `<div class="suggestion">${escapeHtml(suggestion)}</div>`)
    .join("");
}

function setAiStatus(message, isError = false) {
  elements.aiStatus.textContent = message;
  elements.aiStatus.classList.toggle("error", isError);
}

function isAiAvailable() {
  return Boolean(window.puter?.ai?.chat);
}

function buildSuggestions() {
  const answer = (id) => getAnswer(id).trim();
  const q = currentQuestion();
  const domain = answer("domain") || "your chosen domain";
  const problem = answer("problem") || "the practical research problem";
  const type = answer("paperType") || "Empirical study";

  const suggestionsByStep = {
    researcherProfile: [
      "State the user's role and constraints clearly, because the tool can then scale the final plan for a lecturer, early-career researcher, or new student.",
      "Add the intended paper level: class project, workshop, conference, journal pilot, or full journal article.",
    ],
    domain: [
      `Anchor the topic in ${domain}, then add 3-5 keywords that reviewers would recognise.`,
      "Include one applied setting. Strong papers usually connect the method to a real educational, industrial, clinical, creative, or organisational context.",
    ],
    problem: [
      `Turn the gap into a testable sentence: current approaches struggle to address ${problem} because of a specific limitation.`,
      "A good gap names who is affected, what decision is hard, and why existing studies are insufficient.",
    ],
    paperType: [
      `${type} papers need a visible evaluation route: data, protocol, metrics, and a credible comparison point.`,
      "If the idea includes a tool or framework, decide whether the main contribution is the artefact, its evaluation, or the theory behind it.",
    ],
    novelty: [
      "Frame novelty as one primary contribution and two supporting contributions. This keeps the paper defensible.",
      `For ${domain}, consider novelty through method combination, evaluation design, context, dataset, explainability, or reproducibility.`,
    ],
    data: [
      "Separate what is already available from what must be collected. Reviewers notice feasibility immediately.",
      "Add a fallback route using public data, simulation, or expert judgement in case participant recruitment slows down.",
    ],
    method: [
      "Use a three-part method: design or data preparation, evaluation, then analysis. This makes the plan executable.",
      `For the stated problem, include at least one baseline or alternative approach so the findings are comparative rather than descriptive.`,
    ],
    ethics: [
      "Mention consent, anonymisation, prompt privacy, data retention, and how AI-generated material will be verified by humans.",
      "Add validity threats: small sample size, domain bias, subjective scoring, reproducibility, and overgeneralisation.",
    ],
    target: [
      "Match the ambition to the timeline: conference short paper for a quick study, journal paper for stronger evaluation and literature positioning.",
      "Add deliverables by week: literature framing, prototype/protocol, data collection, analysis, writing, and revision.",
    ],
  };

  return suggestionsByStep[q.id] || [];
}

function appendTopSuggestion() {
  const suggestions = buildSuggestions();
  if (!suggestions.length) return;

  const question = currentQuestion();
  const input = document.querySelector("#answerInput");
  const current = input.value.trim();
  const next = current ? `${current}\n\n${suggestions[0]}` : suggestions[0];

  input.value = next;
  setAnswer(question.id, next);
  renderProgress();
  renderSuggestions();
}

async function improveCurrentAnswerWithAi() {
  const question = currentQuestion();
  const input = document.querySelector("#answerInput");
  const current = input.value.trim();

  if (!isAiAvailable()) {
    setAiStatus("AI mode is unavailable. The built-in suggestions still work.", true);
    return;
  }

  elements.aiSuggestionBtn.disabled = true;
  setAiStatus("Asking AI for a sharper answer...");

  try {
    const response = await puter.ai.chat(
      [
        {
          role: "system",
          content:
            "You are a senior academic research mentor. Give concise, practical research planning help. Do not invent results or claim work has been completed.",
        },
        {
          role: "user",
          content: `Question: ${question.prompt}
Helpful context: ${question.help}
Current answer: ${current || "(blank)"}
Previous answers:
${summariseAnswers()}

Improve this answer for a research paper planning tool. Keep it under 120 words. Be specific and suitable for lecturers, researchers, or new research students.`,
        },
      ],
      { model: AI_MODEL },
    );

    const suggestion = extractAiText(response);
    const next = current
      ? `${current}\n\nAI refinement:\n${suggestion}`
      : suggestion;

    input.value = next;
    setAnswer(question.id, next);
    renderProgress();
    renderSuggestions();
    setAiStatus("AI refinement added. You can edit it before moving on.");
  } catch (error) {
    setAiStatus(
      "AI mode could not respond just now. The offline suggestions are still available.",
      true,
    );
  } finally {
    elements.aiSuggestionBtn.disabled = false;
  }
}

function validateCurrent() {
  const question = currentQuestion();
  const value = getAnswer(question.id).trim();
  const validation = document.querySelector("#validationMessage");

  if (!value) {
    validation.textContent = "Add a short answer before continuing.";
    validation.hidden = false;
    return false;
  }

  validation.hidden = true;
  return true;
}

function nextStep() {
  if (!validateCurrent()) return;

  if (state.index < questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    renderFinalPlan();
  }
}

function previousStep() {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
}

function resetTool() {
  if (!confirm("Clear all answers and start again?")) return;
  state.index = 0;
  state.answers = {};
  saveAnswers();
  elements.outputText.textContent = "Complete the questions to generate a plan.";
  renderQuestion();
}

function renderFinalPlan() {
  const missing = questions.filter((question) => !getAnswer(question.id).trim());
  if (missing.length) {
    state.index = questions.indexOf(missing[0]);
    renderQuestion();
    validateCurrent();
    return;
  }

  elements.outputText.textContent = createMarkdownPlan();
}

async function renderAiFinalPlan() {
  const missing = questions.filter((question) => !getAnswer(question.id).trim());
  if (missing.length) {
    state.index = questions.indexOf(missing[0]);
    renderQuestion();
    validateCurrent();
    return;
  }

  if (!isAiAvailable()) {
    setAiStatus("AI mode is unavailable, so I generated the built-in plan instead.", true);
    renderFinalPlan();
    return;
  }

  elements.aiFinalBtn.disabled = true;
  setAiStatus("Generating an AI-refined final plan...");

  try {
    const deterministicPlan = createMarkdownPlan();
    const response = await puter.ai.chat(
      [
        {
          role: "system",
          content:
            "You are a senior academic research mentor. Create rigorous but feasible research plans. Do not invent findings, datasets, approvals, citations, or completed experiments.",
        },
        {
          role: "user",
          content: `Rewrite and strengthen this research plan as polished Markdown.
Keep the same core idea and user-provided constraints.
Include: title, abstract-style summary, aim, 3-5 research questions, methodology, data/resources, evaluation, paper structure, 12-week plan, risks, and a GenAI/local experiment prompt.

Plan:
${deterministicPlan}`,
        },
      ],
      { model: AI_MODEL },
    );

    elements.outputText.textContent = extractAiText(response);
    setAiStatus("AI final plan generated. Review before using it in any submission.");
  } catch (error) {
    renderFinalPlan();
    setAiStatus(
      "AI mode failed, so I generated the built-in final plan instead.",
      true,
    );
  } finally {
    elements.aiFinalBtn.disabled = false;
  }
}

function createMarkdownPlan() {
  const answer = (id) => getAnswer(id).trim();
  const title = generateTitle();
  const aims = generateAims();
  const researchQuestions = generateResearchQuestions();
  const timeline = generateTimeline();

  return `# ${title}

## Researcher Context
${answer("researcherProfile")}

## Topic Area
${answer("domain")}

## Problem and Research Gap
${answer("problem")}

## Recommended Paper Type
${answer("paperType")}

## Core Contribution
${answer("novelty")}

## Aim
${aims}

## Research Questions
${researchQuestions}

## Data, Materials, and Resources
${answer("data")}

## Methodology
${answer("method")}

## Evaluation Plan
- Define success criteria before experimentation begins.
- Compare the proposed approach against at least one baseline, existing process, or expert judgement.
- Report quantitative metrics where possible and add qualitative interpretation where human judgement is involved.
- Keep a reproducible record of prompts, code, datasets, parameters, and decisions.

## Ethics, Risks, and Validity
${answer("ethics")}

## Suggested Paper Structure
1. Introduction: problem, motivation, gap, contribution.
2. Related Work: position the study against current methods and limitations.
3. Proposed Framework or Study Design: explain the model, tool, workflow, or protocol.
4. Methodology: data, participants, experimental design, measures, and analysis.
5. Results: present evidence clearly with tables, figures, and statistical or thematic analysis.
6. Discussion: interpret findings, compare with literature, and explain implications.
7. Limitations and Ethics: show what the study cannot claim and how risks were handled.
8. Conclusion: summarise contribution and next steps.

## Execution Timeline
${timeline}

## Prompt to Feed into GenAI or a Local Experiment Agent
${generateGenAiPrompt()}
`;
}

function generateTitle() {
  const domain = normalisePhrase(getAnswer("domain")) || "applied research";
  const novelty = normalisePhrase(getAnswer("novelty")) || "structured research planning";
  const paperType = getAnswer("paperType") || "empirical study";

  if (paperType.includes("Design science")) {
    return `A Design Science Framework for ${capitalise(novelty)} in ${capitalise(domain)}`;
  }

  if (paperType.includes("Computational")) {
    return `A Computational Evaluation of ${capitalise(novelty)} for ${capitalise(domain)}`;
  }

  if (paperType.includes("Mixed")) {
    return `A Mixed-Methods Study of ${capitalise(novelty)} in ${capitalise(domain)}`;
  }

  return `${capitalise(novelty)} for ${capitalise(domain)}: ${paperType}`;
}

function generateAims() {
  const problem = getAnswer("problem").trim();
  const novelty = getAnswer("novelty").trim();
  return `This study aims to investigate ${problem} by developing and evaluating ${novelty}.`;
}

function generateResearchQuestions() {
  const problem = getAnswer("problem").trim();
  const novelty = getAnswer("novelty").trim();

  return [
    `1. What limitations in current practice make ${problem} difficult to address?`,
    `2. How can ${novelty} be designed as a feasible research contribution?`,
    "3. How effective, usable, or valid is the proposed approach when evaluated with appropriate data, participants, or simulations?",
    "4. What limitations, risks, and future improvements emerge from the evaluation?",
  ].join("\n");
}

function generateTimeline() {
  const target = getAnswer("target").trim();
  return `Target: ${target}

- Week 1-2: refine scope, research questions, literature map, and evaluation criteria.
- Week 3-4: prepare data, prototype, protocol, instruments, or simulation environment.
- Week 5-7: run experiments, collect responses, or execute case-study protocol.
- Week 8-9: analyse results, generate tables and figures, and test robustness.
- Week 10-11: write full manuscript and align contribution with target venue.
- Week 12: revise, proofread, check references, and prepare submission package.`;
}

function generateGenAiPrompt() {
  const answer = (id) => getAnswer(id).trim();

  return `Use the following research plan to help design executable experiments and a manuscript outline. Do not invent results. Ask for missing details before running analysis.

Researcher profile:
${answer("researcherProfile")}

Domain:
${answer("domain")}

Problem and gap:
${answer("problem")}

Paper type:
${answer("paperType")}

Novel contribution:
${answer("novelty")}

Available data/resources:
${answer("data")}

Proposed methodology:
${answer("method")}

Ethics and validity risks:
${answer("ethics")}

Target and timeline:
${answer("target")}

Tasks:
1. Convert this into a precise experimental protocol.
2. Suggest datasets, baselines, metrics, and analysis methods.
3. Produce a reproducible local execution plan with code modules and outputs.
4. Produce a manuscript structure with section-by-section writing guidance.
5. Flag ethical, statistical, or feasibility risks before execution.`;
}

function summariseAnswers() {
  return questions
    .filter((question) => question.id !== currentQuestion().id)
    .map((question) => `${question.title}: ${getAnswer(question.id) || "(blank)"}`)
    .join("\n");
}

function extractAiText(response) {
  if (typeof response === "string") return response.trim();
  if (response?.text) return String(response.text).trim();
  if (response?.message?.content) return String(response.message.content).trim();
  if (response?.choices?.[0]?.message?.content) {
    return String(response.choices[0].message.content).trim();
  }
  return JSON.stringify(response, null, 2);
}

function downloadMarkdown() {
  const content = elements.outputText.textContent;
  if (!content || content.startsWith("Complete the questions")) return;

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "research-paper-plan.md";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyOutput() {
  await navigator.clipboard.writeText(elements.outputText.textContent);
  elements.copyBtn.textContent = "Copied";
  setTimeout(() => {
    elements.copyBtn.textContent = "Copy";
  }, 1200);
}

function normalisePhrase(value) {
  return value
    .split(/[.\n]/)[0]
    .replace(/\s+/g, " ")
    .replace(/^(a|an|the)\s+/i, "")
    .trim();
}

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.backBtn.addEventListener("click", previousStep);
elements.nextBtn.addEventListener("click", nextStep);
elements.finalBtn.addEventListener("click", renderFinalPlan);
elements.resetBtn.addEventListener("click", resetTool);
elements.useSuggestionBtn.addEventListener("click", appendTopSuggestion);
elements.aiSuggestionBtn.addEventListener("click", improveCurrentAnswerWithAi);
elements.aiFinalBtn.addEventListener("click", renderAiFinalPlan);
elements.downloadBtn.addEventListener("click", downloadMarkdown);
elements.copyBtn.addEventListener("click", copyOutput);

initialiseStarPrompt();
renderQuestion();
