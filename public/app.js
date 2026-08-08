const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');
const announcer = document.querySelector('#status-announcer');

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
  item.dataset.id = saved.id;
  item.dataset.title = saved.title;
  item.dataset.body = saved.body;
  item.dataset.favorite = saved.favorite;
  item.innerHTML = `<span class="entry-display"><strong>${saved.title}:</strong> ${saved.body}</span><button class="favorite-btn" type="button" aria-label="Add to favorites">${saved.favorite ? '★' : '☆'}</button><button class="edit-btn hover:bg-teal-50" type="button">Edit</button><button class="delete-btn hover:bg-red-100 hover:text-red-800" hx-delete="/entries/${saved.id}" hx-target="closest li" hx-swap="outerHTML" hx-confirm="Delete this entry?" hx-indicator="next .delete-indicator">Delete</button><span class="delete-indicator htmx-indicator">Deleting...</span>`;
  list.append(item);
  htmx.process(item);

  form.reset();
});

const startEdit = (item) => {
  const display = item.querySelector('.entry-display');
  const buttons = item.querySelectorAll('.edit-btn, .delete-btn');

  const editForm = document.createElement('form');
  editForm.className = 'edit-form flex flex-col gap-2 flex-1 sm:flex-row';
  editForm.innerHTML = `
    <input type="text" name="title" value="${item.dataset.title}" class="form-input">
    <input type="text" name="body" value="${item.dataset.body}" class="form-input">
    <button type="submit" class="bg-teal-700 text-white rounded px-3 py-1.5">Save</button>
    <button type="button" class="cancel-btn bg-gray-500 text-white rounded px-3 py-1.5">Cancel</button>
  `;

  display.replaceWith(editForm);
  buttons.forEach((button) => { button.hidden = true; });
  editForm.querySelector('input[name="title"]').focus();

  editForm.querySelector('.cancel-btn').addEventListener('click', () => {
    editForm.replaceWith(display);
    buttons.forEach((button) => { button.hidden = false; });
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(editForm);
    const entry = Object.fromEntries(data);

    const response = await fetch(`/entries/${item.dataset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    const saved = await response.json();
    item.dataset.title = saved.title;
    item.dataset.body = saved.body;
    display.innerHTML = `<strong>${saved.title}:</strong> ${saved.body}`;
    editForm.replaceWith(display);
    buttons.forEach((button) => { button.hidden = false; });
  });
};

list.addEventListener('click', async (event) => {
  if (event.target.matches('.edit-btn')) {
    startEdit(event.target.closest('li'));
    return;
  }

  if (!event.target.matches('.favorite-btn')) return;

  const button = event.target;
  const item = button.closest('li');

  const response = await fetch(`/entries/${item.dataset.id}/favorite`, { method: 'PATCH' });
  if (!response.ok) return;

  const saved = await response.json();
  item.dataset.favorite = saved.favorite;
  button.textContent = saved.favorite ? '★' : '☆';
  button.setAttribute('aria-label', saved.favorite ? 'Remove from favorites' : 'Add to favorites');
});

list.addEventListener('htmx:beforeSwap', () => {
  announcer.textContent = 'Entry deleted.';
  list.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    document.querySelector('#entry-title').focus();
  }
});