let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timer;
let timeLeft = 15;
let backgroundAudio = new Audio("background.mp3");
backgroundAudio.loop = true;
backgroundAudio.volume = 0.4;

async function fetchQuestions() {
  const category = document.getElementById("categorySelect").value;
  const url = category ? 
    `https://opentdb.com/api.php?amount=10&category=${category}` : 
    'https://opentdb.com/api.php?amount=10';
  const res = await fetch(url);
  const data = await res.json();
  questions = data.results;
  startQuiz();
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById('scoreContainer').classList.add('d-none');
  document.getElementById('quiz').classList.remove('d-none');
  showQuestion();
}

function showQuestion() {
  const questionData = questions[currentQuestionIndex];
  const questionEl = document.getElementById('question');
  const answersEl = document.getElementById('answers');
  const feedbackEl = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');

  questionEl.innerHTML = decodeHTML(questionData.question);
  answersEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.disabled = true;

  const answers = [...questionData.incorrect_answers, questionData.correct_answer];
  answers.sort(() => Math.random() - 0.5);

  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-secondary';
    btn.innerHTML = decodeHTML(answer);
    btn.onclick = () => selectAnswer(answer, questionData.correct_answer, btn);
    answersEl.appendChild(btn);
  });

  startTimer();
}

function selectAnswer(selected, correct, button) {
  clearInterval(timer);
  const feedbackEl = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');
  const allButtons = document.querySelectorAll('#answers button');

  allButtons.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    feedbackEl.textContent = '✅ Correct!';
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn-success');
    score++;
    playSound('correct');
  } else {
    feedbackEl.textContent = '❌ Wrong!';
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn-danger');
    playSound('wrong');
  }

  nextBtn.disabled = false;
  nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  };
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById('quiz').classList.add('d-none');
  document.getElementById('scoreContainer').classList.remove('d-none');
  document.getElementById('score').textContent = score;
  saveHighScore(score);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function startTimer() {
  timeLeft = 15;
  const feedbackEl = document.getElementById('feedback');
  feedbackEl.textContent = `⏱️ Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    feedbackEl.textContent = `⏱️ Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackEl.textContent = "⏰ Time's up!";
      document.querySelectorAll('#answers button').forEach(btn => btn.disabled = true);
      document.getElementById('nextBtn').disabled = false;
      playSound('timeout');
    }
  }, 1000);
}

function playSound(type) {
  const audio = new Audio(`${type}.mp3`);
  audio.play();
}

function toggleMusic() {
  const btn = document.getElementById("musicBtn");
  if (backgroundAudio.paused) {
    backgroundAudio.play();
    btn.textContent = "🔊 Music: On";
  } else {
    backgroundAudio.pause();
    btn.textContent = "🔇 Music: Off";
  }
}

function saveHighScore(newScore) {
  const highScore = localStorage.getItem("quizHighScore") || 0;
  if (newScore > highScore) {
    localStorage.setItem("quizHighScore", newScore);
  }
  document.getElementById("highScore").textContent = Math.max(newScore, highScore);
}

window.onload = () => {
  document.getElementById("highScore").textContent = localStorage.getItem("quizHighScore") || 0;
  fetchQuestions();
};
