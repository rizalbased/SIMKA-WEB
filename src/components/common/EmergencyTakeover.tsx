import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRightCircle, Siren, Volume2, X } from 'lucide-react';
import { DisplayConfig } from '../../types';

interface EmergencyTakeoverProps {
  config: DisplayConfig;
  onDismiss?: () => void;
}

export const EmergencyTakeover: React.FC<EmergencyTakeoverProps> = ({
  config,
  onDismiss
}) => {
  if (!config.emergencyOverride) return null;

  const { title, details, level, actionInstruction } = config.emergencyMessage;

  return (
    <div className="fixed inset-0 z-50 bg-[#E06D53] text-[#18181B] flex flex-col justify-between p-8 md:p-12 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Background Warning Stripe pattern */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_20px,transparent_20px,transparent_40px)] pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex items-center justify-between border-b-4 border-[#18181B] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#18181B] text-[#F9C74F] flex items-center justify-center simka-shadow animate-bounce">
            <Siren className="w-9 h-9" />
          </div>
          <div>
            <div className="inline-block bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-md mb-1">
              HIGH PRIORITY BROADCAST TAKE OVER
            </div>
            <h1 className="font-editorial text-3xl md:text-5xl font-black uppercase tracking-tight text-[#18181B]">
              {title}
            </h1>
          </div>
        </div>

        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="px-4 py-2 bg-white hover:bg-neutral-100 simka-border simka-shadow font-display font-bold text-sm uppercase rounded-xl transition-transform active:translate-y-1"
          >
            Acknowledge & Close
          </button>
        )}
      </div>

      {/* Main Alert Body */}
      <div className="relative z-10 my-auto py-8 max-w-5xl mx-auto w-full grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 bg-white p-8 md:p-10 rounded-3xl simka-border simka-shadow-lg">
          <div className="flex items-center gap-3 text-[#E06D53] font-display font-black text-lg uppercase tracking-wider mb-4">
            <AlertTriangle className="w-6 h-6" />
            <span>Official Facility Notification</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-extrabold leading-snug text-[#18181B] mb-6">
            {details}
          </p>

          <div className="bg-[#FFF8E7] p-5 rounded-2xl border-2 border-[#18181B] flex items-start gap-4">
            <ArrowRightCircle className="w-7 h-7 text-[#0D6E6E] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono-code font-bold uppercase text-[#0D6E6E] mb-1">Required Action</div>
              <div className="font-display font-bold text-lg text-[#18181B]">
                {actionInstruction}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-5">
          <div className="bg-[#18181B] text-white p-6 rounded-3xl simka-shadow">
            <div className="text-[#F9C74F] font-mono-code text-xs font-bold uppercase mb-2">CAMPUS STATUS</div>
            <div className="font-editorial text-2xl font-black text-[#F8F6F0] mb-2">ZONE CONTROL ACTIVE</div>
            <p className="text-xs text-white/80 leading-relaxed">
              Public safety teams and floor marshals are actively stationed at all building junctions.
            </p>
          </div>

          <div className="bg-[#F9C74F] text-[#18181B] p-6 rounded-3xl simka-border simka-shadow">
            <div className="font-mono-code text-xs font-black uppercase text-[#18181B]/70 mb-1">ASSISTANCE FREQUENCY</div>
            <div className="font-editorial text-3xl font-black tracking-tight">CHANNEL 04</div>
            <div className="text-xs font-bold mt-1 text-[#18181B]/80">Or call internal security desk #99</div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Ticker on Takeover */}
      <div className="relative z-10 bg-[#18181B] text-white px-6 py-4 rounded-2xl simka-border flex items-center justify-between gap-4 font-mono-code text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#E06D53] animate-ping" />
          <span className="font-bold text-[#F9C74F] uppercase">EMERGENCY OVERRIDE STREAM ACTIVE</span>
        </div>
        <span className="text-white/60 uppercase">SIMKA SIGNAGE ENGINE • BROADCAST ID #BC-9921</span>
      </div>
    </div>
  );
};
