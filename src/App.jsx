import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ─── Constants ─────────────────────────────────────────────────────────────────
const BRAND_COLOR = '#E8880A'
const BRAND_NAME  = 'Zyven Logistics'
const BRAND_TAGLINE = 'Track · Deliver · Trust'

function generateTrackingId() {
  const n = Math.floor(100000000 + Math.random() * 900000000)
  return `PTR${n}`
}

// ─── Print Receipt ─────────────────────────────────────────────────────────────
function printReceipt(s) {
  const balance = (parseFloat(s.delivery_fee || 0) - parseFloat(s.amount_paid || 0)).toFixed(2)
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head>
<title>${BRAND_NAME} Receipt — ${s.tracking_id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Manrope',sans-serif;background:#fff;color:#111;padding:30px;max-width:520px;margin:auto}
  .logo{font-family:'IBM Plex Mono',monospace;font-size:26px;font-weight:700;letter-spacing:-1px;border-bottom:3px solid #111;padding-bottom:10px;margin-bottom:6px}
  .logo span{color:#E8880A}
  .sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#666;margin-bottom:20px}
  .tid{font-family:'IBM Plex Mono',monospace;background:#111;color:#E8880A;padding:10px 16px;font-size:18px;font-weight:700;letter-spacing:2px;margin-bottom:20px;display:inline-block}
  .sec{margin-bottom:16px;border:1px solid #ddd;border-radius:4px;overflow:hidden}
  .sh{background:#111;color:#E8880A;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;font-weight:700}
  .row{display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #f0f0f0;font-size:13px}
  .row:last-child{border-bottom:none}
  .lbl{color:#666;font-weight:600}
  .val{font-weight:600;text-align:right;max-width:60%}
  .fee{background:#111;color:#fff;padding:12px 16px;margin-top:16px;border-radius:4px}
  .fr{display:flex;justify-content:space-between;font-size:13px;padding:3px 0}
  .ftot{font-size:18px;font-weight:700;color:#E8880A;border-top:1px solid #444;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between}
  .foot{text-align:center;margin-top:24px;font-size:11px;color:#999;border-top:1px dashed #ccc;padding-top:14px}
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .transit{background:#DBEAFE;color:#1D4ED8}
  .moving{background:#DCFCE7;color:#166534}
  .stopped{background:#FEE2E2;color:#991B1B}
  .delivered{background:#D1FAE5;color:#065F46}
  .pending{background:#F3F4F6;color:#374151}
  @media print{body{padding:10px}}
</style></head><body>
<div class="logo">${BRAND_NAME.toUpperCase()}<span>.</span></div>
<div class="sub">Official Delivery Receipt</div>
<div class="tid">${s.tracking_id}</div>
<div class="sec">
  <div class="sh">Shipment Status</div>
  <div class="row"><span class="lbl">Status</span><span class="val"><span class="badge ${s.status === 'Moving' || s.status === 'In Transit' ? 'moving' : s.status === 'Stopped' ? 'stopped' : s.status === 'Delivered' ? 'delivered' : 'pending'}">${s.status}</span></span></div>
  <div class="row"><span class="lbl">Take-off Date</span><span class="val">${s.take_off_date}</span></div>
  <div class="row"><span class="lbl">Est. Delivery</span><span class="val">${s.delivery_date}</span></div>
  <div class="row"><span class="lbl">Est. Delivery Time</span><span class="val">${s.estimated_delivery_time || '—'}</span></div>
  <div class="row"><span class="lbl">Current Location</span><span class="val">${s.current_location || s.custom_location || '—'}</span></div>
  ${s.stopped_date ? `<div class="row"><span class="lbl">Date Stopped</span><span class="val">${s.stopped_date}</span></div>` : ''}
  ${s.stopped_country ? `<div class="row"><span class="lbl">Stop Location</span><span class="val">${s.stopped_country}</span></div>` : ''}
</div>
${(s.port_1_location || s.port_2_location || s.port_3_location) ? `
<div class="sec">
  <div class="sh">Port Route</div>
  ${s.port_1_location ? `<div class="row"><span class="lbl">Port 1 (Origin)</span><span class="val">${s.port_1_location}</span></div>` : ''}
  ${s.port_2_location ? `<div class="row"><span class="lbl">Port 2 (Transit)</span><span class="val">${s.port_2_location}</span></div>` : ''}
  ${s.port_3_location ? `<div class="row"><span class="lbl">Port 3 (Final)</span><span class="val">${s.port_3_location}</span></div>` : ''}
</div>` : ''}
<div class="sec">
  <div class="sh">Sender</div>
  <div class="row"><span class="lbl">Name</span><span class="val">${s.sender_name}</span></div>
  <div class="row"><span class="lbl">Phone</span><span class="val">${s.sender_phone}</span></div>
  <div class="row"><span class="lbl">From</span><span class="val">${s.sender_address}</span></div>
</div>
<div class="sec">
  <div class="sh">Receiver</div>
  <div class="row"><span class="lbl">Name</span><span class="val">${s.receiver_name}</span></div>
  <div class="row"><span class="lbl">Phone</span><span class="val">${s.receiver_phone}</span></div>
  <div class="row"><span class="lbl">Email</span><span class="val">${s.receiver_email || '—'}</span></div>
  <div class="row"><span class="lbl">Address</span><span class="val">${s.receiver_address}</span></div>
  <div class="row"><span class="lbl">City</span><span class="val">${s.receiver_city}</span></div>
</div>
<div class="sec">
  <div class="sh">Package</div>
  <div class="row"><span class="lbl">Description</span><span class="val">${s.package_desc}</span></div>
  <div class="row"><span class="lbl">Weight</span><span class="val">${s.package_weight} kg</span></div>
</div>
<div class="fee">
  <div class="fr"><span>Delivery Fee</span><span>$${parseFloat(s.delivery_fee || 0).toFixed(2)}</span></div>
  <div class="fr"><span>Amount Paid</span><span>$${parseFloat(s.amount_paid || 0).toFixed(2)}</span></div>
  <div class="ftot"><span>BALANCE DUE</span><span>$${balance}</span></div>
</div>
<div class="foot">
  ${BRAND_NAME} &bull; All Rights Reserved<br/>
  Receipt generated: ${new Date().toLocaleString()} &bull; Keep this for your records
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`)
  win.document.close()
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 32, height: 32, border: '3px solid #1e2a3a',
        borderTopColor: BRAND_COLOR, borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
    </div>
  )
}

function TruckTracker({ status }) {
  const isMoving    = status === 'Moving'   || status === 'In Transit'
  const isStopped   = status === 'Stopped'
  const isDelivered = status === 'Delivered'
  const isProcessing = status === 'Processing' || status === 'Pending'

  const truckPos = isDelivered ? '85%' : isMoving ? '48%' : '18%'
  const lightColor = isMoving ? '#22c55e' : isDelivered ? '#3b82f6' : isStopped ? '#ef4444' : '#f59e0b'
  const statusText = isMoving ? '● VESSEL IN MOTION'
    : isDelivered ? '● DELIVERED'
    : isStopped ? '● SHIPMENT STOPPED'
    : '● PROCESSING ORDER'
  const statusSub = isMoving ? 'Live tracking active — shipment currently en route'
    : isDelivered ? 'Package successfully delivered to recipient'
    : isStopped ? 'Shipment has been held — check location details below'
    : 'Order being processed and prepared for dispatch'

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f1923 0%,#1a2840 100%)', borderRadius: 16, padding: '28px 24px', border: '1px solid #2a3a55', position: 'relative', overflow: 'hidden' }}>
      <div style={{ background: '#1e2a3a', borderRadius: 8, height: 76, position: 'relative', overflow: 'hidden', marginBottom: 16, border: '1px solid #2a3a55' }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `${i * 14}%`, width: 40, height: 6, background: BRAND_COLOR, borderRadius: 3, opacity: 0.35, animation: isMoving ? `roadMove 0.8s linear infinite` : 'none', animationDelay: `${i * -0.1}s` }} />
        ))}
        <div style={{ position: 'absolute', top: '50%', left: truckPos, transition: 'left 1.5s ease-in-out', transform: 'translateY(-50%)', fontSize: 34, animation: isMoving ? 'truckBounce 0.3s ease-in-out infinite alternate' : 'none' }}>
          {isDelivered ? '🏠' : isMoving ? '🚢' : isStopped ? '🛑' : '🚚'}
        </div>
        {isMoving && [0,1,2].map(i => (
          <div key={i} style={{ position: 'absolute', left: '32%', top: `${28 + i * 16}%`, width: 6, height: 6, borderRadius: '50%', background: BRAND_COLOR, opacity: 0.3, animation: 'dustFly 0.6s ease-out infinite', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: lightColor, animation: isMoving ? 'pulse 1.2s ease-in-out infinite' : 'none', boxShadow: `0 0 10px ${lightColor}99` }} />
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: lightColor }}>{statusText}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{statusSub}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Journey Steps ─────────────────────────────────────────────────────────────
function JourneySteps({ status }) {
  const ord = { 'Processing': 0, 'Pending': 0, 'Moving': 2, 'In Transit': 2, 'Stopped': 2, 'Delivered': 3 }
  const level = ord[status] ?? 0
  const isStopped = status === 'Stopped'

  const steps = [
    { label: 'Processing', icon: '📋' },
    { label: 'Port 1',     icon: '⚓' },
    { label: 'In Transit', icon: '🚢' },
    { label: 'Delivered',  icon: '✅' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '20px 8px' }}>
      {steps.map((s, i) => {
        const done   = level > i || (level === i && !isStopped)
        const active = level === i && !isStopped
        const stopped = isStopped && level === i
        const dotColor = stopped ? '#ef4444' : done ? '#22c55e' : active ? BRAND_COLOR : '#1e2a3a'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: stopped ? 'rgba(239,68,68,0.15)' : done ? '#22c55e22' : active ? BRAND_COLOR + '22' : '#1e2a3a', border: `2px solid ${dotColor}`, boxShadow: (active || stopped) ? `0 0 18px ${dotColor}88` : 'none', animation: active ? 'pulse 1.4s ease-in-out infinite' : 'none' }}>
                {stopped ? '🛑' : s.icon}
              </div>
              <span style={{ fontSize: 10, color: done || active ? '#e2e8f0' : '#475569', fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 20, background: level > i ? '#22c55e' : '#1e2a3a', transition: 'background 0.6s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({ title, rows }) {
  return (
    <div style={{ background: '#0f1923', border: '1px solid #1e2a3a', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 12, fontFamily: "'IBM Plex Mono',monospace" }}>
        {title}
      </div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, gap: 8 }}>
          <span style={{ color: '#475569', minWidth: 90, flexShrink: 0 }}>{k}</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'right' }}>{v || '—'}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'Processing': { bg: 'rgba(99,102,241,0.18)',  color: '#a5b4fc', label: '⏳ Processing'  },
    'Moving':     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', label: '🚢 Moving'       },
    'Stopped':    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: '🛑 Stopped'      },
    'Delivered':  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: '✅ Delivered'    },
    // legacy aliases
    'Pending':    { bg: 'rgba(99,102,241,0.18)',  color: '#a5b4fc', label: '⏳ Processing'  },
    'In Transit': { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', label: '🚢 Moving'       },
  }
  const cfg = map[status] || { bg: '#1e2a3a', color: '#94a3b8', label: status }
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, fontFamily: "'IBM Plex Mono',monospace", whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC MARKETING HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════════
function HomePage({ onAdminClick, onTrackClick }) {
  const [navOpen, setNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsMobile(w <= 640)
      setIsTablet(w > 640 && w <= 960)
      if (w > 640) setNavOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setNavOpen(false)
  }

  const sectionPx = isMobile ? 16 : 32
  const maxW = isMobile ? '100%' : 1260

  return (
    <div style={{ minHeight: '100vh', background: '#060d16' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(6,13,22,0.92)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid #1a2840', padding: isMobile ? '0 16px' : '0 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: isMobile ? 64 : 76, position: 'sticky', top: 0, zIndex: 100
      }}>
        <button onClick={() => scrollTo('top')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
        </div>
          <div style={{ fontSize: 10, letterSpacing: 2.6, color: '#64748b', marginTop: 1, textAlign: 'left' }}>LOGISTICS</div>
        </button>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {[
              ['Services', 'services'],
              ['How it works', 'how'],
              ['Testimonials', 'testimonials'],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', fontSize: 13, padding: '6px 8px',
              }}>{label}</button>
            ))}
            <button onClick={onTrackClick} style={{
              background: BRAND_COLOR, border: 'none', color: '#0b1220',
              padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
              fontWeight: 800, fontSize: 13, letterSpacing: 0.2
            }}>
              Track Shipment
            </button>
          </nav>
        )}

        {/* Mobile nav toggler */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setNavOpen(o => !o)}
              aria-label="Toggle navigation"
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid #1a2840',
                background: 'rgba(6,13,22,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: 16, height: 12, position: 'relative' }}>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 2,
                      borderRadius: 999,
                      background: '#e5e7eb',
                      top: navOpen
                        ? i === 1
                          ? '50%'
                          : '50%'
                        : `${2 + i * 5}px`,
                      transform: navOpen
                        ? i === 0
                          ? 'translateY(-50%) rotate(45deg)'
                          : i === 2
                          ? 'translateY(-50%) rotate(-45deg)'
                          : 'translateY(-50%) scaleX(0)'
                        : 'none',
                      transformOrigin: 'center',
                      transition: 'transform 0.18s ease, top 0.18s ease'
                    }}
                  />
                ))}
              </div>
            </button>
          </div>
        )}
      </header>

      {/* Mobile nav dropdown */}
      {isMobile && navOpen && (
        <div style={{
          position: 'sticky',
          top: 64,
          zIndex: 90,
          background: 'rgba(6,13,22,0.96)',
          borderBottom: '1px solid #1a2840',
          padding: '10px 16px 14px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['Services', 'services'],
              ['How it works', 'how'],
              ['Testimonials', 'testimonials'],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#e2e8f0',
                  fontSize: 14
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={onTrackClick}
              style={{
                marginTop: 4,
                background: BRAND_COLOR,
                border: 'none',
                color: '#0b1220',
                padding: '10px 10px',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13
              }}
            >
              Track shipment
            </button>
        </div>
        </div>
      )}

      {/* HERO */}
      <section id="top" style={{ padding: `${isMobile ? 64 : 88}px ${sectionPx}px 56px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0,1fr)' : 'minmax(0,1.2fr) minmax(0,1fr)',
            gap: isMobile ? 28 : 40,
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 999,
                border: '1px solid #1a2840', background: 'rgba(15,25,35,0.65)'
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2,
                  color: BRAND_COLOR, fontWeight: 800, textTransform: 'uppercase'
                }}>
                  GLOBAL LOGISTICS · REAL-TIME VISIBILITY
                </span>
        </div>

              <h1 style={{
                marginTop: 16,
                fontSize: 'clamp(40px,5vw,72px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.04,
                letterSpacing: -1.2
              }}>
                Professional shipping,<br />
                built for <span style={{ color: BRAND_COLOR }}>speed</span> and <span style={{ color: BRAND_COLOR }}>trust</span>.
        </h1>

              <p style={{ color: '#94a3b8', fontSize: 17, maxWidth: 620, marginTop: 18, lineHeight: 1.8 }}>
                {BRAND_NAME} helps individuals and businesses move parcels with clarity—shipment updates, delivery accountability, and simple tracking in one place.
              </p>

              <div style={{ display: 'flex', gap: 14, marginTop: 26, flexWrap: 'wrap' }}>
                <button onClick={onTrackClick} style={{
                  background: BRAND_COLOR, color: '#0b1220', border: 'none',
                  padding: '14px 22px', borderRadius: 999, cursor: 'pointer',
                  fontWeight: 800, fontSize: 14, letterSpacing: 0.4
                }}>
                  Track a shipment →
                </button>
                <button onClick={() => scrollTo('services')} style={{
                  background: 'rgba(15,25,35,0.6)', color: '#e2e8f0',
                  border: '1px solid #1a2840', padding: '14px 22px',
                  borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontSize: 14
                }}>
                  Explore services
                </button>
              </div>

              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 28, color: '#64748b', fontSize: 13 }}>
                {['End-to-end visibility', 'Priority handling', 'Customer-first support'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: BRAND_COLOR }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'radial-gradient(1400px 520px at 15% 20%, rgba(232,136,10,0.18), transparent 40%), linear-gradient(135deg, #0f1923 0%, #0a1422 60%, #081021 100%)',
              border: '1px solid #1a2840',
              borderRadius: 24,
              padding: 24,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 360
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(700px 260px at 70% 30%, rgba(59,130,246,0.16), transparent 55%)'
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1.5, fontSize: 11, color: '#94a3b8' }}>
                    LIVE TRACKING PREVIEW
                  </div>
                  <div style={{
                    padding: '6px 10px', borderRadius: 999,
                    border: '1px solid #1a2840', color: '#94a3b8', fontSize: 12
                  }}>
                    <span style={{ color: BRAND_COLOR, fontWeight: 800 }}>●</span> Online
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <TruckTracker status={'In Transit'} />
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }}>
                  {[
                    ['Avg. delivery updates', '< 10 min'],
                    ['Proof of delivery', 'Included'],
                    ['Priority routing', 'Available'],
                    ['Support coverage', '24/7'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'rgba(6,13,22,0.55)', border: '1px solid #1a2840', borderRadius: 16, padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1.3, fontFamily: "'IBM Plex Mono',monospace" }}>{k.toUpperCase()}</div>
                      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: `56px ${sectionPx}px 24px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800 }}>
                SERVICES
              </div>
              <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 850, color: '#fff', letterSpacing: -0.6 }}>
                Logistics that scales with you
              </h2>
              <p style={{ marginTop: 8, color: '#94a3b8', maxWidth: 640, lineHeight: 1.6 }}>
                From single parcels to high-volume distribution, we’re built to deliver predictability, visibility, and professionalism.
              </p>
            </div>
            <button onClick={onTrackClick} style={{
              background: 'rgba(15,25,35,0.55)', color: '#e2e8f0',
              border: '1px solid #1a2840', padding: '10px 14px',
              borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13
            }}>
              Track now →
            </button>
          </div>

          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: isMobile ? 16 : 22 }}>
            {[
              { icon: '🚚', title: 'Domestic Delivery', desc: 'Fast, reliable last‑mile delivery with clear status updates.' },
              { icon: '🌍', title: 'International Shipping', desc: 'Cross‑border shipments with visibility and handoff transparency.' },
              { icon: '🏢', title: 'Business Logistics', desc: 'Scheduled pickups, bulk dispatch, and account-level reporting.' },
              { icon: '📦', title: 'Warehousing & Handling', desc: 'Secure storage, careful handling, and dispatch coordination.' },
            ].map((s) => (
              <div key={s.title} style={{
                background: 'linear-gradient(180deg, rgba(15,25,35,0.96), rgba(10,20,34,0.96))',
                border: '1px solid #1a2840', borderRadius: 20, padding: 22, minHeight: 200
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(232,136,10,0.13)', border: '1px solid rgba(232,136,10,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>{s.icon}</div>
                <div style={{ marginTop: 14, fontSize: 17, fontWeight: 700, color: '#fff' }}>{s.title}</div>
                <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 14.5, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: `40px ${sectionPx}px 32px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{
            borderRadius: 24,
            border: '1px solid #1a2840',
            background: 'radial-gradient(1000px 420px at 20% 20%, rgba(232,136,10,0.16), transparent 45%), radial-gradient(900px 360px at 80% 30%, rgba(59,130,246,0.14), transparent 50%), rgba(15,25,35,0.65)',
            padding: 24
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
              {[
                ['Shipments tracked', '250K+'],
                ['On-time performance', '98.7%'],
                ['Operational hubs', '12'],
                ['Customer satisfaction', '4.9/5'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(6,13,22,0.7)', border: '1px solid #1a2840', borderRadius: 18, padding: 18, minHeight: 140 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2, color: '#94a3b8' }}>
                    {k.toUpperCase()}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: -0.8 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              Metrics shown for presentation purposes.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: `52px ${sectionPx}px 32px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800 }}>
            HOW IT WORKS
          </div>
          <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -0.6 }}>
            Simple, transparent delivery workflow
          </h2>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 22 }}>
            {[
              { step: '01', title: 'Register shipment', desc: 'A tracking ID is created and assigned to your parcel.' },
              { step: '02', title: 'Pickup & processing', desc: 'We confirm details, scan the package, and route it.' },
              { step: '03', title: 'In transit updates', desc: 'Live status updates keep you informed from hub to hub.' },
              { step: '04', title: 'Delivered with proof', desc: 'Delivery is confirmed and recorded for accountability.' },
            ].map((s) => (
              <div key={s.step} style={{ background: '#0f1923', border: '1px solid #1a2840', borderRadius: 18, padding: 20, minHeight: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: 2, color: BRAND_COLOR, fontWeight: 900 }}>{s.step}</div>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: BRAND_COLOR, opacity: 0.6 }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 16, fontWeight: 850, color: '#fff' }}>{s.title}</div>
                <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 14, lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES / EXTRA CONTENT */}
      <section style={{ padding: `40px ${sectionPx}px 20px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0,1fr)' : 'minmax(0,1.2fr) minmax(0,1fr)', gap: isMobile ? 24 : 32, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800 }}>
              INDUSTRIES
            </div>
            <h2 style={{ marginTop: 10, fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
              Built for merchants, distributors and growing teams
            </h2>
            <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>
              Whether you ship a few parcels a week or coordinate hundreds of deliveries across cities, {BRAND_NAME} is designed to feel simple for customers and powerful for your operations team.
            </p>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
              {['E‑commerce & retail', 'B2B wholesale', 'Pharmaceuticals', 'High‑value items'].map((label) => (
                <div key={label} style={{ background: '#0b1220', borderRadius: 14, border: '1px solid #1a2840', padding: 12, fontSize: 13.5, color: '#e2e8f0' }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: '#0b1220',
            borderRadius: 20,
            border: '1px solid #1a2840',
            padding: 20
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800 }}>
              WHY TEAMS CHOOSE {BRAND_NAME.toUpperCase()}
            </div>
            <ul style={{ marginTop: 12, paddingLeft: 18, color: '#cbd5f5', fontSize: 14, lineHeight: 1.7 }}>
              <li>Consistent, easy-to-share tracking pages for customers.</li>
              <li>Clear delivery status that reduces “where is my order?” tickets.</li>
              <li>Professional handling and dispatch communication.</li>
              <li>Admin tools to register, update and monitor every shipment.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ padding: `52px ${sectionPx}px 40px` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800 }}>
            TESTIMONIALS
          </div>
          <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -0.6 }}>
            Trusted by teams that ship daily
          </h2>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
            {[
              { quote: 'Their tracking is clean and accurate. Customers stopped asking “where is my package?” every hour.', name: 'Operations Lead', org: 'E‑commerce brand' },
              { quote: 'Professional handling and consistent updates. It feels like an enterprise-grade logistics partner.', name: 'Logistics Manager', org: 'Retail distributor' },
              { quote: 'Fast delivery and clear proof of delivery. Exactly what we needed for high‑value orders.', name: 'Founder', org: 'DTC startup' },
            ].map((t, idx) => (
              <div key={idx} style={{ background: '#0f1923', border: '1px solid #1a2840', borderRadius: 20, padding: 20, minHeight: 190 }}>
                <div style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6 }}>
                  “{t.quote}”
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: 'rgba(232,136,10,0.16)', border: '1px solid rgba(232,136,10,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: BRAND_COLOR
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 850, color: '#fff', fontSize: 13 }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{t.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1a2840', padding: `26px ${sectionPx}px`, color: '#64748b' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 900, color: '#fff' }}>
              ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: '#94a3b8' }}>
              International logistics with real-time shipment visibility, port-to-door delivery, and full tracking accountability.
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
              <div style={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, marginBottom: 4 }}>HEADQUARTERS</div>
              3300 Claymoore Park Dr<br />Houston, TX 77043<br />United States
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2, color: '#94a3b8' }}>COMPANY</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {[
                ['Services', 'services'],
                ['How it works', 'how'],
                ['Testimonials', 'testimonials'],
                ['Track', 'track'],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => (id === 'track' ? onTrackClick() : scrollTo(id))}
                  style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#94a3b8', fontSize: 13 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2, color: '#94a3b8' }}>TRACKING</div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Have a tracking ID? Get live status, port locations, and delivery updates instantly.
            </div>
            <button onClick={onTrackClick} style={{
              marginTop: 12, background: 'rgba(232,136,10,0.14)', border: '1px solid rgba(232,136,10,0.28)',
              color: BRAND_COLOR, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', fontWeight: 850, fontSize: 13
            }}>
              Track shipment →
            </button>
          </div>
        </div>

        <div style={{ maxWidth: maxW, margin: '18px auto 0', paddingTop: 14, borderTop: '1px solid #0f1923', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#475569' }}>
            {BRAND_NAME} © {new Date().getFullYear()} — {BRAND_TAGLINE}
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>
            3300 Claymoore Park Dr, Houston TX 27045 · United States
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC TRACKING PAGE (DEDICATED VIEW)
// ═══════════════════════════════════════════════════════════════════════════════
function TrackerPage({ onBack, onAdminClick }) {
  const [tid, setTid]       = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function track() {
    const val = tid.trim().toUpperCase()
    if (!val) return
    setLoading(true); setError(''); setResult(null)
    const { data, error: err } = await supabase
      .rpc('track_shipment', { p_tracking_id: val })
    setLoading(false)
    if (err || !data || data.length === 0) setError('No shipment found with that tracking ID.')
    else setResult(data[0])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060d16', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'rgba(6,13,22,0.96)', borderBottom: '1px solid #1a2840',
        padding: '0 20px', height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 80
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
          <span>←</span>
          <span>Back to homepage</span>
        </button>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
          ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 20px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <section style={{ marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2.5, color: BRAND_COLOR, fontWeight: 800, marginBottom: 10 }}>
              SHIPMENT TRACKING
        </div>
            <h1 style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Track your shipment in seconds
        </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>
              Enter your tracking ID to get the latest status, estimated delivery date, and current location.
        </p>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={tid}
            onChange={e => setTid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && track()}
            placeholder="e.g. PTR123456789"
            style={{
                  flex: 1, minWidth: 220, padding: '13px 14px',
                  background: '#0b1220', border: '1px solid #1e293b',
                  borderRadius: 10, color: '#fff', fontSize: 14,
              fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1
            }}
          />
              <button
                onClick={track}
                disabled={loading}
                style={{
                  background: BRAND_COLOR, border: 'none', color: '#0b1220',
                  padding: '13px 18px', borderRadius: 10, fontWeight: 800,
                  fontSize: 13, cursor: 'pointer', letterSpacing: 0.6,
            fontFamily: "'IBM Plex Mono',monospace", opacity: loading ? 0.7 : 1
                }}
              >
            {loading ? '...' : 'TRACK'}
          </button>
        </div>
        {error && (
              <div style={{ color: '#ef4444', marginTop: 10, fontSize: 13, fontFamily: "'IBM Plex Mono',monospace" }}>
            ⚠ {error}
          </div>
        )}
      </section>

      {result && (
            <section className="fade-up">
          <div style={{
                background: '#0b1220', border: `1px solid ${BRAND_COLOR}`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 14,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>TRACKING ID</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 900, color: BRAND_COLOR, letterSpacing: 2 }}>
                {result.tracking_id}
              </div>
            </div>
            <StatusBadge status={result.status} />
          </div>

              <div style={{ marginBottom: 14 }}><TruckTracker status={result.status} /></div>

              <div style={{ background: '#0b1220', border: '1px solid #1e2a3a', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
            <JourneySteps status={result.status} />
          </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 10 }}>
                <InfoCard title="📅 DATES & TIMELINE" rows={[
                  ['Take-off',     result.take_off_date],
                  ['Est. Delivery', result.delivery_date],
                  ['Delivery Time', result.estimated_delivery_time],
                ]} />
                <InfoCard title="📦 PACKAGE" rows={[
                  ['Description', result.package_desc],
                  ['Weight', result.package_weight ? `${result.package_weight} kg` : null],
                  ['Status', result.status],
                ]} />
                <InfoCard title="📍 CURRENT LOCATION" rows={[
                  ['Current Location', result.current_location],
                  ['Custom Location',  result.custom_location],
                  ['Destination City', result.receiver_city],
                ]} />
                <InfoCard title="🚢 PORT ROUTE" rows={[
                  ['Port 1 (Origin)',  result.port_1_location],
                  ['Port 2 (Transit)', result.port_2_location],
                  ['Port 3 (Final)',   result.port_3_location],
                ]} />
                {(result.stopped_date || result.stopped_country) && (
                  <InfoCard title="🛑 HOLD / STOP DETAILS" rows={[
                    ['Date Stopped',       result.stopped_date],
                    ['Location of Stop',   result.stopped_country],
                  ]} />
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function login() {
    setErr('')
    const e = email.trim().toLowerCase()
    if (!e || !password) { setErr('Enter your email and password.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: e, password })
    setLoading(false)
    if (error || !data?.session) {
      setErr(error?.message || 'Sign in failed.')
      return
    }
    onLogin()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060d16', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
      </div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: BRAND_COLOR, marginBottom: 40 }}>ADMIN PORTAL</div>

      <div style={{ background: '#0f1923', border: '1px solid #1e2a3a', borderRadius: 14, padding: 36, width: '100%', maxWidth: 420 }}>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Sign In</h2>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>
          Authorized team members only. Your access is controlled by an admin allowlist in Supabase.
        </p>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" }}>EMAIL</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com"
            autoComplete="email"
            style={{ width: '100%', padding: '12px 14px', background: '#060d16', border: '1px solid #2a3a55', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" }}>PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ width: '100%', padding: '12px 14px', background: '#060d16', border: '1px solid #2a3a55', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
        </label>

        {err && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, fontFamily: "'IBM Plex Mono',monospace" }}>⚠ {err}</div>}

        <button onClick={login} disabled={loading} style={{ width: '100%', background: BRAND_COLOR, color: '#0b1220', border: 'none', padding: 13, borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.4, opacity: loading ? 0.75 : 1 }}>
          {loading ? 'SIGNING IN…' : 'SIGN IN →'}
        </button>
        <button onClick={onBack} style={{ width: '100%', background: 'none', border: 'none', color: '#475569', marginTop: 12, cursor: 'pointer', fontSize: 13 }}>
          ← Back to Website
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY = {
  tracking_id: '', sender_name: '', sender_phone: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_email: '', receiver_address: '', receiver_city: '',
  package_desc: '', package_weight: '', take_off_date: '', delivery_date: '',
  status: 'Processing', current_location: '',
  port_1_location: '', port_2_location: '', port_3_location: '',
  estimated_delivery_time: '', custom_location: '',
  stopped_date: '', stopped_country: '',
  delivery_fee: '', amount_paid: '', notes: ''
}

function AdminDashboard({ onLogout, onPublic }) {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('list')   // list | form
  const [form, setForm]         = useState({ ...EMPTY, tracking_id: generateTrackingId() })
  const [editId, setEditId]     = useState(null)
  const [search, setSearch]     = useState('')
  const [msg, setMsg]           = useState({ text: '', ok: true })
  const [saving, setSaving]     = useState(false)

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3500) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false })
    if (!error) setShipments(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function startNew() {
    setForm({ ...EMPTY, tracking_id: generateTrackingId() })
    setEditId(null)
    setView('form')
  }

  function startEdit(s) {
    setForm({ ...s })
    setEditId(s.tracking_id)
    setView('form')
  }

  async function saveForm() {
    const required = ['sender_name','sender_phone','sender_address','receiver_name','receiver_phone','receiver_address','receiver_city','package_desc','take_off_date','delivery_date']
    for (const f of required) {
      if (!form[f]?.toString().trim()) {
        flash(`Please fill: ${f.replace(/_/g, ' ')}`, false); return
      }
    }
    setSaving(true)
    const payload = { ...form, package_weight: parseFloat(form.package_weight) || null, delivery_fee: parseFloat(form.delivery_fee) || null, amount_paid: parseFloat(form.amount_paid) || null }

    let error
    if (editId) {
      ;({ error } = await supabase.from('shipments').update(payload).eq('tracking_id', editId))
    } else {
      ;({ error } = await supabase.from('shipments').insert([payload]))
    }
    setSaving(false)
    if (error) { flash('Database error: ' + error.message, false); return }
    flash(editId ? '✓ Shipment updated!' : '✓ Shipment created!')
    await fetchAll()
    setView('list')
  }

  async function deleteShipment(id) {
    if (!confirm('Delete this shipment? This cannot be undone.')) return
    const { error } = await supabase.from('shipments').delete().eq('tracking_id', id)
    if (error) flash('Delete failed: ' + error.message, false)
    else { flash('Shipment deleted.'); setShipments(prev => prev.filter(s => s.tracking_id !== id)) }
  }

  const filtered = shipments.filter(s =>
    s.tracking_id?.includes(search.toUpperCase()) ||
    s.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.sender_name?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    total:      shipments.length,
    processing: shipments.filter(s => s.status === 'Processing' || s.status === 'Pending').length,
    moving:     shipments.filter(s => s.status === 'Moving' || s.status === 'In Transit').length,
    stopped:    shipments.filter(s => s.status === 'Stopped').length,
    delivered:  shipments.filter(s => s.status === 'Delivered').length,
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div style={{ minHeight: '100vh', background: '#060d16', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0a1422', borderRight: '1px solid #1a2840', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid #1a2840' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: '#fff' }}>
            ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: BRAND_COLOR, marginTop: 2 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { icon: '📊', label: 'All Shipments', active: view === 'list', action: () => setView('list') },
            { icon: '➕', label: 'New Shipment',  active: view === 'form' && !editId, action: startNew },
          ].map((item, i) => (
            <button key={i} onClick={item.action} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: item.active ? '#0f1923' : 'transparent',
              color: item.active ? '#e2e8f0' : '#64748b',
              fontSize: 14, textAlign: 'left', marginBottom: 4, transition: 'all 0.15s'
            }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a2840' }}>
          <button onClick={onPublic} style={{ width: '100%', background: 'none', border: '1px solid #1a2840', color: '#64748b', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, marginBottom: 8 }}>
            ← Public Site
          </button>
          <button onClick={onLogout} style={{ width: '100%', background: 'none', border: '1px solid #2a3a55', color: '#ef4444', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minWidth: 0 }}>

        {/* Flash message */}
        {msg.text && (
          <div style={{
            background: msg.ok ? '#052e16' : '#450a0a',
            border: `1px solid ${msg.ok ? '#16a34a' : '#ef4444'}`,
            color: msg.ok ? '#4ade80' : '#fca5a5',
            padding: '10px 16px', borderRadius: 8, marginBottom: 20,
            fontFamily: "'IBM Plex Mono',monospace", fontSize: 13
          }}>{msg.text}</div>
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#475569', margin: '4px 0 0', fontSize: 14 }}>Manage all shipments</p>
              </div>
              <button onClick={startNew} style={{ background: BRAND_COLOR, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: 1 }}>
                + NEW SHIPMENT
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Total',      val: counts.total,      color: '#60a5fa' },
                { label: 'Processing', val: counts.processing,  color: '#a5b4fc' },
                { label: 'Moving',     val: counts.moving,      color: '#4ade80' },
                { label: 'Stopped',    val: counts.stopped,     color: '#f87171' },
                { label: 'Delivered',  val: counts.delivered,   color: '#34d399' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0f1923', border: '1px solid #1e2a3a', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1, marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace" }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracking ID, sender or receiver..."
              style={{ width: '100%', padding: '11px 16px', background: '#0f1923', border: '1px solid #1e2a3a', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit', marginBottom: 16 }} />

            {/* Table */}
            <div style={{ background: '#0a1422', border: '1px solid #1a2840', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr 1fr 1.3fr', padding: '12px 20px', background: '#060d16', borderBottom: '1px solid #1a2840', fontSize: 11, color: '#475569', letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" }}>
                <span>TRACKING ID</span><span>SENDER</span><span>RECEIVER</span><span>STATUS</span><span>DELIVERY</span><span>ACTIONS</span>
              </div>

              {loading ? <Spinner /> : filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#334155' }}>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>📦</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14 }}>No shipments yet</div>
                </div>
              ) : filtered.map((s, i) => (
                <div key={s.tracking_id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr 1fr 1.3fr',
                  padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #0f1923' : 'none',
                  alignItems: 'center', transition: 'background 0.15s',
                }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: BRAND_COLOR, fontSize: 12, fontWeight: 700 }}>{s.tracking_id}</span>
                  <span style={{ fontSize: 13, color: '#e2e8f0' }}>{s.sender_name}</span>
                  <span style={{ fontSize: 13, color: '#e2e8f0' }}>{s.receiver_name}</span>
                  <span><StatusBadge status={s.status} /></span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{s.delivery_date}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => startEdit(s)} style={{ background: '#1e2a3a', border: 'none', color: '#94a3b8', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                    <button onClick={() => printReceipt(s)} style={{ background: '#1e2a3a', border: 'none', color: BRAND_COLOR, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>🖨</button>
                    <button onClick={() => deleteShipment(s.tracking_id)} style={{ background: '#1e2a3a', border: 'none', color: '#ef4444', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FORM VIEW ── */}
        {view === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>{editId ? 'Edit Shipment' : 'New Shipment'}</h1>
                <p style={{ color: '#475569', margin: '4px 0 0', fontSize: 14 }}>{editId ? `Editing ${editId}` : 'Register a new delivery'}</p>
              </div>
              <button onClick={() => setView('list')} style={{ background: 'none', border: '1px solid #1e2a3a', color: '#64748b', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                ← Back
              </button>
            </div>

            {/* Tracking ID Banner */}
            <div style={{ background: '#0f1923', border: `1px solid ${BRAND_COLOR}`, borderRadius: 12, padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>TRACKING ID — SHARE WITH CUSTOMER</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 24, fontWeight: 700, color: BRAND_COLOR, letterSpacing: 3 }}>{form.tracking_id}</div>
              </div>
              {!editId && (
                <button onClick={() => set('tracking_id', generateTrackingId())} style={{ background: '#1e2a3a', border: 'none', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                  ↻ Regenerate
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>

              <Sec title="📤 Sender Info">
                <FF label="Sender Name *"           val={form.sender_name}    onChange={v => set('sender_name', v)} />
                <FF label="Phone Number *"           val={form.sender_phone}   onChange={v => set('sender_phone', v)} />
                <FF label="Sending From (Address) *" val={form.sender_address} onChange={v => set('sender_address', v)} />
              </Sec>

              <Sec title="📍 Receiver Info">
                <FF label="Full Name *"       val={form.receiver_name}    onChange={v => set('receiver_name', v)} />
                <FF label="Phone Number *"    val={form.receiver_phone}   onChange={v => set('receiver_phone', v)} />
                <FF label="Email"             val={form.receiver_email}   onChange={v => set('receiver_email', v)} />
                <FF label="Delivery Address *"val={form.receiver_address} onChange={v => set('receiver_address', v)} />
                <FF label="City *"            val={form.receiver_city}    onChange={v => set('receiver_city', v)} />
              </Sec>

              <Sec title="📦 Package">
                <FF label="Description *" val={form.package_desc}   onChange={v => set('package_desc', v)} />
                <FF label="Weight (kg)"   val={form.package_weight} onChange={v => set('package_weight', v)} type="number" />
              </Sec>

              <Sec title="🗓️ Schedule">
                <FF label="Take-off Date *"      val={form.take_off_date}   onChange={v => set('take_off_date', v)}  type="date" />
                <FF label="Est. Delivery Date *" val={form.delivery_date}   onChange={v => set('delivery_date', v)}  type="date" />
                <FF label="Current Location"     val={form.current_location}onChange={v => set('current_location', v)} placeholder="e.g. Lagos Hub" />
              </Sec>

              <Sec title="📊 Status & Fees">
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>STATUS *</div>
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#060d16', border: '1px solid #2a3a55', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit' }}>
                    <option>Processing</option>
                    <option>Moving</option>
                    <option>Stopped</option>
                    <option>Delivered</option>
                  </select>
                </div>
                <FF label="Delivery Fee ($)"  val={form.delivery_fee} onChange={v => set('delivery_fee', v)} type="number" placeholder="0.00" />
                <FF label="Amount Paid ($)"   val={form.amount_paid}  onChange={v => set('amount_paid', v)}  type="number" placeholder="0.00" />
              </Sec>

              <Sec title="🚢 Port Locations">
                <FF label="First Port Location"  val={form.port_1_location} onChange={v => set('port_1_location', v)} placeholder="e.g. Port of Houston, TX" />
                <FF label="Second Port Location" val={form.port_2_location} onChange={v => set('port_2_location', v)} placeholder="e.g. Port of Rotterdam, Netherlands" />
                <FF label="Last Port Location"   val={form.port_3_location} onChange={v => set('port_3_location', v)} placeholder="e.g. Port of Lagos, Nigeria" />
                <FF label="Custom / Current Location" val={form.custom_location} onChange={v => set('custom_location', v)} placeholder="e.g. Clearing at Apapa Wharf" />
              </Sec>

              <Sec title="⏱️ Delivery Time & Holds">
                <FF label="Estimated Delivery Time" val={form.estimated_delivery_time} onChange={v => set('estimated_delivery_time', v)} placeholder="e.g. 5–7 business days" />
                <FF label="Date Stopped (if any)"   val={form.stopped_date}   onChange={v => set('stopped_date', v)}   type="date" />
                <FF label="Country / Location Stopped" val={form.stopped_country} onChange={v => set('stopped_country', v)} placeholder="e.g. Dubai, UAE — Customs Hold" />
              </Sec>

              <Sec title="📝 Notes">
                <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>ADDITIONAL NOTES</div>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={5} placeholder="Special instructions, fragile items, etc."
                  style={{ width: '100%', padding: '10px 12px', background: '#060d16', border: '1px solid #2a3a55', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
              </Sec>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: '1px solid #2a3a55', color: '#64748b', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              {editId && (
                <button onClick={() => printReceipt(form)} style={{ background: '#1e2a3a', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}`, padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  🖨 Print Receipt
                </button>
              )}
              <button onClick={saveForm} disabled={saving} style={{ background: BRAND_COLOR, color: '#fff', border: 'none', padding: '12px 36px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'SAVING…' : editId ? 'UPDATE SHIPMENT' : 'SAVE SHIPMENT'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Form Helpers ──────────────────────────────────────────────────────────────
function Sec({ title, children }) {
  return (
    <div style={{ background: '#0f1923', border: '1px solid #1e2a3a', borderRadius: 12, padding: '20px 20px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}
function FF({ label, val, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>{label.toUpperCase()}</div>
      <input type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', background: '#060d16', border: '1px solid #2a3a55', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('home')  // home | track | login | admin
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  // Hidden admin access everywhere (Ctrl/Cmd + Shift + A or #admin hash)
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = (e.key || '').toLowerCase()
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'a') setPage('login')
    }
    window.addEventListener('keydown', onKeyDown)
    if (typeof window !== 'undefined' && window.location?.hash === '#admin') setPage('login')
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (page === 'home') return <HomePage onAdminClick={() => setPage('login')} onTrackClick={() => setPage('track')} />
  if (page === 'track') return <TrackerPage onAdminClick={() => setPage('login')} onBack={() => setPage('home')} />
  if (page === 'login')   return <AdminLogin   onLogin={() => setPage('admin')} onBack={() => setPage('home')} />
  if (page === 'admin') {
    if (!session) return <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('home')} />
    return (
      <AdminDashboard
        onLogout={async () => { await supabase.auth.signOut(); setPage('login') }}
        onPublic={() => setPage('home')}
      />
    )
  }
}
