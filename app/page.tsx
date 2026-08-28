'use client';

import { useState } from 'react';

type FormDataMap = Record<string, FormDataEntryValue>;

export default function Home() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    try {
      const data: FormDataMap = Object.fromEntries(new FormData(form).entries());
      data.anonymous = 'true';
      const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const text = await response.text();
      let result: { error?: string } = {};
      try { result = text ? JSON.parse(text) : {}; } catch { result = {}; }
      if (response.ok) { form.reset(); setSent(true); }
      else { alert(result.error || `Unable to submit. Server returned ${response.status}.`); }
    } catch (error) {
      alert(error instanceof Error ? `Unable to connect to the server: ${error.message}` : 'Unable to connect to the server. Please try again.');
    } finally { setLoading(false); }
  }

  if (sent) return (
    <main className="page"><section className="card success">
      <img className="siteLogo" src="/khmc-logo.png" alt="Kivu Hills Medical Center" />
      <h1>Thank you</h1>
      <p>Your anonymous feedback has been received by KHMC.</p>
      <button type="button" onClick={() => setSent(false)}>Submit another</button>
    </section></main>
  );

  return (
    <main className="page">
      <section className="hero">
        <img className="siteLogo" src="/khmc-logo.png" alt="Kivu Hills Medical Center" />
        <h1>Suggestion Box</h1>
        <p>We welcome feedback from everyone — patients, visitors, staff and members of the community.</p>
        <div className="privacy anonymousNotice">
          <strong>Your feedback is anonymous</strong>
          <br />You do not need to provide your name, phone number or any other personal information. Your message will be received anonymously by KHMC.
        </div>
      </section>

      <form className="card form" onSubmit={submit}>
        <label>Feedback type
          <select name="type" required>
            <option value="">Select one</option><option>Suggestion</option><option>Complaint</option><option>Compliment</option><option>Other</option>
          </select>
        </label>
        <label>Your message
          <textarea name="message" required placeholder="Tell us what you would like KHMC to know..." />
        </label>
        <div className="privacy anonymousNotice">
          <strong>🔒 Anonymous submission</strong>
          <br />This message is submitted anonymously. We will not ask you for your name, phone number or department.
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Feedback'}</button>
      </form>
    </main>
  );
}
