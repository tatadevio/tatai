#!/usr/bin/env node
"use strict";

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const os = require("os");

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = "https://www.tatai.cloud";
const CONFIG_PATH = path.join(os.homedir(), ".tatai", "config.json");
const VERSION = "1.0.0";

// ── ANSI colours ─────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  purple: "\x1b[35m",
  brightPurple: "\x1b[95m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const brand = `${c.bold}${c.brightPurple}tatAI${c.reset}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) { process.stdout.write(msg + "\n"); }
function err(msg) { process.stderr.write(`${c.red}✗ ${msg}${c.reset}\n`); }

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch { return {}; }
}

function saveConfig(cfg) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ── File expansion (@path mentions) ──────────────────────────────────────────
function expandFileMentions(text) {
  const mentions = [...text.matchAll(/@([\S]+)/g)];
  let expanded = text;
  const included = [];

  for (const [full, filePath] of mentions) {
    const resolved = path.resolve(process.cwd(), filePath);
    try {
      const stat = fs.statSync(resolved);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(resolved).slice(0, 20).join("\n");
        expanded = expanded.replace(full, "");
        included.push(`\n\`\`\`\n# Directory: ${filePath}\n${files}\n\`\`\``);
      } else {
        const content = fs.readFileSync(resolved, "utf8");
        const lines = content.split("\n").length;
        if (lines > 500) {
          included.push(`\n\`\`\`\n# File: ${filePath} (first 500 lines)\n${content.split("\n").slice(0, 500).join("\n")}\n\`\`\``);
        } else {
          included.push(`\n\`\`\`\n# File: ${filePath}\n${content}\n\`\`\``);
        }
        expanded = expanded.replace(full, `\`${filePath}\``);
      }
    } catch {
      // file not found — leave mention as-is
    }
  }

  return expanded + included.join("\n");
}

// ── Apply code block to file (write suggestion) ───────────────────────────────
function tryApplyEdit(responseText, rl) {
  // Look for ```lang\n# File: path\n...\n``` pattern
  const fileBlock = /```[^\n]*\n# File: ([\S]+)\n([\s\S]*?)```/g;
  const matches = [...responseText.matchAll(fileBlock)];
  if (matches.length === 0) return;

  for (const match of matches) {
    const [, filePath, content] = match;
    const resolved = path.resolve(process.cwd(), filePath);
    process.stdout.write(
      `\n${c.yellow}Apply changes to ${c.bold}${filePath}${c.reset}${c.yellow}? [y/N] ${c.reset}`
    );
    rl.question("", (answer) => {
      if (answer.toLowerCase() === "y") {
        try {
          const dir = path.dirname(resolved);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(resolved, content);
          log(`${c.green}✓ Written: ${filePath}${c.reset}`);
        } catch (e) {
          err(`Could not write ${filePath}: ${e.message}`);
        }
      }
      promptNext(rl);
    });
    return; // handle one at a time
  }
}

// ── Streaming chat request ────────────────────────────────────────────────────
function streamChat(messages, model, apiKey, onChunk, onDone, onError) {
  const body = JSON.stringify({ messages, model, textStream: true });
  const url = new URL(`${API_BASE}/api/chat`);
  const isHttps = url.protocol === "https:";
  const lib = isHttps ? https : http;

  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "User-Agent": `tatAI-CLI/${VERSION}`,
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const req = lib.request(
    {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers,
    },
    (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          try { onError(JSON.parse(body).error ?? `HTTP ${res.statusCode}`); }
          catch { onError(`HTTP ${res.statusCode}`); }
        });
        return;
      }
      res.setEncoding("utf8");
      res.on("data", onChunk);
      res.on("end", onDone);
      res.on("error", (e) => onError(e.message));
    }
  );

  req.on("error", (e) => onError(e.message));
  req.setTimeout(60000, () => { req.destroy(); onError("Request timed out"); });
  req.write(body);
  req.end();
}

// ── Model selection ───────────────────────────────────────────────────────────
const MODELS = [
  { id: "gpt-4o-mini", label: "Flash", desc: "Fast & efficient" },
  { id: "gpt-4o",      label: "Nova",  desc: "Balanced power" },
  { id: "o4-mini",     label: "Ultra", desc: "Most powerful" },
];

