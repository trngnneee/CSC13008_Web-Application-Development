export default function ClientLayout({ children }) {
  return (
    <>
      <div className="w-full overflow-hidden relative h-[100px]">
        <img
          src="/shape3.svg"
          className="w-full h-full object-cover"
        />
        <div className="text-white text-[80px] font-extrabold absolute -bottom-8 left-0 translate-x-1/5">Become a bidder</div>
      </div>
      <div className="my-[50px]">
        <div className="container mx-auto flex justify-center items-center gap-20">
          <div className="w-1/2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}