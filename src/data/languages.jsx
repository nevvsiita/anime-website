import React from 'react';

export const FlagES = ({ width = 20, height = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width={width} height={height} style={{ borderRadius: '2px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="20" height="14" fill="#c60b1e"/>
    <rect y="3.5" width="20" height="7" fill="#ffc400"/>
  </svg>
);

export const FlagEN = ({ width = 20, height = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 42" width={width} height={height} style={{ borderRadius: '2px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="60" height="42" fill="#012169"/>
    <path d="M0,0 L60,42 M60,0 L0,42" stroke="#ffffff" strokeWidth="8"/>
    <path d="M0,0 L60,42 M60,0 L0,42" stroke="#c8102e" strokeWidth="4"/>
    <path d="M30,0 V42 M0,21 H60" stroke="#ffffff" strokeWidth="12"/>
    <path d="M30,0 V42 M0,21 H60" stroke="#c8102e" strokeWidth="7"/>
  </svg>
);

export const FlagCA = ({ width = 20, height = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width={width} height={height} style={{ borderRadius: '2px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="20" height="14" fill="#FCDD09"/>
    <rect y="1.5" width="20" height="1.5" fill="#DA121A"/>
    <rect y="4.5" width="20" height="1.5" fill="#DA121A"/>
    <rect y="7.5" width="20" height="1.5" fill="#DA121A"/>
    <rect y="10.5" width="20" height="1.5" fill="#DA121A"/>
  </svg>
);

export const FlagIT = ({ width = 20, height = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width={width} height={height} style={{ borderRadius: '2px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="20" height="14" fill="#ce2b37"/>
    <rect width="13.3" height="14" fill="#fff"/>
    <rect width="6.6" height="14" fill="#009246"/>
  </svg>
);

export const FlagFR = ({ width = 20, height = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width={width} height={height} style={{ borderRadius: '2px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="20" height="14" fill="#ED2939"/>
    <rect width="13.3" height="14" fill="#fff"/>
    <rect width="6.6" height="14" fill="#002395"/>
  </svg>
);

export const LANGS = {
  es: { code: 'es', flag: <FlagES />, name: 'Español', subText: 'Español (ES)', ytCc: 'es' },
  en: { code: 'en', flag: <FlagEN />, name: 'English', subText: 'English (EN)', ytCc: 'en' },
  ca: { code: 'ca', flag: <FlagCA />, name: 'Català', subText: 'Català (CA)', ytCc: 'ca' },
  it: { code: 'it', flag: <FlagIT />, name: 'Italiano', subText: 'Italiano (IT)', ytCc: 'it' },
  fr: { code: 'fr', flag: <FlagFR />, name: 'Français', subText: 'Français (FR)', ytCc: 'fr' }
};
