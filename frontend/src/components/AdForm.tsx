import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface AdFormProps {
  adId?: string;
  title: string;
  submitLabel: string;
}

export default function AdForm({ adId, title: formTitle, submitLabel }: AdFormProps) {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (adId) {
      api<{ title: string; description: string }>(`/ads/${adId}`).then(ad => {
        setTitle(ad.title);
        setDescription(ad.description);
      });
    }
  }, [adId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const method = adId ? 'PUT' : 'POST';
    const path = adId ? `/ads/${adId}` : '/ads';
    await api(path, {
      method,
      body: JSON.stringify({ title, description }),
    });
    nav('/ads');
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{formTitle}</h1>
      <input
        className="border p-2 w-full"
        placeholder="Titulo"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Descripcion"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        {submitLabel}
      </button>
    </form>
  );
}
