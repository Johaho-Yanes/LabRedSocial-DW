import { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc = "https://via.placeholder.com/600x600?text=Image+Not+Found",
  ...props 
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img 
      {...props} 
      src={imgSrc} 
      alt={alt} 
      onError={handleError}
    />
  );
}
