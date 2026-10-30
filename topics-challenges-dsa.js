// Curated LeetCode & Essential DSA Patterns for JavaScript & Full-Stack Developers
// Complete with Basic, Medium, Hard tiers, starter code, solution code, and automated test cases.

module.exports = [
  {
    id: "dsa-arrays-hashing",
    category: "1. Arrays & Hash Maps (Core Patterns)",
    badge: "Hash Maps",
    description: "The most tested pattern in technical interviews. Constant-time O(1) lookups, complement mapping, and frequency counters.",
    topics: [
      {
        id: "two-sum-patterns",
        title: "Two Sum & Complement Hashing",
        tag: "Hash Map",
        summary: "Finding target sum pairs in O(N) single-pass using complement lookups instead of O(N^2) nested loops.",
        mentalModel: "As you iterate through the array at index i, calculate complement = target - nums[i]. Check if complement is in the Map. If yes, return [map.get(complement), i]. Otherwise, store map.set(nums[i], i).",
        traps: "Using the same element twice (e.g. nums[i] + nums[i] == target); neglecting negative numbers or zero; forgetting that Map keys preserve actual values.",
        challenges: {
          Basic: {
            id: "two-sum-basic",
            title: "Two Sum (Return Indices)",
            difficulty: "Basic",
            concept: "One-Pass Hash Map Lookup",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.",
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  // TODO: Implement solution in O(N) time using a Map
}
`,
            interviewTrap: "Using nested loops O(N^2) will get rejected in senior interviews. A single-pass Hash Map achieves O(N) time and O(N) space.",
            testCases: [
              {
                id: 1,
                name: "Finds indices [0, 1] for [2, 7, 11, 15] with target 9",
                input: "nums = [2, 7, 11, 15], target = 9",
                expected: [0, 1],
                testFn: "return twoSum([2, 7, 11, 15], 9);"
              },
              {
                id: 2,
                name: "Finds indices [1, 2] for [3, 2, 4] with target 6",
                input: "nums = [3, 2, 4], target = 6",
                expected: [1, 2],
                testFn: "return twoSum([3, 2, 4], 6);"
              },
              {
                id: 3,
                name: "Handles identical duplicate values [3, 3] with target 6",
                input: "nums = [3, 3], target = 6",
                expected: [0, 1],
                testFn: "return twoSum([3, 3], 6);"
              }
            ],
            solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
`
          },
          Medium: {
            id: "two-sum-medium",
            title: "Two Sum II (Sorted Array - Two Pointers O(1) Space)",
            difficulty: "Medium",
            concept: "Two Pointers on Sorted Arrays",
            description: "Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number.\n\nReturn the indices of the two numbers (1-indexed) as an integer array `[index1, index2]` of length 2.\n\nYou must use only O(1) extra space.",
            starterCode: `/**
 * @param {number[]} numbers (1-indexed, sorted)
 * @param {number} target
 * @returns {number[]} 1-indexed pair
 */
function twoSumSorted(numbers, target) {
  // TODO: Implement two-pointer solution with O(1) extra space
}
`,
            interviewTrap: "Creating a hash map wastes O(N) space. Because the array is already sorted, two pointers (left at start, right at end) solves it in O(N) time and O(1) auxiliary space.",
            testCases: [
              {
                id: 1,
                name: "Returns [1, 2] for [2, 7, 11, 15] target 9",
                input: "numbers = [2, 7, 11, 15], target = 9",
                expected: [1, 2],
                testFn: "return twoSumSorted([2, 7, 11, 15], 9);"
              },
              {
                id: 2,
                name: "Returns [1, 3] for [2, 3, 4] target 6",
                input: "numbers = [2, 3, 4], target = 6",
                expected: [1, 3],
                testFn: "return twoSumSorted([2, 3, 4], 6);"
              },
              {
                id: 3,
                name: "Returns [1, 2] for [-1, 0] target -1",
                input: "numbers = [-1, 0], target = -1",
                expected: [1, 2],
                testFn: "return twoSumSorted([-1, 0], -1);"
              }
            ],
            solutionCode: `function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [];
}
`
          },
          Hard: {
            id: "three-sum-hard",
            title: "3Sum (All Unique Triplets Summing to Zero)",
            difficulty: "Hard",
            concept: "Sorted Array Two Pointers with Duplicate Avoidance",
            description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
            starterCode: `/**
 * @param {number[]} nums
 * @returns {number[][]}
 */
function threeSum(nums) {
  // TODO: Sort array and use Two Pointers, skipping duplicates
}
`,
            interviewTrap: "Generating all triplets takes O(N^3) and leads to duplicate sets. Sorting first in O(N log N) allows locking one number and using two pointers for the rest, skipping duplicate numbers to ensure uniqueness.",
            testCases: [
              {
                id: 1,
                name: "Finds unique triplets for [-1, 0, 1, 2, -1, -4]",
                input: "nums = [-1, 0, 1, 2, -1, -4]",
                expected: [[-1, -1, 2], [-1, 0, 1]],
                testFn: "const res = threeSum([-1, 0, 1, 2, -1, -4]); return res.sort();"
              },
              {
                id: 2,
                name: "Returns empty array when no triplets exist",
                input: "nums = [0, 1, 1]",
                expected: [],
                testFn: "return threeSum([0, 1, 1]);"
              },
              {
                id: 3,
                name: "Handles all zeros [0, 0, 0]",
                input: "nums = [0, 0, 0]",
                expected: [[0, 0, 0]],
                testFn: "return threeSum([0, 0, 0]);"
              }
            ],
            solutionCode: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // Skip duplicate i

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++; // Skip duplicate left
        while (left < right && nums[right] === nums[right - 1]) right--; // Skip duplicate right
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}
`
          }
        }
      },
      {
        id: "group-anagrams-topic",
        title: "Anagrams & Frequency Maps",
        tag: "Hash Map",
        summary: "Validating anagrams and clustering word groups by canonical sorting or character frequency signatures.",
        mentalModel: "Two words are anagrams if and only if they contain the identical set of characters with identical frequencies. The canonical key can be the alphabetically sorted word or a 26-element character count string.",
        traps: "Assuming ASCII-only without verifying; re-sorting long strings excessively; mutability of object keys in standard JS.",
        challenges: {
          Basic: {
            id: "valid-anagram-basic",
            title: "Valid Anagram",
            difficulty: "Basic",
            concept: "Frequency Count Comparison",
            description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
            starterCode: `/**
 * @param {string} s
 * @param {string} t
 * @returns {boolean}
 */
function isAnagram(s, t) {
  // TODO: Check if t is an anagram of s in O(N) time
}
`,
            interviewTrap: "Sorting both strings takes O(N log N). A frequency table using a Map or array of 26 counts runs in linear O(N) time and O(1) space.",
            testCases: [
              {
                id: 1,
                name: "Returns true for anagram and nagaram",
                input: "s = 'anagram', t = 'nagaram'",
                expected: true,
                testFn: "return isAnagram('anagram', 'nagaram');"
              },
              {
                id: 2,
                name: "Returns false for rat and car",
                input: "s = 'rat', t = 'car'",
                expected: false,
                testFn: "return isAnagram('rat', 'car');"
              },
              {
                id: 3,
                name: "Returns false when lengths differ",
                input: "s = 'a', t = 'ab'",
                expected: false,
                testFn: "return isAnagram('a', 'ab');"
              }
            ],
            solutionCode: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};

  for (let i = 0; i < s.length; i++) {
    count[s[i]] = (count[s[i]] || 0) + 1;
    count[t[i]] = (count[t[i]] || 0) - 1;
  }

  for (const key in count) {
    if (count[key] !== 0) return false;
  }
  return true;
}
`
          },
          Medium: {
            id: "group-anagrams-medium",
            title: "Group Anagrams",
            difficulty: "Medium",
            concept: "Canonical Hash Map Keying",
            description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
            starterCode: `/**
 * @param {string[]} strs
 * @returns {string[][]}
 */
function groupAnagrams(strs) {
  // TODO: Group strings having identical sorted character signatures
}
`,
            interviewTrap: "Comparing all pairs takes O(N^2 * K). Sorting each word to generate a canonical hash key (`eat` -> `aet`) maps words in O(N * K log K).",
            testCases: [
              {
                id: 1,
                name: "Groups ['eat','tea','tan','ate','nat','bat']",
                input: "strs = ['eat','tea','tan','ate','nat','bat']",
                expected: 3,
                testFn: "const res = groupAnagrams(['eat','tea','tan','ate','nat','bat']); return res.length;"
              },
              {
                id: 2,
                name: "Handles single empty string ['']",
                input: "strs = ['']",
                expected: [[""]],
                testFn: "return groupAnagrams(['']);"
              },
              {
                id: 3,
                name: "Handles single element ['a']",
                input: "strs = ['a']",
                expected: [["a"]],
                testFn: "return groupAnagrams(['a']);"
              }
            ],
            solutionCode: `function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }
  return Array.from(map.values());
}
`
          },
          Hard: {
            id: "top-k-frequent-hard",
            title: "Top K Frequent Elements (Bucket Sort O(N))",
            difficulty: "Hard",
            concept: "Frequency Bucket Sort",
            description: "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.\n\nYour algorithm's time complexity must be better than O(N log N), where N is the array's size.",
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function topKFrequent(nums, k) {
  // TODO: Count frequencies and use Bucket Sort to achieve O(N) time
}
`,
            interviewTrap: "Sorting by frequency takes O(N log N). A bucket array where index represents frequency allows extraction in pure O(N) linear time.",
            testCases: [
              {
                id: 1,
                name: "Finds top 2 frequent in [1,1,1,2,2,3]",
                input: "nums = [1,1,1,2,2,3], k = 2",
                expected: [1, 2],
                testFn: "const r = topKFrequent([1,1,1,2,2,3], 2); return r.sort((a,b)=>a-b);"
              },
              {
                id: 2,
                name: "Handles single element [1] with k = 1",
                input: "nums = [1], k = 1",
                expected: [1],
                testFn: "return topKFrequent([1], 1);"
              }
            ],
            solutionCode: `function topKFrequent(nums, k) {
  const countMap = new Map();
  for (const n of nums) {
    countMap.set(n, (countMap.get(n) || 0) + 1);
  }

  // Buckets: index is frequency
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, freq] of countMap.entries()) {
    buckets[freq].push(num);
  }

  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    if (buckets[i].length > 0) {
      result.push(...buckets[i]);
    }
  }
  return result.slice(0, k);
}
`
          }
        }
      }
    ]
  },
  {
    id: "dsa-two-pointers-sliding-window",
    category: "2. Two Pointers & Sliding Window",
    badge: "Sliding Window",
    description: "Crucial patterns for substring, contiguous subarray, and monotonic optimization problems.",
    topics: [
      {
        id: "sliding-window-topic",
        title: "Sliding Window Mechanics",
        tag: "Sliding Window",
        summary: "Maintaining a dynamic continuous subarray window [left, right] to solve substring and subarray problems in O(N).",
        mentalModel: "Expand the right boundary until the window becomes invalid (e.g., duplicate character found). Then shrink the left boundary until valid again, tracking the optimal window length at each step.",
        traps: "Failing to update the left pointer in O(1); off-by-one errors in window size calculations `right - left + 1`.",
        challenges: {
          Basic: {
            id: "max-subarray-k-basic",
            title: "Maximum Sum Subarray of Size K",
            difficulty: "Basic",
            concept: "Fixed-Size Sliding Window",
            description: "Given an array of integers `nums` and an integer `k`, find the maximum sum of any contiguous subarray of size `k`.",
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function maxSubarraySum(nums, k) {
  // TODO: Fixed sliding window of size k in O(N)
}
`,
            interviewTrap: "Recomputing the sum of k elements at every index takes O(N * k). Subtracting the element exiting the window and adding the entering element runs in O(N).",
            testCases: [
              {
                id: 1,
                name: "Finds max sum 9 for [2, 1, 5, 1, 3, 2] with k=3",
                input: "nums = [2, 1, 5, 1, 3, 2], k = 3",
                expected: 9,
                testFn: "return maxSubarraySum([2, 1, 5, 1, 3, 2], 3);"
              },
              {
                id: 2,
                name: "Returns 7 for [2, 3, 4, 1, 5] with k=2",
                input: "nums = [2, 3, 4, 1, 5], k = 2",
                expected: 7,
                testFn: "return maxSubarraySum([2, 3, 4, 1, 5], 2);"
              }
            ],
            solutionCode: `function maxSubarraySum(nums, k) {
  if (nums.length < k) return 0;
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
`
          },
          Medium: {
            id: "longest-substring-without-repeat-medium",
            title: "Longest Substring Without Repeating Characters",
            difficulty: "Medium",
            concept: "Dynamic Sliding Window with Set",
            description: "Given a string `s`, find the length of the longest substring without duplicate characters.",
            starterCode: `/**
 * @param {string} s
 * @returns {number}
 */
function lengthOfLongestSubstring(s) {
  // TODO: Dynamic sliding window with Set tracking unique characters
}
`,
            interviewTrap: "Checking all substrings takes O(N^3). Using a Set and moving the `left` pointer whenever a duplicate character appears at `right` achieves optimal O(N) time.",
            testCases: [
              {
                id: 1,
                name: "Returns 3 for 'abcabcbb'",
                input: "s = 'abcabcbb'",
                expected: 3,
                testFn: "return lengthOfLongestSubstring('abcabcbb');"
              },
              {
                id: 2,
                name: "Returns 1 for 'bbbbb'",
                input: "s = 'bbbbb'",
                expected: 1,
                testFn: "return lengthOfLongestSubstring('bbbbb');"
              },
              {
                id: 3,
                name: "Returns 3 for 'pwwkew'",
                input: "s = 'pwwkew'",
                expected: 3,
                testFn: "return lengthOfLongestSubstring('pwwkew');"
              }
            ],
            solutionCode: `function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}
`
          },
          Hard: {
            id: "container-water-hard",
            title: "Container With Most Water",
            difficulty: "Hard",
            concept: "Two Pointers Greedy Inward Traversal",
            description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
            starterCode: `/**
 * @param {number[]} height
 * @returns {number}
 */
function maxArea(height) {
  // TODO: Two Pointers inward greedy traversal
}
`,
            interviewTrap: "Testing all pairs is O(N^2). Since width shrinks as pointers move inward, the only way to find a larger area is to move the pointer pointing to the shorter vertical line.",
            testCases: [
              {
                id: 1,
                name: "Returns 49 for [1,8,6,2,5,4,8,3,7]",
                input: "height = [1,8,6,2,5,4,8,3,7]",
                expected: 49,
                testFn: "return maxArea([1,8,6,2,5,4,8,3,7]);"
              },
              {
                id: 2,
                name: "Returns 1 for [1,1]",
                input: "height = [1,1]",
                expected: 1,
                testFn: "return maxArea([1,1]);"
              }
            ],
            solutionCode: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let max = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    max = Math.max(max, width * h);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return max;
}
`
          }
        }
      }
    ]
  },
  {
    id: "dsa-stacks-queues",
    category: "3. Stacks & Queues",
    badge: "Stack LIFO",
    description: "LIFO execution contexts, parenthetical balancing, undo/redo buffers, and monotonic queues.",
    topics: [
      {
        id: "stack-patterns-topic",
        title: "Stack Matching & Monotonic Stacks",
        tag: "Stack",
        summary: "Using Last-In-First-Out (LIFO) order to match opening/closing tokens and track minimums in O(1).",
        mentalModel: "Whenever an opening delimiter arrives, push its corresponding closer onto the stack. When a closing delimiter arrives, pop and verify it matches. The string is valid if the stack is completely empty at the end.",
        traps: "Assuming string length odd is valid (odd length is immediately false); forgetting to check stack non-empty before popping.",
        challenges: {
          Basic: {
            id: "valid-parentheses-basic",
            title: "Valid Parentheses",
            difficulty: "Basic",
            concept: "LIFO Stack Matching",
            description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
            starterCode: `/**
 * @param {string} s
 * @returns {boolean}
 */
