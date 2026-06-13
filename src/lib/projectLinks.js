const labels = {
  'raw footage': 'Raw file link',
  'reference audio': 'Reference audio link',
  'reference video': 'Reference video link',
};

export function getProjectLinkLabel(label) {
  const normalized = typeof label === 'string' ? label.trim().toLowerCase() : '';
  return labels[normalized] || label || 'Project link';
}
