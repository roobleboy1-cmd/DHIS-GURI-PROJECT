import React from 'react';
import { getStatusColor, capitalizeFirst } from '../../utils/helpers';

const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;
  const colors = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {capitalizeFirst(status)}
    </span>
  );
};

export default StatusBadge;
