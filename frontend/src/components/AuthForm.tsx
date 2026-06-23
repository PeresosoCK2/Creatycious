import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface AuthField {
  name: string;
  label: string;
  type?: string;
}

interface AuthFormProps {
  title: string;
  endpoint: string;
  fields: AuthField[];
  submitLabel: string;
}

export default function AuthForm({ title, endpoint, fields, submitLabel }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.name, '']))
  );
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api<{ token: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      localStorage.setItem('token', res.token);
      nav('/');
    } catch (err: any) {
      setError(err?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{title}</h2>
      <form onSubmit={submit}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type || 'text'}
              value={values[field.name]}
              onChange={e => handleChange(field.name, e.target.value)}
            />
          </div>
        ))}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">{submitLabel}</button>
      </form>
    </div>
  );
}
