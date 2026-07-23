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
  item.dataset.title = saved.title;
  item.dataset.body = saved.body;
  item.innerHTML = `<span class="entry-display"><strong>${saved.title}:</strong> ${saved.body}</span><button class="edit-btn" type="button">Edit</button><button class="delete-btn" type="button">Delete</button>`;
  list.append(item);

  form.reset();
});

const startEdit = (item) => {
  const display = item.querySelector('.entry-display');
  const buttons = item.querySelectorAll('.edit-btn, .delete-btn');

  const editForm = document.createElement('form');
  editForm.className = 'edit-form';
  editForm.innerHTML = `
    <input type="text" name="title" value="${item.dataset.title}">
    <input type="text" name="body" value="${item.dataset.body}">
    <button type="submit">Save</button>
    <button type="button" class="cancel-btn">Cancel</button>
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