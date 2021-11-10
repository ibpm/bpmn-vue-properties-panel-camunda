export const
  getLocale = () => {
    const lang = localStorage.getItem('locale') || sessionStorage.getItem('locale') ||
        localStorage.getItem('lang') || sessionStorage.getItem('lang') ||
        localStorage.getItem('language') || sessionStorage.getItem('language') || navigator.language,
      index = lang.indexOf('-')
    return index <= 0 ? lang : lang.substring(0, index)
  },
  getTimeStr = () => {
    const
      now = new Date(),
      month = now.getMonth() + 1,
      date = now.getDate(),
      hour = now.getHours(),
      min = now.getMinutes(),
      sec = now.getSeconds()
    return '' +
      now.getFullYear() +
      (month < 10 ? '0' + month : month) +
      (date < 10 ? '0' + date : date) +
      '_' +
      (hour < 10 ? '0' + hour : hour) +
      (min < 10 ? '0' + min : min) +
      (sec < 10 ? '0' + sec : sec)
  },
  isBlank = (str) => {
    return !str || str.trim() === ''
  },
  addZero = (key) => {
    return key < 10 ? '0' + key : '' + key
  },
  commonParse = (element) => {
    const result = {
      ...element.businessObject,
      ...element.businessObject.$attrs
    }
    return result
  }
