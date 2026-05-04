import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { clearCache, getSettings, setSettings } from '../lib/storage';
import { DEFAULT_SETTINGS } from '../lib/types';

function Options() {
  const [interval, setInterval] = useState(DEFAULT_SETTINGS.refreshIntervalSec);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => setInterval(s.refreshIntervalSec));
  }, []);

  const save = async () => {
    await setSettings({ refreshIntervalSec: interval });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <label htmlFor="interval">Refresh interval (seconds)</label>
      <input
        id="interval"
        type="number"
        min={10}
        max={3600}
        value={interval}
        onChange={(e) => setInterval(Number(e.target.value))}
      />
      <div>
        <button onClick={save}>{saved ? 'Saved' : 'Save'}</button>
        <button onClick={() => clearCache()} style={{ marginLeft: 8 }}>
          Clear cache
        </button>
      </div>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<Options />);
