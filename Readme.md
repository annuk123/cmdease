# cmdease 

**Your Offline-First Command Palette for the Terminal**

[![npm version](https://img.shields.io/npm/v/cmdease.svg)](https://www.npmjs.com/package/cmdease)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

##  About

**cmdease** is a powerful offline-first CLI command palette that helps you quickly search, explore, and run commands from your terminal. It syncs from a remote GitHub repository and caches commands locally for offline usage. Perfect for developers who want fast, reliable access to frequently used commands.

---

## 🚀 Features

*  Fuzzy search with autocomplete
*  Favorites & command history
*  Online & Offline support (Convex or Local Cache)
*  Auto-sync with remote GitHub on version change
*  Auto-refresh commands every 30 seconds
*  Lightweight & blazing fast
*  Built-in help and version flags

---

## 📥 Installation

```bash
npm install -g cmdease
```

Or using pnpm:

```bash
pnpm add -g cmdease
```

---

## ⚡️ Usage

### Start Command Palette:

```bash
cmdease
```

### Show CLI Version:

```bash
cmdease --version
```

### Show Help:

```bash
cmdease --help
```

---

## 📚 Example

```bash
? Select a category: git
?  Offline Start typing to search a command: git status
 Running: git status
```

---

## 🔄 Sync & Update

* Automatically pulls the latest commands from GitHub when a new version of the CLI is detected.
* Supports auto-refresh every 30 seconds to keep commands up-to-date.

---

## 🛠 Technologies Used

* Node.js
* Inquirer.js (with autocomplete)
* Axios
* ShellJS
* Convex Database (for syncing history and favorites)
* Fuzzy Search

---

## 🧑‍💻 Author

**Annu Kumari**
[GitHub](https://github.com/annuk123) | [LinkedIn](https://www.linkedin.com/in/annu-kumari-540337237/)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💡 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/annuk123/cmdease/issues).

---

## 🔗 Links

* **NPM:** [https://www.npmjs.com/package/cmdease](https://www.npmjs.com/package/cmdease)
* **GitHub Repository:** [https://github.com/annuk123/cmdease](https://github.com/annuk123/cmdease)

---
