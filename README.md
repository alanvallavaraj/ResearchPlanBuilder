# ResearchPlanBuilder

An AI-guided research design tool that turns raw paper ideas into publication-ready research plans, structured outlines, experiment prompts, and strong working titles.

The tool runs entirely in the browser. It can be hosted from any GitHub repository with GitHub Pages, or opened locally by double-clicking `index.html`.

## What It Does

- Asks chained research-planning questions.
- Gives AI-style suggestions at each stage.
- Optionally uses Puter.js AI for live answer refinement and AI-generated final plans.
- Produces a final research title.
- Generates a research aim, research questions, methodology guidance, paper structure, timeline, and a prompt that can be fed into GenAI or a local experiment agent.
- Stores draft answers in browser local storage.
- Exports the final plan as Markdown.

## AI Mode

The app includes an optional Puter.js integration using:

```text
liquid/lfm-2.5-1.2b-instruct:free
```

No secret API key is stored in this repository. The default rule is simple:

- Built-in suggestions work fully offline in the browser.
- AI buttons call Puter.js only when the user clicks them.
- Text entered into the tool may be sent to Puter/Liquid AI when AI mode is used.
- If AI mode is unavailable, the app falls back to the built-in planner.

## Run Locally

Open:

```bash
index.html
```

Or serve the folder locally:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Deploy on GitHub Pages

1. Create a new GitHub repository or copy these files into an existing repository.
2. Commit `index.html`, `styles.css`, `app.js`, and `README.md`.
3. In GitHub, go to **Settings > Pages**.
4. Set the source to the default branch and root folder.
5. Open the GitHub Pages URL once deployment completes.

## Suggested Repository Name

```text
ResearchPlanBuilder
```

## Future Enhancements

- Optional OpenAI API integration for stronger live suggestions.
- Export to DOCX and PDF.
- Lecturer mode for student supervision templates.
- Journal targeting and checklist mode.
- Rubric-based scoring of plan quality.
- Shared class link with preset questions for research methods modules.
