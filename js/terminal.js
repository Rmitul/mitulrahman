/**
 * NetCLI Interactive Terminal Engine
 * Supports interactive multi-step prompts (e.g. typing 'routing' asks which routing protocol is needed),
 * direct command execution, history navigation (Up/Down), clipboard copy, and navigation to guide.
 */

class NetTerminal {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    
    // Terminal state
    this.history = [];
    this.historyIndex = -1;
    this.currentMode = "NORMAL"; // 'NORMAL', 'ROUTING_PROMPT', 'SWITCHING_PROMPT'
    this.promptText = options.defaultPrompt || "Router#";
    
    this.initDOM();
    this.attachEvents();
    this.printWelcome();
  }

  initDOM() {
    window.netTerminal = this;
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-controls">
            <span class="control-dot dot-close" title="Close"></span>
            <span class="control-dot dot-min" title="Minimize"></span>
            <span class="control-dot dot-max" title="Maximize"></span>
          </div>
          <div class="terminal-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
            <span>Cisco-IOS-Gateway-2960# (Interactive CLI Mode)</span>
          </div>
          <div class="terminal-actions">
            <button class="term-action-btn" id="termClearBtn" title="Clear screen">Clear</button>
            <a href="commands.html" class="term-action-btn" style="color: #38bdf8; text-decoration: none;">📖 Guide Page</a>
          </div>
        </div>
        
        <div class="terminal-body" id="termBody">
          <!-- Terminal logs will be appended here -->
        </div>

        <div class="terminal-footer" style="padding: 0.6rem 1.25rem; background: #0b0f19; border-top: 1px solid rgba(255,255,255,0.06);">
          <div class="terminal-input-row">
            <span class="terminal-prompt" id="termPromptLabel">${this.promptText}</span>
            <input type="text" class="terminal-input" id="termInput" autocomplete="off" spellcheck="false" placeholder="Type command (e.g. routing, vlan, satik, rip, ospf, dns) or 'help'..." />
          </div>
        </div>
      </div>
    `;

    this.bodyEl = this.container.querySelector("#termBody");
    this.inputEl = this.container.querySelector("#termInput");
    this.promptEl = this.container.querySelector("#termPromptLabel");
    this.clearBtn = this.container.querySelector("#termClearBtn");
  }

  attachEvents() {
    this.inputEl.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.clearBtn.addEventListener("click", () => this.clear());
    
    // Click anywhere on terminal body focuses input
    this.container.addEventListener("click", (e) => {
      if (!e.target.closest("button") && !e.target.closest("a")) {
        this.inputEl.focus();
      }
    });
  }

  printWelcome() {
    const welcomeHtml = `
      <div class="term-welcome">
        <div class="ascii-art">
   ____ _ ____ ____ ___     _  _ ____ ___ _  _ ____ ____ _  _ 
   |    | [__  |    |  \\    |\\ | |___  |  | /| |  | |__/ |_/  
   |___ | ___] |___ |__/    | \\| |___  |  |/ | |__| |  \\ | \\_ 
        </div>
        <div style="color: #38bdf8; font-weight: bold; margin-bottom: 0.4rem;">
          ⚡ Cisco Networking CLI Interactive Configuration Engine
        </div>
        <div style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 0.6rem;">
          স্বাগতম! এখানে আপনি সরাসরি কমান্ডের নাম লিখে অথবা ক্যাটাগরি ব্রাউজ করে সিসকো কনফিগারেশন দেখতে পারবেন।
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem;">
          <span style="color: #64748b;">কুইক ট্রাই করুন:</span>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('routing')">🔀 routing</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('vlan')">🏷️ vlan</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('inter-vlan')">🔌 intar vlan</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('satik')">📌 satik</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('ospf')">🚀 ospf</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('dns')">🌍 dns</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('dhcp')">💻 dhcp</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('acl')">🛡️ acl</button>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('help')">❓ help</button>
        </div>
      </div>
    `;
    this.bodyEl.innerHTML = welcomeHtml;
    this.scrollToBottom();
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      const val = this.inputEl.value.trim();
      if (val) {
        this.history.push(val);
        this.historyIndex = this.history.length;
        this.executeInput(val);
      } else {
        this.appendLine(`<span class="prompt-tag">${this.promptText}</span> `);
      }
      this.inputEl.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputEl.value = this.history[this.historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.inputEl.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.inputEl.value = "";
      }
    }
  }

  runCommand(cmdStr) {
    this.inputEl.value = cmdStr;
    this.history.push(cmdStr);
    this.historyIndex = this.history.length;
    this.executeInput(cmdStr);
    this.inputEl.value = "";
    this.inputEl.focus();
  }

  executeInput(rawInput) {
    const input = rawInput.toLowerCase().trim();

    // Echo current command in history
    this.appendEcho(rawInput);

    // Check if we are in an interactive sub-prompt
    if (this.currentMode === "ROUTING_PROMPT") {
      this.handleRoutingPromptChoice(input);
      return;
    }

    // Normal Command Mode
    if (input === "clear" || input === "cls") {
      this.clear();
      return;
    }

    if (input === "help" || input === "?") {
      this.showHelp();
      return;
    }

    if (input === "guide" || input === "page" || input === "cheatsheet") {
      this.appendLine(`
        <div style="color: #38bdf8; padding: 0.5rem 0;">
          📖 Commands Guide পেজে রিডাইরেক্ট করা হচ্ছে... 
          <a href="commands.html" style="color: #4ade80; text-decoration: underline; font-weight: bold;">
            ক্লিক করে এখনি প্রবেশ করুন
          </a>
        </div>
      `);
      setTimeout(() => { window.location.href = "commands.html"; }, 800);
      return;
    }

    // Interactive Trigger: User asks for 'routing' or 'touting' or 'router'
    if (input === "routing" || input === "touting" || input === "route" || input === "router") {
      this.startRoutingPrompt();
      return;
    }

    // Direct lookup in COMMANDS_DATABASE
    const foundKey = this.findCommandKey(input);
    if (foundKey) {
      this.displayCommandData(window.COMMANDS_DATABASE[foundKey]);
      return;
    }

    // If not found
    this.appendLine(`
      <div style="color: #f87171; margin: 0.4rem 0;">
        % Invalid input detected at '^' marker: "<b>${this.escapeHtml(rawInput)}</b>"
      </div>
      <div style="color: #94a3b8; font-size: 0.88rem;">
        উপলব্ধ কমান্ড দেখতে '<b>help</b>' টাইপ করুন, অথবা '<b>routing</b>', '<b>vlan</b>', '<b>satik</b>', '<b>ospf</b>' ট্রাই করুন।
      </div>
    `);
    this.scrollToBottom();
  }

  /**
   * Interactive Prompt: User typed 'routing'
   */
  startRoutingPrompt() {
    this.currentMode = "ROUTING_PROMPT";
    this.promptText = "Router(routing-select)#";
    this.promptEl.textContent = this.promptText;

    let optionsHtml = "";
    window.ROUTING_MENU.forEach((item) => {
      optionsHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.03); margin-bottom: 0.3rem;">
          <div>
            <span style="color: #38bdf8; font-weight: bold;">[${item.key}]</span> 
            <span style="color: #f1f5f9; font-weight: 500;">${item.label}</span>
          </div>
          <button class="tag-btn" onclick="window.netTerminal.runCommand('${item.key}')" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">Select ${item.key}</button>
        </div>
      `;
    });

    const boxHtml = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 1rem; margin: 0.6rem 0;">
        <div style="color: #38bdf8; font-weight: bold; font-size: 1rem; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🔀</span> আপনি কোন রাউটিং দেখতে চান? (Select Routing Protocol)
        </div>
        <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.75rem;">
          নিচের অপশন নম্বর (১-৫) অথবা প্রোটোকলের নাম টাইপ করুন, কিংবা সরাসরি বাটনে ক্লিক করুন:
        </div>
        ${optionsHtml}
        <div style="color: #64748b; font-size: 0.8rem; margin-top: 0.5rem;">
          (ক্যান্সেল করতে 'cancel' বা 'exit' টাইপ করুন)
        </div>
      </div>
    `;

    this.appendLine(boxHtml);
    this.scrollToBottom();
  }

  /**
   * Handle user choice when in ROUTING_PROMPT mode
   */
  handleRoutingPromptChoice(input) {
    if (input === "cancel" || input === "exit" || input === "quit") {
      this.resetPromptMode();
      this.appendLine(`<div style="color: #94a3b8;">রাউটিং সিলেকশন বাতিল করা হয়েছে। ব্যাক টু মেইন প্রম্পট।</div>`);
      this.scrollToBottom();
      return;
    }

    let selectedId = null;

    // Check by number 1-5
    const matchedByNum = window.ROUTING_MENU.find(m => m.key === input);
    if (matchedByNum) {
      selectedId = matchedByNum.id;
    } else {
      // Check by alias/name (e.g. 'satik', 'static', 'ospf', 'rip', 'eigrp', 'dynamic')
      selectedId = this.findCommandKey(input);
    }

    if (selectedId && window.COMMANDS_DATABASE[selectedId]) {
      this.resetPromptMode();
      this.appendLine(`
        <div style="color: #4ade80; font-weight: bold; margin: 0.3rem 0;">
          ✓ নির্বাচিত রাউটিং: ${window.COMMANDS_DATABASE[selectedId].title}
        </div>
      `);
      this.displayCommandData(window.COMMANDS_DATABASE[selectedId]);
    } else {
      this.appendLine(`
        <div style="color: #f87171; margin: 0.3rem 0;">
          অনুগ্রহ করে ১ থেকে ৫ এর মধ্যে সংখ্যা লিখুন (যেমন 1, 2, 3, 4, 5) অথবা 'cancel' লিখুন।
        </div>
      `);
      this.scrollToBottom();
    }
  }

  resetPromptMode() {
    this.currentMode = "NORMAL";
    this.promptText = this.options.defaultPrompt || "Router#";
    this.promptEl.textContent = this.promptText;
  }

  findCommandKey(query) {
    for (const [key, data] of Object.entries(window.COMMANDS_DATABASE)) {
      if (key === query) return key;
      if (data.aliases && data.aliases.includes(query)) return key;
    }
    // Fuzzy check
    for (const [key, data] of Object.entries(window.COMMANDS_DATABASE)) {
      if (data.title.toLowerCase().includes(query)) return key;
    }
    return null;
  }

  displayCommandData(data) {
    let stepsHtml = "";
    data.steps.forEach(s => {
      stepsHtml += `
        <div style="margin-top: 0.8rem;">
          <div style="color: #93c5fd; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.3rem;">
            Step ${s.step}: ${this.escapeHtml(s.title)}
          </div>
          <div class="term-code-block">
            <button class="term-copy-btn" onclick="window.netTerminal.copyCode(this)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <pre>${this.formatCiscoCode(s.code)}</pre>
          </div>
        </div>
      `;
    });

    let verifHtml = "";
    if (data.verification && data.verification.length) {
      verifHtml = `
        <div style="margin-top: 1rem; padding: 0.6rem 0.8rem; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; border-radius: 4px;">
          <div style="color: #34d399; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.4rem;">
            ✓ Verification / টেস্ট করার কমান্ডসমূহ:
          </div>
          <pre style="margin: 0; color: #a7f3d0; font-size: 0.85rem; font-family: var(--font-mono);">${this.escapeHtml(data.verification.join("\n"))}</pre>
        </div>
      `;
    }

    const outputHtml = `
      <div class="term-result">
        <div class="term-result-header">
          <div class="term-result-title">
            <span>${data.icon || '📌'}</span> ${data.title}
          </div>
          <span class="term-result-badge">${data.badge}</span>
        </div>
        <div style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.5rem;">
          ${data.description}
        </div>
        ${stepsHtml}
        ${verifHtml}
        <div style="margin-top: 0.9rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.6rem;">
          <span style="color: #64748b; font-size: 0.8rem;">Category: ${data.categoryTitle || data.category}</span>
          <a href="commands.html#${data.id}" class="term-view-guide-btn">
            📖 চিট শিট পেজে বিস্তারিত দেখুন →
          </a>
        </div>
      </div>
    `;

    this.appendLine(outputHtml);
    this.scrollToBottom();
  }

  showHelp() {
    let helpHtml = `
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 1rem; margin: 0.6rem 0;">
        <div style="color: #38bdf8; font-weight: bold; font-size: 1rem; margin-bottom: 0.6rem;">
          📖 উপলব্ধ কমান্ড ও কি-ওয়ার্ড তালিকা (Available Commands):
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <!-- 1. VLAN & Inter-VLAN -->
          <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.2);">
            <div style="color: #38bdf8; font-weight: 600; margin-bottom: 0.4rem;">🔀 VLAN & Inter-VLAN (একদিকে)</div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('vlan')">vlan</b> - বেসিক VLAN, নাম ও ট্রাঙ্ক পোর্ট<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('inter-vlan')">inter-vlan</b> - Router on a Stick ইন্টার-ভিএলএএন
            </div>
          </div>

          <!-- 2. Routing Protocols -->
          <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2);">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 0.4rem;">🧭 Routing Protocols (অন্য দিকে)</div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('routing')">routing</b> - ইন্টারঅ্যাক্টিভ প্রশ্ন ও সিলেকশন মোড<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('satik')">satik / static</b> - স্ট্যাটিক ও ডিফল্ট রাউট<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('rip')">rip</b> - RIPv2 কনফিগারেশন<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('ospf')">ospf</b> - OSPF এরিয়া ও ওয়াইল্ডকার্ড<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('eigrp')">eigrp</b> - EIGRP AS কনফিগারেশন<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('daynamik')">daynamik / dynamic</b> - ডায়নামিক রাউটিং গাইড
            </div>
          </div>

          <!-- 3. Network Services -->
          <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2);">
            <div style="color: #f59e0b; font-weight: 600; margin-bottom: 0.4rem;">🛡️ Services & Security (ডিএনএস ও সার্ভিস)</div>
            <div style="font-size: 0.85rem; color: #cbd5e1;">
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('dns')">dns</b> - ডোমেইন নেম সার্ভার ও হোস্ট ম্যাপিং<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('dhcp')">dhcp</b> - রাউটার DHCP পুল ও হেল্পার আইপি<br/>
              • <b style="color: #fff; cursor: pointer;" onclick="window.netTerminal.runCommand('acl')">acl</b> - স্ট্যান্ডার্ড ও এক্সটেন্ডেড ফিল্টারিং
            </div>
          </div>
        </div>

        <div style="margin-top: 0.8rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.82rem; color: #94a3b8;">
          অন্যান্য কমান্ড: <b>clear</b> (স্ক্রিন মুছুন), <b>guide</b> (চিট শিট পেজে যান), <b>help</b> (এই মেনু)
        </div>
      </div>
    `;

    this.appendLine(helpHtml);
    this.scrollToBottom();
  }

  appendEcho(cmdText) {
    const entry = document.createElement("div");
    entry.className = "term-history-cmd";
    entry.innerHTML = `<span class="prompt-tag">${this.promptText}</span> <span>${this.escapeHtml(cmdText)}</span>`;
    this.bodyEl.appendChild(entry);
  }

  appendLine(htmlContent) {
    const entry = document.createElement("div");
    entry.className = "term-output-entry";
    entry.innerHTML = htmlContent;
    this.bodyEl.appendChild(entry);
  }

  clear() {
    this.bodyEl.innerHTML = "";
    this.resetPromptMode();
    this.printWelcome();
    this.inputEl.focus();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    }, 10);
  }

  copyCode(btnElement) {
    const pre = btnElement.parentElement.querySelector("pre");
    if (!pre) return;
    const text = pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const origText = btnElement.innerHTML;
      btnElement.innerHTML = `✓ Copied!`;
      btnElement.style.color = "#4ade80";
      setTimeout(() => {
        btnElement.innerHTML = origText;
        btnElement.style.color = "";
      }, 1500);
    });
  }

  formatCiscoCode(code) {
    const lines = code.split("\n");
    return lines.map(line => {
      // Highlight comments starting with !
      if (line.trim().startsWith("!")) {
        return `<span class="term-comment">${this.escapeHtml(line)}</span>`;
      }
      return this.escapeHtml(line);
    }).join("\n");
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global initialization helper
window.initNetTerminal = function(containerId, options = {}) {
  window.netTerminal = new NetTerminal(containerId, options);
  return window.netTerminal;
};
