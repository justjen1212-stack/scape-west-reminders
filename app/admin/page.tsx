'use client';

import { useState, useEffect } from 'react';

type Template = {
  subject: string;
  intro: string;
  main_paragraph: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  recommendation: string;
  closing: string;
};

const defaultTemplate: Template = {
  subject: '',
  intro: '',
  main_paragraph: '',
  step1: '',
  step2: '',
  step3: '',
  step4: '',
  recommendation: '',
  closing: '',
};

export default function AdminPage() {
  const [template, setTemplate] = useState<Template>(defaultTemplate);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/template')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setTemplate({
            subject: data.subject ?? '',
            intro: data.intro ?? '',
            main_paragraph: data.main_paragraph ?? '',
            step1: data.step1 ?? '',
            step2: data.step2 ?? '',
            step3: data.step3 ?? '',
            step4: data.step4 ?? '',
            recommendation: data.recommendation ?? '',
            closing: data.closing ?? '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleChange(field: keyof Template, value: string) {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(template),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Template saved successfully.' });
      } else if (res.status === 401) {
        setMessage({ type: 'error', text: 'Incorrect password. Please try again.' });
      } else {
        setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontFamily: 'Georgia, serif',
    fontSize: '15px',
    color: '#2c1a0e',
    backgroundColor: '#fff',
    border: '1px solid #d4c5b0',
    borderRadius: '6px',
    boxSizing: 'border-box',
    resize: 'vertical',
    lineHeight: '1.6',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#2c1a0e',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  };

  const hintStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'Georgia, serif',
    fontSize: '12px',
    color: '#8b7355',
    marginBottom: '8px',
    fontStyle: 'italic',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '28px',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f6f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', color: '#5c3d1e', fontSize: '16px' }}>
        Loading template...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f6f1', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2c1a0e', padding: '28px 40px', textAlign: 'center' }}>
        <h1 style={{ color: '#f5e6c8', margin: '0 0 4px', fontSize: '22px', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Scape West
        </h1>
        <p style={{ color: '#c9a87a', margin: 0, fontSize: '13px', letterSpacing: '1px' }}>
          Email Template Admin
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 60px' }}>
        <p style={{ color: '#5c3d1e', fontSize: '15px', lineHeight: '1.7', marginBottom: '36px' }}>
          Edit the wording of the wax reminder email sent to customers 3 months after purchase.
          Changes take effect immediately for future sends.
        </p>

        {/* Subject */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Email Subject Line</label>
          <input
            type="text"
            value={template.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        {/* Intro */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Intro Paragraph</label>
          <span style={hintStyle}>Use [product] where you want the product name to appear.</span>
          <textarea
            rows={3}
            value={template.intro}
            onChange={(e) => handleChange('intro', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Main paragraph */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Main Paragraph</label>
          <textarea
            rows={3}
            value={template.main_paragraph}
            onChange={(e) => handleChange('main_paragraph', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '28px', backgroundColor: '#fff', border: '1px solid #d4c5b0', borderRadius: '8px', padding: '24px' }}>
          <p style={{ ...labelStyle, marginBottom: '20px' }}>How to Apply — Steps</p>

          {(['step1', 'step2', 'step3', 'step4'] as const).map((step, i) => (
            <div key={step} style={{ marginBottom: i < 3 ? '16px' : 0 }}>
              <label style={{ ...labelStyle, fontSize: '12px', color: '#8b5e3c' }}>Step {i + 1}</label>
              <input
                type="text"
                value={template[step]}
                onChange={(e) => handleChange(step, e.target.value)}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Product Recommendation</label>
          <textarea
            rows={3}
            value={template.recommendation}
            onChange={(e) => handleChange('recommendation', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Closing */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Closing Line</label>
          <textarea
            rows={2}
            value={template.closing}
            onChange={(e) => handleChange('closing', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #d4c5b0', margin: '8px 0 28px' }} />

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to save"
            style={{ ...inputStyle, resize: 'none', maxWidth: '320px' }}
          />
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            backgroundColor: message.type === 'success' ? '#e8f5e9' : '#fdecea',
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !password}
          style={{
            backgroundColor: saving || !password ? '#8b7355' : '#2c1a0e',
            color: '#f5e6c8',
            border: 'none',
            borderRadius: '6px',
            padding: '14px 36px',
            fontFamily: 'Georgia, serif',
            fontSize: '15px',
            letterSpacing: '1px',
            cursor: saving || !password ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}
