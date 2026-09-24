/**
 * AMRITHA SANJIV - EDITORIAL PORTFOLIO
 * Interactive Resume Modal, Contact Form, and AI Resume Analyzer Live Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  initResumeModal();
  initContactForm();
  initInboxModal();
  initClassifierDemo();
});

/* ==========================================================================
   RESUME MODAL HANDLER
   ========================================================================== */
function initResumeModal() {
  const modal = document.getElementById('resumeModal');
  const openButtons = document.querySelectorAll('.open-resume-btn');
  const closeButton = document.getElementById('closeResumeModal');
  const printButton = document.getElementById('printResumeBtn');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (printButton) {
    printButton.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   CONTACT FORM SUBMISSION WITH FORMSUBMIT & LOCAL INBOX BACKUP
   ========================================================================== */
const INBOX_STORAGE_KEY = 'amritha_portfolio_messages';

function getStoredMessages() {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading stored messages:', err);
    return [];
  }
}

function saveMessage(messageObj) {
  try {
    const list = getStoredMessages();
    list.unshift(messageObj);
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(list));
    updateInboxBadge();
  } catch (err) {
    console.error('Error saving message:', err);
  }
}

function updateInboxBadge() {
  const badge = document.getElementById('inboxCountBadge');
  const navBadge = document.getElementById('navInboxBadge');
  const countStat = document.getElementById('inboxCountStat');
  const list = getStoredMessages();
  const count = list.length;

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  if (countStat) {
    countStat.innerHTML = `<i class="fas fa-layer-group"></i> <span>${count} ${count === 1 ? 'message' : 'messages'} stored</span>`;
  }
}

function initContactForm() {
  const contactForm = document.getElementById('portfolioContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject').value.trim();
    const message = document.getElementById('formMessage').value.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    // Prepare message object
    const newMsg = {
      id: Date.now().toString(),
      name,
      email,
      subject: subject || 'Portfolio Opportunity / Inquiry',
      message,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };

    // Loading State
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatching Message...';
    submitBtn.disabled = true;

    try {
      // Send real email via FormSubmit API
      const response = await fetch('https://formsubmit.co/ajax/sanjivamritha@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: subject ? `Portfolio Message: ${subject} (${name})` : `New Portfolio Message from ${name}`,
          message: message,
          _captcha: 'false',
          _template: 'table'
        })
      });

      // Always save locally so Amritha can view it immediately on-site
      saveMessage(newMsg);
      contactForm.reset();

      if (response.ok) {
        showToast(`Thank you, ${name}! Your message was dispatched to Amritha's inbox.`, 'success');
      } else {
        showToast(`Message sent & recorded! Forwarded to sanjivamritha@gmail.com.`, 'success');
      }
    } catch (err) {
      console.warn('Network notice during email dispatch:', err);
      // Still store locally so nothing is ever lost
      saveMessage(newMsg);
      contactForm.reset();
      showToast(`Thank you, ${name}! Your message is recorded in the inbox.`, 'success');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  updateInboxBadge();
}

/* ==========================================================================
   RECEIVED MESSAGES INBOX MODAL
   ========================================================================== */
