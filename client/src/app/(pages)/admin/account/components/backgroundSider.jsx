export const BackgroundSider = () => {
  return (
    <div className="w-3/5 h-full relative">
      <img
        src="/category1.jpg"
        alt="Admin background"
        className="w-full h-full object-cover opacity-90"
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-[60%]">
        <div className="w-[400px] h-auto">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain rounded-[20px]"
          />
        </div>
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 translate-y-full border border-[#ffffff5d] p-5 rounded-[20px] px-[50px] text-white bg-white/30 backdrop-blur-sm">
        <div className="text-center mb-2.5 font-light">Khám phá thêm về SnapBid</div>
        <div className="text-[20px] font-extrabold text-center">
          snapbid.com
        </div>
      </div>
    </div>
  );
};
