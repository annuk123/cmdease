# cmdease

**Your Offline-First Command Palette for the Terminal**

[![npm version](https://img.shields.io/npm/v/cmdease.svg)](https://www.npmjs.com/package/cmdease)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

# cmdease – Developer Command Palette CLI

`cmdease` is a fast, interactive **Command Palette CLI** that supercharges your development workflow.

It brings **searchable, categorized, and project-scoped commands** directly into your terminal — just like VS Code’s Command Palette, but for your CLI.

---

## Why cmdease?

Developers often lose time:

* Repeating the same terminal commands.
* Searching for project-specific or complex commands.
* Struggling to remember tool-specific CLIs.

**cmdease solves this.**
It’s a **command launcher for your terminal** — simple, smart, and super productive.

---

## Key Benefits

* **Boost Productivity:** Run categorized commands instantly.
* **Auto-Sync:** Commands sync automatically from GitHub.
* **Offline-First:** Works fully with local cache.
* **Favorites:** Save your frequently used commands.
* **History Tracking:** Quickly re-run past commands.
* **Network Awareness:** Auto-syncs when connection is restored.
* **Project Scoped:** Separate command palettes per project.
* **Customizable:** Manage commands easily via `cmdpalette.json`.

---

##  Installation

Make sure you have **Node.js v22+** installed.

```bash
npm install -g cmdease
```

or

```bash
pnpm add -g cmdease
```

---

##  Quick Start

Just run:

```bash
cmdease
```

Features:

* Select categories
* Fuzzy search commands
* Run commands directly
* Add commands to favorites
* Auto-sync & offline support

👉 No need to initialize anything. Just start using it!

---

## Features

| Feature               | Description                                 |
| --------------------- | ------------------------------------------- |
|  Remote Sync        | Auto-pulls commands from GitHub             |
|  History Tracking   | Saves and suggests previously used commands |
|  Favorites           | Easily mark frequently used commands        |
|  Offline Support    | Fully functional even without internet      |
|  Auto-Refresh       | Commands auto-refresh every 30 seconds      |
|  Network Monitoring | Auto-detects connection and syncs           |
|  Project Scoped    | Separate command palettes for each project  |
|  Customizable       | Easy JSON configuration                     |

---

## Example `cmdpalette.json`

```json
{
  "version": "1.0.0",
  "Build": {
    "Start Dev Server": "npm run dev",
    "Build Project": "npm run build"
  },
  "Git": {
    "Status": "git status",
    "Pull": "git pull"
  }
}
```

 Organize your commands by categories and you’re good to go!

---

##  Command Summary

| Command             | Description               |
| ------------------- | ------------------------- |
| `cmdease`           | Start the interactive CLI |
| `cmdease --help`    | Show help menu            |
| `cmdease --version` | Show CLI version          |

---

##  Save Time, Command with Ease

 **No more memorization.**
 **No more hunting through docs.**
 **Offline-friendly.**
 **Simple to use, powerful in impact.**

**Your terminal should work *with* you, not slow you down.**

---

##  Tech Stack

* Node.js
* Commander.js
* Inquirer (with autocomplete)
* Convex Database
* Axios (remote sync)
* ShellJS (command execution)
* Fuzzy Search

---

##  Offline-First & Reliable

Even without internet, cmdease:

* Works perfectly with local cache.
* Auto-syncs history and favorites when you're back online.

---

## Example

```bash
? Select a category: Git
? Offline - Start typing to search a command: git status
🚀 Running: git status
```
---

## Auto-Sync & Version Updates

* Detects CLI version changes and pulls latest commands.
* Auto-refreshes every 30 seconds for seamless updates.

---

## About the Author

**Annu Kumari**
[GitHub](https://github.com/annuk123) • [LinkedIn](https://www.linkedin.com/in/annu-kumari-540337237/)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

##  Contributing

This is my **first ever CLI project as an indie hacker.** 🎉

I would love to:

* Hear your feedback
* Fix bugs you find
* Add more features you suggest

 **Please raise an issue** if you find any bugs.
 Contributions and feature requests are most welcome!

GitHub Issues: [https://github.com/annuk123/cmdease/issues](https://github.com/annuk123/cmdease/issues)

---

## npm Package

Try it now:

```bash
npx cmdease
```

 **npm:** [https://www.npmjs.com/package/cmdease](https://www.npmjs.com/package/cmdease)
 **GitHub:** [https://github.com/annuk123/cmdease](https://github.com/annuk123/cmdease)

---

##  Final Note

**Stop wasting time. Start commanding with ease.**

Make your terminal as fast and productive as you are. 

---