function isValidParentheses(s) {
  // TODO: Validate balanced parentheses using a Stack
}
`,
            interviewTrap: "Using regex `replace(/\\(\\)/g, '')` in a while loop takes O(N^2). A stack runs in linear O(N) time and O(N) space.",
            testCases: [
              {
                id: 1,
                name: "Returns true for '()[]{}'",
                input: "s = '()[]{}'",
                expected: true,
                testFn: "return isValidParentheses('()[]{}');"
              },
              {
                id: 2,
                name: "Returns false for '(]'",
                input: "s = '(]'",
                expected: false,
                testFn: "return isValidParentheses('(]');"
              },
              {
                id: 3,
                name: "Returns false for unmatched single '['",
                input: "s = '['",
                expected: false,
                testFn: "return isValidParentheses('[');"
              }
            ],
            solutionCode: `function isValidParentheses(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = {
    '(': ')',
    '{': '}',
    '[': ']'
  };

  for (const char of s) {
    if (map[char]) {
      stack.push(map[char]);
    } else {
      if (stack.pop() !== char) return false;
    }
  }
  return stack.length === 0;
}
`
          },
          Medium: {
            id: "min-stack-medium",
            title: "Design Min Stack with O(1) GetMin",
            difficulty: "Medium",
            concept: "Parallel Min Tracking Stack",
            description: "Design a stack that supports `push`, `pop`, `top`, and retrieving the minimum element in constant O(1) time.\n\nImplement the `MinStack` class with methods `push(val)`, `pop()`, `top()`, and `getMin()`.",
            starterCode: `class MinStack {
  constructor() {
    // TODO: Initialize stack data structures
  }
  push(val) {}
  pop() {}
  top() {}
  getMin() {}
}
`,
            interviewTrap: "Iterating through the stack on `getMin()` takes O(N). Storing `[val, currentMin]` on each frame guarantees O(1) retrieval for all operations.",
            testCases: [
              {
                id: 1,
                name: "Pushes and retrieves min correctly",
                input: "push(-2), push(0), push(-3), getMin() -> -3, pop(), top() -> 0, getMin() -> -2",
                expected: [-3, 0, -2],
                testFn: "const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); const m1 = s.getMin(); s.pop(); const t1 = s.top(); const m2 = s.getMin(); return [m1, t1, m2];"
              }
            ],
            solutionCode: `class MinStack {
  constructor() {
    this.stack = [];
  }

  push(val) {
    const min = this.stack.length === 0 ? val : Math.min(val, this.getMin());
    this.stack.push({ val, min });
  }

  pop() {
    return this.stack.pop()?.val;
  }

  top() {
    return this.stack[this.stack.length - 1]?.val;
  }

  getMin() {
    return this.stack[this.stack.length - 1]?.min;
  }
}
`
          },
          Hard: {
            id: "daily-temperatures-hard",
            title: "Daily Temperatures (Monotonic Stack)",
            difficulty: "Hard",
            concept: "Monotonic Decreasing Stack",
            description: "Given an array of integers `temperatures` representing the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i-th` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0`.",
            starterCode: `/**
 * @param {number[]} temperatures
 * @returns {number[]}
 */
