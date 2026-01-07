import Link from "next/link"

export const SectionHeader = ({ title, subtitle, link }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="font-bold text-[40px]">{title}</div>
        {/* <Link className="font-bold text-[18px] hover:underline" href={link}>{subtitle}</Link> */}
      </div>
    </>
  )
}