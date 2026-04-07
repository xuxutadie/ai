import Grainient from './Grainient';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-900">
      <Grainient 
        color1="#3b82f6" // 亮蓝 (Tailwind Blue-500) 
        color2="#6366f1" // 靛蓝 (Tailwind Indigo-500) 
        color3="#0ea5e9" // 湖蓝 (Tailwind Sky-500) 
        timeSpeed={0.25} 
        noiseScale={2} 
        grainAmount={0.1} 
        contrast={1.5} 
      />
    </div>
  );
}
