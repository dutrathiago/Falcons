"use client";

import React from "react";

interface TopBarProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function TopBar({ title, actionLabel, onAction }: TopBarProps) {
  return (
    <div className="top-bar">
      <div className="top-title" id="page-title">{title}</div>
      <div className="top-actions">
        {actionLabel && onAction && (
          <button 
            className="btn btn-primary" 
            id="main-action-btn" 
            onClick={onAction}
            style={{ border: '1.5px solid #fff' }}
          >
            <span id="main-action-label">{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
