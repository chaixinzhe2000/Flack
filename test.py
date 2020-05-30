class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        indexOne, indexTwo = 0, 0
        for i in range(len(nums)):
            firstNum = nums[i]
            for j in range(i, len(nums)):
                secondNum = nums[j]
                sum = firstNum + secondNum
                print(sum)
                if sum == 9:
                    indexOne = i
                    indexTwo = j
                break
            break
        return [indexOne, indexTwo]
	
