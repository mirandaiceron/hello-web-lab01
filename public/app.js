const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = Object.fromEntries(data);

  const response = await fetch('/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    const { error } = await response.json();
    alert(error);
    return;
  }

  const saved = await response.json();

  const item = document.createElement('li');
  item.dataset.id = list.children.length;
  item.innerHTML = `<span><strong>${saved.title}:</strong> ${saved.body}</span><button class="delete-btn" type="button">Delete</button>`;
  list.append(item);

  form.reset();
});

list.addEventListener('click', async (event) => {
  if (!event.target.matches('.delete-btn')) return;

  const button = event.target;
  const item = button.closest('li');
  const id = item.dataset.id;

  button.disabled = true;
  try {
    await fetch(`/entries/${id}`, { method: 'DELETE' });
    item.remove();
  } catch {
    button.disabled = false;
  }
});