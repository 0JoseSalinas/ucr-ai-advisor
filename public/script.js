const form = document.getElementById('questionForm');
const questionInput = document.getElementById('questionInput');
const questionsList = document.getElementById('questionsList');

function renderSingleItem(item) {
  questionsList.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'question-card';
  div.innerHTML = `
    <p><strong>Question:</strong> ${item.question}</p>
    <p><strong>Response:</strong> ${item.response}</p>
    <p><strong>Created:</strong> ${new Date(item.created_at).toLocaleString()}</p>
  `;
  questionsList.appendChild(div);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();
  if (!question) return;

  const res = await fetch('/question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  const result = await res.json();

  questionInput.value = '';

  if (result.data) {
    renderSingleItem(result.data);
  }
});