export const Breadcrumb = ({ title }) => {
  return (
    <div className="w-full overflow-hidden relative h-[100px]">
      <img
        src="/shape3.svg"
        className="w-full h-full object-cover"
      />
      <div className="text-white text-[80px] font-extrabold absolute bottom-1/2 translate-y-1/2 left-0 translate-x-1/5">{title}</div>
    </div>
  )
}