// ── Main REPL ─────────────────────────────────────────────────────────────────
let messages = [];
let currentModel = "gpt-4o";
let isStreaming = false;
let rlInstance = null;

function showHelp() {
  log(`
${c.bold}Commands:${c.reset}
  ${c.cyan}/model${c.reset}           Switch AI model
  ${c.cyan}/clear${c.reset}           Clear chat history
  ${c.cyan}/paste${c.reset}           Paste multi-line text (end with ${c.bold}END${c.reset} on its own line)
  ${c.cyan}/read <file>${c.reset}     Read and include a file
  ${c.cyan}/ls [dir]${c.reset}        List directory contents
  ${c.cyan}/login <key>${c.reset}     Save your API key
  ${c.cyan}/help${c.reset}            Show this help
  ${c.cyan}/exit${c.reset}            Quit

${c.bold}Tips:${c.reset}
  • Use ${c.cyan}@path/to/file${c.reset} in your message to include a file
  • Use ${c.cyan}@src/${c.reset} to list a directory
  • tatAI will suggest file writes — you choose whether to apply them
`);
}

function showWelcome() {
  const cwd = process.cwd();
  const model = MODELS.find(m => m.id === currentModel) ?? MODELS[1];
  log(`
  ████████╗ █████╗ ████████╗ █████╗ ██╗
     ██╔══╝██╔══██╗╚══██╔══╝██╔══██╗██║
     ██║   ███████║   ██║   ███████║██║
     ██║   ██╔══██║   ██║   ██╔══██║██║
     ██║   ██║  ██║   ██║   ██║  ██║██║
     ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝

${brand} ${c.gray}v${VERSION}${c.reset}  ·  ${c.dim}Intelligence Unleashed${c.reset}

  ${c.gray}Model:${c.reset} ${c.purple}${model.label}${c.reset} ${c.gray}(${model.desc})${c.reset}
  ${c.gray}Dir:${c.reset}   ${c.dim}${cwd}${c.reset}

  Type ${c.cyan}/help${c.reset} for commands. Press ${c.cyan}Ctrl+C${c.reset} to exit.
`);
}

function prompt(rl) {
  if (isStreaming) return;
  const cfg = loadConfig();
  const keyStatus = cfg.apiKey ? `${c.green}●${c.reset}` : `${c.gray}○${c.reset}`;
  rl.question(`${keyStatus} ${c.bold}${c.brightPurple}You${c.reset} › `, handleInput.bind(null, rl));
}

// alias so tryApplyEdit can call it
function promptNext(rl) { prompt(rl); }

