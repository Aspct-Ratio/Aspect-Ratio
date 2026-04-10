export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="flex-shrink-0">
        <rect x="2" y="2" width="26" height="26" rx="5" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5"/>
        <line x1="11" y1="2" x2="11" y2="28" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="2 2"/>
        <line x1="19" y1="2" x2="19" y2="28" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="2 2"/>
        <line x1="2" y1="11" x2="28" y2="11" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="2 2"/>
        <line x1="2" y1="19" x2="28" y2="19" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="2 2"/>
        <rect x="11" y="11" width="8" height="8" rx="1.5" fill="#4F46E5"/>
      </svg>
      <span className="font-bold text-[15px] tracking-tight text-gray-900">ASPCT RATIO</span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">Beta</span>
    </div>
  )
}
