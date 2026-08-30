'use client';

import { useState } from 'react';

type FormDataMap = Record<string, FormDataEntryValue>;
type Language = 'en' | 'rw';

const translations = {
  en: {
    title: 'Suggestion Box', intro: 'Your feedback helps us improve the care and service we provide.', feedbackType: 'Feedback type', selectOne: 'Select one', suggestion: 'Suggestion', complaint: 'Complaint', compliment: 'Compliment', other: 'Other',
    department: 'Department / Service', selectDepartment: 'Select department / service', pleaseSpecify: 'Please specify', typeDepartment: 'Type the department or service', message: 'Your message', messagePlaceholder: 'Tell us what you would like KHMC to know...', anonymous: 'Submit anonymously', name: 'Name', yourName: 'Your name', phone: 'Phone', phonePlaceholder: '+250 7XX XXX XXX', submitting: 'Submitting...', submit: 'Submit Feedback', privacy: 'Your feedback is treated respectfully. You may submit anonymously.', thankYou: 'Thank you', received: 'Your feedback has been received by KHMC.', another: 'Submit another', submitError: 'Unable to submit. Server returned', connectionError: 'Unable to connect to the server. Please try again.',
    departments: { Reception: 'Reception', Consultation: 'Consultation', Laboratory: 'Laboratory', Pharmacy: 'Pharmacy', Nursing: 'Nursing', Dental: 'Dental', Maternity: 'Maternity', Emergency: 'Emergency', Outpatient: 'Outpatient', Administration: 'Administration' },
  },
  rw: {
    title: 'Agasanduku k\'Ibitekerezo', intro: 'Ibitekerezo byanyu bidufasha kunoza serivisi n\'ubuvuzi dutanga.', feedbackType: 'Ubwoko bw\'igitekerezo', selectOne: 'Hitamo kimwe', suggestion: 'Igitekerezo', complaint: 'Ikirego', compliment: 'Ishimwe', other: 'Ibindi',
    department: 'Ishami / Serivisi', selectDepartment: 'Hitamo ishami / serivisi', pleaseSpecify: 'Sobanura neza', typeDepartment: 'Andika ishami cyangwa serivisi', message: 'Ubutumwa bwawe', messagePlaceholder: 'Tubwire icyo wifuza ko KHMC imenya...', anonymous: 'Ohereza utagaragaje amazina', name: 'Amazina', yourName: 'Andika amazina yawe', phone: 'Telefoni', phonePlaceholder: '+250 7XX XXX XXX', submitting: 'Birimo koherezwa...', submit: 'Ohereza Igitekerezo', privacy: 'Igitekerezo cyawe kizafatwa mu cyubahiro. Ushobora kugitanga utagaragaje amazina.', thankYou: 'Murakoze', received: 'Igitekerezo cyawe cyakiriwe na KHMC.', another: 'Ohereza ikindi', submitError: 'Ntibishoboye koherezwa. Seriveri yagaruye', connectionError: 'Ntibishoboye guhuza na seriveri. Ongera ugerageze.',
    departments: { Reception: 'Aho kwakirira', Consultation: 'Kugana umuganga', Laboratory: 'Laboratwari', Pharmacy: 'Farumasi', Nursing: 'Ububyaza n\'ubuforomo', Dental: 'Amenyo', Maternity: 'Ababyeyi', Emergency: 'Ishami ry\'ibyihutirwa', Outpatient: 'Abarwayi bo hanze', Administration: 'Ubuyobozi' },
  },
} as const;

