export const isValidDate = (date: any): date is Date => {
  if (Object.prototype.toString.call(date) === '[object Date]') {
    // it is a date
    if (isNaN(date)) {
      // d.getTime() or d.valueOf() will also work
      // date object is not valid
      return false;
    }
    // date object is valid
    return true;
  }
  return false;
};
