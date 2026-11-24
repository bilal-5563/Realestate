/**
 * Enquiry form: native constraint validation with inline, announced errors, then a JSON POST to Web3Forms.
 * Without JS the form still submits as a normal POST.
 */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const configured = form.dataset.configured === 'true';

  const messageFor = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const label = form.querySelector(`label[for="${el.id}"]`)?.textContent?.replace('*', '').trim() ?? 'This field';
    if (el.validity.valueMissing) return `${label} is required.`;
    if (el.validity.typeMismatch) return 'Please enter a valid email address.';
    if (el.validity.tooShort) return `Please add a little more detail (at least ${el.getAttribute('minlength')} characters).`;
    return '';
  };

  const check = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const err = el.getAttribute('aria-describedby')?.split(' ').map((id) => document.getElementById(id)).find((n) => n?.hasAttribute('data-err'));
    const msg = el.checkValidity() ? '' : messageFor(el);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  };

  const required = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')];
  required.forEach((el) =>
    el.addEventListener('blur', () => {
      if (el.value) check(el);
    }),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = required.filter((el) => !check(el));
    if (invalid.length) {
      status.textContent = `Please check ${invalid.length === 1 ? 'one field' : `${invalid.length} fields`} above.`;
      invalid[0].focus();
      return;
    }
    if ((form.querySelector('[name="botcheck"]') as HTMLInputElement)?.checked) return;

    if (!configured) {
      status.textContent = 'The form isn’t connected yet — please email us or message us on WhatsApp for now.';
      return;
    }

    submit.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        form.reset();
        status.textContent = 'Thank you — your quote request is in. We’ll be in touch to arrange a site visit.';
      } else {
        status.textContent = 'Something went wrong sending the form. Please email or WhatsApp us instead.';
      }
    } catch {
      status.textContent = 'You seem to be offline. Please try again, or email or WhatsApp us.';
    } finally {
      submit.removeAttribute('aria-busy');
    }
  });
}
