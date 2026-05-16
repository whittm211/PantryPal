import { useState, ImgHTMLAttributes } from 'react';

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23E5E7EB'/><text x='50' y='54' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239CA3AF'>image</text></svg>";

export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, ...rest } = props;
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored || !src ? FALLBACK : src}
      alt={alt ?? ''}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
