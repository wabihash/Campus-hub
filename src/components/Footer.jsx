import React from "react";
import styles from "./Footer.module.css";
import siteConfig from "../config/siteConfig";

function Icon({ name }) {
  // simple inline svg icons by name
  const icons = {
    twitter: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.36 5.64a1 1 0 00-1.41 0L12 10.59 7.05 5.64a1 1 0 10-1.41 1.41L10.59 12 5.64 16.95a1 1 0 101.41 1.41L12 13.41l4.95 4.95a1 1 0 001.41-1.41L13.41 12l4.95-4.95a1 1 0 000-1.41z"/>
      </svg>
    ),
    facebook: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.35-3.6 3.4-3.6.98 0 2 .18 2 .18v2.2h-1.12c-1.1 0-1.45.7-1.45 1.4V12h2.47l-.4 2.9h-2.07v7A10 10 0 0022 12"/>
      </svg>
    ),
    instagram: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a5 5 0 100 10 5 5 0 000-10zm6.5-3a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0118.5 5z"/>
      </svg>
    ),
    linkedin: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5a2.38 2.38 0 11.02 4.76 2.38 2.38 0 01-.02-4.76zM3 8.98H7v12H3v-12zM9 8.98h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05C20.7 8.53 22 10 22 13.16V20h-4v-6.07c0-1.45-.02-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.2V20H9v-11.02z"/>
      </svg>
    ),
    github: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 00-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.88 1.5 2.3 1.07 2.86.82.09-.64.35-1.07.64-1.32-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.5 9.5 0 0112 6.8c.85.004 1.71.116 2.51.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.69.92.69 1.86v2.76c0 .26.18.59.69.48A10 10 0 0012 2z"/>
      </svg>
    )
    ,
    telegram: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.45 2.6L2.85 9.2c-.9.34-.9 1.4.08 1.76l4.06 1.54 1.83 5.7c.25.77 1.3.77 1.55 0l2.22-6.89 4.65 3.45c.8.6 1.95.05 2.02-.94l.78-14.89c.06-1.07-1.07-1.66-1.9-1.2zM9.4 13.1l-.26 3.65-.02.24-.02.12-.01.02-.01.02c-.03.14-.25.15-.32.02l-.7-1.63 2.03-4.49c.12-.26.47-.33.67-.12l3.44 3.44-5.8-1.25c-.35-.08-.55.32-.26.99z"/>
      </svg>
    )
  };
  return icons[name] || null;
}

export default function Footer() {
  const { socials, copyrightHolder, year } = siteConfig;

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.left}>
        <div>© {year} {copyrightHolder}. All rights reserved.</div>
      </div>

      <div className={styles.center}>
        {Object.entries(socials).map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${key} in new tab`}
          >
            <Icon name={key} />
            <span style={{display:'none'}}>{key}</span>
          </a>
        ))}
      </div>
      <div className={styles.right}>
        <div className={styles.credits}>Made with care.</div>
      </div>
    </footer>
  );
}
