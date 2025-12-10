"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTimeToAllProducts } from "@/lib/adminAPI/product";
import { toastHandler } from "@/lib/toastHandler";
import { ArrowLeft } from "lucide-react";

export default function AddTimePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    extend_threshold_minutes: "",
    extend_duration_minutes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.extend_threshold_minutes || !formData.extend_duration_minutes) {
      toastHandler("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    const thresholdMinutes = parseInt(formData.extend_threshold_minutes);
    const durationMinutes = parseInt(formData.extend_duration_minutes);

    if (isNaN(thresholdMinutes) || isNaN(durationMinutes)) {
      toastHandler("Các giá trị phải là số nguyên", "error");
      return;
    }

    if (thresholdMinutes <= 0 || durationMinutes <= 0) {
      toastHandler("Các giá trị phải lớn hơn 0", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await addTimeToAllProducts(thresholdMinutes, durationMinutes);
      toastHandler("Cập nhật thời gian tự động gia hạn thành công", "success");
      setTimeout(() => {
        router.push("/admin/product");
      }, 1000);
    } catch (error) {
      toastHandler(error.message, "error");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Cài đặt thời gian tự động gia hạn</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thời gian kích hoạt gia hạn */}
          <div className="space-y-2">
            <Label htmlFor="extend_threshold_minutes" className="text-base font-semibold">
              Thời gian kích hoạt gia hạn (phút)
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Sản phẩm còn dưới bao nhiêu phút thì tự động gia hạn
            </p>
            <Input
              id="extend_threshold_minutes"
              name="extend_threshold_minutes"
              type="number"
              min="1"
              placeholder="Nhập số phút (ví dụ: 60)"
              value={formData.extend_threshold_minutes}
              onChange={handleInputChange}
              className="text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: Nhập 60 có nghĩa sản phẩm còn dưới 60 phút thì sẽ tự động gia hạn
            </p>
          </div>

          {/* Thời gian gia hạn thêm */}
          <div className="space-y-2">
            <Label htmlFor="extend_duration_minutes" className="text-base font-semibold">
              Thời gian gia hạn thêm (phút)
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Khi có lượt đấu giá mới trong thời gian kích hoạt, gia hạn thêm bao nhiêu phút
            </p>
            <Input
              id="extend_duration_minutes"
              name="extend_duration_minutes"
              type="number"
              min="1"
              placeholder="Nhập số phút (ví dụ: 30)"
              value={formData.extend_duration_minutes}
              onChange={handleInputChange}
              className="text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: Nhập 30 có nghĩa mỗi lượt đấu giá mới sẽ gia hạn thêm 30 phút
            </p>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Tóm tắt:</span> Khi có lượt đấu giá mới và sản phẩm còn dưới{" "}
              <span className="font-semibold">{formData.extend_threshold_minutes || "X"} phút</span>, hệ thống sẽ tự động gia hạn thêm{" "}
              <span className="font-semibold">{formData.extend_duration_minutes || "Y"} phút</span>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
