export const buildParams = (filter) => {
  let params = "";
  if (filter.keyword)
  {
    params += `?keyword=${encodeURIComponent(filter.keyword)}`;
  }
  if (filter.page)
  {
    params += `?page=${encodeURIComponent(filter.page)}`;
  }
  return params;
}