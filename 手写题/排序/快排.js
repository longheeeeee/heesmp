/**
 * https://www.bilibili.com/video/BV1j841197rQ/?spm_id_from=333.337.search-card.all.click&vd_source=1eba8722483d59c3af62938c51a8bda2
 * 快速排序
 * 核心是：拿到一个基准，把所有小的放左边，所有大的放右边，分别对左右两个数组做递归
 * 1. 先拿到最左边的一个作为基准
 * 2. 生成双指针
 * 3. 拿最右的开始比对，如果比基准大则跳过，检测下一个，如果比基准小，则交换到左指针（第一次比较的时候，左指针指向的是基准，已经保存了，所以可以理解成空位）
 * 4. 切换到左边，左边同理
 * 5. 对比到左右指针相同
 * @param {*} arr 
 * @returns 
 */
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