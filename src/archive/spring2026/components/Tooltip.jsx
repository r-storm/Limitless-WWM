import { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from '../../../utils/classNames';

export default function Tooltip({ content, children, placement = 'top', className = '' }) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!show || !triggerRef.current || !tooltipRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const margin = 8;
    let top = placement === 'top' ? t.top - tip.height - margin : t.bottom + margin;
    let left = t.left + t.width / 2 - tip.width / 2;
    const maxLeft = window.innerWidth - tip.width - 4;
    if (left < 4) left = 4;
    if (left > maxLeft) left = maxLeft;
    if (top < 4) top = t.bottom + margin;
    setCoords({ top, left });
  }, [show, placement, content]);

  if (!content) return children;

  return (
    <>
      <span
        ref={triggerRef}
        className={classNames('relative inline-flex', className)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
      </span>
      {show && createPortal(
        <span
          ref={tooltipRef}
          role="tooltip"
          className={classNames(
            'fixed z-[100] pointer-events-none',
            'px-2.5 py-1.5 rounded-sm',
            'bg-[var(--dossier-ink)] text-[var(--dossier-bone)]',
            'text-xs font-normal tracking-normal normal-case leading-snug',
            'border border-[var(--dossier-line-bright)]',
            'whitespace-normal w-max max-w-[16rem]',
          )}
          style={{ top: coords.top, left: coords.left, boxShadow: '0 6px 20px rgba(0,0,0,0.45)' }}
        >
          {content}
        </span>,
        document.body,
      )}
    </>
  );
}