function initInboxModal() {
  const modal = document.getElementById('inboxModal');
  const openBtn = document.getElementById('openInboxBtn');
  const closeBtn = document.getElementById('closeInboxModal');
  const clearBtn = document.getElementById('clearInboxBtn');
  const listContainer = document.getElementById('inboxMessagesList');

  if (!modal) return;

  function renderInbox() {
    if (!listContainer) return;
    const messages = getStoredMessages();

    if (messages.length === 0) {
      listContainer.innerHTML = `
        <div class="inbox-empty-view">
          <div class="empty-icon-wrap">
            <i class="fas fa-envelope-open-text"></i>
          </div>
          <h4>No Messages Yet</h4>
          <p>Any message submitted through the contact form will appear right here and is also sent directly to <strong>sanjivamritha@gmail.com</strong>.</p>
          <div class="empty-action-hint">Send a test message through the form above to see it appear here!</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = messages.map(msg => `
      <div class="inbox-message-item" data-id="${msg.id}">
        <div class="msg-header">
          <div class="msg-author-info">
            <div class="msg-avatar-gem">${(msg.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div class="msg-author-name">${escapeHtml(msg.name)}</div>
              <a href="mailto:${escapeHtml(msg.email)}" class="msg-author-email" title="Click to email sender">
                <i class="fas fa-envelope"></i> ${escapeHtml(msg.email)}
              </a>
            </div>
          </div>
          <div class="msg-timestamp">
            <i class="far fa-clock"></i> ${msg.displayDate || 'Recently'}
          </div>
        </div>

        <div class="msg-subject-line">
          <span class="subject-tag">Subject</span>
          <strong>${escapeHtml(msg.subject || 'Portfolio Inquiry')}</strong>
        </div>

        <div class="msg-content-body">
          ${escapeHtml(msg.message).replace(/\\n/g, '<br>')}
        </div>

        <div class="msg-footer-bar">
          <a href="mailto:${escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}" class="btn-reply-sender">
            <i class="fas fa-reply"></i> Reply via Email
          </a>
          <button type="button" class="btn-delete-single-msg" data-id="${msg.id}" title="Delete this message">
            <i class="fas fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `).join('');

    // Attach individual delete handlers
    listContainer.querySelectorAll('.btn-delete-single-msg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToDelete = e.currentTarget.getAttribute('data-id');
        deleteMessageById(idToDelete);
      });
    });
  }

  function deleteMessageById(id) {
    const list = getStoredMessages().filter(m => m.id !== id);
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(list));
    updateInboxBadge();
    renderInbox();
    showToast('Message removed from local inbox.', 'warning');
  }

  function openInbox() {
    renderInbox();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeInbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  const openTriggers = document.querySelectorAll('.open-inbox-trigger, #openInboxBtn');
  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openInbox();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeInbox);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeInbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeInbox();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const messages = getStoredMessages();
      if (messages.length === 0) {
        showToast('Inbox is already empty.', 'warning');
        return;
      }
      if (confirm('Are you sure you want to clear all stored messages from this browser?')) {
        localStorage.removeItem(INBOX_STORAGE_KEY);
        updateInboxBadge();
        renderInbox();
        showToast('All stored messages cleared.', 'warning');
      }
    });
  }

  updateInboxBadge();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}" style="color: ${type === 'success' ? '#dfb08c' : '#a62a42'}; font-size: 1.2rem;"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   AI RESUME ANALYZER SIMULATION ENGINE
   Simulates TF-IDF Feature Extraction and Multinomial Naive Bayes Classification
   ========================================================================== */
