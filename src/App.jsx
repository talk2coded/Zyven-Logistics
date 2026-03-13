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
  <div class="row"><span class="lbl">Country</span><span class="val">${s.receiver_country || '—'}</span></div>
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
  const statusText = isMoving ? '● SHIPMENT IN MOTION'
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
// REDESIGNED PUBLIC MARKETING HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════════
function HomePage({ onAdminClick, onTrackClick, onAboutClick, onContactClick }) {
  const [navOpen, setNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsMobile(w <= 768)
      setIsTablet(w > 768 && w <= 1024)  // ADD THIS
      if (w > 768) setNavOpen(false)
    }
    const handleScroll = () => setScrollY(window.scrollY)
    
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setNavOpen(false)
  }

  // Parallax offset for hero
  const parallaxOffset = scrollY * 0.5

  const services = [
    { icon: '✈️', title: 'Air Freight', desc: 'Express global air cargo with real-time tracking and priority handling.', stat: '48h', statLabel: 'Avg. transit' },
    { icon: '🚢', title: 'Ocean Freight', desc: 'FCL and LCL shipping solutions with port-to-door visibility.', stat: '150+', statLabel: 'Trade lanes' },
    { icon: '🚛', title: 'Ground Transport', desc: 'Last-mile delivery and full truckload services across continents.', stat: '99%', statLabel: 'On-time rate' },
    { icon: '🏭', title: 'Warehousing', desc: 'Smart storage with inventory management and fulfillment integration.', stat: '2M+', statLabel: 'Sq ft global' },
  ]

  const stats = [
    { value: '2.5M+', label: 'Shipments Delivered', suffix: 'annually' },
    { value: '150+', label: 'Countries Served', suffix: 'worldwide' },
    { value: '98.9%', label: 'On-Time Performance', suffix: 'global avg' },
    { value: '24/7', label: 'Real-Time Tracking', suffix: 'live updates' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060d16', overflowX: 'hidden' }}>
      {/* Navigation */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrollY > 50 ? 'rgba(6,13,22,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(26,40,64,0.8)' : 'none',
        transition: 'all 0.3s ease',
        padding: isMobile ? '0 20px' : '0 48px',
        height: isMobile ? 70 : 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={() => scrollTo('top')} style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#fff',
            boxShadow: `0 4px 20px ${BRAND_COLOR}40`
          }}>
            Z
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontFamily: "'IBM Plex Mono',monospace", 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: 800, 
              color: '#fff', 
              letterSpacing: -0.5 
            }}>
              ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
            </div>
            <div style={{ 
              fontSize: 9, 
              letterSpacing: 2, 
              color: '#64748b', 
              marginTop: -2,
              fontWeight: 600
            }}>LOGISTICS</div>
          </div>
        </button>

        {!isMobile && (
  <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
     <button onClick={onAboutClick} style={{
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      fontSize: 14,
      padding: '8px 16px',
      borderRadius: 8,
      transition: 'all 0.2s',
      fontWeight: 500,
    }} onMouseEnter={(e) => {
      e.target.style.color = '#fff'
      e.target.style.background = 'rgba(255,255,255,0.05)'
    }} onMouseLeave={(e) => {
      e.target.style.color = '#94a3b8'
      e.target.style.background = 'transparent'
    }}>About</button>
    <button onClick={onContactClick} style={{
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      fontSize: 14,
      padding: '8px 16px',
      borderRadius: 8,
      transition: 'all 0.2s',
      fontWeight: 500,
    }} onMouseEnter={(e) => {
      e.target.style.color = '#fff'
      e.target.style.background = 'rgba(255,255,255,0.05)'
    }} onMouseLeave={(e) => {
      e.target.style.color = '#94a3b8'
      e.target.style.background = 'transparent'
    }}>Contact</button>
    {[
      ['Services', 'services'],
      ['Network', 'network'],
    ].map(([label, id]) => (
      <button key={id} onClick={() => scrollTo(id)} style={{
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: 14,
        padding: '8px 16px',
        borderRadius: 8,
        transition: 'all 0.2s',
        fontWeight: 500,
      }} onMouseEnter={(e) => {
        e.target.style.color = '#fff'
        e.target.style.background = 'rgba(255,255,255,0.05)'
      }} onMouseLeave={(e) => {
        e.target.style.color = '#94a3b8'
        e.target.style.background = 'transparent'
      }}>{label}</button>
    ))}
   
    <button onClick={onTrackClick} style={{
      background: BRAND_COLOR,
      border: 'none',
      color: '#0b1220',
      padding: '10px 20px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13,
      marginLeft: 16,
      boxShadow: `0 4px 20px ${BRAND_COLOR}40`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }} onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)'
      e.target.style.boxShadow = `0 8px 30px ${BRAND_COLOR}60`
    }} onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = `0 4px 20px ${BRAND_COLOR}40`
    }}>
      Track Shipment
    </button>
  </nav>
)}



        {isMobile && (
          <button onClick={() => setNavOpen(!navOpen)} style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: '1px solid #1a2840',
            background: 'rgba(15,25,35,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            cursor: 'pointer'
          }}>
            <span style={{
              width: 20,
              height: 2,
              background: '#fff',
              borderRadius: 2,
              transform: navOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              transition: 'transform 0.3s'
            }} />
            <span style={{
              width: 20,
              height: 2,
              background: '#fff',
              borderRadius: 2,
              opacity: navOpen ? 0 : 1,
              transition: 'opacity 0.3s'
            }} />
            <span style={{
              width: 20,
              height: 2,
              background: '#fff',
              borderRadius: 2,
              transform: navOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              transition: 'transform 0.3s'
            }} />
          </button>
        )}
      </header>

      {/* Mobile Menu */}
      {isMobile && navOpen && (
        <div style={{
          position: 'fixed',
          top: 70,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6,13,22,0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          animation: 'fadeUp 0.3s ease'
        }}>
          {[
  ['Services', 'services'],
  ['Network', 'network'],
].map(([label, id]) => (
  <button key={id} onClick={() => scrollTo(id)} style={{
    background: 'none',
    border: 'none',
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: 600,
    padding: '16px 0',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid #1a2840'
  }}>{label}</button>
))}
<button onClick={onAboutClick} style={{
  background: 'none',
  border: 'none',
  color: '#e2e8f0',
  fontSize: 24,
  fontWeight: 600,
  padding: '16px 0',
  textAlign: 'left',
  cursor: 'pointer',
  borderBottom: '1px solid #1a2840'
}}>About</button>
<button onClick={onContactClick} style={{
  background: 'none',
  border: 'none',
  color: '#e2e8f0',
  fontSize: 24,
  fontWeight: 600,
  padding: '16px 0',
  textAlign: 'left',
  cursor: 'pointer',
  borderBottom: '1px solid #1a2840'
}}>Contact</button>
<button onClick={onTrackClick} style={{
  background: BRAND_COLOR,
  border: 'none',
  color: '#0b1220',
  padding: '16px 24px',
  borderRadius: 12,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 16,
  marginTop: 16
}}>
  Track Your Shipment →
</button>
        </div>
      )}

      {/* Hero Section */}
      <section id="top" style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: 80
      }}>
        {/* Background Elements */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(232,136,10,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59,130,246,0.1) 0%, transparent 50%),
            linear-gradient(180deg, #060d16 0%, #0a1422 100%)
          `
        }} />
        
        {/* Animated Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          backgroundImage: `
            linear-gradient(rgba(232,136,10,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,136,10,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateY(${parallaxOffset * 0.1}px)`
        }} />

        {/* Floating Orbs */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_COLOR}20 0%, transparent 70%)`,
          top: '20%',
          right: '10%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '40px 24px' : '0 48px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
          gap: isMobile ? 40 : 80,
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div style={{ animation: 'fadeUp 0.8s ease' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              background: 'rgba(232,136,10,0.1)',
              border: '1px solid rgba(232,136,10,0.3)',
              borderRadius: 100,
              marginBottom: 32
            }}>
              <span style={{
                width: 8,
                height: 8,
                background: '#22c55e',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 12,
                color: BRAND_COLOR,
                fontWeight: 600,
                letterSpacing: 1
              }}>
                LIVE OPERATIONS ACTIVE
              </span>
            </div>

            <h1 style={{
              fontSize: isMobile ? 'clamp(36px, 8vw, 56px)' : 'clamp(48px, 5vw, 72px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 24
            }}>
              Global logistics
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                reimagined
              </span>
            </h1>

            <p style={{
              color: '#94a3b8',
              fontSize: isMobile ? 16 : 18,
              lineHeight: 1.7,
              maxWidth: 540,
              marginBottom: 40
            }}>
              End-to-end supply chain visibility with AI-powered tracking, 
              predictive analytics, and seamless multi-modal transportation 
              across 150+ countries.
            </p>

            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 48
            }}>
              <button onClick={onTrackClick} style={{
                background: BRAND_COLOR,
                border: 'none',
                color: '#0b1220',
                padding: isMobile ? '14px 24px' : '16px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 4px 24px ${BRAND_COLOR}50`,
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = `0 12px 40px ${BRAND_COLOR}60`
              }} onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = `0 4px 24px ${BRAND_COLOR}50`
              }}>
                Track Shipment
                <span style={{ fontSize: 18 }}>→</span>
              </button>
              
              <button onClick={() => scrollTo('services')} style={{
                background: 'transparent',
                border: '1px solid #2a3a55',
                color: '#e2e8f0',
                padding: isMobile ? '14px 24px' : '16px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.target.style.borderColor = BRAND_COLOR
                e.target.style.background = 'rgba(232,136,10,0.05)'
              }} onMouseLeave={(e) => {
                e.target.style.borderColor = '#2a3a55'
                e.target.style.background = 'transparent'
              }}>
                Explore Services
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
              opacity: 0.8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>ISO 9001 Certified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>IATA Accredited</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>AEO Certified</span>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Card */}
          <div style={{
            position: 'relative',
            animation: 'fadeUp 0.8s ease 0.2s both'
          }}>
            {/* Main Tracking Card */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(15,25,35,0.9) 0%, rgba(10,20,34,0.95) 100%)',
              border: '1px solid rgba(232,136,10,0.2)',
              borderRadius: 24,
              padding: 32,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    color: '#64748b',
                    letterSpacing: 1,
                    marginBottom: 4
                  }}>
                    TRACKING ID
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 20,
                    fontWeight: 700,
                    color: BRAND_COLOR,
                    letterSpacing: 2
                  }}>
                    ZYV-8842-91
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 20,
                  color: '#22c55e',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    background: '#22c55e',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  IN TRANSIT
                </div>
              </div>

              {/* Progress Visual */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  height: 4,
                  background: '#1e2a3a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginBottom: 12
                }}>
                  <div style={{
                    width: '65%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                    borderRadius: 2,
                    transition: 'width 2s ease'
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#64748b'
                }}>
                  <span>Houston, TX</span>
                  <span>Rotterdam, NL</span>
                </div>
              </div>

              {/* Route Visualization */}
              <div style={{
                background: 'rgba(6,13,22,0.6)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  {['Origin', 'Transit', 'Customs', 'Delivery'].map((step, i) => (
                    <div key={step} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      zIndex: 2
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: i <= 2 ? `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)` : '#1e2a3a',
                        border: `2px solid ${i <= 2 ? BRAND_COLOR : '#2a3a55'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        boxShadow: i <= 2 ? `0 0 20px ${BRAND_COLOR}40` : 'none'
                      }}>
                        {i === 0 ? '✓' : i === 1 ? '🚢' : i === 2 ? '🏭' : '📦'}
                      </div>
                      <span style={{
                        fontSize: 10,
                        color: i <= 2 ? '#e2e8f0' : '#475569',
                        fontWeight: 600,
                        letterSpacing: 0.5
                      }}>{step}</span>
                    </div>
                  ))}
                  {/* Connecting Line */}
                  <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 40,
                    right: 40,
                    height: 2,
                    background: 'linear-gradient(90deg, #E8880A 0%, #E8880A 66%, #1e2a3a 66%, #1e2a3a 100%)',
                    zIndex: 1
                  }} />
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16
              }}>
                {[
                  ['ETA', '2 Days'],
                  ['Distance', '4,832 mi'],
                  ['Mode', 'Ocean'],
                ].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 11,
                      color: '#64748b',
                      letterSpacing: 1,
                      marginBottom: 4,
                      fontFamily: "'IBM Plex Mono',monospace"
                    }}>{label}</div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#e2e8f0'
                    }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: `linear-gradient(135deg, ${BRAND_COLOR}30 0%, transparent 100%)`,
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
          animation: 'bounce 2s infinite'
        }}>
          <span style={{ fontSize: 12, color: '#64748b', letterSpacing: 2 }}>SCROLL</span>
          <span style={{ fontSize: 20, color: BRAND_COLOR }}>↓</span>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'rgba(15,25,35,0.6)',
        borderTop: '1px solid #1a2840',
        borderBottom: '1px solid #1a2840',
        padding: '40px 24px'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '0 16px',
              borderRight: i < stats.length - 1 ? '1px solid #1a2840' : 'none'
            }}>
              <div style={{
                fontSize: isMobile ? 32 : 40,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: -1,
                marginBottom: 8,
                fontFamily: "'IBM Plex Mono',monospace"
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 14,
                color: '#94a3b8',
                fontWeight: 500,
                marginBottom: 4
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 12,
                color: '#64748b'
              }}>
                {stat.suffix}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Bento Grid */}
      <section id="services" style={{
        padding: isMobile ? '80px 24px' : '120px 48px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 64
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>
              OUR SERVICES
            </span>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#fff',
              marginTop: 16,
              letterSpacing: -1
            }}>
              Multi-modal logistics solutions
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: 18,
              maxWidth: 600,
              margin: '16px auto 0',
              lineHeight: 1.6
            }}>
              Comprehensive shipping services tailored to your supply chain needs
            </p>
          </div>

          {/* Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 24
          }}>
            {services.map((service, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
                border: '1px solid #1a2840',
                borderRadius: 24,
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(232,136,10,0.4)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a2840'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                {/* Background Glow */}
                <div style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: `radial-gradient(circle, ${BRAND_COLOR}15 0%, transparent 70%)`,
                  filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 24
                  }}>
                    <div style={{
                      width: 64,
                      height: 64,
                      background: 'rgba(232,136,10,0.1)',
                      border: '1px solid rgba(232,136,10,0.3)',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28
                    }}>
                      {service.icon}
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: 'rgba(232,136,10,0.1)',
                      borderRadius: 20,
                      border: '1px solid rgba(232,136,10,0.2)'
                    }}>
                      <span style={{
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: 20,
                        fontWeight: 700,
                        color: BRAND_COLOR
                      }}>
                        {service.stat}
                      </span>
                      <span style={{
                        fontSize: 11,
                        color: '#64748b',
                        marginLeft: 4
                      }}>
                        {service.statLabel}
                      </span>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 12
                  }}>
                    {service.title}
                  </h3>
                  
                  <p style={{
                    color: '#94a3b8',
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 24
                  }}>
                    {service.desc}
                  </p>

                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: BRAND_COLOR,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: 0
                  }}>
                    Learn more
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     

      {/* Network Map Section */}
      <section id="network" style={{
        padding: isMobile ? '80px 24px' : '120px 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 50%, rgba(232,136,10,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)
          `
        }} />

        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>
              GLOBAL NETWORK
            </span>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#fff',
              marginTop: 16,
              letterSpacing: -1
            }}>
              Connected across continents
            </h2>
          </div>

          {/* Simplified Network Visualization */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
            border: '1px solid #1a2840',
            borderRadius: 24,
            padding: isMobile ? 24 : 48,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? 24 : 48
            }}>
              {[
                { region: 'North America', hubs: '12 hubs', cities: ['Houston', 'Los Angeles', 'Miami', 'New York'] },
                { region: 'Europe', hubs: '8 hubs', cities: ['Rotterdam', 'Hamburg', 'Antwerp', 'Barcelona'] },
                { region: 'Asia Pacific', hubs: '15 hubs', cities: ['Singapore', 'Shanghai', 'Busan', 'Tokyo'] },
                { region: 'Middle East & Africa', hubs: '6 hubs', cities: ['Dubai', 'Lagos', 'Cape Town', 'Mombasa'] },
              ].map((area, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: isMobile ? 16 : 24,
                  borderRight: !isMobile && i < 3 ? '1px solid #1a2840' : 'none',
                  borderBottom: isMobile && i < 2 ? '1px solid #1a2840' : 'none'
                }}>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 8
                  }}>
                    {area.region}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 14,
                    color: BRAND_COLOR,
                    marginBottom: 16
                  }}>
                    {area.hubs}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center'
                  }}>
                    {area.cities.map(city => (
                      <span key={city} style={{
                        fontSize: 12,
                        color: '#64748b',
                        padding: '4px 10px',
                        background: 'rgba(30,42,58,0.5)',
                        borderRadius: 12
                      }}>
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    





      {/* Testimonials */}
      <section style={{
        padding: isMobile ? '80px 24px' : '120px 48px',
        background: 'linear-gradient(180deg, #060d16 0%, #0a1422 100%)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>
              TESTIMONIALS
            </span>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#fff',
              marginTop: 16,
              letterSpacing: -1
            }}>
              Trusted by industry leaders
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 24
          }}>
            {[
              {
                quote: "Zyven transformed our supply chain visibility. Their predictive ETAs reduced our inventory holding costs by 23%.",
                author: "Sarah Chen",
                role: "VP Operations",
                company: "TechGear International",
                rating: 5
              },
              {
                quote: "The real-time tracking and exception management has virtually eliminated our 'where is my shipment' inquiries.",
                author: "Marcus Johnson",
                role: "Logistics Director",
                company: "Global Retail Solutions",
                rating: 5
              },
              {
                quote: "From air freight to last-mile, Zyven provides the reliability and transparency our customers demand.",
                author: "Elena Rodriguez",
                role: "Supply Chain Manager",
                company: "MediPharm Distribution",
                rating: 5
              }
            ].map((t, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
                border: '1px solid #1a2840',
                borderRadius: 20,
                padding: 32,
                position: 'relative'
              }}>
                <div style={{ marginBottom: 20 }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} style={{ color: BRAND_COLOR, fontSize: 16, marginRight: 2 }}>★</span>
                  ))}
                </div>
                <p style={{
                  color: '#e2e8f0',
                  fontSize: 16,
                  lineHeight: 1.7,
                  marginBottom: 24,
                  fontStyle: 'italic'
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BRAND_COLOR}40 0%, #ff9f4340 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: BRAND_COLOR,
                    fontSize: 16
                  }}>
                    {t.author[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{t.author}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '80px 24px' : '120px 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 80% at 50% 50%, rgba(232,136,10,0.15) 0%, transparent 50%),
            linear-gradient(180deg, #0a1422 0%, #060d16 100%)
          `
        }} />

        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: -1,
            marginBottom: 24
          }}>
            Ready to optimize your supply chain?
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: 18,
            lineHeight: 1.7,
            marginBottom: 40
          }}>
            Join 2,500+ companies that trust Zyven for their global logistics needs.
            Get started with a free consultation.
          </p>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button onClick={onTrackClick} style={{
              background: BRAND_COLOR,
              border: 'none',
              color: '#0b1220',
              padding: '16px 32px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              boxShadow: `0 4px 24px ${BRAND_COLOR}50`,
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = `0 12px 40px ${BRAND_COLOR}60`
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = `0 4px 24px ${BRAND_COLOR}50`
            }}>
              Track a Shipment
            </button>
           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a1422',
        borderTop: '1px solid #1a2840',
        padding: isMobile ? '48px 24px' : '64px 48px 32px'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: 48,
            marginBottom: 64
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  Z
                </div>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 800, color: '#fff' }}>
                    ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
                  </div>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                Global logistics with real-time visibility, port-to-door delivery, 
                and full tracking accountability.
              </p>
              <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.8 }}>
                <div>3300 Claymoore Park Dr</div>
                <div>Houston, TX 77043</div>
                <div>United States</div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#94a3b8', letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>
                SERVICES
              </div>
              {['Air Freight', 'Ocean Freight', 'Ground Transport', 'Warehousing', 'Customs Brokerage'].map(item => (
                <div key={item} style={{ color: '#64748b', fontSize: 14, marginBottom: 12, cursor: 'pointer', ':hover': { color: '#fff' } }}>
                  {item}
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#94a3b8', letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>
                COMPANY
              </div>
              {['About Us', 'Careers', 'Press', 'Partners', 'Contact'].map(item => (
                <div key={item} style={{ color: '#64748b', fontSize: 14, marginBottom: 12, cursor: 'pointer' }}>
                  {item}
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#94a3b8', letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>
                LEGAL
              </div>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(item => (
                <div key={item} style={{ color: '#64748b', fontSize: 14, marginBottom: 12, cursor: 'pointer' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #1a2840',
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ color: '#475569', fontSize: 13 }}>
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </div>
           
          </div>
        </div>
      </footer>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
      `}</style>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE (STANDALONE)
// ═══════════════════════════════════════════════════════════════════════════════
function AboutPage({ onBack, onTrackClick, onContactClick }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const milestones = [
    { year: '2008', title: 'Founded in Houston', desc: 'Started with 3 employees and a 5,000 sq ft warehouse', highlight: false },
    { year: '2012', title: 'First International Office', desc: 'Opened Rotterdam hub to serve European markets', highlight: false },
    { year: '2016', title: 'Digital Transformation', desc: 'Launched proprietary tracking platform with real-time visibility', highlight: true },
    { year: '2019', title: 'Asia Pacific Expansion', desc: 'Singapore and Shanghai offices established', highlight: false },
    { year: '2022', title: 'AI Integration', desc: 'Deployed predictive analytics for ETA forecasting', highlight: true },
    { year: '2024', title: 'Global Network Complete', desc: '150+ countries served, 2.5M+ annual shipments', highlight: true },
  ]

  const values = [
    { icon: '🎯', title: 'Precision', desc: 'Every shipment tracked, every deadline met, every promise kept.' },
    { icon: '⚡', title: 'Velocity', desc: 'Speed without sacrifice—optimized routes that respect urgency.' },
    { icon: '🛡️', title: 'Integrity', desc: 'Transparent pricing, honest communication, ethical operations.' },
    { icon: '🌱', title: 'Sustainability', desc: 'Carbon-neutral options and green logistics for a better planet.' },
  ]

  const leaders = [
    { name: 'James Davidson', role: 'Founder & CEO', exp: '25+ years in global logistics', color: BRAND_COLOR },
    { name: 'Sarah Chen', role: 'Chief Operating Officer', exp: 'Former Amazon Logistics VP', color: '#3b82f6' },
    { name: 'Michael Torres', role: 'Chief Technology Officer', exp: 'Ex-Google Cloud, AI specialist', color: '#8b5cf6' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060d16' }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(6,13,22,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26,40,64,0.8)',
        padding: isMobile ? '0 20px' : '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
        }} onMouseEnter={(e) => {
          e.target.style.color = '#fff'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }} onMouseLeave={(e) => {
          e.target.style.color = '#94a3b8'
          e.target.style.background = 'transparent'
        }}>
          <span style={{ fontSize: 18 }}>←</span>
          <span>Back to Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: 16
          }}>Z</div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: '#fff' }}>
              ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#64748b', marginTop: -2 }}>LOGISTICS</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onTrackClick} style={{
            background: BRAND_COLOR,
            border: 'none',
            color: '#0b1220',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
          }}>Track</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section style={{
          padding: isMobile ? '60px 24px' : '100px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,136,10,0.15) 0%, transparent 50%)`
          }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1400, margin: '0 auto' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>ABOUT US</span>
            <h1 style={{
              fontSize: isMobile ? 36 : 56,
              fontWeight: 800,
              color: '#fff',
              marginTop: 20,
              letterSpacing: -2,
              lineHeight: 1.1
            }}>
              Built for the future of<br />
              <span style={{
                background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>global trade</span>
            </h1>
          </div>
        </section>

        {/* Story Section */}
        <section style={{
          padding: isMobile ? '40px 24px' : '80px 48px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 64,
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                background: 'rgba(232,136,10,0.1)',
                border: '1px solid rgba(232,136,10,0.2)',
                borderRadius: 100,
                marginBottom: 32
              }}>
                <span style={{ fontSize: 16 }}>🚀</span>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 13,
                  color: BRAND_COLOR,
                  fontWeight: 600,
                  letterSpacing: 1
                }}>OUR STORY</span>
              </div>

              <h2 style={{
                fontSize: isMobile ? 24 : 32,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 24,
                lineHeight: 1.3
              }}>From a single warehouse in Houston to a global network spanning 150+ countries</h2>

              <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                Founded in 2008 by logistics veterans who believed transparency and technology 
                could transform international shipping, Zyven began with a simple mission: 
                make global trade accessible, predictable, and efficient for businesses of all sizes.
              </p>
              <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                What started as a regional freight forwarder has evolved into a comprehensive 
                supply chain partner. Today, we combine deep industry expertise with cutting-edge 
                AI and IoT technology to move over 2.5 million shipments annually.
              </p>
              <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
                Our commitment remains unchanged: deliver not just cargo, but confidence. 
                Every tracking update, every on-time delivery, every solved customs challenge 
                reinforces the trust our clients place in us.
              </p>

              <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #1a2840' }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: '#e2e8f0', fontStyle: 'italic' }}>
                  "Logistics isn't just about moving boxes—it's about enabling possibilities."
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BRAND_COLOR}30 0%, #ff9f4330 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: BRAND_COLOR
                  }}>JD</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>James Davidson</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Founder & CEO</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(15,25,35,0.9) 0%, rgba(10,20,34,0.95) 100%)',
              border: '1px solid #1a2840',
              borderRadius: 24,
              padding: 40
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 12,
                color: '#64748b',
                letterSpacing: 2,
                marginBottom: 32,
                textTransform: 'uppercase'
              }}>Our Journey</div>

              {milestones.map((milestone, i, arr) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 20,
                  position: 'relative',
                  paddingBottom: i < arr.length - 1 ? 28 : 0,
                  marginBottom: i < arr.length - 1 ? 28 : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid #1a2840' : 'none'
                }}>
                  {i < arr.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: 23,
                      top: 44,
                      width: 2,
                      height: 'calc(100% - 20px)',
                      background: milestone.highlight ? `linear-gradient(180deg, ${BRAND_COLOR} 0%, #1e2a3a 100%)` : '#1e2a3a'
                    }} />
                  )}

                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: milestone.highlight ? `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)` : '#0f1923',
                    border: `2px solid ${milestone.highlight ? BRAND_COLOR : '#2a3a55'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: milestone.highlight ? '#0b1220' : '#64748b',
                    flexShrink: 0,
                    zIndex: 2
                  }}>{milestone.year.slice(2)}</div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: milestone.highlight ? '#fff' : '#94a3b8',
                      marginBottom: 4
                    }}>{milestone.title}</div>
                    <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{milestone.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{
          padding: isMobile ? '40px 24px' : '80px 48px',
          background: 'linear-gradient(180deg, #060d16 0%, #0a1422 50%, #060d16 100%)'
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? 28 : 36,
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              marginBottom: 48,
              letterSpacing: -1
            }}>What drives us</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: 24
            }}>
              {values.map((value, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
                  border: '1px solid #1a2840',
                  borderRadius: 20,
                  padding: 32,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 20px',
                    background: 'rgba(232,136,10,0.1)',
                    border: '1px solid rgba(232,136,10,0.3)',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28
                  }}>{value.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{value.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section style={{ padding: isMobile ? '40px 24px' : '80px 48px', maxWidth: 1400, margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: -1
          }}>Leadership team</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 24
          }}>
            {leaders.map((leader, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
                border: '1px solid #1a2840',
                borderRadius: 20,
                padding: 32,
                textAlign: 'center'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${leader.color}30 0%, ${leader.color}10 100%)`,
                  border: `2px solid ${leader.color}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 700,
                  color: leader.color
                }}>{leader.name.split(' ').map(n => n[0]).join('')}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{leader.name}</h3>
                <div style={{ fontSize: 14, color: BRAND_COLOR, fontWeight: 600, marginBottom: 8 }}>{leader.role}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{leader.exp}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section style={{
          padding: isMobile ? '40px 24px' : '60px 48px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div style={{
            padding: '32px 48px',
            background: 'rgba(15,25,35,0.6)',
            border: '1px solid #1a2840',
            borderRadius: 16,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 48
          }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#64748b', letterSpacing: 2 }}>
              CERTIFIED & ACCREDITED BY
            </span>
            {['ISO 9001:2015', 'IATA', 'AEO Certified', 'C-TPAT', 'GDP Compliant'].map((cert) => (
              <span key={cert} style={{
                fontSize: 14,
                color: '#94a3b8',
                fontWeight: 600,
                padding: '8px 16px',
                background: 'rgba(30,42,58,0.5)',
                borderRadius: 8,
                border: '1px solid #2a3a55'
              }}>{cert}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: isMobile ? '60px 24px' : '100px 48px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(232,136,10,0.15) 0%, transparent 50%)`
          }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: -1,
              marginBottom: 24
            }}>Ready to work with us?</h2>
            <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40 }}>
              Join 2,500+ companies that trust Zyven for their global logistics needs.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onContactClick} style={{
                background: BRAND_COLOR,
                border: 'none',
                color: '#0b1220',
                padding: '16px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15
              }}>Contact Us</button>
              <button onClick={onTrackClick} style={{
                background: 'transparent',
                border: '1px solid #2a3a55',
                color: '#e2e8f0',
                padding: '16px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15
              }}>Track a Shipment</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          background: '#0a1422',
          borderTop: '1px solid #1a2840',
          padding: isMobile ? '48px 24px' : '64px 48px 32px'
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center', color: '#475569', fontSize: 13 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ color: BRAND_COLOR }}>support@zyvenlogistics.com</span> • 3300 Claymoore Park Dr, Houston, TX 77043
            </div>
            <div>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE (STANDALONE - NO FORM)
