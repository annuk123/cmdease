# cmdease 

**Your Offline-First Command Palette for the Terminal**

[![npm version](https://img.shields.io/npm/v/cmdease.svg)](https://www.npmjs.com/package/cmdease)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

#  cmdease – Developer Command Palette CLI

`cmdease` is an advanced, interactive **Command Palette CLI** built to supercharge your development workflow.
It brings the power of centralized, categorized, and searchable commands right into your terminal, reducing the need to remember or search for commands across multiple project files, scripts, or documentation.

---

## ✨ Why cmdease?

Developers often waste precious minutes:

* Repeating commonly used terminal commands.
* Searching complex project-specific CLI commands.
* Manually syncing or organizing frequently used commands.

**`cmdease` solves this.**
It acts like a command launcher in your terminal — just like VS Code's Command Palette, but for your CLI.

###  Key Benefits:

*  **Boosts Productivity:** Run categorized project commands instantly.
*  **Auto-Sync:** Always get the latest commands synced from GitHub.
*  **Offline Support:** Full local cache for seamless offline usage.
*  **Favorites:** Mark and quickly access frequently used commands.
*  **History Tracking:** Easily find and re-run previously used commands.
*  **Network Awareness:** Smartly syncs when the connection is restored.
*  **Project Scoped:** Customizable per project with a simple `cmdpalette.json` file.

---

##  Installation

Make sure you have **Node.js v22+** installed.

```bash
npm install -g cmdease
```

Or with `pnpm`:

```bash
pnpm add -g cmdease
```

---

##  Quick Start

### 1. Initialize in your project:

```bash
cmdease init
```

This will create a `.cmdpalette.json` in your project root to store your command list.

---

### 2. Start the CLI:

```bash
cmdease
```

This launches the interactive Command Palette CLI where you can:

* Browse command categories
* Fuzzy search commands
* Run commands directly from the terminal
* Favorite commands for faster future access

---

##  Features

| Feature              | Description                                  |
| -------------------- | -------------------------------------------- |
|  Remote Sync       | Auto-pulls commands from GitHub periodically |
|  History Tracking  | Saves and suggests previously used commands  |
|  Favorites         | Add/remove frequently used commands          |
|  Offline Support    | Fully functional with local cache            |
|  Auto-Refresh      | Auto-syncs commands every 30 seconds         |
|  Network Monitoring | Auto-detects connection changes and syncs    |
|  Project Scoped    | Separate command palettes for each project   |
|  Customizable     | Easy JSON configuration (`cmdpalette.json`)  |

---

## 📝 Configuration Example (`cmdpalette.json`)

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

➡️ Just organize your commands by categories and you’re ready to go!

---

## 🚦 Command Summary

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `cmdease init`      | Initialize the CLI in your project |
| `cmdease`           | Start the interactive CLI          |
| `cmdease --help`    | Show help menu                     |
| `cmdease --version` | Show CLI version                   |

---

##  How cmdease Saves You Time

* **Forget memorization:** Search and run your commands instantly.
* **No more docs hunting:** Everything you need is inside your terminal.
* **Cross-project friendly:** Each project has its own command palette.
* **Works offline:** Travel with your CLI anywhere, even without internet.
* **Zero learning curve:** Simple interface, powerful results.

---

##  Tech Stack

* Node.js
* Commander.js
* Inquirer (with autocomplete)
* Convex Database (for sync/history)
* Axios (remote sync)
* ShellJS (command execution)
* Fuzzy Search

---

## 🔒 Offline-First & Reliable

Even if you lose internet connection, your CLI:

* Still works perfectly using the local cache.
* Auto-syncs history and favorites when back online.


---

##  Example

```bash
? Select a category: git
?  Offline Start typing to search a command: git status
 Running: git status
```


## 🔄 Sync & Update

* Automatically pulls the latest commands from GitHub when a new version of the CLI is detected.
* Supports auto-refresh every 30 seconds to keep commands up-to-date.

---

## 🧑‍💻 Author

**Annu Kumari**
[GitHub](https://github.com/annuk123) | [LinkedIn](https://www.linkedin.com/in/annu-kumari-540337237/)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

##  Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/annuk123/cmdease/issues).

---

##  Links

* **NPM:** [https://www.npmjs.com/package/cmdease](https://www.npmjs.com/package/cmdease)
* **GitHub Repository:** [https://github.com/annuk123/cmdease](https://github.com/annuk123/cmdease)

---


##  Final Note

`cmdease` is designed to make your terminal feel like a supercharged command launcher.

**Stop wasting time. Start commanding with ease. **