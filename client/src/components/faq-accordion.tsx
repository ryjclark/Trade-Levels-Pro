import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div
            key={idx}
            className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
            data-testid={`faq-item-${idx}`}
          >
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpen(isOpen ? null : idx)}
              aria-expanded={isOpen}
              data-testid={`faq-trigger-${idx}`}
            >
              <span>{item.q}</span>
              <ChevronDown size={18} className="faq-chevron" />
            </button>
            <div className="faq-content">
              <p className="faq-answer">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
