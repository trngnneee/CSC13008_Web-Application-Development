export const dateFormat = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const dateTimeFormat = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

export const getRelativeEndTime = (endDate) => {
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;
  
  // If already ended
  if (diffMs <= 0) {
    return "Đã kết thúc";
  }
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays < 3) {
    if (diffDays > 0) {
      return `${diffDays} ngày nữa`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ nữa`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} phút nữa`;
    } else {
      return `${diffSeconds} giây nữa`;
    }
  }
  
  return dateTimeFormat(endDate);
}

export const getCountdown = (endDate) => {
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSeconds / (24 * 60 * 60));
  const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
  const seconds = diffSeconds % 60;
  
  return { days, hours, minutes, seconds, ended: false };
}