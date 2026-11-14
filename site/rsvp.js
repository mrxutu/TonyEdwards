const form = document.querySelector('#rsvp form');
const statusMessage = form.querySelector('.status');
const submitButton = form.querySelector('button');
const eventNames = ['cremation', 'celebration'];

function updateCounts() {
  for (const event of eventNames) {
    const checkbox = form.elements[event];
    const count = form.elements[event + 'Count'];
    count.disabled = !checkbox.checked;
    count.parentElement.hidden = !checkbox.checked;
  }
}

form.addEventListener('change', updateCounts);
updateCounts();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = form.elements.guestName.value.trim();
  if (!name) {
    statusMessage.textContent = 'Please enter your name.';
    form.elements.guestName.focus();
    return;
  }

  const attendance = {};
  for (const eventName of eventNames) {
    if (form.elements[eventName].checked) {
      attendance[eventName] = form.elements[eventName + 'Count'].valueAsNumber;
    }
  }
  if (Object.keys(attendance).length === 0) {
    statusMessage.textContent = 'Please select at least one event.';
    form.elements.cremation.focus();
    return;
  }
  if (!form.dataset.endpoint) {
    statusMessage.textContent = 'This is a preview. RSVP sending is not yet active.';
    return;
  }

  submitButton.disabled = true;
  form.setAttribute('aria-busy', 'true');
  statusMessage.textContent = 'Sending your RSVP…';
  try {
    const response = await fetch(form.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, attendance }),
    });
    if (!response.ok) throw new Error('RSVP delivery failed');
    form.reset();
    updateCounts();
    statusMessage.textContent = 'Thank you. We’ve received your RSVP.';
  } catch {
    statusMessage.textContent = 'We couldn’t send your RSVP. Your answers are still here. Please try again.';
  } finally {
    form.removeAttribute('aria-busy');
    submitButton.disabled = false;
  }
});
