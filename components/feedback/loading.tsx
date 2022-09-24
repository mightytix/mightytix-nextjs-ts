import React from 'react';

export function Loading({ text = 'Loading', speed = 500, delay = 200 }) {
  const [content, setContent] = React.useState(text);
  const [pastDelay, setPastDelay] = React.useState(false);

  React.useEffect(() => {
    // Only show loading indicator after 'delay' to avoid flashing
    const id = window.setTimeout(() => {
      setPastDelay(true);
    }, delay);

    return () => window.clearTimeout(id);
  }, [delay]);

  React.useEffect(() => {
    // Rotate three dots after text to indicate things are still happening
    const id = window.setInterval(() => {
      setContent(content => {
        return content === `${text}...` ? text : `${content}.`;
      });
    }, speed);

    return () => window.clearInterval(id);
  }, [pastDelay, text, speed]);

  if (!pastDelay) return null;

  return (
    <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-40">
        <div className="text-center">
          <h3 className="mt-2 text-3xl font-extrabold text-gray-500 tracking-tight sm:text-4xl">
            {content}
          </h3>
        </div>
      </div>
    </main>
  );
}
