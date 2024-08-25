const fastSort = (arr) => {
  if (arr.length <= 1) return arr
  const baseItem = arr[0]
  let left = 0
  let right = arr.length - 1
  let cur = 'right'
  while(left < right) {
    if (arr[right] >= baseItem) {
      right--
      continue
    }
    if (arr[left] < baseItem) {
      left++
      continue
    }
    if (cur === 'right') {
      arr[left] = arr[right]
      left++
      cur = 'left'
    }
    else {
      arr[right] = arr[left]
      right--
      cur = 'right'
    }
  }
  arr[left] = baseItem
  return [...fastSort(arr.slice(0, left)), baseItem, ...fastSort(arr.slice(left + 1, arr.length))]
}
const arr = [7,1,4,4,4,5,7,2,9,4,3,3,6,8,2,2,7,9,0]
console.log(JSON.stringify(fastSort(arr)))