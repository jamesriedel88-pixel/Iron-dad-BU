const IronDadLogo = ({ className = "", size = "default" }) => {
  const sizes = {
    small: { fontSize: "text-lg", tagline: "text-[8px]" },
    default: { fontSize: "text-xl", tagline: "text-[10px]" },
    large: { fontSize: "text-3xl", tagline: "text-xs" }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <div className={`font-black uppercase tracking-tighter ${currentSize.fontSize}`}>
        <span className="text-white">IRON</span>
        <span className="text-primary ml-1">DAD</span>
      </div>
      <div className={`${currentSize.tagline} text-accent font-bold uppercase tracking-wider -mt-0.5`}>
        Dad Bod to Beast
      </div>
    </div>
  );
};

export default IronDadLogo;