export default function SuggestionBox() {
  const [language, setLanguage] = useState<Language>('en');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otherDepartment, setOtherDepartment] = useState(false);
  const t = translations[language];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); const form = e.currentTarget;
    try {
      const data: FormDataMap = Object.fromEntries(new FormData(form).entries());
      data.anonymous = anonymous ? 'true' : 'false';
      if (otherDepartment) data.department = data.departmentOther || 'Other';
      delete data.departmentOther;
      const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const text = await response.text();
      if (response.ok) { form.reset(); setAnonymous(true); setOtherDepartment(false); setSent(true); }
      else { console.error('Suggestion submission failed:', response.status, text); alert(`${t.submitError} ${response.status}.`); }
    } catch (error) {
      console.error('Suggestion network error:', error);
      alert(error instanceof Error ? `${t.connectionError} ${error.message}` : t.connectionError);
    } finally { setLoading(false); }
  }

  function changeLanguage(next: Language) { setLanguage(next); setLanguageOpen(false); }

  const languageSelector = (
    <div className="languageSwitcherWrap">
      <button type="button" className="languageSwitcher" onClick={() => setLanguageOpen(!languageOpen)} aria-expanded={languageOpen}>
        {language === 'en' ? 'EN' : 'RW'} <span>{languageOpen ? '⌃' : '⌄'}</span>
      </button>
      {languageOpen && (
        <div className="languageMenu">
          <button type="button" className={language === 'en' ? 'languageOption active' : 'languageOption'} onClick={() => changeLanguage('en')}>English {language === 'en' && <span>✓</span>}</button>
          <button type="button" className={language === 'rw' ? 'languageOption active' : 'languageOption'} onClick={() => changeLanguage('rw')}>Kinyarwanda {language === 'rw' && <span>✓</span>}</button>
        </div>
      )}
    </div>
  );

  const styles = <style jsx>{`
    .languageSwitcherWrap{position:absolute;top:0;right:0;z-index:20}
    .languageSwitcher{background:#fff;color:#174f88;border:0;border-radius:0 0 8px 8px;padding:10px 16px;font-size:14px;font-weight:700;min-width:70px;box-shadow:0 3px 10px rgba(0,0,0,.08);transform:none}
    .languageSwitcher:hover{transform:none;box-shadow:0 3px 10px rgba(0,0,0,.12)}
    .languageSwitcher span{font-size:13px;margin-left:3px}
    .languageMenu{position:absolute;top:42px;right:0;width:140px;background:#fff;border-radius:0 0 14px 14px;box-shadow:0 8px 20px rgba(0,0,0,.14);overflow:hidden;padding:5px 0}
    .languageOption{width:100%;display:flex;justify-content:space-between;align-items:center;background:#fff;color:#374151;border:0;border-radius:0;padding:11px 16px;font-size:14px;font-weight:600;text-align:left;transform:none;box-shadow:none}
    .languageOption:hover{background:#f1f5f9;color:#174f88;transform:none;box-shadow:none}
    .languageOption.active{background:#eaf2fb;color:#174f88}
    .languageOption span{font-size:16px;color:#174f88}
    @media(max-width:650px){.languageSwitcherWrap{right:8px}.languageMenu{right:0}}
  `}</style>;

  if (sent) return <main className="page">{languageSelector}<section className="card success"><img className="siteLogo" src="/khmc-logo.png" alt="Kivu Hills Medical Center" /><h1>{t.thankYou}</h1><p>{t.received}</p><button type="button" onClick={() => setSent(false)}>{t.another}</button></section>{styles}</main>;

  return (
    <main className="page">
      {languageSelector}
      <section className="hero"><img className="siteLogo" src="/khmc-logo.png" alt="Kivu Hills Medical Center" /><h1>{t.title}</h1><p>{t.intro}</p></section>
      <form className="card form" onSubmit={submit}>
        <label>{t.feedbackType}<select name="type" required><option value="">{t.selectOne}</option><option value="Suggestion">{t.suggestion}</option><option value="Complaint">{t.complaint}</option><option value="Compliment">{t.compliment}</option><option value="Other">{t.other}</option></select></label>
        <label>{t.department}<select name="department" required defaultValue="" onChange={(e) => setOtherDepartment(e.target.value === 'Other')}>
          <option value="">{t.selectDepartment}</option>
          <option value="Reception">{t.departments.Reception}</option><option value="Consultation">{t.departments.Consultation}</option><option value="Laboratory">{t.departments.Laboratory}</option><option value="Pharmacy">{t.departments.Pharmacy}</option><option value="Nursing">{t.departments.Nursing}</option><option value="Dental">{t.departments.Dental}</option><option value="Maternity">{t.departments.Maternity}</option><option value="Emergency">{t.departments.Emergency}</option><option value="Outpatient">{t.departments.Outpatient}</option><option value="Administration">{t.departments.Administration}</option><option value="Other">{t.other}</option>
        </select></label>
        {otherDepartment && <label>{t.pleaseSpecify}<input name="departmentOther" placeholder={t.typeDepartment} required /></label>}
        <label>{t.message}<textarea name="message" required placeholder={t.messagePlaceholder} /></label>
        <label className="check"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />{t.anonymous}</label>
        {!anonymous && <><label>{t.name}<input name="name" placeholder={t.yourName} /></label><label>{t.phone}<input name="phone" placeholder={t.phonePlaceholder} /></label></>}
        <button type="submit" disabled={loading}>{loading ? t.submitting : t.submit}</button><p className="privacy">{t.privacy}</p>
      </form>
      {styles}
    </main>
  );
}
