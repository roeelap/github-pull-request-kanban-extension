import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { clearCache } from '../lib/storage';

function Popup() {
  const [cleared, setCleared] = useState(false);
  const [tabUrl, setTabUrl] = useState<string>('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setTabUrl(tabs[0]?.url ?? '');
    });
  }, []);

  const isPRPage = /https:\/\/github\.com\/[^/]+\/[^/]+\/pulls/.test(tabUrl);

  return (
    <div>
      <h3 style={{ margin: '0 0 8px' }}>GitHub PR Kanban</h3>
      <p style={{ color: '#57606a', margin: '0 0 12px' }}>
        {isPRPage ? 'Use the toggle on the page to switch views.' : 'Open a repo PR list to use the kanban.'}
      </p>
      <button
        onClick={async () => {
          await clearCache();
          setCleared(true);
          setTimeout(() => setCleared(false), 1500);
        }}
      >
        {cleared ? 'Cache cleared' : 'Clear cache'}
      </button>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<Popup />);
