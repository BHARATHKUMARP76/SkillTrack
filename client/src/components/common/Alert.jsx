import React from 'react';

const Alert = ({ type = 'danger', message }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{type === 'danger' ? '⚠️' : '✅'}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
