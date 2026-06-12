export default function CmsMedia({ url, type = 'image', alt = '', className = '', videoClassName = '' }) {
  if (!url) return null;
  if (type === 'video') {
    return <video src={url} className={videoClassName || className} controls playsInline preload="metadata" aria-label={alt} />;
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
