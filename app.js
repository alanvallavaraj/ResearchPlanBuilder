const questions = [
  {
    id: "researcherProfile",
    title: "Researcher profile",
    prompt: "Who is this plan for?",
    help: "Pick the closest profile. Add a short note only if the project needs extra context.",
    type: "objective",
    multi: true,
    choices: [
      "New research student",
      "MSc or final-year project",
      "Lecturer-led study",
      "Early-career researcher",
      "Experienced researcher",
      "Industry collaboration",
      "Needs a fast pilot study",
      "Needs journal-level depth",
    ],
    noteLabel: "Optional profile note",
    placeholder: "Example: 12-week MSc Business Computing project with limited data access.",
  },
  {
    id: "domain",
    title: "Domain and topic area",
    prompt: "Choose the broad research area.",
    help: "Select one or more common domains. Add keywords if the exact topic is not listed.",
    type: "objective",
    multi: true,
    choices: [
      "Generative AI in education",
      "Human-AI interaction",
      "AI-assisted research workflows",
      "Computational optimisation",
      "Digital twins and simulation",
      "Healthcare AI",
      "Audio and music technology",
      "Business computing",
      "Cybersecurity or privacy",
      "IoT and smart systems",
    ],
    noteLabel: "Optional keywords or setting",
    placeholder: "Example: assessment feedback, hearing calibration, classroom analytics.",
  },
  {
    id: "problem",
    title: "Problem and gap",
    prompt: "What kind of research gap should it target?",
    help: "Use these objective gap types to avoid long typing at the start.",
    type: "objective",
    multi: true,
    choices: [
      "Existing tools are difficult for beginners",
      "Current methods lack clear evaluation",
      "There is limited evidence in a real-world setting",
      "Users need more interpretable guidance",
      "Manual work is slow or inconsistent",
      "Privacy and ethics are not handled well",
      "Few studies compare GenAI with local methods",
      "The field lacks a practical framework",
    ],
    noteLabel: "Optional specific problem",
    placeholder: "Example: lecturers need structured guidance for turning rough ideas into publishable plans.",
  },
  {
    id: "paperType",
    title: "Paper type",
    prompt: "What kind of paper should this become?",
    help: "Pick the closest contribution type. This shapes the final structure and method.",
    type: "objective",
    multi: false,
    options: [
      "Empirical study",
      "Design science / artefact paper",
      "Computational experiment",
      "Case study",
      "Framework or model paper",
      "Mixed-methods study",
    ],
    choices: [
      "Empirical study",
      "Design science / artefact paper",
      "Computational experiment",
      "Case study",
      "Framework or model paper",
      "Mixed-methods study",
    ],
    noteLabel: "Optional paper-type note",
    placeholder: "Example: build a small tool, then evaluate it with users and expert review.",
  },
  {
    id: "novelty",
    title: "Novel contribution",
    prompt: "Where should the novelty come from?",
    help: "Choose contribution angles that reviewers can recognise.",
    type: "objective",
    multi: true,
    choices: [
      "New guided workflow",
      "New framework or taxonomy",
      "New prototype or tool",
      "New dataset or benchmark",
      "New evaluation protocol",
      "New comparison of GenAI and local execution",
      "New applied case study",
      "New explainability or ethics layer",
    ],
    noteLabel: "Optional novelty detail",
    placeholder: "Example: chained questioning that converts early ideas into experiment-ready protocols.",
  },
  {
    id: "data",
    title: "Data and resources",
    prompt: "What resources can the study use?",
    help: "Select what is feasible. The tool will build a plan around available evidence.",
    type: "objective",
    multi: true,
    choices: [
      "Public datasets",
      "Survey responses",
      "Interviews or focus groups",
      "Expert review",
      "Student or lecturer participants",
      "GitHub repositories or documents",
      "Local Python experiments",
      "GenAI-assisted experiments",
      "Simulation data",
      "No dataset yet",
    ],
    noteLabel: "Optional data note",
    placeholder: "Example: public dataset first, then small expert validation if time allows.",
  },
  {
    id: "method",
    title: "Methodology",
    prompt: "How should the study be evaluated?",
    help: "Select methods that make the paper defensible without requiring a long explanation.",
    type: "objective",
    multi: true,
    choices: [
      "Prototype and evaluate",
      "Compare against a baseline",
      "Run computational experiments",
      "Use qualitative thematic analysis",
      "Use statistical comparison",
      "Measure usability",
      "Measure accuracy or quality",
      "Run ablation or sensitivity testing",
      "Use expert judgement",
      "Report reproducibility artefacts",
    ],
    noteLabel: "Optional method detail",
    placeholder: "Example: compare plan quality before/after tool use with expert scoring.",
  },
  {
    id: "ethics",
    title: "Ethics and risks",
    prompt: "Which risks must be controlled?",
    help: "Select the common risks. These become the ethics and validity section.",
    type: "objective",
    multi: true,
    choices: [
      "Participant consent",
      "Data anonymisation",
      "Prompt privacy",
      "Bias and fairness",
      "Small sample size",
      "Reproducibility",
      "Overclaiming AI capability",
      "Human verification of AI output",
      "Institutional ethics approval",
    ],
    noteLabel: "Optional ethics note",
    placeholder: "Example: avoid using sensitive student data in third-party prompts.",
  },
  {
    id: "target",
    title: "Target and timeline",
    prompt: "What is the target output?",
    help: "Pick the intended publication level and timeframe.",
    type: "objective",
    multi: true,
    choices: [
      "Class project",
      "Workshop paper",
      "Conference paper",
      "Journal article",
      "Short 6-week sprint",
      "12-week student project",
      "3-6 month study",
      "Needs GenAI experiment prompt",
      "Needs local execution plan",
    ],
    noteLabel: "Optional target note",
    placeholder: "Example: conference first, then expand into an Elsevier or ACM journal paper.",
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
  starRepoLink: document.querySelector("#starRepoLink"),
  outputText: document.querySelector("#outputText"),
  copyBtn: document.querySelector("#copyBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
};

const AI_MODEL = "liquid/lfm-2.5-1.2b-instruct:free";
const STAR_PROMPT_KEY = "researchPlanBuilderStarPromptDismissed";
const TOOL_AUTHOR = "Dr Alan Vallavaraj";

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

  elements.starRepoLink.addEventListener("click", () => {
    localStorage.setItem(STAR_PROMPT_KEY, "true");
    elements.starPrompt.hidden = true;
  });
}

function currentQuestion() {
  return questions[state.index];
}

function getAnswer(id) {
  const value = state.answers[id];
  if (!value) return "";
  if (typeof value === "string") return value;

  const choices = Array.isArray(value.choices) ? value.choices : [];
  const note = value.note ? `Details: ${value.note}` : "";
  return [...choices, note].filter(Boolean).join("\n");
}

function setAnswer(id, value) {
  state.answers[id] = value;
  saveAnswers();
}

function getObjectiveRecord(question) {
  const value = state.answers[question.id];
  if (value && typeof value === "object") {
    return {
      choices: Array.isArray(value.choices) ? value.choices : [],
      note: value.note || "",
    };
  }

  return {
    choices: [],
    note: typeof value === "string" ? value : "",
  };
}

function setObjectiveAnswer(question, choices, note) {
  setAnswer(question.id, {
    choices,
    note: note.trim(),
  });
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

  const input =
    question.type === "objective"
      ? renderObjectiveInput(question)
      : renderTextInput(question);

  elements.questionPanel.innerHTML = `
    <div class="field-grid">
      <label for="answerInput">${question.prompt}</label>
      <p class="question-copy">${question.help}</p>
      ${input}
      <p id="validationMessage" class="validation" hidden></p>
    </div>
  `;

  const answerInput = document.querySelector("#answerInput");
  if (question.type === "objective") {
    bindObjectiveInput(question, answerInput);
  } else {
    answerInput.addEventListener("input", (event) => {
      setAnswer(question.id, event.target.value);
      renderProgress();
      renderSuggestions();
    });
  }

  renderSuggestions();
  renderProgress();
}

function renderObjectiveInput(question) {
  const record = getObjectiveRecord(question);
  const selected = new Set(record.choices);
  const modeLabel = question.multi ? "Choose all that apply" : "Choose one";

  return `
    <div>
      <p class="choice-instruction">${modeLabel}</p>
      <div class="choice-grid" role="group" aria-label="${escapeHtml(
        question.prompt,
      )}">
        ${question.choices
          .map((choice, index) => {
            const isSelected = selected.has(choice);
            return `
              <button
                class="choice-chip${isSelected ? " selected" : ""}"
                type="button"
                data-choice-index="${index}"
                aria-pressed="${isSelected}"
              >
                ${escapeHtml(choice)}
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
    <label class="note-label" for="answerInput">${escapeHtml(
      question.noteLabel || "Optional detail",
    )}</label>
    <textarea id="answerInput" class="short-answer" placeholder="${escapeHtml(
      question.placeholder,
    )}">${escapeHtml(record.note)}</textarea>
  `;
}

function renderTextInput(question) {
  const value = getAnswer(question.id);

  if (question.type === "select") {
    return `<select id="answerInput">${question.options
      .map(
        (option) =>
          `<option value="${escapeHtml(option)}" ${
            option === value ? "selected" : ""
          }>${escapeHtml(option)}</option>`,
      )
      .join("")}</select>`;
  }

  return `<textarea id="answerInput" placeholder="${escapeHtml(
    question.placeholder,
  )}">${escapeHtml(value)}</textarea>`;
}