function handleInput(rl, raw) {
  const input = raw.trim();
  if (!input) { prompt(rl); return; }

  // ── Slash commands ──────────────────────────────────────────────────────────
  if (input.startsWith("/")) {
    const [cmd, ...args] = input.slice(1).split(" ");
    switch (cmd.toLowerCase()) {
      case "exit": case "quit":
        log(`\n${brand} ${c.dim}Goodbye!${c.reset}\n`);
        process.exit(0);

      case "clear":
        messages = [];
        process.stdout.write("\x1b[2J\x1b[H");
        showWelcome();
        break;

      case "help": showHelp(); break;

      case "model": {
        log(`\n${c.bold}Available models:${c.reset}`);
        MODELS.forEach((m, i) => {
          const active = m.id === currentModel ? `${c.green}▶ ${c.reset}` : "  ";
          log(`${active}${i + 1}. ${c.purple}${m.label}${c.reset} ${c.gray}${m.desc}${c.reset}`);
        });
        rl.question(`\nSelect (1-${MODELS.length}): `, (ans) => {
          const idx = parseInt(ans) - 1;
          if (idx >= 0 && idx < MODELS.length) {
            currentModel = MODELS[idx].id;
            log(`${c.green}✓ Switched to ${MODELS[idx].label}${c.reset}`);
          }
          prompt(rl);
        });
        return;
      }

      case "login": {
        const key = args.join(" ").trim();
        if (!key) { log(`${c.yellow}Usage: /login <your-api-key>${c.reset}`); break; }
        const cfg = loadConfig();
        cfg.apiKey = key;
        saveConfig(cfg);
        log(`${c.green}✓ API key saved to ${CONFIG_PATH}${c.reset}`);
        break;
      }

      case "read": {
        const filePath = args.join(" ").trim();
        if (!filePath) { log(`${c.yellow}Usage: /read <path>${c.reset}`); break; }
        try {
          const content = fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
          log(`${c.green}✓ Loaded ${filePath} (${content.split("\n").length} lines)${c.reset}`);
          // inject as next user message context
          handleInput(rl, `Here is the file ${filePath}:\n\`\`\`\n${content}\n\`\`\``);
          return;
        } catch (e) {
          err(`Could not read ${filePath}: ${e.message}`);
        }
        break;
      }

      case "ls": {
        const dir = args.join(" ").trim() || ".";
        try {
          const entries = fs.readdirSync(path.resolve(process.cwd(), dir));
          log(`\n${c.dim}${dir}/${c.reset}`);
          entries.forEach(e => {
            const full = path.join(process.cwd(), dir, e);
            const isDir = fs.statSync(full).isDirectory();
            log(`  ${isDir ? c.blue : c.white}${e}${isDir ? "/" : ""}${c.reset}`);
          });
          log("");
        } catch (e) {
          err(e.message);
        }
        break;
      }

      case "paste": {
        log(`${c.dim}Paste your text. Type END on its own line when done.${c.reset}`);
        const lines = [];
        const pasteHandler = (line) => {
          if (line === "END") {
            rl.removeListener("line", pasteHandler);
            handleInput(rl, lines.join("\n"));
          } else {
            lines.push(line);
          }
        };
        rl.on("line", pasteHandler);
        return;
      }

      default:
        log(`${c.yellow}Unknown command: /${cmd}. Type /help for help.${c.reset}`);
    }
    prompt(rl);
    return;
  }

  // ── Regular message ─────────────────────────────────────────────────────────
  const expanded = expandFileMentions(input);
  const cfg = loadConfig();

  const userMsg = {
    id: Date.now().toString(),
    role: "user",
    parts: [{ type: "text", text: expanded }],
    content: expanded,
  };
  messages.push(userMsg);

  isStreaming = true;
  let response = "";
  process.stdout.write(`\n${c.bold}${c.brightPurple}tatAI${c.reset} › `);

  streamChat(
    messages,
    currentModel,
    cfg.apiKey ?? null,
    (chunk) => {
      response += chunk;
      process.stdout.write(chunk);
    },
    () => {
      process.stdout.write("\n\n");
      isStreaming = false;
      messages.push({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        parts: [{ type: "text", text: response }],
        content: response,
      });
      tryApplyEdit(response, rl);
      if (!/```[^\n]*\n# File:/.test(response)) prompt(rl);
    },
    (e) => {
      process.stdout.write("\n");
      err(e);
      isStreaming = false;
      messages.pop(); // remove failed user message
      prompt(rl);
    }
  );
}

// ── One-shot mode (tatai "do something") ─────────────────────────────────────
function oneShot(query) {
  const expanded = expandFileMentions(query);
  const cfg = loadConfig();
  const userMsg = {
    id: "1",
    role: "user",
    parts: [{ type: "text", text: expanded }],
    content: expanded,
  };

  streamChat(
    [userMsg],
    currentModel,
    cfg.apiKey ?? null,
    (chunk) => process.stdout.write(chunk),
    () => { process.stdout.write("\n"); process.exit(0); },
    (e) => { err(e); process.exit(1); }
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  log(`tatAI CLI v${VERSION}`);
  process.exit(0);
}

if (args.length > 0 && !args[0].startsWith("-")) {
  // One-shot: tatai "fix my code"
  oneShot(args.join(" "));
} else {
  // Interactive REPL
  showWelcome();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  rlInstance = rl;
  rl.on("close", () => {
    log(`\n${brand} ${c.dim}Goodbye!${c.reset}\n`);
    process.exit(0);
  });
  prompt(rl);
}
