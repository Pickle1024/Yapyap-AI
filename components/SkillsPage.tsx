import React from 'react';

interface Props {
  onBack: () => void;
}

export const SkillsPage: React.FC<Props> = ({ onBack }) => {
  const skills = [
    {
      title: "The Icebreaker (Openers)",
      icon: "🧊",
      color: "border-cyan-500/50 text-cyan-400",
      content: [
        { label: "Goal", text: "Take the risk, assume the burden. Don't wait for them." },
        { label: "Technique", text: "Use 'Free Information' from the setting, occasion, or their behavior." },
        { label: "Try This", text: "\"Describe for me...\", \"Tell me about...\", \"How did you get started in...?\"" },
        { label: "Avoid", text: "\"How are you?\" (Dead end), \"What do you do?\" (Too cliché)." }
      ]
    },
    {
      title: "Digging Deeper (Continuers)",
      icon: "⛏️",
      color: "border-emerald-500/50 text-emerald-400",
      content: [
        { label: "Goal", text: "Move past one-word answers." },
        { label: "Technique", text: "The F.O.R.M. Framework: Family, Occupation, Recreation, Miscellaneous." },
        { label: "Active Listening", text: "Listen with your eyes. Paraphrase what they said to show you care." },
        { label: "Follow Up", text: "\"What was the best part of that?\" or \"How did that make you feel?\"" }
      ]
    },
    {
      title: "Crimes & Misdemeanors (Killers)",
      icon: "💀",
      color: "border-rose-500/50 text-rose-400",
      content: [
        { label: "The FBI Agent", text: "Firing rapid-fire closed-ended questions without sharing anything yourself." },
        { label: "The Monopolizer", text: "Talking only about yourself for more than 5 minutes." },
        { label: "The One-Upper", text: "\"That happened to me too, but mine was bigger/worse/better...\"" },
        { label: "The Adviser", text: "Giving unsolicited advice instead of just listening and empathizing." }
      ]
    },
    {
      title: "The Graceful Exit (Closers)",
      icon: "🚪",
      color: "border-purple-500/50 text-purple-400",
      content: [
        { label: "Formula", text: "State a specific destination/task + Express appreciation." },
        { label: "Technique", text: "Don't just fade away. Be honest but polite." },
        { label: "Example", text: "\"I promised myself I'd meet three new people tonight. It's been lovely hearing about your trip.\"" },
        { label: "Business", text: "\"I need to catch the speaker before she leaves. Let's exchange cards.\"" }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">Skills Database</h2>
          <p className="text-slate-400">Mastering the fine art of small talk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {skills.map((skill, idx) => (
          <div key={idx} className={`bg-slate-800/50 border ${skill.color} border-opacity-30 rounded-xl p-6 backdrop-blur-sm`}>
            <div className={`flex items-center gap-3 mb-4 ${skill.color}`}>
              <span className="text-2xl">{skill.icon}</span>
              <h3 className="text-xl font-bold">{skill.title}</h3>
            </div>
            
            <div className="space-y-4">
              {skill.content.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500">{item.label}</span>
                  <p className="text-slate-200 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Ready to test your skills?</h3>
        <p className="text-slate-400 mb-6">"Conversation is a learned skill, not a personality trait."</p>
        <button 
          onClick={onBack}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
        >
          Enter Simulation
        </button>
      </div>
    </div>
  );
};