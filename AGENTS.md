# Agent Guide for Wrong Questions Statistics

This repository contains a single-page web application for statistical analysis of classroom wrong questions. It is built using vanilla HTML, CSS, and JavaScript, all contained within `index.html`. This document serves as the primary guide for agentic coding tools operating in this codebase.

## 1. Project Overview

- **Entry Point:** `index.html`
- **Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Data Persistence:** Browser `localStorage`.
- **External Dependencies:** None (Zero-dependency).
- **Environment:** Browser-based (Client-side only).

## 2. Build, Lint, and Test Commands

Since this is a simple static site, there is no complex build pipeline or package manager (no `package.json`).

### Build
No build step is required. The source code is directly executable in any modern web browser.
- **Run:** Open `index.html` in a web browser.
- **Dev Server:** For better local development experience, you may use:
  - `python -m http.server 8000`
  - `npx serve .`
  - Or any static file server.

### Lint
There are no project-specific lint configurations (e.g., `.eslintrc`, `.prettierrc`). Agents must strictly adhere to the following implicit standards to maintain consistency:
- **HTML:** Valid HTML5 structure.
- **CSS:** Standard CSS3, no preprocessors (SASS/LESS).
- **JS:** ES6+ syntax.
- **Verification:** Ensure no syntax errors are introduced.

### Test
There are currently **no automated tests** (Jest, Mocha, etc.) setup in this project.
- **Unit Testing:** There is no test runner.
- **Single Test Execution:** If you need to verify a specific function (e.g., `shuffleArray` or `selectRandomStudents`), it is recommended to:
  1. Create a temporary file (e.g., `test_script.js`).
  2. Copy the function logic there.
  3. Add mock data and assertions.
  4. Run with `node test_script.js`.
  5. Delete the temporary file after verification.
- **Manual Verification:** Agents must logically verify changes.
- **Regression Testing:** Ensure `localStorage` data handling remains intact. Breaking the data structure will result in user data loss.

## 3. Code Style & Conventions

### General
- **Indentation:** 4 spaces (soft tabs).
- **Line Endings:** LF (Unix style) or CRLF (Windows) - match existing file.
- **File Structure:** Keep all code in `index.html` unless explicitly instructed to refactor into separate files.
  - CSS in `<style>` tags within `<head>`.
  - HTML structure in `<body>`.
  - JS in `<script>` tags at the end of `<body>`.

### HTML
- **Attributes:** Use double quotes (e.g., `class="container"`).
- **IDs/Classes:** Use `kebab-case` (e.g., `student-list`, `btn-random`, `problem-matrix`).
- **Semantic Tags:** Use `<header>`, `<button>`, `<label>`, `<section>` where appropriate.
- **Accessibility:** Ensure buttons have text or `aria-labels`.

### CSS
- **Selectors:** Use class selectors over ID selectors for styling where possible.
- **Naming:** `kebab-case` for class names.
- **Layout:** Flexbox and Grid are the preferred layout models.
- **Colors:** Maintain the existing color palette:
  - Primary Blue: `#4b6cb7` to `#182848` (gradients).
  - Accent Orange: `#ff7733`.
  - Background: `#f5f7fa`.
- **Responsiveness:** Use relative units (`rem`, `%`) and flex/grid to adapt to screen sizes.
- **Animations:** Use `@keyframes` for subtle UI feedback (e.g., `fadeIn`, `pulse`).

### JavaScript
- **Variable Declaration:**
  - Use `const` by default.
  - Use `let` only when reassignment is necessary.
  - Avoid `var` entirely.
- **Naming:**
  - Variables/Functions: `camelCase` (e.g., `updateStudentList`, `saveData`).
  - Constants: `UPPER_SNAKE_CASE` (if introducing global config constants).
- **Functions:**
  - Use arrow functions `() => {}` for callbacks and array methods.
  - Use named functions `function name() {}` for top-level logic and event handlers to aid debugging.
- **Semicolons:** Always use semicolons to terminate statements.
- **Quotes:** Single quotes `'` are preferred for strings in JS, unless interpolating with backticks `` ` ``.
- **DOM Access:** Cache DOM elements at the top of the script script (e.g., `const studentList = document.getElementById(...)`).

### Error Handling
- **Input Validation:** Validate all user inputs (e.g., check for empty strings, valid number ranges).
- **Storage Safety:** Wrap `JSON.parse(localStorage.getItem(...))` in try-catch blocks if the schema might have changed, or ensure backward compatibility.
- **User Feedback:** Use `alert()` or custom DOM notifications (preferred) for errors, not just `console.error`.

## 4. Architecture & State Management

### Data Store (`data` object)
The application state is centralized in a global `data` object. **Do not fragment this state.**
```javascript
const data = {
    students: [],           // Array of student names [String]
    problems: {},           // Object mapping problem ID to error count { "1": 5, "2": 1 }
    relatedProblems: {},    // Adjacency list for related problems { "1": [2, 3] }
    calledStudents: []      // History of called students/indices
};
```

### Persistence Strategy
- **Key:** `classroomWrongProblemsData`
- **Mechanism:** `localStorage`
- **Triggers:**
  - Auto-save: Every 30 seconds via `setInterval`.
  - Manual save: On critical actions (`addStudents`, `handleProblemClick`).
- **Safety:** Always ensure `loadData()` can handle missing or partial data structures gracefully.

## 5. Development Workflow for Agents

1.  **Analyze Context:** Before making changes, read the `index.html` file fully to understand the DOM structure and the dependencies between the HTML IDs and the JavaScript variables.
2.  **Plan Modifications:** Identify which parts of the triad (HTML/CSS/JS) need changing. Often a change requires updates to all three.
3.  **Implement:**
    - If adding a feature, add the HTML markup, then the CSS styles, then the JS logic.
    - If fixing a bug, identify the root cause in the JS logic or CSS rules.
4.  **Verify Integrity:**
    - Check if `data` object structure is maintained.
    - Ensure `saveData` is called at appropriate times.
    - Ensure event listeners are attached correctly (check `addEventListeners` function).
5.  **Clean Code:** Remove any console logs used for debugging before finalizing.

## 6. Specific Feature Rules

- **Student Grouping:** The current logic (Lines ~970) groups students by index (0-14, 15-39, 40+). Respect this logic if modifying the `selectRandomStudents` function.
- **Heatmap Visualization:** The `heat-x` classes (`heat-0` to `heat-4-plus`) are driven by `updateProblemHeatStyle`. Ensure this visual consistency is maintained.
- **Performance:** For large lists of students or problems, ensure DOM manipulation is efficient (e.g., building fragments before appending).

---
*Generated by opencode for the Wrong Questions Statistics project.*