function bindObjectiveInput(question, answerInput) {
  const choiceGrid = document.querySelector(".choice-grid");

  choiceGrid.addEventListener("click", (event) => {
    const chip = event.target.closest(".choice-chip");
    if (!chip) return;

    const record = getObjectiveRecord(question);
    const choice = question.choices[Number(chip.dataset.choiceIndex)];
    const choices = question.multi
      ? toggleChoice(record.choices, choice)
      : [choice];

    setObjectiveAnswer(question, choices, answerInput.value);
    renderQuestion();
  });

  answerInput.addEventListener("input", (event) => {
    const record = getObjectiveRecord(question);
    setObjectiveAnswer(question, record.choices, event.target.value);
    renderProgress();
    renderSuggestions();
  });
}

function toggleChoice(choices, choice) {
  return choices.includes(choice)
    ? choices.filter((item) => item !== choice)
    : [...choices, choice];
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
  if (question.type === "objective") {
    const record = getObjectiveRecord(question);
    setObjectiveAnswer(question, record.choices, next);
  } else {
    setAnswer(question.id, next);
  }
  renderProgress();
  renderSuggestions();
}

async function improveCurrentAnswerWithAi() {
  const question = currentQuestion();
  const input = document.querySelector("#answerInput");
  const current = getAnswer(question.id).trim();

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
    const note = input.value.trim();
    const next = note ? `${note}\n\nAI refinement:\n${suggestion}` : suggestion;

    input.value = next;
    if (question.type === "objective") {
      const record = getObjectiveRecord(question);
      setObjectiveAnswer(question, record.choices, next);
    } else {
      setAnswer(question.id, next);
    }
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

---
Generated with ResearchPlanBuilder by ${TOOL_AUTHOR}.
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
5. Flag ethical, statistical, or feasibility risks before execution.

Tool attribution: ResearchPlanBuilder by ${TOOL_AUTHOR}.`;
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
