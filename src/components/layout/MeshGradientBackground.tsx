export default function MeshGradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-2]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/30 blur-[140px] animate-blob [animation-delay:2s]" />
      <div className="absolute bottom-[-20%] left-[15%] w-[50%] h-[50%] rounded-full bg-accent/40 blur-[120px] animate-blob [animation-delay:4s]" />
    </div>
  );
}
