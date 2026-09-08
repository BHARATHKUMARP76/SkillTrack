import React from 'react';

const ProgressBar = ({ progress = 0, colorClass = '' }) => {
  const percentage = Math.min(100, Math.max(0, progress));

  let variant = colorClass;
  if (!colorClass) {
    if (percentage >= 75) variant = 'success';
    else if (percentage >= 50) variant = '';
    else if (percentage >= 25) variant = 'warning';
    else variant = 'danger';
  }

  return (
    <div className="progress-bar-container">
      <div
        className={`progress-bar-fill ${variant}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
