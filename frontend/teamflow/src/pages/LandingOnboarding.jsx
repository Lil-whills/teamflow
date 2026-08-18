import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutGrid, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  MessageSquare, 
  Users, 
  Kanban 
} from 'lucide-react';

const LandingOnboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      badge: 'WELCOME TO TEAMFLOW',
      title: "Where teams see who's doing what",
      description: 'TeamFlow empowers owners and team members to collaborate transparently. Create projects, assign tasks, track real-time progress, and eliminate workflow bottlenecks.',
      icon: Sparkles,
      iconBg: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
      preview: (
        <div className="bg-[#0b1511] border border-[#1b2e28] rounded-xl p-4 shadow-xl space-y-3 w-full max-w-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#162721]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#10b981] text-black font-bold text-[10px] flex items-center justify-center">
                TF
              </div>
              <span className="text-xs font-semibold text-white">Marketing site launch</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#172722] text-[#8ea89d] border border-[#223d33]">
              owner
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#8ca398]">
            <div className="flex items-center -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-700 text-[9px] text-white flex items-center justify-center ring-1 ring-[#0b1511]">WI</span>
              <span className="w-5 h-5 rounded-full bg-amber-700 text-[9px] text-white flex items-center justify-center ring-1 ring-[#0b1511]">JO</span>
              <span className="w-5 h-5 rounded-full bg-purple-800 text-[9px] text-white flex items-center justify-center ring-1 ring-[#0b1511]">CR</span>
            </div>
            <span className="text-[11px] font-medium text-[#34d399]">3 open · 3 members</span>
          </div>
        </div>
      )
    },
    {
      id: 1,
      badge: 'HOW IT WORKS',
      title: 'Simple Kanban & Contextual Discussions',
      description: 'Break work down into TODO, IN PROGRESS, and DONE. Assign tasks to specific members with due dates, and hold active discussions right where the work happens.',
      icon: LayoutGrid,
      iconBg: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
      preview: (
        <div className="grid grid-cols-3 gap-2 w-full max-w-md bg-[#09120f] border border-[#182a24] rounded-xl p-3 shadow-xl">
          <div className="bg-[#0f1d18] border border-[#1b2f28] rounded-lg p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-[10px] font-mono text-white font-semibold">TODO</span>
            </div>
            <div className="p-1.5 rounded bg-[#13241e] border border-[#1d352c] text-[10px] text-slate-200">
              Fix mobile nav
            </div>
          </div>

          <div className="bg-[#0f1d18] border border-[#1b2f28] rounded-lg p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-[10px] font-mono text-[#fbbf24] font-semibold">PROGRESS</span>
            </div>
            <div className="p-1.5 rounded bg-[#13241e] border border-[#f59e0b]/40 text-[10px] text-amber-200">
              Staging setup
            </div>
          </div>

          <div className="bg-[#0f1d18] border border-[#1b2f28] rounded-lg p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-mono text-[#34d399] font-semibold">DONE</span>
            </div>
            <div className="p-1.5 rounded bg-[#13241e] border border-[#10b981]/40 text-[10px] text-emerald-300">
              QA pass
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      badge: 'READY TO JOIN',
      title: "Streamline your team's workflow today",
      description: 'Create your account or sign in to start creating project boards, inviting teammates, and driving projects from to-do to done.',
      icon: CheckCircle2,
      iconBg: 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/30',
      preview: (
        <div className="bg-[#0b1511] border border-[#1b2f28] rounded-xl p-5 shadow-xl text-center space-y-3 w-full max-w-sm">
          <div className="w-10 h-10 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#34d399] mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-white">All systems ready</h4>
          <p className="text-[11px] text-[#7e998e]">
            Join thousands of productive teams organizing their daily work with TeamFlow.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const activeSlide = slides[currentSlide];
  const Icon = activeSlide.icon;

  return (
    <div className="min-h-screen w-full bg-[#08100d] text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#047857]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center font-bold text-black text-sm shadow-md">
            TF
          </div>
          <span className="font-semibold text-white text-base tracking-wide">
            TeamFlow
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-xs text-[#8ca398] hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-[#12211c] border border-transparent hover:border-[#1e382f] transition-all"
        >
          Skip to Sign In →
        </button>
      </header>

      {/* Slide Container */}
      <main className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center my-8 z-10">
        <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 key={currentSlide}">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12211c] border border-[#1e382f] text-[11px] font-mono tracking-widest text-[#34d399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            {activeSlide.badge}
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-lg">
            {activeSlide.title}
          </h1>

          {/* Description */}
          <p className="text-sm text-[#8fa79d] leading-relaxed max-w-md">
            {activeSlide.description}
          </p>

          {/* Interactive Preview Widget */}
          <div className="pt-3 w-full flex justify-center">
            {activeSlide.preview}
          </div>
        </div>
      </main>

      {/* Bottom Footer & Navigation Controls */}
      <footer className="max-w-5xl mx-auto w-full flex items-center justify-between z-10 pt-4 border-t border-[#12211c]">
        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentSlide === idx
                  ? 'w-7 bg-[#10b981]'
                  : 'w-2 bg-[#1b2f28] hover:bg-[#28473c]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#8ca398] hover:text-white bg-[#101e19] border border-[#1b2f28] hover:border-[#28453b] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-black transition-all shadow-md active:scale-[0.98]"
          >
            <span>{currentSlide === slides.length - 1 ? 'Join Now' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingOnboarding;
