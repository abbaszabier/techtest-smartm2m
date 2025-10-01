import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

export type EmailCellProps = {
  emails: string[];
};

export const EmailCell: React.FC<EmailCellProps> = ({ emails }) => {
  const containerRef = useRef<HTMLDivElement>(null); // ref ke elemen container div, dipakai untuk mengukur lebar cell
  const [width, setWidth] = useState(0); // state untuk menyimpan lebar container

  // hook untuk observe perubahan ukuran elemen container
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // hitung email mana yang bisa ditampilkan penuh dan mana yang disembunyikan
  const { visible, hidden } = useMemo(() => {
    if (!emails || emails.length === 0) {
      return { visible: [], hidden: [] };
    }

    if (!containerRef.current || width === 0) {
      return { visible: [], hidden: emails };
    }

    // buat elemen span sementara untuk mengukur lebar teks email
    const temp = document.createElement("span");
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "nowrap";
    temp.style.position = "absolute";
    temp.style.font =
      getComputedStyle(containerRef.current).font || "14px sans-serif";
    document.body.appendChild(temp);

    const padd = 8; // padding antar email
    let used = 0; // total pixel yang sudah dipakai
    const vis: string[] = []; // daftar email yang muat ditampilkan

    // iterasi tiap email
    for (let i = 0; i < emails.length; i++) {
      temp.textContent = emails[i];
      const w = temp.getBoundingClientRect().width + padd;
      if (used + w <= width) {
        vis.push(emails[i]);
        used += w;
      } else {
        break;
      }
    }

    document.body.removeChild(temp);

    return { visible: vis, hidden: emails.slice(vis.length) };
  }, [emails, width]);

  // jika email kosong
  if (!emails || emails.length === 0) {
    return (
      <div ref={containerRef} className="email-cell">
        –
      </div>
    );
  }

  // jika ada 1 email
  if (visible.length <= 1) {
    const first = emails[0] || "";
    const restCount = emails.length - 1;
    return (
      <div ref={containerRef} className="email-cell single">
        <span className="email-ellipsis" title={first}>
          {first}
        </span>
        {restCount > 0 && (
          <span
            className="email-badge"
            title={emails.join(", ")}
            aria-label={`${restCount} more`}
          >
            +{restCount}
          </span>
        )}
      </div>
    );
  }

  // jika ada ≥2 email yang muat
  return (
    <div ref={containerRef} className="email-cell multi">
      <span className="email-full">{visible.join(", ")}</span>
      {hidden.length > 0 && (
        <span
          className="email-badge"
          title={emails.join(", ")}
          aria-label={`${hidden.length} more`}
        >
          +{hidden.length}
        </span>
      )}
    </div>
  );
};