function dailyTemperatures(temperatures) {
  // TODO: Monotonic stack storing indices
}
`,
            interviewTrap: "Checking every day forward takes O(N^2). Maintaining a monotonic decreasing stack of indices resolves each day in O(N) total amortized time.",
            testCases: [
              {
                id: 1,
                name: "Solves [73,74,75,71,69,72,76,73]",
                input: "temperatures = [73,74,75,71,69,72,76,73]",
                expected: [1, 1, 4, 2, 1, 1, 0, 0],
                testFn: "return dailyTemperatures([73,74,75,71,69,72,76,73]);"
              },
              {
                id: 2,
                name: "Handles non-increasing array [30,40,50,60]",
                input: "temperatures = [30,40,50,60]",
                expected: [1, 1, 1, 0],
                testFn: "return dailyTemperatures([30,40,50,60]);"
              }
            ],
            solutionCode: `function dailyTemperatures(temperatures) {
  const result = new Array(temperatures.length).fill(0);
  const stack = []; // stores indices

  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop();
      result[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  return result;
}
`
          }
        }
      }
    ]
  },
  {
    id: "dsa-linked-lists-lru",
    category: "4. Linked Lists & High-Performance Caches",
    badge: "LRU Cache",
    description: "Pointer manipulation, circular detection, and designing O(1) in-memory LRU cache architectures.",
    topics: [
      {
        id: "lru-cache-topic",
        title: "LRU Cache (Least Recently Used)",
        tag: "System DSA",
        summary: "Architecting an in-memory cache supporting O(1) get and put operations by combining a Hash Map with a Doubly Linked List.",
        mentalModel: "Hash Map provides O(1) key-to-node lookups. Doubly Linked List maintains access recency order. When a node is accessed or inserted, remove it from its current position and splice it to the head. When capacity exceeds, evict from tail.",
        traps: "Using an Array where splice() or unshift() costs O(N) per operation; neglecting pointer severing during eviction.",
        challenges: {
          Basic: {
            id: "reverse-linked-list-basic",
            title: "Reverse a Singly Linked List",
            difficulty: "Basic",
            concept: "3-Pointer In-Place Reversal",
            description: "Given the head of a singly linked list, reverse the list in-place and return the reversed list head.",
            starterCode: `/**
 * @param {{ val: any, next: object|null }} head
 * @returns {object|null}
 */
function reverseList(head) {
  // TODO: Reverse pointers in O(N) time and O(1) space
}
`,
            interviewTrap: "Copying all values to an array consumes O(N) space. Using three pointers (`prev = null`, `curr = head`, `next = null`) reverses links in-place in O(1) space.",
            testCases: [
              {
                id: 1,
                name: "Reverses list 1 -> 2 -> 3 to 3 -> 2 -> 1",
                input: "head = 1 -> 2 -> 3",
                expected: [3, 2, 1],
                testFn: "const l = { val: 1, next: { val: 2, next: { val: 3, next: null } } }; const rev = reverseList(l); return [rev.val, rev.next.val, rev.next.next.val];"
              },
              {
                id: 2,
                name: "Handles null head safely",
                input: "head = null",
                expected: null,
                testFn: "return reverseList(null);"
              }
            ],
            solutionCode: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
`
          },
          Medium: {
            id: "lru-cache-map-medium",
            title: "LRU Cache using JavaScript Map Keys Order",
            difficulty: "Medium",
            concept: "JavaScript Map Insertion-Order Semantics",
            description: "Implement a Least Recently Used (LRU) Cache class `LRUCache(capacity)` using ES6 Map insertion-order semantics:\n- `get(key)`: Return value if exists, else -1, marking key as most recently used.\n- `put(key, value)`: Update or insert key-value pair. If capacity exceeded, evict the least recently used key.",
            starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // TODO: Initialize Map and capacity
  }
  get(key) {}
  put(key, value) {}
}
`,
            interviewTrap: "In JavaScript, `Map.prototype.keys()` reflects insertion order. Re-inserting an existing key (`map.delete(key); map.set(key, val);`) moves it to the most recent slot in O(1).",
            testCases: [
              {
                id: 1,
                name: "Evicts key 1 when capacity 2 is exceeded",
                input: "put(1, 1), put(2, 2), get(1), put(3, 3) -> evicts 2",
                expected: [1, -1, 3],
                testFn: "const lru = new LRUCache(2); lru.put(1, 1); lru.put(2, 2); const g1 = lru.get(1); lru.put(3, 3); const g2 = lru.get(2); const g3 = lru.get(3); return [g1, g2, g3];"
              }
            ],
            solutionCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
`
          },
          Hard: {
            id: "lru-cache-dll-hard",
            title: "Production LRU Cache with Doubly Linked List",
            difficulty: "Hard",
            concept: "Hash Map + Doubly Linked List Pointers",
            description: "Implement a full production `LRUCache(capacity)` without relying on Map internal order, using an explicit Doubly Linked List with dummy head and tail sentinel nodes for guaranteed strict O(1) pointer updates.",
            starterCode: `class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class FullLRUCache {
  constructor(capacity) {
    // TODO: Setup dummy head, tail, map, and capacity
  }
  get(key) {}
  put(key, value) {}
}
`,
            interviewTrap: "Staff interviews at Google/Uber will reject Map insertion order and demand an explicit Doubly Linked List with sentinel nodes to verify memory pointer mastery.",
            testCases: [
              {
                id: 1,
                name: "Performs strict O(1) DLL LRU operations",
                input: "put(1, 10), put(2, 20), get(1), put(3, 30) -> evicts 2",
                expected: [10, -1, 30],
                testFn: "const c = new FullLRUCache(2); c.put(1, 10); c.put(2, 20); const v1 = c.get(1); c.put(3, 30); const v2 = c.get(2); const v3 = c.get(3); return [v1, v2, v3];"
              }
            ],
            solutionCode: `class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class FullLRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _add(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._add(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }
    const node = new Node(key, value);
    this._add(node);
    this.map.set(key, node);

    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}
`
          }
        }
      }
    ]
  },
  {
    id: "dsa-trees-graphs",
    category: "5. Trees, Recursion & Graphs",
    badge: "Trees & Graphs",
    description: "Hierarchical traversal, DOM tree walkers, and dependency cycle detection (Topological Sort).",
    topics: [
      {
        id: "tree-graph-patterns",
        title: "Tree BFS/DFS & Dependency Graphs",
        tag: "Trees & Graphs",
        summary: "Traversing nested tree hierarchies and resolving directed acyclic graphs for module dependency graphs.",
        mentalModel: "BFS uses a Queue (FIFO) to traverse level-by-level. DFS uses Recursion / Stack (LIFO) to traverse branches deeply. Graph cycle detection tracks nodes currently visiting (gray) vs visited (black).",
        traps: "Infinite recursion when objects have circular references; attempting recursive DFS without stack limits.",
        challenges: {
          Basic: {
            id: "max-depth-tree-basic",
            title: "Maximum Depth of Binary Tree",
            difficulty: "Basic",
            concept: "Recursive Tree DFS",
            description: "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
            starterCode: `/**
 * @param {{ val: any, left: object|null, right: object|null }|null} root
 * @returns {number}
 */
function maxDepth(root) {
  // TODO: Calculate tree depth recursively
}
`,
            interviewTrap: "Null roots must return 0. The recurrence relation is `1 + Math.max(maxDepth(root.left), maxDepth(root.right))`.",
            testCases: [
              {
                id: 1,
                name: "Calculates depth 3 for [3,9,20,null,null,15,7]",
                input: "root = 3 -> (9, 20 -> (15, 7))",
                expected: 3,
                testFn: "const t = { val: 3, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } }; return maxDepth(t);"
              },
              {
                id: 2,
                name: "Returns 0 for null root",
                input: "root = null",
                expected: 0,
                testFn: "return maxDepth(null);"
              }
            ],
            solutionCode: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`
          },
          Medium: {
            id: "level-order-traversal-medium",
            title: "Binary Tree Level Order Traversal (BFS Queue)",
            difficulty: "Medium",
            concept: "Queue-Based Breadth-First Search",
            description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
            starterCode: `/**
 * @param {{ val: any, left: object|null, right: object|null }|null} root
 * @returns {any[][]}
 */
function levelOrder(root) {
  // TODO: Level-by-level BFS traversal using a Queue
}
`,
            interviewTrap: "Snapshotting `queue.length` at the start of each level loop prevents newly enqueued child nodes from interfering with the current level processing.",
            testCases: [
              {
                id: 1,
                name: "Returns [[3], [9, 20], [15, 7]]",
                input: "root = 3 -> (9, 20 -> (15, 7))",
                expected: [[3], [9, 20], [15, 7]],
                testFn: "const t = { val: 3, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } }; return levelOrder(t);"
              },
              {
                id: 2,
                name: "Returns [] for empty tree",
                input: "root = null",
                expected: [],
                testFn: "return levelOrder(null);"
              }
            ],
            solutionCode: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}
`
          },
          Hard: {
            id: "course-schedule-cycle-hard",
            title: "Detect Dependency Cycle in Module Graph (Course Schedule)",
            difficulty: "Hard",
            concept: "Directed Graph Cycle Detection / Topological Sort",
            description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`.\n\nReturn `true` if you can finish all courses (i.e., the dependency graph has NO cycles), otherwise return `false`.",
            starterCode: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @returns {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // TODO: Build adjacency list and detect cycles using 3-state DFS
}
`,
            interviewTrap: "A standard visited boolean array cannot distinguish between a node visited in a previous path vs an ancestor in the active recursion stack. A 3-state tracking (`0=unvisited, 1=visiting, 2=visited`) detects back-edges accurately.",
            testCases: [
              {
                id: 1,
                name: "Can finish 2 courses with [1, 0]",
                input: "numCourses = 2, prerequisites = [[1, 0]]",
                expected: true,
                testFn: "return canFinish(2, [[1, 0]]);"
              },
              {
                id: 2,
                name: "Detects cycle in [[1, 0], [0, 1]]",
                input: "numCourses = 2, prerequisites = [[1, 0], [0, 1]]",
                expected: false,
                testFn: "return canFinish(2, [[1, 0], [0, 1]]);"
              }
            ],
            solutionCode: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
  }

  // States: 0 = unvisited, 1 = visiting (in active recursion), 2 = visited
  const state = new Array(numCourses).fill(0);

  function hasCycle(node) {
    if (state[node] === 1) return true; // Found back-edge!
    if (state[node] === 2) return false; // Already verified safe

    state[node] = 1; // Mark visiting
    for (const neighbor of adj[node]) {
      if (hasCycle(neighbor)) return true;
    }
    state[node] = 2; // Mark safe
    return false;
  }

  for (let i = 0; i < numCourses; i++) {
    if (state[i] === 0) {
      if (hasCycle(i)) return false;
    }
  }
  return true;
}
`
          }
        }
      }
    ]
  },
  {
    id: "dsa-intervals",
    category: "6. Intervals & Overlap Merging",
    badge: "Intervals",
    description: "Meeting rooms, calendar scheduling, and sorting intervals by start times.",
    topics: [
      {
        id: "merge-intervals-topic",
        title: "Merge Overlapping Intervals",
        tag: "Intervals",
        summary: "Sorting intervals by start time and merging overlapping pairs in linear O(N) time.",
        mentalModel: "Sort intervals by start time. Initialize result with the first interval. For each subsequent interval, if its start <= last interval's end, merge them by setting last.end = Math.max(last.end, current.end). Otherwise, append current interval.",
        traps: "Attempting to merge without sorting first (fails on out-of-order intervals); forgetting Math.max on ends (e.g. [1, 5] and [2, 3]).",
        challenges: {
          Basic: {
            id: "meeting-rooms-basic",
            title: "Meeting Rooms (Can Attend All)",
            difficulty: "Basic",
            concept: "Interval Overlap Detection",
            description: "Given an array of meeting time intervals where `intervals[i] = [start_i, end_i]`, determine if a person could attend all meetings without overlap.",
            starterCode: `/**
 * @param {number[][]} intervals
 * @returns {boolean}
 */
function canAttendMeetings(intervals) {
  // TODO: Sort by start time and check adjacent overlaps
}
`,
            interviewTrap: "Pairwise comparisons take O(N^2). Sorting intervals by start time reduces overlap detection to a single O(N) scan.",
            testCases: [
              {
                id: 1,
                name: "Returns false for overlapping [[0,30],[5,10],[15,20]]",
                input: "intervals = [[0,30],[5,10],[15,20]]",
                expected: false,
                testFn: "return canAttendMeetings([[0,30],[5,10],[15,20]]);"
              },
              {
                id: 2,
                name: "Returns true for non-overlapping [[7,10],[2,4]]",
                input: "intervals = [[7,10],[2,4]]",
                expected: true,
                testFn: "return canAttendMeetings([[7,10],[2,4]]);"
              }
            ],
            solutionCode: `function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;
    }
  }
  return true;
}
`
          },
          Medium: {
            id: "merge-intervals-medium",
            title: "Merge Intervals",
            difficulty: "Medium",
            concept: "Sequential Interval Merging",
            description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
            starterCode: `/**
 * @param {number[][]} intervals
 * @returns {number[][]}
 */
