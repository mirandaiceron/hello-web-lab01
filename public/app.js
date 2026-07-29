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
  item.dataset.id = saved.id;
  item.dataset.title = saved.title;
  item.dataset.body = saved.body;
  item.dataset.favorite = saved.favorite;
  item.innerHTML = `<span class="entry-display"><strong>${saved.title}:</strong> ${saved.body}</span><button class="favorite-btn" type="button">${saved.favorite ? '★' : '☆'}</button><button class="edit-btn hover:bg-teal-50" type="button">Edit</button><button class="delete-btn hover:bg-red-50" hx-delete="/entries/${saved.id}" hx-target="closest li" hx-swap="outerHTML" hx-confirm="Delete this entry?" hx-indicator="next .delete-indicator">Delete</button><span class="delete-indicator htmx-indicator">Deleting...</span>`;
  list.append(item);
  htmx.process(item);

  form.reset();
});

const startEdit = (item) => {
  const display = item.querySelector('.entry-display');
  const buttons = item.querySelectorAll('.edit-btn, .delete-btn');

  const editForm = document.createElement('form');
  editForm.className = 'flex flex-col flex-1 gap-2 sm:flex-row';
  editForm.innerHTML = `
    <input type="text" name="title" value="${item.dataset.title}" class="form-input">
    <input type="text" name="body" value="${item.dataset.body}" class="form-input">
    <button type="submit" class="bg-teal-700 hover:bg-teal-800 text-white rounded px-4 py-2">Save</button>
    <button type="button" class="cancel-btn bg-gray-500 text-white rounded px-4 py-2">Cancel</button>
  `;

  display.replaceWith(editForm);
  buttons.forEach((button) => { button.hidden = true; });

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
});