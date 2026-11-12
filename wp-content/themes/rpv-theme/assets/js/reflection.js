/* Український коментар: локальний сценарій не надсилає відповіді на сервер. */
(function () {
  'use strict';

  const app = document.querySelector('[data-reflection-app]');
  if (!app) return;

  const state = { step: 1, topic: 'life', tension: '', focus: '' };
  const steps = Array.from(app.querySelectorAll('[data-step]'));
  const progressLabel = app.querySelector('[data-progress-label]');
  const progressBar = app.querySelector('[data-progress-bar]');
  const result = app.querySelector('[data-result]');
  const resultTitle = app.querySelector('[data-result-title]');
  const resultBody = app.querySelector('[data-result-body]');
  const hint = app.querySelector('[data-step-hint]');
  const backButton = app.querySelector('[data-back]');
  const topicButtons = Array.from(document.querySelectorAll('[data-topic-choice]'));

  const copy = {
    love: {
      title: 'Give connection room to be mutual.',
      uncertain: 'Uncertainty can make every pause feel like an answer. Notice what you know from direct words and steady actions, then leave room for what you do not know yet.',
      choice: 'A relationship decision does not need to erase your needs. Name what you hope for, and what you would need in order to feel respected either way.',
      communication: 'A clear conversation can begin with one honest sentence about your experience. Speak from what you have seen and felt; let the other person speak for themselves.',
      energy: 'Care for the connection without carrying it alone. Notice where effort is shared, and where a gentler boundary could give you room to breathe.'
    },
    career: {
      title: 'Let the next step be an experiment.',
      uncertain: 'A changing work situation can feel bigger when every outcome is still open. Separate what is confirmed from what you are predicting, then choose one fact to clarify.',
      choice: 'You do not have to solve your whole career at once. Compare the options by the day-to-day life each one creates, not only by the title or promise.',
      communication: 'A useful work conversation can ask for specifics: priorities, support, timing, or what success would look like. Clear information makes a decision easier to own.',
      energy: 'Being stretched thin is information. Identify one demand that can be renegotiated, delayed, or shared before you decide that you need a whole new direction.'
    },
    life: {
      title: 'You can move before everything feels certain.',
      uncertain: 'Not knowing yet is a real place to be. You can hold that uncertainty without turning it into a prediction. Look for the next detail you can learn or the small choice still in your hands.',
      choice: 'When two paths both matter, ask which value each one protects. A decision can be thoughtful without being perfect or permanent.',
      communication: 'If something feels unspoken, begin with the part that belongs to you: what you noticed, what you need, and what you are willing to ask.',
      energy: 'A low reserve can make every choice look urgent. Give yourself one small pause, then decide what truly needs your attention today and what can wait.'
    }
  };

  const focusCopy = {
    'one-step': 'Try this: choose one action small enough to take within the next day. It can be a question, a note, or a moment to pause before responding.',
    boundary: 'Try this: finish the sentence “I can offer ___, and I need ___.” A boundary describes what you will do to care for yourself; it does not control someone else.',
    question: 'Try this: ask one open, direct question whose answer would help you make your own decision. Leave room for the answer to be different from what you hope.'
  };

  const topicNames = { love: 'Love', career: 'Career', life: 'Life' };
  const tensionNames = {
    uncertainty: 'uncertainty', choice: 'a decision', communication: 'a conversation', energy: 'your energy'
  };

  function updateTopicButtons() {
    topicButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.topicChoice === state.topic));
    });
    const selectedTopic = app.querySelector('[data-selected-topic]');
    if (selectedTopic) selectedTopic.textContent = `${topicNames[state.topic] || 'Life'} reflection`;
    app.querySelectorAll('[data-answer="topic"]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.value === state.topic));
    });
  }

  function showStep(step) {
    state.step = step;
    steps.forEach((panel) => { panel.hidden = Number(panel.dataset.step) !== step; });
    result.hidden = true;
    backButton.hidden = step === 1;
    progressLabel.textContent = `Step ${step} of 3`;
    progressBar.style.width = `${Math.round((step / 3) * 100)}%`;
    hint.textContent = step === 1 ? 'Choose one answer to continue' : 'Your choices stay on this page';
  }

  function addParagraph(parent, text, className) {
    const paragraph = document.createElement('p');
    if (className) paragraph.className = className;
    paragraph.textContent = text;
    parent.appendChild(paragraph);
  }

  function showResult() {
    steps.forEach((panel) => { panel.hidden = true; });
    result.hidden = false;
    backButton.hidden = true;
    progressLabel.textContent = 'Your reflection';
    progressBar.style.width = '100%';
    hint.textContent = 'Nothing was saved or sent';

    const topicCopy = copy[state.topic] || copy.life;
    resultTitle.textContent = `${topicNames[state.topic] || 'Life'}: ${topicCopy.title}`;
    resultBody.replaceChildren();
    addParagraph(resultBody, `You named ${tensionNames[state.tension] || 'a question'} as the part that feels most present. ${topicCopy[state.tension] || copy.life.uncertain}`);

    const question = app.querySelector('[data-question]');
    const questionText = question ? question.value.trim() : '';
    if (questionText) {
      addParagraph(resultBody, `Your question: “${questionText}”`);
    }

    addParagraph(resultBody, focusCopy[state.focus] || focusCopy['one-step'], 'rpv-result__next');
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  }

  function selectAnswer(button) {
    const answer = button.dataset.answer;
    const value = button.dataset.value;
    if (!answer || !value) return;

    app.querySelectorAll(`[data-answer="${answer}"]`).forEach((choice) => {
      choice.setAttribute('aria-pressed', String(choice === button));
    });
    state[answer] = value;

    if (answer === 'topic') {
      state.tension = '';
      state.focus = '';
      app.querySelectorAll('[data-answer="tension"], [data-answer="focus"]').forEach((choice) => choice.setAttribute('aria-pressed', 'false'));
      updateTopicButtons();
      showStep(2);
    } else if (answer === 'tension') {
      showStep(3);
    } else if (answer === 'focus') {
      showResult();
    }
  }

  app.addEventListener('click', (event) => {
    const answerButton = event.target.closest('[data-answer]');
    if (answerButton) {
      selectAnswer(answerButton);
      return;
    }
    if (event.target.closest('[data-back]') && state.step > 1) {
      showStep(state.step - 1);
      return;
    }
    if (event.target.closest('[data-restart]')) {
      state.topic = 'life';
      state.tension = '';
      state.focus = '';
      const question = app.querySelector('[data-question]');
      if (question) question.value = '';
      app.querySelectorAll('[data-answer]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
      updateTopicButtons();
      showStep(1);
    }
  });

  topicButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.topic = button.dataset.topicChoice || 'life';
      state.tension = '';
      state.focus = '';
      app.querySelectorAll('[data-answer="tension"], [data-answer="focus"]').forEach((choice) => choice.setAttribute('aria-pressed', 'false'));
      updateTopicButtons();
      showStep(2);
      document.querySelector('#reflection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const routeTopic = new URLSearchParams(window.location.search).get('topic');
  if (Object.prototype.hasOwnProperty.call(topicNames, routeTopic)) {
    state.topic = routeTopic;
  }
  updateTopicButtons();
  showStep(routeTopic ? 2 : 1);
  if (routeTopic) {
    document.querySelector('#reflection').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
})();
