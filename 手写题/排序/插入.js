/**
 * 插入排序
 * 逐个往前面插
 */
const insertSort = (arr) => {
  for (let i = 1; i < arr.length; i++) {
    for (let j = i; j > 0; j--) {
      if (arr[j] < arr[j-1]) {
        [arr[j], arr[j-1]] = [arr[j-1], arr[j]]
      }
      else {
        break
      }
    }
  }
  return arr
}

const arr = [7,1,4,4,4,5,7,2,9,4,3,3,6,8,2,2,7,9,0]
console.log(JSON.stringify(insertSort(arr)))