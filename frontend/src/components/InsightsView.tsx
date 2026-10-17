import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle, Calendar, BarChart3, TrendingUp, Layers } from 'lucide-react';
import type { Insights } from '../types';
import { getInsights } from '../api';

export const InsightsView: React.FC = () => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getInsights()
      .then((data) => {
        if (mounted) {
          setInsights(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !insights) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
        Loading engineering insights...
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Entries',
      val: insights.total_entries,
      icon: BarChart3,
      color: '#7c3aed',
      sub: 'All-time logged milestones',
    },
    {
      label: 'This Week',
      val: insights.this_week_entries,
      icon: Calendar,
      color: '#10b981',
      sub: 'Entries logged this week',
    },
    {
      label: 'Active Days',
      val: insights.unique_active_days,
      icon: TrendingUp,
      color: '#06b6d4',
      sub: 'Days with recorded learning',
    },
    {
      label: 'Current Streak',
      val: `${insights.current_streak} days`,
      icon: Flame,
      color: '#f97316',
      sub: insights.current_streak > 0 ? 'Consistency on fire!' : 'Start your streak today',
    },
    {
      label: 'Completion Rate',
      val: `${insights.completion_rate}%`,
      icon: CheckCircle,
      color: '#a855f7',
      sub: `${insights.by_status.completed} tasks completed`,
    },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#16171d',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {card.label}
                </span>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: `${card.color}1c`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={16} />
                </div>
              </div>

              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f4f4f5', letterSpacing: '-0.5px' }}>
                {card.val}
              </div>

              <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Tech Distribution & Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Technology Distribution */}
        <div style={{
          backgroundColor: '#16171d',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={16} color="#c4b5fd" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
              Technology Distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.by_technology.length === 0 ? (
              <div style={{ color: '#a1a1aa', fontSize: '13px' }}>No entries recorded yet.</div>
            ) : (
              insights.by_technology.map((tech) => (
                <div key={tech.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tech.color }} />
                      <span style={{ fontWeight: '600', color: '#f4f4f5' }}>{tech.name}</span>
                    </div>
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>
                      {tech.count} entries ({tech.percentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#22232c',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${tech.percentage}%`,
                        height: '100%',
                        backgroundColor: tech.color,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div style={{
          backgroundColor: '#16171d',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={16} color="#34d399" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
                Status Breakdown
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                <span style={{ color: '#34d399', fontWeight: '600', fontSize: '13px' }}>Completed</span>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{insights.by_status.completed}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.28)',
              }}>
                <span style={{ color: '#c4b5fd', fontWeight: '600', fontSize: '13px' }}>In Progress</span>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{insights.by_status.in_progress}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(161, 161, 170, 0.1)',
                border: '1px solid rgba(161, 161, 170, 0.22)',
              }}>
                <span style={{ color: '#d4d4d8', fontWeight: '600', fontSize: '13px' }}>Planned</span>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>{insights.by_status.planned}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: '#a1a1aa', marginTop: '16px', lineHeight: 1.45 }}>
            Maintaining steady daily habits yields compound knowledge gains in AI engineering.
          </div>
        </div>
      </div>

      {/* 14-Day Activity Heatmap/Trend */}
      <div style={{
        backgroundColor: '#16171d',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '20px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5', marginBottom: '14px' }}>
          Recent 14-Day Activity Trend
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '8px', alignItems: 'flex-end', height: '90px' }}>
          {insights.recent_activity.map((item, i) => {
            const heightPct = Math.min(100, Math.max(15, item.count * 25));
            const hasActivity = item.count > 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '10.5px', color: hasActivity ? '#c4b5fd' : '#71717a', fontWeight: '600' }}>
                  {item.count}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    backgroundColor: hasActivity ? 'var(--accent-purple)' : '#22232c',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  title={`${item.date}: ${item.count} entries`}
                />
                <div style={{ fontSize: '10px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {item.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
