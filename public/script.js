const form = document.getElementById('questionForm');
const questionInput = document.getElementById('questionInput');
const questionsList = document.getElementById('questionsList');
const loading = document.getElementById('loading');
const submitBtn = document.getElementById('submitBtn');

console.log('script.js loaded');
console.log({ form, questionInput, questionsList, loading, submitBtn });

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
  console.log('submit handler fired');

  const question = questionInput.value.trim();
  console.log('question value:', question);

  if (!question) return;

  try {
    if (loading) loading.classList.remove('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Thinking...';
    }

    console.log('about to fetch /question');

    const res = await fetch('/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    console.log('fetch finished, status:', res.status);

    const result = await res.json();
    console.log('frontend result:', result);

    if (!res.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    if (result.data) {
      renderSingleItem(result.data);
      questionInput.value = '';
    } else {
      questionsList.innerHTML = `
        <div class="question-card">
          <p><strong>Error:</strong> No response data was returned.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('frontend catch error:', error);
    questionsList.innerHTML = `
      <div class="question-card">
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  } finally {
    if (loading) loading.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }
});