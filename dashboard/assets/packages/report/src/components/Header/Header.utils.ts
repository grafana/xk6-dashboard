const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: false
})

export const toDate = (date?: Date) => {
  return date && dateTimeFormatter.format(new Date(date))
}
