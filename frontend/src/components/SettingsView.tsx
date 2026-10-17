import React, { useState } from 'react';
import { Download, Upload, Database, RefreshCw, Trash2, Check, AlertCircle } from 'lucide-react';
import { seedDemoData, clearDemoData, exportData, importData } from '../api';

interface SettingsViewProps {
  onDataChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataChanged }) => {
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSeedDemo = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await seedDemoData(true);
      setActionMsg({ type: 'success', text: res.message || 'Demo data loaded successfully!' });
      onDataChanged();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to seed demo data' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await clearDemoData();
      setActionMsg({ type: 'success', text: res.message || 'Demo data cleared!' });
      onDataChanged();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to clear demo data' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buildlog_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setActionMsg({ type: 'success', text: 'Backup exported successfully!' });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setActionMsg(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await importData(json);
      setActionMsg({ type: 'success', text: `Imported ${res.imported_entries} entries successfully!` });
      onDataChanged();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {actionMsg && (
          <div style={{
            backgroundColor: actionMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${actionMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: actionMsg.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '13px',
          }}>
            {actionMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Demo Data Management */}
        <div style={{
          backgroundColor: '#16171d',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5', marginBottom: '6px' }}>
            Demo & Sample Data
          </h3>
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px', lineHeight: 1.45 }}>
            Quickly test the full-screen board with sample data. Demo entries are cleanly separated from your real personal logs.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSeedDemo}
              className="btn-primary"
              disabled={loading}
              style={{ fontSize: '12.5px' }}
            >
              <RefreshCw size={14} />
              <span>Seed Realistic Demo Data (20 Entries)</span>
            </button>

            <button
              onClick={handleClearDemo}
              className="btn-secondary"
              disabled={loading}
              style={{ fontSize: '12.5px', color: '#f87171' }}
            >
              <Trash2 size={14} />
              <span>Clear Demo Data</span>
            </button>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div style={{
          backgroundColor: '#16171d',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5', marginBottom: '6px' }}>
            Backup & Portability
          </h3>
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px', lineHeight: 1.45 }}>
            Export all your daily engineering logs and custom technology categories as JSON, or restore from a previous backup.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleExport}
              className="btn-secondary"
              disabled={loading}
              style={{ fontSize: '12.5px' }}
            >
              <Download size={14} />
              <span>Export JSON Backup</span>
            </button>

            <label
              className="btn-secondary"
              style={{ fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* System & Storage Specs */}
        <div style={{
          backgroundColor: '#16171d',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database size={16} color="#c4b5fd" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
              System & Persistence Architecture
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#e4e4e7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#a1a1aa' }}>Storage Engine:</span>
              <span style={{ fontWeight: '600' }}>SQLite (Local embedded, zero external cloud dependencies)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#a1a1aa' }}>Database Location:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c4b5fd' }}>backend/buildlog.db</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#a1a1aa' }}>API Server:</span>
              <span style={{ fontWeight: '600' }}>FastAPI (Python 3.12, Uvicorn)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#a1a1aa' }}>Frontend:</span>
              <span style={{ fontWeight: '600' }}>React 19 + TypeScript + Vite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
