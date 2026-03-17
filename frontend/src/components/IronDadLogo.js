const IronDadLogo = ({ className = "", size = "default" }) => {
  const sizes = {
    small: { height: "32", fontSize: "text-lg" },
    default: { height: "40", fontSize: "text-xl" },
    large: { height: "56", fontSize: "text-3xl" }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Dumbbell Icon SVG */}
      <svg 
        width={currentSize.height} 
        height={currentSize.height} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Left weight */}
        <rect x="2" y="16" width="8" height="16" rx="2" fill="currentColor" className="text-primary" />
        <rect x="6" y="14" width="4" height="20" rx="1" fill="currentColor" className="text-primary" />
        
        {/* Center bar */}
        <rect x="10" y="22" width="28" height="4" rx="2" fill="currentColor" className="text-accent" />
        
        {/* Right weight */}
        <rect x="38" y="16" width="8" height="16" rx="2" fill="currentColor" className="text-primary" />
        <rect x="38" y="14" width="4" height="20" rx="1" fill="currentColor" className="text-primary" />
      </svg>

      {/* Text Logo */}
      <div className="flex flex-col leading-none">
        <div className={`font-black uppercase tracking-tighter ${currentSize.fontSize}`}>
          <span className="text-white">IRON</span>
          <span className="text-primary ml-1">DAD</span>
        </div>
        <div className="text-[10px] text-accent font-bold uppercase tracking-wider -mt-0.5">
          Dad Bod to Weapon
        </div>
      </div>
    </div>
  );
};

export default IronDadLogo;
