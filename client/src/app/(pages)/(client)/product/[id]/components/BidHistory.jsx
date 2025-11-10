export const BidHistory = () => {
  const bids = [
    { bidder: "d********3", amount: "$700", time: "7/8/2022 03:21:59" },
    { bidder: "d********3", amount: "$500", time: "3/8/2022 02:42:13" },
    { bidder: "d********3", amount: "$450", time: "2/8/2022 11:10:39" },
    { bidder: "d********3", amount: "$400", time: "30/7/2022 03:03:04" },
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Người đấu giá</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Thời gian đấu giá</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{bid.bidder}</td>
                <td className="px-4 py-3 font-medium">{bid.amount}</td>
                <td className="px-4 py-3 text-gray-600">{bid.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}