window.formatDateTime = function (dateString, format, timeFormat) {
  if (!dateString) return "-";
  if (!format) format = "YYYY. MM. DD";
  if (!timeFormat) timeFormat = "24";

  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";

  let result = format
    .replace("YYYY", year)
    .replace("YY", String(year).slice(-2))
    .replace("MM", month)
    .replace("DD", day);

  if (timeFormat === "12") {
    const timePart = `${String(hours12).padStart(2, "0")}:${minutes}`;
    if (result.includes("HH") || result.includes("hh")) {
      result = result
        .replace(/HH|hh/g, String(hours12).padStart(2, "0"))
        .replace("mm", minutes)
        .replace("a", ampm);
    } else {
    }
  } else {
    if (result.includes("HH") || result.includes("hh")) {
      result = result
        .replace(/HH|hh/g, String(hours24).padStart(2, "0"))
        .replace("mm", minutes)
        .replace("a", "");
    }
  }

  return result;
};

window.formatDate = function (dateObj, formatStr) {
  const timeFmt = window.userTimeFormat || "24";
  const d = new Date(dateObj);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";

  let result = formatStr || "YYYY. MM. DD";

  result = result
    .replace("YYYY", year)
    .replace("YY", String(year).slice(-2))
    .replace("MM", month)
    .replace("DD", day);

  if (timeFmt === "12") {
    result = result
      .replace("HH", String(hours12).padStart(2, "0"))
      .replace("hh", String(hours12).padStart(2, "0"))
      .replace("mm", minutes)
      .replace("ss", seconds)
      .replace("a", ampm);
  } else {
    result = result
      .replace("HH", String(hours24).padStart(2, "0"))
      .replace("hh", String(hours24).padStart(2, "0"))
      .replace("mm", minutes)
      .replace("ss", seconds)
      .replace("a", "");
  }

  return result;
};
