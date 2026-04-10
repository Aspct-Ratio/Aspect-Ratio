'use client'

import ChannelAccordion from './ChannelAccordion'
import NamingConfig from './NamingConfig'

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function Step2Formats({ onBack, onNext }: Props) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-extrabold text-gray-900 mb-1 tracking-tight">CHOOSE FORMATS &amp; CONFIGURE NAMING</h1>
      <p className="text-sm text-gray-500 mb-7">Select the channels you need, then set your file naming convention.</p>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Left: channels */}
        <div>
          <ChannelAccordion />
        </div>

        {/* Right: settings */}
        <div>
          <NamingConfig />
        </div>
      </div>

      <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
        <button onClick={onBack} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">← Back</button>
        <button onClick={onNext} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">Adjust Crops →</button>
      </div>
    </div>
  )
}
