import React from 'react';

export interface NeoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional label text above the textarea */
  label?: string;
  /** Additional hint shown after the label in lighter text */
  labelHint?: string;
}

export const NeoTextarea: React.FC<NeoTextareaProps> = ({
  label,
  labelHint,
  className = '',
  ...rest
}) => {
  const baseClass =
    'w-full p-2.5 border-2 border-black rounded-lg bg-gray-50 font-bold text-sm placeholder:font-medium placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-1.5">
          {label}
          {labelHint && (
            <span className="text-gray-400 normal-case font-normal"> {labelHint}</span>
          )}
        </label>
      )}
      <textarea {...rest} className={baseClass} />
    </div>
  );
};
