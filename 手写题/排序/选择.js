/**
 * 拿到最小的，往最前面插
 */
const selectSort = (arr) => {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex =  i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j
      }
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
  }
  return arr
}

const arr = [7,1,4,4,4,5,7,2,9,4,3,3,6,8,2,2,7,9,0]
console.log(JSON.stringify(selectSort(arr)))
