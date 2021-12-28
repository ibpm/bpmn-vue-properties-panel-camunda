import IdGenerator from 'ids'

export const
  idGenerator = new IdGenerator([32, 32, 1]),
  next = (prefix = null) => {
    return (prefix ? prefix + '_' : '') + idGenerator.next()
  },
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
  /*
  isBlank = (str) => {
    return !str || str.trim() === ''
  },
  */
  addZero = (key) => {
    return key < 10 ? '0' + key : '' + key
  },
  /**
   * 数组元素交换位置
   * @param {array} arr 数组
   * @param {number} index1 添加项目的位置
   * @param {number} index2 删除项目的位置
   * index1和index2分别是两个数组的索引值，即是两个要交换元素位置的索引值，如1，5就是数组中下标为1和5的两个元素交换位置
   */
  swapArray = (arr, index1, index2) => {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0]
    return arr
  }

