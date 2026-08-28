'use client';

import { useState } from 'react';

type FormDataMap = Record<string, FormDataEntryValue>;

export default function Home() {
  const [anonymous, setAnonymous] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    try {
      const data: FormDataMap = Object.fromEntries(new FormData(form).entries());
      data.anonymous = anonymous ? 'true' : 'false';

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const text = await response.text();
      let result: { error?: string } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (response.ok) {
        form.reset();
        setAnonymous(true);
        setSent(true);
      } else {
        console.error('Suggestion submission failed:', response.status, text);
        alert(result.error || `Unable to submit. Server returned ${response.status}.`);
      }
    } catch (error) {
      console.error('Suggestion network error:', error);
      alert(
        error instanceof Error
          ? `Unable to connect to the server: ${error.message}`
          : 'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="page">
        <section className="card success">
          <img
            className="siteLogo"
            src="/khmc-logo.png"
            alt="Kivu Hills Medical Center"
          />
          <h1>Thank you</h1>
          <p>Your feedback has been received by KHMC.</p>
          <button type="button" onClick={() => setSent(false)}>
            Submit another
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <img
          className="siteLogo"
          src="/khmc-logo.png"
          alt="Kivu Hills Medical Center"
        />
        <h1>Suggestion Box</h1>
        <p>Your feedback helps us improve the care and service we provide.</p>

        <div className="qrCard">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fkhmc-suggestion-box-ten.vercel.app%2F"
            alt="QR code for KHMC Suggestion Box"
          />
          <strong>Scan to open the Suggestion Box</strong>
          <span>Use your phone camera to scan this code.</span>
        </div>
      </section>

      <form className="card form" onSubmit={submit}>
        <label>
          Feedback type
          <select name="type" required>
            <option value="">Select one</option>
            <option>Suggestion</option>
            <option>Complaint</option>
            <option>Compliment</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Department / Service
          <select name="department" required>
            <option value="">Select department</option>
            <option>Reception</option>
            <option>Consultation</option>
            <option>Laboratory</option>
            <option>Pharmacy</option>
            <option>Nursing</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Your message
          <textarea
            name="message"
            required
            placeholder="Tell us what you would like KHMC to know..."
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Submit anonymously
        </label>

        {!anonymous && (
          <>
            <label>
              Name
              <input name="name" placeholder="Your name" />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="+250 7XX XXX XXX" />
            </label>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <p className="privacy">
          Your feedback is treated respectfully. You may submit anonymously.
        </p>
      </form>
    </main>
  );
}
