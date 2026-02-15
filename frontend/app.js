const API_BASE_URL = window.__API_BASE_URL__ || 'https://salesauto-api-demo.trycloudflare.com';

const outputEl = document.getElementById('output');
const apiUrlEl = document.getElementById('api-url');
apiUrlEl.textContent = API_BASE_URL;

function setOutput(payload) {
  outputEl.textContent = JSON.stringify(payload, null, 2);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

document.getElementById('health-btn').addEventListener('click', async () => {
  try {
    const data = await request('/health');
    setOutput(data);
  } catch (error) {
    setOutput({ error: error.message });
  }
});

document.getElementById('lead-btn').addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  try {
    const data = await request('/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    setOutput(data);
  } catch (error) {
    setOutput({ error: error.message });
  }
});