// ═══════════════════════════════════════════════════════════════════════════════
function ContactPage({ onBack, onTrackClick, onAboutClick }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const contactCards = [
    { 
      icon: '📍', 
      title: 'Headquarters',
      address: '3300 Claymoore Park Dr',
      city: 'Houston, TX 77043',
      country: 'United States',
     
    },
    { 
      icon: '📞', 
      title: 'Phone Support',
      main: '+1 (319) 380-3526',
      hours: 'Mon-Fri: 8am - 6pm CST',
      action: 'Call Now',
      link: 'tel:: +13193803526'
    },
    { 
      icon: '✉️', 
      title: 'Email',
      sales: 'sales@zyvenlogistics.com',
      support: 'support@zyvenlogistics.com',
      action: 'Send Email',
      link: 'mailto:sales@zyvenlogistics.com'
    },
    
  ]

  const globalOffices = [
    { region: 'North America', city: 'Houston',  flag: '🇺🇸' },
    { region: 'Europe', city: 'Rotterdam',  flag: '🇳🇱' },
    { region: 'Asia Pacific', city: 'Singapore', flag: '🇸🇬' },
    { region: 'Middle East', city: 'Dubai', flag: '🇦🇪' },
  ]

  const departments = [
   
    { name: 'Customer Support', email: 'support@zyvenlogistics.com', desc: 'Existing shipment assistance' },
   
    { name: 'Claims', email: 'support@zyvenlogistics.com', desc: 'Damage or loss reports' },
   
   
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060d16' }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,136,10,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 20% 100%, rgba(59,130,246,0.08) 0%, transparent 50%),
          linear-gradient(180deg, #060d16 0%, #0a1422 50%, #060d16 100%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(6,13,22,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26,40,64,0.8)',
        padding: isMobile ? '0 20px' : '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.target.style.color = '#fff'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }} onMouseLeave={(e) => {
          e.target.style.color = '#94a3b8'
          e.target.style.background = 'transparent'
        }}>
          <span style={{ fontSize: 18 }}>←</span>
          <span>Back to Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: 16
          }}>Z</div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: '#fff' }}>
              ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#64748b', marginTop: -2 }}>LOGISTICS</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onTrackClick} style={{
            background: BRAND_COLOR,
            border: 'none',
            color: '#0b1220',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
          }}>Track</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: 72, position: 'relative', zIndex: 5 }}>
        {/* Hero */}
        <section style={{
          padding: isMobile ? '80px 24px' : '120px 48px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>GET IN TOUCH</span>
            <h1 style={{
              fontSize: isMobile ? 40 : 64,
              fontWeight: 800,
              color: '#fff',
              marginTop: 20,
              letterSpacing: -2,
              lineHeight: 1.1
            }}>
              We're here to<br />
              <span style={{
                background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>help</span>
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: 18,
              maxWidth: 600,
              margin: '32px auto 0',
              lineHeight: 1.7
            }}>
              Reach out to our team for quotes, support, or partnership opportunities. 
              We typically respond within 2 hours during business hours.
            </p>
          </div>
        </section>

        {/* Contact Cards Grid */}
        <section style={{
          padding: isMobile ? '40px 24px' : '60px 48px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 24
          }}>
            {contactCards.map((card, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, rgba(15,25,35,0.9) 0%, rgba(10,20,34,0.95) 100%)',
                border: '1px solid #1a2840',
                borderRadius: 24,
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(232,136,10,0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a2840'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                {/* Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  background: `radial-gradient(circle, ${BRAND_COLOR}10 0%, transparent 70%)`,
                  filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    background: 'rgba(232,136,10,0.1)',
                    border: '1px solid rgba(232,136,10,0.3)',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 24
                  }}>{card.icon}</div>

                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{card.title}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {card.address && (
                      <>
                        <span style={{ color: '#e2e8f0', fontSize: 15 }}>{card.address}</span>
                        <span style={{ color: '#94a3b8', fontSize: 14 }}>{card.city}</span>
                        <span style={{ color: '#64748b', fontSize: 14 }}>{card.country}</span>
                      </>
                    )}
                    {card.main && (
                      <>
                        <span style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>{card.main}</span>
                        <span style={{ color: '#94a3b8', fontSize: 14 }}>{card.hours}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>{card.tollFree}</span>
                      </>
                    )}
                    {card.sales && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontSize: 13 }}>Sales:</span>
                            <span style={{ color: '#e2e8f0', fontSize: 14 }}>{card.sales}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontSize: 13 }}>Support:</span>
                            <span style={{ color: '#e2e8f0', fontSize: 14 }}>{card.support}</span>
                          </div>
                         
                        </div>
                      </>
                    )}
                    {card.status && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                          <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>{card.status}</span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: 14 }}>{card.response}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>{card.hours}</span>
                      </>
                    )}
                  </div>

                  <a href={card.link} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background: i === 0 ? BRAND_COLOR : 'rgba(232,136,10,0.1)',
                    border: i === 0 ? 'none' : '1px solid rgba(232,136,10,0.3)',
                    borderRadius: 10,
                    color: i === 0 ? '#0b1220' : BRAND_COLOR,
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} onMouseEnter={(e) => {
                    if (i !== 0) {
                      e.target.style.background = 'rgba(232,136,10,0.2)'
                    }
                  }} onMouseLeave={(e) => {
                    if (i !== 0) {
                      e.target.style.background = 'rgba(232,136,10,0.1)'
                    }
                  }}>
                    {card.action} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Offices */}
        <section style={{
          padding: isMobile ? '60px 24px' : '100px 48px',
          background: 'linear-gradient(180deg, #060d16 0%, #0a1422 50%, #060d16 100%)'
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 12,
                color: BRAND_COLOR,
                letterSpacing: 3,
                fontWeight: 600
              }}>GLOBAL PRESENCE</span>
              <h2 style={{
                fontSize: isMobile ? 32 : 40,
                fontWeight: 800,
                color: '#fff',
                marginTop: 16,
                letterSpacing: -1
              }}>Regional Offices</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: 24
            }}>
              {globalOffices.map((office, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)',
                  border: '1px solid #1a2840',
                  borderRadius: 20,
                  padding: 28,
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(232,136,10,0.3)'
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a2840'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{office.flag}</div>
                  <div style={{ fontSize: 12, color: BRAND_COLOR, letterSpacing: 2, marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {office.region.toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{office.city}</h3>
                  <p style={{ 
                    color: '#94a3b8', 
                    fontSize: 14, 
                    fontFamily: "'IBM Plex Mono',monospace",
                    marginBottom: 16
                  }}>{office.phone}</p>
                 
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Department Directory */}
        <section style={{
          padding: isMobile ? '60px 24px' : '100px 48px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: BRAND_COLOR,
              letterSpacing: 3,
              fontWeight: 600
            }}>DIRECTORY</span>
            <h2 style={{
              fontSize: isMobile ? 32 : 40,
              fontWeight: 800,
              color: '#fff',
              marginTop: 16,
              letterSpacing: -1
            }}>Department Contacts</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 20
          }}>
            {departments.map((dept, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, rgba(15,25,35,0.6) 0%, rgba(10,20,34,0.8) 100%)',
                border: '1px solid #1a2840',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(232,136,10,0.2)'
                e.currentTarget.style.background = 'linear-gradient(145deg, rgba(15,25,35,0.8) 0%, rgba(10,20,34,0.9) 100%)'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a2840'
                e.currentTarget.style.background = 'linear-gradient(145deg, rgba(15,25,35,0.6) 0%, rgba(10,20,34,0.8) 100%)'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{dept.name}</h3>
                <p style={{ color: '#64748b', fontSize: 13 }}>{dept.desc}</p>
                <a href={`mailto:${dept.email}`} style={{
                  color: BRAND_COLOR,
                  fontSize: 13,
                  fontFamily: "'IBM Plex Mono',monospace",
                  textDecoration: 'none',
                  marginTop: 'auto',
                  paddingTop: 12,
                  borderTop: '1px solid #1a2840'
                }}>{dept.email}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Banner */}
        <section style={{
          padding: isMobile ? '40px 24px' : '60px 48px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,136,10,0.15) 0%, rgba(255,159,67,0.05) 100%)',
            border: `1px solid ${BRAND_COLOR}40`,
            borderRadius: 20,
            padding: isMobile ? '32px 24px' : '40px 48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🚨</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Shipment Emergency?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
              For urgent shipment issues outside business hours, call our 24/7 emergency hotline.
            </p>
            <a href="tel:+13193803526" style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: BRAND_COLOR,
              borderRadius: 10,
              color: '#0b1220',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'IBM Plex Mono',monospace",
              textDecoration: 'none'
            }}>
             +1 (319) 380-3526
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          background: '#0a1422',
          borderTop: '1px solid #1a2840',
          padding: isMobile ? '48px 24px' : '64px 48px 32px',
          marginTop: 80
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
              paddingBottom: 32,
              borderBottom: '1px solid #1a2840',
              marginBottom: 32
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#fff',
                  fontSize: 18
                }}>Z</div>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: '#64748b' }}>LOGISTICS</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 32 }}>
                <button onClick={onAboutClick} style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  About Us
                </button>
                <button onClick={onTrackClick} style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  Track Shipment
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ color: '#475569', fontSize: 13 }}>
                © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
              </div>
            
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDESIGNED PUBLIC TRACKING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function TrackerPage({ onBack, onAdminClick }) {
  const [tid, setTid] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [isFocused, setIsFocused] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zyven_recent_tracks')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  async function track() {
    const val = tid.trim().toUpperCase()
    if (!val) return
    setLoading(true); setError(''); setResult(null)
    
    // Simulate API call delay for better UX
    await new Promise(r => setTimeout(r, 800))
    
    const { data, error: err } = await supabase
      .rpc('track_shipment', { p_tracking_id: val })
    
    setLoading(false)
    if (err || !data || data.length === 0) {
      setError('No shipment found with that tracking ID. Please check and try again.')
    } else {
      setResult(data[0])
      // Save to recent searches
      const updated = [val, ...recentSearches.filter(s => s !== val)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('zyven_recent_tracks', JSON.stringify(updated))
    }
  }

  const clearSearch = () => {
    setTid('')
    setResult(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060d16', display: 'flex', flexDirection: 'column' }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,136,10,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(59,130,246,0.08) 0%, transparent 50%),
          linear-gradient(180deg, #060d16 0%, #0a1422 50%, #060d16 100%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Grid Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(232,136,10,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,136,10,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(6,13,22,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26,40,64,0.6)',
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.target.style.color = '#fff'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }} onMouseLeave={(e) => {
          e.target.style.color = '#94a3b8'
          e.target.style.background = 'transparent'
        }}>
          <span style={{ fontSize: 18 }}>←</span>
          <span>Back to homepage</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #ff9f43 100%)`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: 16
          }}>
            Z
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
              ZYVEN<span style={{ color: BRAND_COLOR }}>.</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#64748b', marginTop: -2 }}>LOGISTICS</div>
          </div>
        </div>

        <div style={{ width: 100 }} /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 5,
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: 1000 }}>
          
          {/* Hero Search Section */}
          {!result && (
            <div style={{
              textAlign: 'center',
              padding: '60px 0 40px',
              animation: 'fadeUp 0.6s ease'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(232,136,10,0.1)',
                border: '1px solid rgba(232,136,10,0.2)',
                borderRadius: 100,
                marginBottom: 24
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  background: '#22c55e',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 12,
                  color: BRAND_COLOR,
                  fontWeight: 600,
                  letterSpacing: 1
                }}>
                  TRACKING SYSTEM ONLINE
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: -1,
                marginBottom: 16,
                lineHeight: 1.1
              }}>
                Track your shipment
              </h1>
              
              <p style={{
                color: '#94a3b8',
                fontSize: 16,
                maxWidth: 480,
                margin: '0 auto 40px',
                lineHeight: 1.6
              }}>
                Enter your tracking ID to get real-time updates on your shipment's location, 
                estimated delivery, and transit history.
              </p>

              {/* Search Box */}
              <div style={{
  maxWidth: 600,
  margin: '0 auto',
  position: 'relative',
  width: '100%'
}}>
  <div style={{
    background: 'rgba(15,25,35,0.8)',
    border: '1px solid #1e2a3a',
    borderRadius: 16,
    padding: '6px',
    display: 'flex',
    gap: 6,
    flexWrap: 'nowrap',
    alignItems: 'center'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      color: '#64748b',
      flexShrink: 0
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    </div>
    
    <input
  value={tid}
  onChange={e => setTid(e.target.value.toUpperCase())}
  onKeyDown={e => e.key === 'Enter' && track()}
  placeholder="Enter tracking ID"
  style={{
    flex: 1,
    minWidth: 0,
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 16,
    fontFamily: "'IBM Plex Mono',monospace",
    letterSpacing: 1,
    outline: 'none',
    padding: '14px 0',
    width: '100%'
  }}
  onMouseEnter={(e) => {
    e.target.style.border = 'none'
    e.target.style.boxShadow = 'none'
  }}
  onMouseDown={(e) => {
    e.target.style.border = 'none'
    e.target.style.boxShadow = 'none'
    e.target.style.outline = 'none'
  }}
  onFocus={(e) => {
    e.target.style.border = 'none'
    e.target.style.boxShadow = 'none'
    e.target.style.outline = 'none'
  }}
/>
    
    {tid && (
      <button onClick={clearSearch} style={{
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        padding: '0 8px',
        fontSize: 20,
        flexShrink: 0
      }}>
        ×
      </button>
    )}
    
    <button
      onClick={track}
      disabled={loading || !tid.trim()}
      style={{
        background: BRAND_COLOR,
        border: 'none',
        color: '#0b1220',
        padding: '12px 20px',
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        cursor: tid.trim() ? 'pointer' : 'not-allowed',
        opacity: tid.trim() ? 1 : 0.5,
        flexShrink: 0,
        whiteSpace: 'nowrap'
      }}
    >
      {loading ? '...' : 'Track'}
    </button>
  </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && !tid && (
                  <div style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Recent:</span>
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => { setTid(search); track() }}
                        style={{
                          background: 'rgba(30,42,58,0.5)',
                          border: '1px solid #2a3a55',
                          color: '#94a3b8',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontFamily: "'IBM Plex Mono',monospace",
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = BRAND_COLOR
                          e.target.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#2a3a55'
                          e.target.style.color = '#94a3b8'
                        }}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  maxWidth: 600,
                  margin: '24px auto 0',
                  padding: '16px 20px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#f87171',
                  fontSize: 14,
                  animation: 'fadeUp 0.3s ease'
                }}>
                  <span style={{ fontSize: 18 }}>⚠</span>
                  {error}
                </div>
              )}

              {/* Quick Help Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                maxWidth: 800,
                margin: '60px auto 0'
              }}>
                {[
                  { icon: '📱', title: 'Real-time Updates', desc: 'Live tracking via GPS and IoT sensors' },
                  { icon: '🔔', title: 'Notifications', desc: 'Email & SMS alerts at every milestone' },
                  { icon: '📄', title: 'Proof of Delivery', desc: 'Digital signatures and photo confirmation' },
                  { icon: '💬', title: '24/7 Support', desc: 'Chat with our logistics experts anytime' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(15,25,35,0.6)',
                    border: '1px solid #1a2840',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(232,136,10,0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1a2840'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div style={{ animation: 'fadeUp 0.5s ease' }}>
              {/* Results Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    color: '#64748b',
                    letterSpacing: 2,
                    marginBottom: 4,
                    textTransform: 'uppercase'
                  }}>
                    Tracking Results
                  </div>
                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: -0.5
                  }}>
                    Shipment Details
                  </h2>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={clearSearch} style={{
                    background: 'rgba(30,42,58,0.5)',
                    border: '1px solid #2a3a55',
                    color: '#94a3b8',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }} onMouseEnter={(e) => {
                    e.target.style.borderColor = '#64748b'
                    e.target.style.color = '#fff'
                  }} onMouseLeave={(e) => {
                    e.target.style.borderColor = '#2a3a55'
                    e.target.style.color = '#94a3b8'
                  }}>
                    <span>←</span> New Search
                  </button>
                  
                  
                </div>
              </div>

              {/* Tracking ID Banner */}
              <div style={{
                background: `linear-gradient(135deg, rgba(232,136,10,0.15) 0%, rgba(255,159,67,0.05) 100%)`,
                border: `1px solid ${BRAND_COLOR}40`,
                borderRadius: 16,
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{
                    fontSize: 11,
                    color: '#64748b',
                    letterSpacing: 2,
                    marginBottom: 4,
                    fontFamily: "'IBM Plex Mono',monospace"
                  }}>
                    TRACKING ID
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 24,
                    fontWeight: 900,
                    color: BRAND_COLOR,
                    letterSpacing: 2
                  }}>
                    {result.tracking_id}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <StatusBadge status={result.status} />
                  <div style={{
                    padding: '8px 16px',
                    background: 'rgba(6,13,22,0.5)',
                    borderRadius: 8,
                    border: '1px solid #2a3a55'
                  }}>
                    <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, marginBottom: 2 }}>LAST UPDATED</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Tracker */}
              <div style={{ marginBottom: 24 }}>
                <TruckTracker status={result.status} />
              </div>

              {/* Journey Steps */}
              <div style={{
                background: 'rgba(15,25,35,0.6)',
                border: '1px solid #1a2840',
                borderRadius: 16,
                padding: '20px 24px',
                marginBottom: 24
              }}>
                <JourneySteps status={result.status} />
              </div>

              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}>
                <InfoCard title="📅 Timeline" rows={[
                  ['Ship Date', result.take_off_date],
                  ['Est. Delivery', result.delivery_date],
                  ['Delivery Window', result.estimated_delivery_time || '—'],
                  ['Days in Transit', calculateDays(result.take_off_date)],
                ]} />
                
                <InfoCard title="📦 Package Details" rows={[
                  ['Description', result.package_desc],
                  ['Weight', result.package_weight ? `${result.package_weight} kg` : '—'],
                  ['Dimensions', result.package_dimensions || '—'],
                  ['Service Type', result.service_type || 'Standard'],
                ]} />
                
                <InfoCard title="📍 Locations" rows={[
                  ['Origin', result.port_1_location || result.sender_address],
                  ['Current', result.status === 'Delivered' ? null : result.status === 'Stopped' ? result.stopped_country || result.current_location : result.current_location || result.custom_location || 'In Transit'],
                
                  ['Next Stop', result.port_2_location || '—'],
                  ['Destination', result.receiver_city],
                ]} />
                
                <InfoCard title="👥 Parties" rows={[
                  ['Shipper', result.sender_name],
                  ['Consignee', result.receiver_name],
                  ['Notify Party', result.receiver_email || '—'],
                  ['Broker', result.customs_broker || '—'],
                ]} />
              </div>

              {/* Port Route Visualization */}
              {(result.port_1_location || result.port_2_location || result.port_3_location) && (
                <div style={{
                  background: 'rgba(15,25,35,0.6)',
                  border: '1px solid #1a2840',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 24
                }}>
                  <div style={{
                    fontSize: 11,
                    color: '#64748b',
                    letterSpacing: 2,
                    marginBottom: 20,
                    fontFamily: "'IBM Plex Mono',monospace"
                  }}>
                    PORT ROUTE
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { loc: result.port_1_location, label: 'Origin', icon: '🏁' },
                      { loc: result.port_2_location, label: 'Transit', icon: '🏁' },
                      { loc: result.port_3_location, label: 'Destination', icon: '🏁' },
                    ].filter(p => p.loc).map((port, i, arr) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          background: 'rgba(6,13,22,0.8)',
                          border: `1px solid ${i === arr.length - 1 ? BRAND_COLOR : '#2a3a55'}`,
                          borderRadius: 12,
                          padding: 16,
                          minWidth: 140
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 8 }}>{port.icon}</div>
                          <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, marginBottom: 4 }}>{port.label}</div>
                          <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{port.loc}</div>
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ color: BRAND_COLOR, fontSize: 20 }}>→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stop/Hold Alert */}
              {(result.stopped_date || result.stopped_country) && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    🛑
                  </div>
                  <div>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      Shipment on Hold
                    </div>
                    <div style={{ color: '#fca5a5', fontSize: 14, lineHeight: 1.6 }}>
                      {result.stopped_country && `Location: ${result.stopped_country}`}
                      {result.stopped_date && ` • Date: ${result.stopped_date}`}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                      Contact support for more information about this hold.
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Details */}
              {(result.delivery_fee || result.amount_paid) && (
                <div style={{
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 12,
                  padding: 20
                }}>
                  <div style={{
                    fontSize: 11,
                    color: '#64748b',
                    letterSpacing: 2,
                    marginBottom: 16,
                    fontFamily: "'IBM Plex Mono',monospace"
                  }}>
                    CHARGES
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Delivery Fee</div>
                      <div style={{ fontSize: 20, color: '#fff', fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
                        ${parseFloat(result.delivery_fee || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Amount Paid</div>
                      <div style={{ fontSize: 20, color: '#22c55e', fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
                        ${parseFloat(result.amount_paid || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Balance Due</div>
                      <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
                        ${(parseFloat(result.delivery_fee || 0) - parseFloat(result.amount_paid || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        borderTop: '1px solid #1a2840',
        padding: '24px',
        textAlign: 'center',
        color: '#475569',
        fontSize: 13
      }}>
        <div style={{ marginBottom: 8 }}>
          Need help? Contact our support team at{' '}
          <span style={{ color: BRAND_COLOR }}>support@zyvenlogistics.com</span>
        </div>
        <div>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Helper function
function calculateDays(takeOffDate) {
  if (!takeOffDate) return '—'
  const start = new Date(takeOffDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} days` : 'Today'
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
  receiver_name: '', receiver_phone: '', receiver_email: '', receiver_address: '', receiver_country: '',
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
    const required = ['sender_name','sender_phone','sender_address','receiver_name','receiver_phone','receiver_address','package_desc','take_off_date','delivery_date']
    for (const f of required) {
      if (!form[f]?.toString().trim()) {
        flash(`Please fill: ${f.replace(/_/g, ' ')}`, false); return
      }
    }
    setSaving(true)
    const payload = { ...form, package_weight: parseFloat(form.package_weight) || null, delivery_fee: parseFloat(form.delivery_fee) || null, amount_paid: parseFloat(form.amount_paid) || null, stopped_date: form.stopped_date || null }

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
               
                <FF label="Country *"         val={form.receiver_country} onChange={v => set('receiver_country', v)} placeholder="e.g. United States" />
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
  const [page, setPage] = useState('home')  // home | track | login | admin | about | contact
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

  if (page === 'home') return <HomePage onAdminClick={() => setPage('login')} onTrackClick={() => setPage('track')} onAboutClick={() => setPage('about')} onContactClick={() => setPage('contact')} />
  if (page === 'track') return <TrackerPage onAdminClick={() => setPage('login')} onBack={() => setPage('home')} />
  if (page === 'about') return <AboutPage onBack={() => setPage('home')} onTrackClick={() => setPage('track')} onContactClick={() => setPage('contact')} />
  if (page === 'contact') return <ContactPage onBack={() => setPage('home')} onTrackClick={() => setPage('track')} onAboutClick={() => setPage('about')} />
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