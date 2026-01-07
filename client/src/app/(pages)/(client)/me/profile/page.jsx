"use client"

import { Label } from "@/components/ui/label";
import { HeaderTitle } from "../components/HeaderTitle";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JustValidate from "just-validate";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CircleAlertIcon, Leaf, Star } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { clientProfileUpdate, clientUpgrade, getClientProfile } from "@/lib/clientAPI/user";
import { toastHandler } from "@/lib/toastHandler";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfilePage() {
  const { userInfo } = useClientAuthContext();
  console.log("userInfo:", userInfo);
  const [date, setDate] = useState(new Date());
  const [submit, setSubmit] = useState(false);
  const router = useRouter();

  const handleCalendarChange = (_value, _e) => {
    const _event = {
      target: {
        value: _value,
      },
    }
    _e(_event);
  };

  useEffect(() => {
    setDate(userInfo?.date_of_birth ? new Date(userInfo.date_of_birth) : new Date());
  }, [userInfo])

  useEffect(() => {
    const validation = new JustValidate('#profile-form');

    validation
      .addField('#fullname', [
        {
          rule: 'required',
          errorMessage: 'Họ và tên không được để trống',
        },
        {
          rule: 'minLength',
          value: 3,
          errorMessage: 'Họ và tên phải có ít nhất 3 ký tự',
        },
      ])
      .onSuccess(() => {
        setSubmit(true);
      })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submit) {
      const fullname = e.target.fullname.value;
      const date_of_birth = date;
      const finalData = {
        fullname,
        date_of_birth,
      };

      const promise = clientProfileUpdate(finalData);
      toast.promise(promise, {
        loading: "Đang cập nhật thông tin cá nhân...",
        success: (data) => {
          window.location.reload();
          setSubmit(false);
          return data.message || "Cập nhật thông tin cá nhân thành công!";
        },
        error: (err) => err.message || "Cập nhật thông tin cá nhân thất bại!"
      })
    }
  }

  const handleUpgrade = () => {
    const promise = clientUpgrade();
    toastHandler(promise, router, "/me/profile");
  }

  return (
    <>
      <div className="mb-10">
        <HeaderTitle title="Điểm của bạn" />
        <div>
          <div className="flex justify-center items-center gap-3 text-[30px] font-extrabold border border-gray-300 shadow-md rounded-xl py-3 max-w-md mx-auto my-5">
            <Leaf size={30} className="scale-x-[-1]" />
            <div>
              {parseFloat(userInfo?.user_point || 0).toFixed(1) || 0} / 1.0
            </div>
            <Leaf size={30} />
          </div>
          <div className="space-y-4 mt-4">
            {userInfo && userInfo.feedBackList && userInfo.feedBackList.length > 0 && userInfo.feedBackList.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[16px] flex items-center gap-2">
                    <span>Đánh giá từ: {item.reviewer_name || "Người dùng"}</span>
                    {item.rating_point == 1 ? <Star fill="yellow" className="text-yellow-500" /> : <Star className="text-gray-400" />}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${item.reviewer_role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.reviewer_role === 'seller' ? 'Người bán' : 'Người mua'}
                  </span>
                </div>
                {item.product_name && (
                  <div className="text-xs text-gray-500 mt-1">Sản phẩm: {item.product_name}</div>
                )}
                <div className="whitespace-pre-line mt-2 text-sm text-gray-600">{item.content}</div>
              </div>
            ))}
            {(!userInfo?.feedBackList || userInfo.feedBackList.length === 0) && (
              <div className="text-gray-500 text-center py-4">Chưa có đánh giá nào</div>
            )}
          </div>
        </div>
      </div>
      <HeaderTitle title="Chỉnh sửa thông tin cá nhân" />
      <form id="profile-form" className="mt-5" onSubmit={handleSubmit}>
        <div className="flex gap-5 items-center">
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="fullname" className={"text-[var(--main-client-color)]"}>Họ và tên</Label>
            <Input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="Nhập họ và tên"
              defaultValue={userInfo?.fullname}
            />
          </div>
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="email" className={"text-[var(--main-client-color)]"}>Email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="Nhập email"
              defaultValue={userInfo?.email}
              readOnly
            />
          </div>
        </div>
        <div className="flex gap-5 items-center mt-5">
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="date_of_birth" className={"text-[var(--main-client-color)]"}>Ngày sinh</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="text"
                  readOnly
                  value={date && formatDate(date, "dd/MM/yyyy")}
                  onChange={() => { }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Calendar
                  captionLayout="dropdown"
                  className="rounded-md border p-2"
                  classNames={{
                    month_caption: "mx-0",
                  }}
                  components={{
                    Dropdown: (props) => {
                      return (
                        <Select
                          onValueChange={(value) => {
                            if (props.onChange) {
                              handleCalendarChange(value, props.onChange);
                            }
                          }}
                          value={String(props.value)}
                        >
                          <SelectTrigger className="h-8 w-fit font-medium first:grow">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                            {props.options?.map((option) => (
                              <SelectItem
                                disabled={option.disabled}
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    },
                    DropdownNav: (props) => {
                      return (
                        <div className="flex w-full items-center gap-2">
                          {props.children}
                        </div>
                      );
                    },
                  }}
                  defaultMonth={new Date()}
                  hideNavigation
                  mode="single"
                  onSelect={setDate}
                  selected={date}
                  startMonth={new Date(1980, 6)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full">
          </div>
        </div>
        {userInfo?.role == "bidder" && (
          <div className="mt-5">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"}>Gửi yêu cầu trở thành người bán</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <CircleAlertIcon className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn gửi yêu cầu trở thành người bán không?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Yêu cầu của bạn sẽ được chúng tôi xem xét và phản hồi trong thời gian sớm nhất.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpgrade} className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"}>Xác nhận</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <Button disabled={submit} className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] w-full mt-5"}>Lưu</Button>
        <Link href="/me/reset-password" className="block mt-3 text-center text-[var(--main-client-color)] hover:underline">Đổi mật khẩu</Link>
      </form>
    </>
  )
}