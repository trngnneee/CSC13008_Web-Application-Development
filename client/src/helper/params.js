export const buildParams = (filter) => {
  let params = "";
  if (filter.keyword)
  {
    if (params.length > 0) {
      params += `&`;
    } else {
      params += `?`;
    }
    params += `keyword=${encodeURIComponent(filter.keyword)}`;
  }
  if (filter.page)
  {
    if (params.length > 0) {
      params += `&`;
    } else {
      params += `?`;
    }
    params += `page=${encodeURIComponent(filter.page)}`;
  }
  if (filter.status)
  {
    if (params.length > 0) {
      params += `&`;
    } else {
      params += `?`;
    }
    params += `status=${encodeURIComponent(filter.status)}`;
  }
  return params;
}