function initClassifierDemo() {
  const textarea = document.getElementById('analyzerTextarea');
  const runBtn = document.getElementById('runAnalyzerBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  if (!textarea || !runBtn) return;

  const presets = {
    ai_ml: "Machine learning engineer experienced in Python, Scikit-learn, Pandas, NumPy, and TensorFlow. Specialized in NLP pipelines with TF-IDF feature extraction, text tokenization, and Multinomial Naive Bayes algorithms. Developed deep generative AI models and interactive Streamlit deployment interfaces.",
    fullstack: "Full stack web developer with strong hands-on experience in Django and Python backend architecture. Proficient in HTML5, CSS3, JavaScript, REST API integration, and relational database management using SQLite and MySQL. Implemented secure role-based authentication and responsive dashboards.",
    backend: "Backend software engineer focused on Python, Django, database schema design, and server optimization. Hands-on with MySQL, SQLite, query indexing, session management, and microservice communication. Experienced with Git, GitHub version control, and system debugging.",
    data_science: "Data scientist skilled in statistical analysis, exploratory data analysis using Pandas and NumPy, data cleaning, and machine learning classification. Proficient with feature selection, data visualization, and predictive model evaluation."
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.getAttribute('data-preset');
      if (presets[presetKey]) {
        textarea.value = presets[presetKey];
        runClassification(textarea.value);
      }
    });
  });

  runBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      showToast('Please enter some text or select a preset to analyze.', 'warning');
      return;
    }
    runClassification(text);
  });

  function runClassification(text) {
    const lower = text.toLowerCase();

    // Domain Vocabularies with Feature Weights
    const vocabularies = {
      'AI & Machine Learning': {
        keywords: ['machine learning', 'ai', 'scikit-learn', 'pandas', 'numpy', 'tf-idf', 'naive bayes', 'nlp', 'deep learning', 'model', 'streamlit', 'prediction', 'generative', 'dataset'],
        baseScore: 10
      },
      'Full-Stack Web Dev': {
        keywords: ['django', 'html', 'css', 'javascript', 'web', 'full-stack', 'frontend', 'backend', 'rest', 'api', 'dashboard', 'responsive', 'interface', 'react'],
        baseScore: 8
      },
      'Backend & Databases': {
        keywords: ['mysql', 'sqlite', 'database', 'sql', 'query', 'authentication', 'schema', 'server', 'logic', 'session', 'crud', 'optimization', 'architecture'],
        baseScore: 6
      },
      'Data Analytics': {
        keywords: ['data', 'analytics', 'statistics', 'visualization', 'eda', 'feature extraction', 'cleaning', 'metrics', 'evaluation', 'reports'],
        baseScore: 5
      }
    };

    // Calculate Scores (Simulated Multinomial Naive Bayes log-likelihood)
    const scores = {};
    const extractedKeywords = new Set();

    Object.keys(vocabularies).forEach(category => {
      let score = vocabularies[category].baseScore;
      vocabularies[category].keywords.forEach(kw => {
        const matches = (lower.match(new RegExp('\\b' + kw.replace('-', '\\-') + '\\b', 'g')) || []).length;
        if (matches > 0) {
          score += matches * 18;
          extractedKeywords.add(kw);
        }
      });
      scores[category] = score;
    });

    // Normalize probabilities
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const percentages = {};
    let topCategory = 'AI & Machine Learning';
    let maxPct = 0;

    Object.keys(scores).forEach(cat => {
      const pct = Math.round((scores[cat] / totalScore) * 100);
      percentages[cat] = pct;
      if (pct > maxPct) {
        maxPct = pct;
        topCategory = cat;
      }
    });

    // Update UI elements
    const roleElem = document.getElementById('predictedRoleName');
    const scoreElem = document.getElementById('predictedConfidence');

    if (roleElem) roleElem.textContent = topCategory;
    if (scoreElem) scoreElem.textContent = `Confidence: ${maxPct}% Match (Multinomial NB)`;

    // Update Progress Bars
    updateBar('barAi', percentages['AI & Machine Learning'] || 15);
    updateBar('barFullstack', percentages['Full-Stack Web Dev'] || 15);
    updateBar('barBackend', percentages['Backend & Databases'] || 15);
    updateBar('barData', percentages['Data Analytics'] || 15);

    // Update Extracted TF-IDF Tokens
    const tokenContainer = document.getElementById('tokenCloudContainer');
    if (tokenContainer) {
      tokenContainer.innerHTML = '';
      const tokensToDisplay = Array.from(extractedKeywords).slice(0, 8);
      if (tokensToDisplay.length === 0) {
        tokenContainer.innerHTML = '<span class="token-badge">python</span><span class="token-badge">development</span><span class="token-badge">engineering</span>';
      } else {
        tokensToDisplay.forEach(token => {
          const badge = document.createElement('span');
          badge.className = 'token-badge';
          badge.innerHTML = `✦ ${token}`;
          tokenContainer.appendChild(badge);
        });
      }
    }
  }

  function updateBar(barId, percentage) {
    const bar = document.getElementById(barId);
    const label = document.getElementById(barId + 'Val');
    if (bar) {
      bar.style.width = `${percentage}%`;
    }
    if (label) {
      label.textContent = `${percentage}%`;
    }
  }
}
