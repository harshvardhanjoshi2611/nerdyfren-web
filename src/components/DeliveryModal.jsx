import { LoaderCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { editorApi, getApiError } from '../lib/api';
import Modal from './Modal';

export default function DeliveryModal({ project, onClose, onSubmitted }) {
  const [form, setForm] = useState({ delivery_url: '', delivery_notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await editorApi.submitFinalDelivery({
        booking_id: project.id,
        delivery_url: form.delivery_url,
        delivery_notes: form.delivery_notes,
      });
      await onSubmitted?.();
      onClose();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not submit this delivery.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Submit final delivery" eyebrow={project.booking_ref} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label>
          <span className="label">Delivery link</span>
          <input
            required
            type="url"
            className="input"
            value={form.delivery_url}
            onChange={(event) => setForm({ ...form, delivery_url: event.target.value })}
            placeholder="https://drive.google.com/..."
          />
          <span className="mt-2 block text-xs leading-5 text-slate-600">Use the authorized client delivery folder or review file. Do not use a public link unless the project requires it.</span>
        </label>
        <label>
          <span className="label">Delivery notes</span>
          <textarea
            required
            minLength={1}
            className="input min-h-32 resize-y"
            value={form.delivery_notes}
            onChange={(event) => setForm({ ...form, delivery_notes: event.target.value })}
            placeholder="Summarize what is ready and what the client should review."
          />
        </label>
        {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button disabled={busy} className="btn-primary">
            {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}
            Submit delivery
          </button>
        </div>
      </form>
    </Modal>
  );
}
