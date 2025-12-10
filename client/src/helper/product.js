const isNewProduct = (() => {
  const posted = new Date(item.posted_date_time).getTime();
  const now = Date.now();
  const diffMinutes = (now - posted) / (1000 * 60);
  return diffMinutes <= 60; 
})();
