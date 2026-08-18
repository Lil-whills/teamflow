import React from 'react';
import { getInitials, getAvatarStyle } from '../utils/helpers';

const Avatar = ({ name, size = 'md', className = '', showTooltip = false }) => {
  const initials = getInitials(name);
  const style = getAvatarStyle(name);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs font-semibold',
    lg: 'w-9 h-9 text-sm font-semibold',
    xl: 'w-11 h-11 text-base font-bold'
  };

  return (
    <div
      title={showTooltip ? name : undefined}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border
      }}
      className={`inline-flex items-center justify-center rounded-full border border-black/20 select-none shadow-sm flex-shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
