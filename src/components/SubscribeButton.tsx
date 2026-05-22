import { useState } from 'react';
import { SubscribeModal } from './SubscribeModal';

export function SubscribeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm font-medium rounded-lg text-[#666] hover:text-[#111] dark:text-[#888] dark:hover:text-[#eee] hover:bg-[#eee] dark:hover:bg-[#111] transition-colors"
      >
        Get Updates
      </button>
      <SubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