function mergeIntervals(intervals) {
  // TODO: Sort by start time and merge overlaps in O(N log N)
}
`,
            interviewTrap: "Not using `Math.max(last[1], curr[1])` breaks when a larger interval completely encapsulates a smaller one (e.g. `[1, 4]` and `[2, 3]`).",
            testCases: [
              {
                id: 1,
                name: "Merges [[1,3],[2,6],[8,10],[15,18]]",
                input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                expected: [[1, 6], [8, 10], [15, 18]],
                testFn: "return mergeIntervals([[1,3],[2,6],[8,10],[15,18]]);"
              },
              {
                id: 2,
                name: "Merges completely overlapping [[1,4],[4,5]]",
                input: "intervals = [[1,4],[4,5]]",
                expected: [[1, 5]],
                testFn: "return mergeIntervals([[1,4],[4,5]]);"
              }
            ],
            solutionCode: `function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const curr = intervals[i];

    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}
`
          },
          Hard: {
            id: "insert-interval-hard",
            title: "Insert Interval (Sorted Array O(N))",
            difficulty: "Hard",
            concept: "3-Phase Interval Insertion",
            description: "You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [start_i, end_i]` sorted in ascending order by `start_i`. You are also given an interval `newInterval = [start, end]`.\n\nInsert `newInterval` into `intervals` such that `intervals` is still sorted and has no overlapping intervals.",
            starterCode: `/**
 * @param {number[][]} intervals
 * @param {number[]} newInterval
 * @returns {number[][]}
 */
function insertInterval(intervals, newInterval) {
  // TODO: Insert and merge in single O(N) pass
}
`,
            interviewTrap: "Inserting and re-sorting costs O(N log N). Since intervals are already sorted, you can solve it in a single O(N) pass with 3 phases: before overlap, overlapping merge, after overlap.",
            testCases: [
              {
                id: 1,
                name: "Inserts [2, 5] into [[1,3],[6,9]]",
                input: "intervals = [[1,3],[6,9]], newInterval = [2,5]",
                expected: [[1, 5], [6, 9]],
                testFn: "return insertInterval([[1,3],[6,9]], [2,5]);"
              },
              {
                id: 2,
                name: "Merges multiple intervals [[1,2],[3,5],[6,7],[8,10],[12,16]] with [4,8]",
                input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
                expected: [[1, 2], [3, 10], [12, 16]],
                testFn: "return insertInterval([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]);"
              }
            ],
            solutionCode: `function insertInterval(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;

  // 1. Add all intervals ending before newInterval starts
  while (i < n && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }

  // 2. Merge all overlapping intervals
  while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  result.push(newInterval);

  // 3. Add all remaining intervals
  while (i < n) {
    result.push(intervals[i]);
    i++;
  }

  return result;
}
`
          }
        }
      }
    ]
  }
];
