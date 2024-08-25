
const bubble = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let cur = 0; cur < i; cur++) {
      if (arr[cur] > arr[cur + 1]) {
        [arr[cur], arr[cur + 1]] = [arr[cur + 1], arr[cur]]
      }
    }
  }
  return arr
}

const arr = [7,1,4,5,2,9,3,6,8]
console.log(JSON.stringify(bubble(arr)))