// Exhaustive React.js Mastery Topics Catalog
// Curated with Basic, Medium, and Hard challenges with runnable test cases.

module.exports = [
  {
    "id": "react-engine-fiber",
    "category": "1. Fiber Architecture & Reconciliation",
    "badge": "Core Architecture",
    "description": "Understand the Virtual DOM, the Fiber linked list, Render vs Commit phases, and the reconciliation algorithm.",
    "topics": [
      {
        "id": "fiber-nodes-trees",
        "title": "Fiber Tree & Linked List Traversal",
        "tag": "Fiber Architecture",
        "summary": "Child, Sibling, Return pointers, current vs workInProgress trees, and double buffering.",
        "mentalModel": "React 16+ models UI as a singly linked list of Fiber nodes rather than a recursive tree. Each fiber has `child`, `sibling`, and `return` (parent) pointers. During updates, React clones the `current` tree into a `workInProgress` tree (double buffering) and switches the pointer during the synchronous commit phase.",
        "traps": "Believing reconciliation is immediate/synchronous; forgetting that the render phase can be paused, aborted, or restarted in Concurrent Mode.",
        "challenges": {
          "Basic": {
            "id": "fiber-tree-basic",
            "title": "Fiber Node Factory for React Elements",
            "difficulty": "Basic",
            "concept": "Fiber Node Structure & Pointers",
            "description": "Implement `createFiber(tag, type, props)` that creates a standard React Fiber node with initialized `child: null`, `sibling: null`, `return: null`, `memoizedState: null`, and `pendingProps`.",
            "starterCode": "function createFiber(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Confusing React elements (ephemeral, plain JS objects) with Fiber nodes (stateful, long-lived runtime nodes).",
            "testCases": [
              {
                "id": 1,
                "name": "Creates fiber with null relational pointers",
                "input": "createFiber('HostComponent', 'div')",
                "expected": {
                  "child": null,
                  "sibling": null,
                  "return": null
                },
                "testFn": "const f = createFiber('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                "id": 2,
                "name": "Stores pendingProps accurately",
                "input": "createFiber with className prop",
                "expected": "btn-primary",
                "testFn": "const f = createFiber('HostComponent', 'button', { className: 'btn-primary' }); return f.pendingProps.className;"
              },
              {
                "id": 3,
                "name": "Prepares alternate slot for double buffering",
                "input": "alternate property is null",
                "expected": null,
                "testFn": "const f = createFiber('FunctionComponent', () => {}); return f.alternate;"
              }
            ],
            "solutionCode": "function createFiber(tag, type, props = {}) {\n  return {\n    tag, // e.g. 'HostComponent', 'FunctionComponent'\n    type, // 'div', 'span', or Component function\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
          },
          "Medium": {
            "id": "fiber-tree-medium",
            "title": "Iterative Fiber Depth-First Walker",
            "difficulty": "Medium",
            "concept": "Non-Recursive Tree Traversal via Fiber Pointers",
            "description": "Implement `walkFiberTree(root, onVisit)` that visits every node in a Fiber tree in depth-first order using ONLY `child`, `sibling`, and `return` without recursion or array stacks.",
            "starterCode": "function walkFiberTree(root, onVisit) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using recursion will overflow the call stack when React reconciles large DOM trees of 10,000+ nodes.",
            "testCases": [
              {
                "id": 1,
                "name": "Traverses root and children in pre-order",
                "input": "Root -> A, B",
                "expected": [
                  "Root",
                  "A",
                  "B"
                ],
                "testFn": "const root = { id: 'Root', child: null, sibling: null, return: null }; const a = { id: 'A', child: null, return: root }; const b = { id: 'B', child: null, sibling: null, return: root }; root.child = a; a.sibling = b; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                "id": 2,
                "name": "Navigates multi-level nested children",
                "input": "Root -> A -> A1, then B",
                "expected": [
                  "Root",
                  "A",
                  "A1",
                  "B"
                ],
                "testFn": "const root = { id: 'Root', child: null, return: null }; const b = { id: 'B', child: null, sibling: null, return: root }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', child: a1, sibling: b, return: root }; a1.return = a; root.child = a; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                "id": 3,
                "name": "Handles leaf node with no children gracefully",
                "input": "Single node",
                "expected": [
                  "OnlyOne"
                ],
                "testFn": "const node = { id: 'OnlyOne', child: null, sibling: null, return: null }; const visited = []; walkFiberTree(node, f => visited.push(f.id)); return visited;"
              }
            ],
            "solutionCode": "function walkFiberTree(root, onVisit) {\n  let current = root;\n\n  while (current) {\n    onVisit(current);\n\n    if (current.child) {\n      current = current.child;\n      continue;\n    }\n\n    if (current === root) break;\n\n    while (!current.sibling) {\n      if (!current.return || current.return === root) {\n        return;\n      }\n      current = current.return;\n    }\n\n    current = current.sibling;\n  }\n}\n"
          },
          "Hard": {
            "id": "fiber-tree-hard",
            "title": "Fiber Double Buffering (WorkInProgress Tree Cloner)",
            "difficulty": "Hard",
            "concept": "Double Buffering & Pointer Flipping in Commit Phase",
            "description": "Implement `createWorkInProgress(currentFiber, pendingProps)` that creates or reuses the `alternate` Fiber node. It must clone the current node into its alternate, update `pendingProps`, link their mutual `alternate` references, and return the workInProgress node.",
            "starterCode": "function createWorkInProgress(current, pendingProps) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Re-allocating new objects on every render causes GC churn. React reuses the existing `current.alternate` node whenever available to maintain peak performance.",
            "testCases": [
              {
                "id": 1,
                "name": "Creates new alternate and links mutual references",
                "input": "first call links current <-> workInProgress",
                "expected": true,
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip = createWorkInProgress(current, { id: 'wip' }); return current.alternate === wip && wip.alternate === current;"
              },
              {
                "id": 2,
                "name": "Reuses existing alternate on subsequent renders (zero new object allocation)",
                "input": "subsequent call reuses current.alternate",
                "expected": true,
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip1 = createWorkInProgress(current, { count: 1 }); const wip2 = createWorkInProgress(current, { count: 2 }); return wip1 === wip2 && wip2.pendingProps.count === 2;"
              },
              {
                "id": 3,
                "name": "Updates pendingProps while preserving memoizedProps until commit",
                "input": "pendingProps updated, memoizedProps unchanged",
                "expected": {
                  "pending": "new",
                  "memoized": "old"
                },
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: 'old', alternate: null }; const wip = createWorkInProgress(current, 'new'); return { pending: wip.pendingProps, memoized: wip.memoizedProps };"
              }
            ],
            "solutionCode": "function createWorkInProgress(current, pendingProps) {\n  let workInProgress = current.alternate;\n\n  if (workInProgress === null) {\n    // Initial alternate creation\n    workInProgress = {\n      tag: current.tag,\n      type: current.type,\n      child: current.child,\n      sibling: current.sibling,\n      return: current.return,\n      memoizedProps: current.memoizedProps,\n      memoizedState: current.memoizedState,\n      alternate: current\n    };\n    current.alternate = workInProgress;\n  } else {\n    // Reuse existing alternate (zero allocation!)\n    workInProgress.child = current.child;\n    workInProgress.sibling = current.sibling;\n    workInProgress.memoizedProps = current.memoizedProps;\n    workInProgress.memoizedState = current.memoizedState;\n  }\n\n  workInProgress.pendingProps = pendingProps;\n  return workInProgress;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "fiber-tree-basic",
          "title": "Fiber Node Factory for React Elements",
          "difficulty": "Basic",
          "concept": "Fiber Node Structure & Pointers",
          "description": "Implement `createFiber(tag, type, props)` that creates a standard React Fiber node with initialized `child: null`, `sibling: null`, `return: null`, `memoizedState: null`, and `pendingProps`.",
          "starterCode": "function createFiber(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Confusing React elements (ephemeral, plain JS objects) with Fiber nodes (stateful, long-lived runtime nodes).",
          "testCases": [
            {
              "id": 1,
              "name": "Creates fiber with null relational pointers",
              "input": "createFiber('HostComponent', 'div')",
              "expected": {
                "child": null,
                "sibling": null,
                "return": null
              },
              "testFn": "const f = createFiber('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
            },
            {
              "id": 2,
              "name": "Stores pendingProps accurately",
              "input": "createFiber with className prop",
              "expected": "btn-primary",
              "testFn": "const f = createFiber('HostComponent', 'button', { className: 'btn-primary' }); return f.pendingProps.className;"
            },
            {
              "id": 3,
              "name": "Prepares alternate slot for double buffering",
              "input": "alternate property is null",
              "expected": null,
              "testFn": "const f = createFiber('FunctionComponent', () => {}); return f.alternate;"
            }
          ],
          "solutionCode": "function createFiber(tag, type, props = {}) {\n  return {\n    tag, // e.g. 'HostComponent', 'FunctionComponent'\n    type, // 'div', 'span', or Component function\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
        },
        "questions": [
          {
            "id": "fiber-tree-basic",
            "title": "Fiber Node Factory for React Elements",
            "difficulty": "Basic",
            "concept": "Fiber Node Structure & Pointers",
            "description": "Implement `createFiber(tag, type, props)` that creates a standard React Fiber node with initialized `child: null`, `sibling: null`, `return: null`, `memoizedState: null`, and `pendingProps`.",
            "starterCode": "function createFiber(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Confusing React elements (ephemeral, plain JS objects) with Fiber nodes (stateful, long-lived runtime nodes).",
            "testCases": [
              {
                "id": 1,
                "name": "Creates fiber with null relational pointers",
                "input": "createFiber('HostComponent', 'div')",
                "expected": {
                  "child": null,
                  "sibling": null,
                  "return": null
                },
                "testFn": "const f = createFiber('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                "id": 2,
                "name": "Stores pendingProps accurately",
                "input": "createFiber with className prop",
                "expected": "btn-primary",
                "testFn": "const f = createFiber('HostComponent', 'button', { className: 'btn-primary' }); return f.pendingProps.className;"
              },
              {
                "id": 3,
                "name": "Prepares alternate slot for double buffering",
                "input": "alternate property is null",
                "expected": null,
                "testFn": "const f = createFiber('FunctionComponent', () => {}); return f.alternate;"
              }
            ],
            "solutionCode": "function createFiber(tag, type, props = {}) {\n  return {\n    tag, // e.g. 'HostComponent', 'FunctionComponent'\n    type, // 'div', 'span', or Component function\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
          },
          {
            "id": "fiber-tree-medium",
            "title": "Iterative Fiber Depth-First Walker",
            "difficulty": "Medium",
            "concept": "Non-Recursive Tree Traversal via Fiber Pointers",
            "description": "Implement `walkFiberTree(root, onVisit)` that visits every node in a Fiber tree in depth-first order using ONLY `child`, `sibling`, and `return` without recursion or array stacks.",
            "starterCode": "function walkFiberTree(root, onVisit) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using recursion will overflow the call stack when React reconciles large DOM trees of 10,000+ nodes.",
            "testCases": [
              {
                "id": 1,
                "name": "Traverses root and children in pre-order",
                "input": "Root -> A, B",
                "expected": [
                  "Root",
                  "A",
                  "B"
                ],
                "testFn": "const root = { id: 'Root', child: null, sibling: null, return: null }; const a = { id: 'A', child: null, return: root }; const b = { id: 'B', child: null, sibling: null, return: root }; root.child = a; a.sibling = b; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                "id": 2,
                "name": "Navigates multi-level nested children",
                "input": "Root -> A -> A1, then B",
                "expected": [
                  "Root",
                  "A",
                  "A1",
                  "B"
                ],
                "testFn": "const root = { id: 'Root', child: null, return: null }; const b = { id: 'B', child: null, sibling: null, return: root }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', child: a1, sibling: b, return: root }; a1.return = a; root.child = a; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                "id": 3,
                "name": "Handles leaf node with no children gracefully",
                "input": "Single node",
                "expected": [
                  "OnlyOne"
                ],
                "testFn": "const node = { id: 'OnlyOne', child: null, sibling: null, return: null }; const visited = []; walkFiberTree(node, f => visited.push(f.id)); return visited;"
              }
            ],
            "solutionCode": "function walkFiberTree(root, onVisit) {\n  let current = root;\n\n  while (current) {\n    onVisit(current);\n\n    if (current.child) {\n      current = current.child;\n      continue;\n    }\n\n    if (current === root) break;\n\n    while (!current.sibling) {\n      if (!current.return || current.return === root) {\n        return;\n      }\n      current = current.return;\n    }\n\n    current = current.sibling;\n  }\n}\n"
          },
          {
            "id": "fiber-tree-hard",
            "title": "Fiber Double Buffering (WorkInProgress Tree Cloner)",
            "difficulty": "Hard",
            "concept": "Double Buffering & Pointer Flipping in Commit Phase",
            "description": "Implement `createWorkInProgress(currentFiber, pendingProps)` that creates or reuses the `alternate` Fiber node. It must clone the current node into its alternate, update `pendingProps`, link their mutual `alternate` references, and return the workInProgress node.",
            "starterCode": "function createWorkInProgress(current, pendingProps) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Re-allocating new objects on every render causes GC churn. React reuses the existing `current.alternate` node whenever available to maintain peak performance.",
            "testCases": [
              {
                "id": 1,
                "name": "Creates new alternate and links mutual references",
                "input": "first call links current <-> workInProgress",
                "expected": true,
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip = createWorkInProgress(current, { id: 'wip' }); return current.alternate === wip && wip.alternate === current;"
              },
              {
                "id": 2,
                "name": "Reuses existing alternate on subsequent renders (zero new object allocation)",
                "input": "subsequent call reuses current.alternate",
                "expected": true,
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip1 = createWorkInProgress(current, { count: 1 }); const wip2 = createWorkInProgress(current, { count: 2 }); return wip1 === wip2 && wip2.pendingProps.count === 2;"
              },
              {
                "id": 3,
                "name": "Updates pendingProps while preserving memoizedProps until commit",
                "input": "pendingProps updated, memoizedProps unchanged",
                "expected": {
                  "pending": "new",
                  "memoized": "old"
                },
                "testFn": "const current = { tag: 'Host', type: 'div', memoizedProps: 'old', alternate: null }; const wip = createWorkInProgress(current, 'new'); return { pending: wip.pendingProps, memoized: wip.memoizedProps };"
              }
            ],
            "solutionCode": "function createWorkInProgress(current, pendingProps) {\n  let workInProgress = current.alternate;\n\n  if (workInProgress === null) {\n    // Initial alternate creation\n    workInProgress = {\n      tag: current.tag,\n      type: current.type,\n      child: current.child,\n      sibling: current.sibling,\n      return: current.return,\n      memoizedProps: current.memoizedProps,\n      memoizedState: current.memoizedState,\n      alternate: current\n    };\n    current.alternate = workInProgress;\n  } else {\n    // Reuse existing alternate (zero allocation!)\n    workInProgress.child = current.child;\n    workInProgress.sibling = current.sibling;\n    workInProgress.memoizedProps = current.memoizedProps;\n    workInProgress.memoizedState = current.memoizedState;\n  }\n\n  workInProgress.pendingProps = pendingProps;\n  return workInProgress;\n}\n"
          }
        ]
      },
      {
        "id": "reconciliation-keys",
        "title": "Diffing Algorithm & The 'key' Prop Trap",
        "tag": "Reconciliation",
        "summary": "O(n) heuristic diffing, element type comparison, key stability, and index-as-key state corruption.",
        "mentalModel": "React diffs level-by-level with 2 assumptions: elements with different types produce different trees, and keys uniquely identify siblings across renders. If element types differ, the entire subtree is unmounted and rebuilt from scratch.",
        "traps": "Using array index as key when list items can be reordered, inserted, or filtered (leads to state attached to wrong inputs/components).",
        "challenges": {
          "Basic": {
            "id": "keys-basic",
            "title": "Detect Missing or Duplicate Keys in Children",
            "difficulty": "Basic",
            "concept": "Key Uniqueness Verification",
            "description": "Implement `validateKeys(children)` that inspects an array of child objects `{ key, type }` and returns `{ valid: boolean, duplicateKeys: string[], missingCount: number }`.",
            "starterCode": "function validateKeys(children) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Keys must be unique strictly among SIBLINGS, not across the entire application.",
            "testCases": [
              {
                "id": 1,
                "name": "Validates list with unique stable keys",
                "input": "children with keys 'a', 'b', 'c'",
                "expected": {
                  "valid": true,
                  "missingCount": 0,
                  "duplicateCount": 0
                },
                "testFn": "const res = validateKeys([{ key: 'a' }, { key: 'b' }, { key: 'c' }]); return { valid: res.valid, missingCount: res.missingCount, duplicateCount: res.duplicateKeys.length };"
              },
              {
                "id": 2,
                "name": "Detects duplicate keys in sibling list",
                "input": "children with duplicate key 'item-1'",
                "expected": [
                  "item-1"
                ],
                "testFn": "const res = validateKeys([{ key: 'item-1' }, { key: 'item-2' }, { key: 'item-1' }]); return res.duplicateKeys;"
              },
              {
                "id": 3,
                "name": "Counts children with missing keys",
                "input": "children missing keys",
                "expected": 2,
                "testFn": "const res = validateKeys([{ key: 'x' }, {}, { type: 'div' }]); return res.missingCount;"
              }
            ],
            "solutionCode": "function validateKeys(children) {\n  const seen = new Set();\n  const duplicateKeys = [];\n  let missingCount = 0;\n\n  for (const child of children) {\n    if (child.key === undefined || child.key === null) {\n      missingCount++;\n      continue;\n    }\n    const k = String(child.key);\n    if (seen.has(k)) {\n      if (!duplicateKeys.includes(k)) duplicateKeys.push(k);\n    } else {\n      seen.add(k);\n    }\n  }\n\n  return {\n    valid: missingCount === 0 && duplicateKeys.length === 0,\n    duplicateKeys,\n    missingCount\n  };\n}\n"
          },
          "Medium": {
            "id": "keys-medium",
            "title": "Key-Based List Reconciler (Minimal DOM Operations)",
            "difficulty": "Medium",
            "concept": "O(n) Sibling Diffing using Key Maps",
            "description": "Implement `reconcileChildren(oldChildren, newChildren)` that matches old and new list items by `key`. Returns `{ reused: string[], created: string[], deleted: string[] }`.",
            "starterCode": "function reconcileChildren(oldChildren, newChildren) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Without keys, React falls back to index comparison. Inserting an item at the beginning causes ALL subsequent items to re-render and mutate.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies reused, created, and deleted items correctly",
                "input": "[A, B, C] -> [B, C, D]",
                "expected": {
                  "reused": [
                    "B",
                    "C"
                  ],
                  "created": [
                    "D"
                  ],
                  "deleted": [
                    "A"
                  ]
                },
                "testFn": "return reconcileChildren([{ key: 'A' }, { key: 'B' }, { key: 'C' }], [{ key: 'B' }, { key: 'C' }, { key: 'D' }]);"
              },
              {
                "id": 2,
                "name": "Handles complete replacement",
                "input": "[1, 2] -> [3, 4]",
                "expected": {
                  "reused": [],
                  "created": [
                    "3",
                    "4"
                  ],
                  "deleted": [
                    "1",
                    "2"
                  ]
                },
                "testFn": "return reconcileChildren([{ key: '1' }, { key: '2' }], [{ key: '3' }, { key: '4' }]);"
              },
              {
                "id": 3,
                "name": "Handles unchanged re-ordering",
                "input": "[X, Y] -> [Y, X]",
                "expected": {
                  "reused": [
                    "Y",
                    "X"
                  ],
                  "created": [],
                  "deleted": []
                },
                "testFn": "return reconcileChildren([{ key: 'X' }, { key: 'Y' }], [{ key: 'Y' }, { key: 'X' }]);"
              }
            ],
            "solutionCode": "function reconcileChildren(oldChildren, newChildren) {\n  const oldKeyMap = new Map();\n  oldChildren.forEach(child => oldKeyMap.set(child.key, child));\n\n  const reused = [];\n  const created = [];\n  const seenNewKeys = new Set();\n\n  newChildren.forEach(child => {\n    seenNewKeys.add(child.key);\n    if (oldKeyMap.has(child.key)) {\n      reused.push(child.key);\n    } else {\n      created.push(child.key);\n    }\n  });\n\n  const deleted = [];\n  oldChildren.forEach(child => {\n    if (!seenNewKeys.has(child.key)) {\n      deleted.push(child.key);\n    }\n  });\n\n  return { reused, created, deleted };\n}\n"
          },
          "Hard": {
            "id": "keys-hard",
            "title": "Diagnose & Fix State Corruption from Index-as-Key",
            "difficulty": "Hard",
            "concept": "Uncontrolled State Retention across Key Changes",
            "description": "Implement `simulateTodoDeletion(todos, deleteIndex, useStableKey)` that demonstrates why using index as key causes state corruption when items are removed. When `useStableKey` is true, state stays bound to the item's true ID; when false, state stays bound to the array index.",
            "starterCode": "function simulateTodoDeletion(todos, deleteIndex, useStableKey = true) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the classic senior interview question: when deleting item 0, the input at index 0 still displays item 0's text if index was used as key!",
            "testCases": [
              {
                "id": 1,
                "name": "Stable key preserves correct text on each item after deletion",
                "input": "Delete top item with stable key",
                "expected": [
                  {
                    "id": "2",
                    "displayedText": "two"
                  }
                ],
                "testFn": "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; return simulateTodoDeletion(todos, 0, true);"
              },
              {
                "id": 2,
                "name": "Index-as-key causes state bleed where remaining item gets deleted item's input state",
                "input": "Delete top item with index as key",
                "expected": "one",
                "testFn": "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; const res = simulateTodoDeletion(todos, 0, false); return res[0].displayedText;"
              },
              {
                "id": 3,
                "name": "Stable keys prevent corruption on middle deletions",
                "input": "3 items deleting middle with stable keys",
                "expected": [
                  "A",
                  "C"
                ],
                "testFn": "const todos = [{ id: 'a', userTextInInput: 'A' }, { id: 'b', userTextInInput: 'B' }, { id: 'c', userTextInInput: 'C' }]; return simulateTodoDeletion(todos, 1, true).map(t => t.displayedText);"
              }
            ],
            "solutionCode": "function simulateTodoDeletion(todos, deleteIndex, useStableKey = true) {\n  // Each todo has: { id: string, text: string, userTextInInput: string }\n  if (useStableKey) {\n    // Stable key maps input by id\n    const remaining = todos.filter((_, i) => i !== deleteIndex);\n    return remaining.map(t => ({ id: t.id, displayedText: t.userTextInInput }));\n  } else {\n    // Index key associates input state with index!\n    const remaining = todos.filter((_, i) => i !== deleteIndex);\n    // When deleting index 0, index 0 keeps old index 0's input state!\n    return remaining.map((t, idx) => ({\n      id: t.id,\n      displayedText: todos[idx].userTextInInput // Stale state bleed!\n    }));\n  }\n}\n"
          }
        },
        "starterChallenge": {
          "id": "keys-basic",
          "title": "Detect Missing or Duplicate Keys in Children",
          "difficulty": "Basic",
          "concept": "Key Uniqueness Verification",
          "description": "Implement `validateKeys(children)` that inspects an array of child objects `{ key, type }` and returns `{ valid: boolean, duplicateKeys: string[], missingCount: number }`.",
          "starterCode": "function validateKeys(children) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Keys must be unique strictly among SIBLINGS, not across the entire application.",
          "testCases": [
            {
              "id": 1,
              "name": "Validates list with unique stable keys",
              "input": "children with keys 'a', 'b', 'c'",
              "expected": {
                "valid": true,
                "missingCount": 0,
                "duplicateCount": 0
              },
              "testFn": "const res = validateKeys([{ key: 'a' }, { key: 'b' }, { key: 'c' }]); return { valid: res.valid, missingCount: res.missingCount, duplicateCount: res.duplicateKeys.length };"
            },
            {
              "id": 2,
              "name": "Detects duplicate keys in sibling list",
              "input": "children with duplicate key 'item-1'",
              "expected": [
                "item-1"
              ],
              "testFn": "const res = validateKeys([{ key: 'item-1' }, { key: 'item-2' }, { key: 'item-1' }]); return res.duplicateKeys;"
            },
            {
              "id": 3,
              "name": "Counts children with missing keys",
              "input": "children missing keys",
              "expected": 2,
              "testFn": "const res = validateKeys([{ key: 'x' }, {}, { type: 'div' }]); return res.missingCount;"
            }
          ],
          "solutionCode": "function validateKeys(children) {\n  const seen = new Set();\n  const duplicateKeys = [];\n  let missingCount = 0;\n\n  for (const child of children) {\n    if (child.key === undefined || child.key === null) {\n      missingCount++;\n      continue;\n    }\n    const k = String(child.key);\n    if (seen.has(k)) {\n      if (!duplicateKeys.includes(k)) duplicateKeys.push(k);\n    } else {\n      seen.add(k);\n    }\n  }\n\n  return {\n    valid: missingCount === 0 && duplicateKeys.length === 0,\n    duplicateKeys,\n    missingCount\n  };\n}\n"
        },
        "questions": [
          {
            "id": "keys-basic",
            "title": "Detect Missing or Duplicate Keys in Children",
            "difficulty": "Basic",
            "concept": "Key Uniqueness Verification",
            "description": "Implement `validateKeys(children)` that inspects an array of child objects `{ key, type }` and returns `{ valid: boolean, duplicateKeys: string[], missingCount: number }`.",
            "starterCode": "function validateKeys(children) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Keys must be unique strictly among SIBLINGS, not across the entire application.",
            "testCases": [
              {
                "id": 1,
                "name": "Validates list with unique stable keys",
                "input": "children with keys 'a', 'b', 'c'",
                "expected": {
                  "valid": true,
                  "missingCount": 0,
                  "duplicateCount": 0
                },
                "testFn": "const res = validateKeys([{ key: 'a' }, { key: 'b' }, { key: 'c' }]); return { valid: res.valid, missingCount: res.missingCount, duplicateCount: res.duplicateKeys.length };"
              },
              {
                "id": 2,
                "name": "Detects duplicate keys in sibling list",
                "input": "children with duplicate key 'item-1'",
                "expected": [
                  "item-1"
                ],
                "testFn": "const res = validateKeys([{ key: 'item-1' }, { key: 'item-2' }, { key: 'item-1' }]); return res.duplicateKeys;"
              },
              {
                "id": 3,
                "name": "Counts children with missing keys",
                "input": "children missing keys",
                "expected": 2,
                "testFn": "const res = validateKeys([{ key: 'x' }, {}, { type: 'div' }]); return res.missingCount;"
              }
            ],
            "solutionCode": "function validateKeys(children) {\n  const seen = new Set();\n  const duplicateKeys = [];\n  let missingCount = 0;\n\n  for (const child of children) {\n    if (child.key === undefined || child.key === null) {\n      missingCount++;\n      continue;\n    }\n    const k = String(child.key);\n    if (seen.has(k)) {\n      if (!duplicateKeys.includes(k)) duplicateKeys.push(k);\n    } else {\n      seen.add(k);\n    }\n  }\n\n  return {\n    valid: missingCount === 0 && duplicateKeys.length === 0,\n    duplicateKeys,\n    missingCount\n  };\n}\n"
          },
          {
            "id": "keys-medium",
            "title": "Key-Based List Reconciler (Minimal DOM Operations)",
            "difficulty": "Medium",
            "concept": "O(n) Sibling Diffing using Key Maps",
            "description": "Implement `reconcileChildren(oldChildren, newChildren)` that matches old and new list items by `key`. Returns `{ reused: string[], created: string[], deleted: string[] }`.",
            "starterCode": "function reconcileChildren(oldChildren, newChildren) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Without keys, React falls back to index comparison. Inserting an item at the beginning causes ALL subsequent items to re-render and mutate.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies reused, created, and deleted items correctly",
                "input": "[A, B, C] -> [B, C, D]",
                "expected": {
                  "reused": [
                    "B",
                    "C"
                  ],
                  "created": [
                    "D"
                  ],
                  "deleted": [
                    "A"
                  ]
                },
                "testFn": "return reconcileChildren([{ key: 'A' }, { key: 'B' }, { key: 'C' }], [{ key: 'B' }, { key: 'C' }, { key: 'D' }]);"
              },
              {
                "id": 2,
                "name": "Handles complete replacement",
                "input": "[1, 2] -> [3, 4]",
                "expected": {
                  "reused": [],
                  "created": [
                    "3",
                    "4"
                  ],
                  "deleted": [
                    "1",
                    "2"
                  ]
                },
                "testFn": "return reconcileChildren([{ key: '1' }, { key: '2' }], [{ key: '3' }, { key: '4' }]);"
              },
              {
                "id": 3,
                "name": "Handles unchanged re-ordering",
                "input": "[X, Y] -> [Y, X]",
                "expected": {
                  "reused": [
                    "Y",
                    "X"
                  ],
                  "created": [],
                  "deleted": []
                },
                "testFn": "return reconcileChildren([{ key: 'X' }, { key: 'Y' }], [{ key: 'Y' }, { key: 'X' }]);"
              }
            ],
            "solutionCode": "function reconcileChildren(oldChildren, newChildren) {\n  const oldKeyMap = new Map();\n  oldChildren.forEach(child => oldKeyMap.set(child.key, child));\n\n  const reused = [];\n  const created = [];\n  const seenNewKeys = new Set();\n\n  newChildren.forEach(child => {\n    seenNewKeys.add(child.key);\n    if (oldKeyMap.has(child.key)) {\n      reused.push(child.key);\n    } else {\n      created.push(child.key);\n    }\n  });\n\n  const deleted = [];\n  oldChildren.forEach(child => {\n    if (!seenNewKeys.has(child.key)) {\n      deleted.push(child.key);\n    }\n  });\n\n  return { reused, created, deleted };\n}\n"
          },
          {
            "id": "keys-hard",
            "title": "Diagnose & Fix State Corruption from Index-as-Key",
            "difficulty": "Hard",
            "concept": "Uncontrolled State Retention across Key Changes",
            "description": "Implement `simulateTodoDeletion(todos, deleteIndex, useStableKey)` that demonstrates why using index as key causes state corruption when items are removed. When `useStableKey` is true, state stays bound to the item's true ID; when false, state stays bound to the array index.",
            "starterCode": "function simulateTodoDeletion(todos, deleteIndex, useStableKey = true) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the classic senior interview question: when deleting item 0, the input at index 0 still displays item 0's text if index was used as key!",
            "testCases": [
              {
                "id": 1,
                "name": "Stable key preserves correct text on each item after deletion",
                "input": "Delete top item with stable key",
                "expected": [
                  {
                    "id": "2",
                    "displayedText": "two"
                  }
                ],
                "testFn": "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; return simulateTodoDeletion(todos, 0, true);"
              },
              {
                "id": 2,
                "name": "Index-as-key causes state bleed where remaining item gets deleted item's input state",
                "input": "Delete top item with index as key",
                "expected": "one",
                "testFn": "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; const res = simulateTodoDeletion(todos, 0, false); return res[0].displayedText;"
              },
              {
                "id": 3,
                "name": "Stable keys prevent corruption on middle deletions",
                "input": "3 items deleting middle with stable keys",
                "expected": [
                  "A",
                  "C"
                ],
                "testFn": "const todos = [{ id: 'a', userTextInInput: 'A' }, { id: 'b', userTextInInput: 'B' }, { id: 'c', userTextInInput: 'C' }]; return simulateTodoDeletion(todos, 1, true).map(t => t.displayedText);"
              }
            ],
            "solutionCode": "function simulateTodoDeletion(todos, deleteIndex, useStableKey = true) {\n  // Each todo has: { id: string, text: string, userTextInInput: string }\n  if (useStableKey) {\n    // Stable key maps input by id\n    const remaining = todos.filter((_, i) => i !== deleteIndex);\n    return remaining.map(t => ({ id: t.id, displayedText: t.userTextInInput }));\n  } else {\n    // Index key associates input state with index!\n    const remaining = todos.filter((_, i) => i !== deleteIndex);\n    // When deleting index 0, index 0 keeps old index 0's input state!\n    return remaining.map((t, idx) => ({\n      id: t.id,\n      displayedText: todos[idx].userTextInInput // Stale state bleed!\n    }));\n  }\n}\n"
          }
        ]
      },
      {
        "id": "render-vs-commit",
        "title": "Render Phase vs Commit Phase Mechanics",
        "tag": "Lifecycle",
        "summary": "Pure render functions, side effects placement, synchronously flushing DOM changes in commit phase.",
        "mentalModel": "The Render Phase calls component functions and reconciles virtual fibers. It MUST be pure with zero side effects, because React may abort or restart it multiple times. The Commit Phase applies DOM changes synchronously, then runs layout and passive effects.",
        "traps": "Mutating global variables, making network calls, or setting state inside the render function body.",
        "challenges": {
          "Basic": {
            "id": "phases-basic",
            "title": "Pure Component Render Inspector",
            "difficulty": "Basic",
            "concept": "Idempotence and Purity in Component Body",
            "description": "Implement `verifyRenderPurity(componentFn, props)` that runs `componentFn(props)` twice consecutively. If the output varies or side-effect counters change between runs, returns `{ isPure: false }`, otherwise `{ isPure: true, output }`.",
            "starterCode": "function verifyRenderPurity(componentFn, props) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React StrictMode renders components TWICE in development specifically to uncover impure renders and accidental side effects.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies pure deterministic render",
                "input": "pure component returns same output",
                "expected": true,
                "testFn": "const PureComp = p => ({ tag: 'h1', text: p.name }); return verifyRenderPurity(PureComp, { name: 'Alice' }).isPure;"
              },
              {
                "id": 2,
                "name": "Flags impure component mutating external counter",
                "input": "impure component increments global variable",
                "expected": false,
                "testFn": "let globalCount = 0; const ImpureComp = () => ({ val: ++globalCount }); return verifyRenderPurity(ImpureComp, {}).isPure;"
              },
              {
                "id": 3,
                "name": "Returns component output safely",
                "input": "output text verified",
                "expected": "Hello",
                "testFn": "const Comp = () => ({ text: 'Hello' }); return verifyRenderPurity(Comp, {}).output.text;"
              }
            ],
            "solutionCode": "function verifyRenderPurity(componentFn, props) {\n  const run1 = JSON.stringify(componentFn(props));\n  const run2 = JSON.stringify(componentFn(props));\n\n  return {\n    isPure: run1 === run2,\n    output: JSON.parse(run1)\n  };\n}\n"
          },
          "Medium": {
            "id": "phases-medium",
            "title": "Simulate Two-Phase Render and Commit Pipeline",
            "difficulty": "Medium",
            "concept": "Separation of VDOM Calculation and DOM Mutation",
            "description": "Implement `createUpdatePipeline()` that splits updates into two distinct phases: `renderPhase(components)` which computes DOM changes without touching the DOM, and `commitPhase(changes, targetDOM)` which applies all DOM mutations synchronously.",
            "starterCode": "function createUpdatePipeline() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly modifying the DOM during the render phase causes partial, broken UI states if the render gets aborted.",
            "testCases": [
              {
                "id": 1,
                "name": "Calculates mutations in render phase without executing commit",
                "input": "renderPhase stages mutations",
                "expected": 2,
                "testFn": "const p = createUpdatePipeline(); return p.renderPhase([{ action: 'INSERT', id: '1', content: 'A' }, { action: 'UPDATE', id: '2', content: 'B' }]);"
              },
              {
                "id": 2,
                "name": "Flushes all staged mutations synchronously during commit",
                "input": "commitPhase executes applied mutations",
                "expected": [
                  "INSERT 1: Hello",
                  "UPDATE 2: World"
                ],
                "testFn": "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'Hello' }, { action: 'UPDATE', id: '2', content: 'World' }]); return p.commitPhase();"
              },
              {
                "id": 3,
                "name": "Clears mutation buffer after commit",
                "input": "subsequent commit returns empty",
                "expected": [],
                "testFn": "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'x' }]); p.commitPhase(); return p.commitPhase();"
              }
            ],
            "solutionCode": "function createUpdatePipeline() {\n  let pendingMutations = [];\n\n  return {\n    renderPhase(virtualUpdates) {\n      // Pure calculation phase: calculate operations\n      pendingMutations = virtualUpdates.map(u => ({\n        type: u.action, // 'INSERT' | 'UPDATE' | 'REMOVE'\n        elementId: u.id,\n        content: u.content\n      }));\n      return pendingMutations.length;\n    },\n    commitPhase(domContainer) {\n      // Synchronous commit phase: flush all mutations into DOM\n      const applied = [];\n      for (const mut of pendingMutations) {\n        applied.push(`${mut.type} ${mut.elementId}: ${mut.content}`);\n      }\n      pendingMutations = [];\n      return applied;\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "phases-hard",
            "title": "Interruptible Work Loop with Time-Slicing Simulation",
            "difficulty": "Hard",
            "concept": "Scheduler Yielding & Concurrent Render Loop",
            "description": "Implement `runWorkLoop(workUnits, deadlineMs)` that processes an array of work units. It checks elapsed time after each unit, and if `deadlineMs` is exceeded, pauses execution, yields control, and returns `{ done: false, remainingCount }`. If all units finish within budget, returns `{ done: true, remainingCount: 0 }`.",
            "starterCode": "function runWorkLoop(workUnits, deadlineMs = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact design of React Concurrent Mode's `shouldYield()` workLoop. Synchronous blocking renders drop 60fps frame rates.",
            "testCases": [
              {
                "id": 1,
                "name": "Completes all units when well within time deadline",
                "input": "3 quick units with 50ms deadline",
                "expected": {
                  "done": true,
                  "remainingCount": 0
                },
                "testFn": "const units = [() => {}, () => {}, () => {}]; const res = runWorkLoop(units, 50); return { done: res.done, remainingCount: res.remainingCount };"
              },
              {
                "id": 2,
                "name": "Interrupts work loop and yields when deadline is exceeded",
                "input": "units exceeding 1ms deadline yield",
                "expected": false,
                "testFn": "const units = Array.from({ length: 100 }, () => () => { const start = performance.now(); while (performance.now() - start < 1); }); const res = runWorkLoop(units, 2); return res.done;"
              },
              {
                "id": 3,
                "name": "Processes units sequentially",
                "input": "verifies units execute in order",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const log = []; const units = [() => log.push(1), () => log.push(2), () => log.push(3)]; runWorkLoop(units, 50); return log;"
              }
            ],
            "solutionCode": "function runWorkLoop(workUnits, deadlineMs = 5) {\n  const startTime = performance.now();\n  let index = 0;\n\n  while (index < workUnits.length) {\n    if (performance.now() - startTime >= deadlineMs) {\n      return {\n        done: false,\n        processedCount: index,\n        remainingCount: workUnits.length - index\n      };\n    }\n    workUnits[index]();\n    index++;\n  }\n\n  return {\n    done: true,\n    processedCount: index,\n    remainingCount: 0\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "phases-basic",
          "title": "Pure Component Render Inspector",
          "difficulty": "Basic",
          "concept": "Idempotence and Purity in Component Body",
          "description": "Implement `verifyRenderPurity(componentFn, props)` that runs `componentFn(props)` twice consecutively. If the output varies or side-effect counters change between runs, returns `{ isPure: false }`, otherwise `{ isPure: true, output }`.",
          "starterCode": "function verifyRenderPurity(componentFn, props) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "React StrictMode renders components TWICE in development specifically to uncover impure renders and accidental side effects.",
          "testCases": [
            {
              "id": 1,
              "name": "Identifies pure deterministic render",
              "input": "pure component returns same output",
              "expected": true,
              "testFn": "const PureComp = p => ({ tag: 'h1', text: p.name }); return verifyRenderPurity(PureComp, { name: 'Alice' }).isPure;"
            },
            {
              "id": 2,
              "name": "Flags impure component mutating external counter",
              "input": "impure component increments global variable",
              "expected": false,
              "testFn": "let globalCount = 0; const ImpureComp = () => ({ val: ++globalCount }); return verifyRenderPurity(ImpureComp, {}).isPure;"
            },
            {
              "id": 3,
              "name": "Returns component output safely",
              "input": "output text verified",
              "expected": "Hello",
              "testFn": "const Comp = () => ({ text: 'Hello' }); return verifyRenderPurity(Comp, {}).output.text;"
            }
          ],
          "solutionCode": "function verifyRenderPurity(componentFn, props) {\n  const run1 = JSON.stringify(componentFn(props));\n  const run2 = JSON.stringify(componentFn(props));\n\n  return {\n    isPure: run1 === run2,\n    output: JSON.parse(run1)\n  };\n}\n"
        },
        "questions": [
          {
            "id": "phases-basic",
            "title": "Pure Component Render Inspector",
            "difficulty": "Basic",
            "concept": "Idempotence and Purity in Component Body",
            "description": "Implement `verifyRenderPurity(componentFn, props)` that runs `componentFn(props)` twice consecutively. If the output varies or side-effect counters change between runs, returns `{ isPure: false }`, otherwise `{ isPure: true, output }`.",
            "starterCode": "function verifyRenderPurity(componentFn, props) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React StrictMode renders components TWICE in development specifically to uncover impure renders and accidental side effects.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies pure deterministic render",
                "input": "pure component returns same output",
                "expected": true,
                "testFn": "const PureComp = p => ({ tag: 'h1', text: p.name }); return verifyRenderPurity(PureComp, { name: 'Alice' }).isPure;"
              },
              {
                "id": 2,
                "name": "Flags impure component mutating external counter",
                "input": "impure component increments global variable",
                "expected": false,
                "testFn": "let globalCount = 0; const ImpureComp = () => ({ val: ++globalCount }); return verifyRenderPurity(ImpureComp, {}).isPure;"
              },
              {
                "id": 3,
                "name": "Returns component output safely",
                "input": "output text verified",
                "expected": "Hello",
                "testFn": "const Comp = () => ({ text: 'Hello' }); return verifyRenderPurity(Comp, {}).output.text;"
              }
            ],
            "solutionCode": "function verifyRenderPurity(componentFn, props) {\n  const run1 = JSON.stringify(componentFn(props));\n  const run2 = JSON.stringify(componentFn(props));\n\n  return {\n    isPure: run1 === run2,\n    output: JSON.parse(run1)\n  };\n}\n"
          },
          {
            "id": "phases-medium",
            "title": "Simulate Two-Phase Render and Commit Pipeline",
            "difficulty": "Medium",
            "concept": "Separation of VDOM Calculation and DOM Mutation",
            "description": "Implement `createUpdatePipeline()` that splits updates into two distinct phases: `renderPhase(components)` which computes DOM changes without touching the DOM, and `commitPhase(changes, targetDOM)` which applies all DOM mutations synchronously.",
            "starterCode": "function createUpdatePipeline() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly modifying the DOM during the render phase causes partial, broken UI states if the render gets aborted.",
            "testCases": [
              {
                "id": 1,
                "name": "Calculates mutations in render phase without executing commit",
                "input": "renderPhase stages mutations",
                "expected": 2,
                "testFn": "const p = createUpdatePipeline(); return p.renderPhase([{ action: 'INSERT', id: '1', content: 'A' }, { action: 'UPDATE', id: '2', content: 'B' }]);"
              },
              {
                "id": 2,
                "name": "Flushes all staged mutations synchronously during commit",
                "input": "commitPhase executes applied mutations",
                "expected": [
                  "INSERT 1: Hello",
                  "UPDATE 2: World"
                ],
                "testFn": "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'Hello' }, { action: 'UPDATE', id: '2', content: 'World' }]); return p.commitPhase();"
              },
              {
                "id": 3,
                "name": "Clears mutation buffer after commit",
                "input": "subsequent commit returns empty",
                "expected": [],
                "testFn": "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'x' }]); p.commitPhase(); return p.commitPhase();"
              }
            ],
            "solutionCode": "function createUpdatePipeline() {\n  let pendingMutations = [];\n\n  return {\n    renderPhase(virtualUpdates) {\n      // Pure calculation phase: calculate operations\n      pendingMutations = virtualUpdates.map(u => ({\n        type: u.action, // 'INSERT' | 'UPDATE' | 'REMOVE'\n        elementId: u.id,\n        content: u.content\n      }));\n      return pendingMutations.length;\n    },\n    commitPhase(domContainer) {\n      // Synchronous commit phase: flush all mutations into DOM\n      const applied = [];\n      for (const mut of pendingMutations) {\n        applied.push(`${mut.type} ${mut.elementId}: ${mut.content}`);\n      }\n      pendingMutations = [];\n      return applied;\n    }\n  };\n}\n"
          },
          {
            "id": "phases-hard",
            "title": "Interruptible Work Loop with Time-Slicing Simulation",
            "difficulty": "Hard",
            "concept": "Scheduler Yielding & Concurrent Render Loop",
            "description": "Implement `runWorkLoop(workUnits, deadlineMs)` that processes an array of work units. It checks elapsed time after each unit, and if `deadlineMs` is exceeded, pauses execution, yields control, and returns `{ done: false, remainingCount }`. If all units finish within budget, returns `{ done: true, remainingCount: 0 }`.",
            "starterCode": "function runWorkLoop(workUnits, deadlineMs = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact design of React Concurrent Mode's `shouldYield()` workLoop. Synchronous blocking renders drop 60fps frame rates.",
            "testCases": [
              {
                "id": 1,
                "name": "Completes all units when well within time deadline",
                "input": "3 quick units with 50ms deadline",
                "expected": {
                  "done": true,
                  "remainingCount": 0
                },
                "testFn": "const units = [() => {}, () => {}, () => {}]; const res = runWorkLoop(units, 50); return { done: res.done, remainingCount: res.remainingCount };"
              },
              {
                "id": 2,
                "name": "Interrupts work loop and yields when deadline is exceeded",
                "input": "units exceeding 1ms deadline yield",
                "expected": false,
                "testFn": "const units = Array.from({ length: 100 }, () => () => { const start = performance.now(); while (performance.now() - start < 1); }); const res = runWorkLoop(units, 2); return res.done;"
              },
              {
                "id": 3,
                "name": "Processes units sequentially",
                "input": "verifies units execute in order",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const log = []; const units = [() => log.push(1), () => log.push(2), () => log.push(3)]; runWorkLoop(units, 50); return log;"
              }
            ],
            "solutionCode": "function runWorkLoop(workUnits, deadlineMs = 5) {\n  const startTime = performance.now();\n  let index = 0;\n\n  while (index < workUnits.length) {\n    if (performance.now() - startTime >= deadlineMs) {\n      return {\n        done: false,\n        processedCount: index,\n        remainingCount: workUnits.length - index\n      };\n    }\n    workUnits[index]();\n    index++;\n  }\n\n  return {\n    done: true,\n    processedCount: index,\n    remainingCount: 0\n  };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "react-hooks-state-machine",
    "category": "2. Hooks State Machine & Closures",
    "badge": "Hooks Internals",
    "description": "Hooks linked-list memoizedState, stale closures in useEffect, and effect timings.",
    "topics": [
      {
        "id": "hooks-under-the-hood",
        "title": "Hooks Linked List & Rules of Hooks",
        "tag": "Hooks Core",
        "summary": "memoizedState pointer list on fiber, call order stability, why hooks cannot be in if-statements.",
        "mentalModel": "React stores hook states on the Fiber's `memoizedState` property as a singly linked list (`hook.next`). On every render, React traverses this list in the exact order hooks are called. If a hook call is conditional, the list indices drift, corrupting all subsequent hook states.",
        "traps": "Calling hooks inside `if (condition)`, loops, or nested functions, causing silent state corruption or invariant crashes.",
        "challenges": {
          "Basic": {
            "id": "hook-core-basic",
            "title": "Simulate useState Hook in Pure JS",
            "difficulty": "Basic",
            "concept": "Hook State Holder and Setter Dispatcher",
            "description": "Implement `createSimpleUseState(initialValue)` that returns a pair `[getState, setState]`. Calling `setState(newValueOrFn)` updates state, and `getState()` returns the current value.",
            "starterCode": "function createSimpleUseState(initialValue) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not supporting functional updates `setState(prev => prev + 1)`.",
            "testCases": [
              {
                "id": 1,
                "name": "Initializes and updates with direct values",
                "input": "setState(42)",
                "expected": 42,
                "testFn": "const [get, set] = createSimpleUseState(0); set(42); return get();"
              },
              {
                "id": 2,
                "name": "Supports functional updater syntax",
                "input": "set(prev => prev + 5)",
                "expected": 15,
                "testFn": "const [get, set] = createSimpleUseState(10); set(prev => prev + 5); return get();"
              },
              {
                "id": 3,
                "name": "Supports lazy initial state function",
                "input": "createSimpleUseState(() => 'computed')",
                "expected": "computed",
                "testFn": "const [get] = createSimpleUseState(() => 'computed'); return get();"
              }
            ],
            "solutionCode": "function createSimpleUseState(initialValue) {\n  let state = typeof initialValue === 'function' ? initialValue() : initialValue;\n\n  function getState() {\n    return state;\n  }\n\n  function setState(action) {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = action;\n    }\n  }\n\n  return [getState, setState];\n}\n"
          },
          "Medium": {
            "id": "hook-core-medium",
            "title": "Multi-Hook Linked List Runner",
            "difficulty": "Medium",
            "concept": "Fiber memoizedState Linked List & Sequential Traversal",
            "description": "Implement `createHookRunner()` that supports multiple calls to `useState()` across consecutive render passes, storing them in a linked-list structure and maintaining state continuity.",
            "starterCode": "function createHookRunner() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React does not use key names for hooks! It relies 100% on execution call order to pair each hook with its corresponding slot in the linked list.",
            "testCases": [
              {
                "id": 1,
                "name": "Maintains multiple independent hook states in order",
                "input": "useState('name') and useState('age')",
                "expected": [
                  "Alice",
                  25
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); const [name] = r.useState('Alice'); const [age] = r.useState(25); return [name, age];"
              },
              {
                "id": 2,
                "name": "Preserves updated values across multiple renders",
                "input": "setState updates state on next render pass",
                "expected": [
                  "Bob",
                  26
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); const [, setName] = r.useState('Alice'); const [, setAge] = r.useState(25); setName('Bob'); setAge(prev => prev + 1); r.prepareRender(); const [name2] = r.useState(); const [age2] = r.useState(); return [name2, age2];"
              },
              {
                "id": 3,
                "name": "Handles 3 or more hooks in strict sequence",
                "input": "3 hooks preserved accurately",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); r.useState(1); r.useState(2); r.useState(3); r.prepareRender(); return [r.useState()[0], r.useState()[0], r.useState()[0]];"
              }
            ],
            "solutionCode": "function createHookRunner() {\n  let firstHook = null;\n  let currentHook = null;\n  let isMount = true;\n\n  function useState(initialState) {\n    let hook;\n\n    if (isMount) {\n      hook = {\n        memoizedState: typeof initialState === 'function' ? initialState() : initialState,\n        next: null\n      };\n      if (!firstHook) {\n        firstHook = hook;\n      } else {\n        currentHook.next = hook;\n      }\n      currentHook = hook;\n    } else {\n      hook = currentHook;\n      currentHook = currentHook.next;\n    }\n\n    const setState = (action) => {\n      hook.memoizedState = typeof action === 'function' ? action(hook.memoizedState) : action;\n    };\n\n    return [hook.memoizedState, setState];\n  }\n\n  function prepareRender() {\n    isMount = firstHook === null;\n    currentHook = firstHook;\n  }\n\n  return { useState, prepareRender };\n}\n"
          },
          "Hard": {
            "id": "hook-core-hard",
            "title": "Rules of Hooks Dynamic Validator",
            "difficulty": "Hard",
            "concept": "Detecting Conditional or Shuffled Hook Calls",
            "description": "Implement `validateHookSequence(mountHooks, updateHooks)` that compares the sequence of hook types called on mount vs update. If update calls fewer hooks, more hooks, or a different hook type at any index, throws an Error detailing the exact violation.",
            "starterCode": "function validateHookSequence(mountHookTypes, updateHookTypes) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact runtime error React throws: 'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.'",
            "testCases": [
              {
                "id": 1,
                "name": "Validates identical hook sequences across renders",
                "input": "['useState', 'useEffect'] -> ['useState', 'useEffect']",
                "expected": true,
                "testFn": "return validateHookSequence(['useState', 'useEffect'], ['useState', 'useEffect']).valid;"
              },
              {
                "id": 2,
                "name": "Throws error when hook count changes between renders",
                "input": "mount 3 hooks, update 2 hooks throws Error",
                "expected": true,
                "testFn": "try { validateHookSequence(['useState', 'useRef', 'useEffect'], ['useState', 'useEffect']); return false; } catch (e) { return true; }"
              },
              {
                "id": 3,
                "name": "Throws error when hook type order is transposed",
                "input": "swapped hooks throws type mismatch error",
                "expected": true,
                "testFn": "try { validateHookSequence(['useState', 'useEffect'], ['useEffect', 'useState']); return false; } catch (e) { return e.message.includes('Hook type mismatch'); }"
              }
            ],
            "solutionCode": "function validateHookSequence(mountHookTypes, updateHookTypes) {\n  if (mountHookTypes.length !== updateHookTypes.length) {\n    throw new Error(`Rendered fewer or more hooks than expected. Mounted: ${mountHookTypes.length}, Updated: ${updateHookTypes.length}`);\n  }\n\n  for (let i = 0; i < mountHookTypes.length; i++) {\n    if (mountHookTypes[i] !== updateHookTypes[i]) {\n      throw new Error(`Hook type mismatch at slot ${i}: expected ${mountHookTypes[i]}, received ${updateHookTypes[i]}`);\n    }\n  }\n\n  return { valid: true };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "hook-core-basic",
          "title": "Simulate useState Hook in Pure JS",
          "difficulty": "Basic",
          "concept": "Hook State Holder and Setter Dispatcher",
          "description": "Implement `createSimpleUseState(initialValue)` that returns a pair `[getState, setState]`. Calling `setState(newValueOrFn)` updates state, and `getState()` returns the current value.",
          "starterCode": "function createSimpleUseState(initialValue) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Not supporting functional updates `setState(prev => prev + 1)`.",
          "testCases": [
            {
              "id": 1,
              "name": "Initializes and updates with direct values",
              "input": "setState(42)",
              "expected": 42,
              "testFn": "const [get, set] = createSimpleUseState(0); set(42); return get();"
            },
            {
              "id": 2,
              "name": "Supports functional updater syntax",
              "input": "set(prev => prev + 5)",
              "expected": 15,
              "testFn": "const [get, set] = createSimpleUseState(10); set(prev => prev + 5); return get();"
            },
            {
              "id": 3,
              "name": "Supports lazy initial state function",
              "input": "createSimpleUseState(() => 'computed')",
              "expected": "computed",
              "testFn": "const [get] = createSimpleUseState(() => 'computed'); return get();"
            }
          ],
          "solutionCode": "function createSimpleUseState(initialValue) {\n  let state = typeof initialValue === 'function' ? initialValue() : initialValue;\n\n  function getState() {\n    return state;\n  }\n\n  function setState(action) {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = action;\n    }\n  }\n\n  return [getState, setState];\n}\n"
        },
        "questions": [
          {
            "id": "hook-core-basic",
            "title": "Simulate useState Hook in Pure JS",
            "difficulty": "Basic",
            "concept": "Hook State Holder and Setter Dispatcher",
            "description": "Implement `createSimpleUseState(initialValue)` that returns a pair `[getState, setState]`. Calling `setState(newValueOrFn)` updates state, and `getState()` returns the current value.",
            "starterCode": "function createSimpleUseState(initialValue) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not supporting functional updates `setState(prev => prev + 1)`.",
            "testCases": [
              {
                "id": 1,
                "name": "Initializes and updates with direct values",
                "input": "setState(42)",
                "expected": 42,
                "testFn": "const [get, set] = createSimpleUseState(0); set(42); return get();"
              },
              {
                "id": 2,
                "name": "Supports functional updater syntax",
                "input": "set(prev => prev + 5)",
                "expected": 15,
                "testFn": "const [get, set] = createSimpleUseState(10); set(prev => prev + 5); return get();"
              },
              {
                "id": 3,
                "name": "Supports lazy initial state function",
                "input": "createSimpleUseState(() => 'computed')",
                "expected": "computed",
                "testFn": "const [get] = createSimpleUseState(() => 'computed'); return get();"
              }
            ],
            "solutionCode": "function createSimpleUseState(initialValue) {\n  let state = typeof initialValue === 'function' ? initialValue() : initialValue;\n\n  function getState() {\n    return state;\n  }\n\n  function setState(action) {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = action;\n    }\n  }\n\n  return [getState, setState];\n}\n"
          },
          {
            "id": "hook-core-medium",
            "title": "Multi-Hook Linked List Runner",
            "difficulty": "Medium",
            "concept": "Fiber memoizedState Linked List & Sequential Traversal",
            "description": "Implement `createHookRunner()` that supports multiple calls to `useState()` across consecutive render passes, storing them in a linked-list structure and maintaining state continuity.",
            "starterCode": "function createHookRunner() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React does not use key names for hooks! It relies 100% on execution call order to pair each hook with its corresponding slot in the linked list.",
            "testCases": [
              {
                "id": 1,
                "name": "Maintains multiple independent hook states in order",
                "input": "useState('name') and useState('age')",
                "expected": [
                  "Alice",
                  25
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); const [name] = r.useState('Alice'); const [age] = r.useState(25); return [name, age];"
              },
              {
                "id": 2,
                "name": "Preserves updated values across multiple renders",
                "input": "setState updates state on next render pass",
                "expected": [
                  "Bob",
                  26
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); const [, setName] = r.useState('Alice'); const [, setAge] = r.useState(25); setName('Bob'); setAge(prev => prev + 1); r.prepareRender(); const [name2] = r.useState(); const [age2] = r.useState(); return [name2, age2];"
              },
              {
                "id": 3,
                "name": "Handles 3 or more hooks in strict sequence",
                "input": "3 hooks preserved accurately",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const r = createHookRunner(); r.prepareRender(); r.useState(1); r.useState(2); r.useState(3); r.prepareRender(); return [r.useState()[0], r.useState()[0], r.useState()[0]];"
              }
            ],
            "solutionCode": "function createHookRunner() {\n  let firstHook = null;\n  let currentHook = null;\n  let isMount = true;\n\n  function useState(initialState) {\n    let hook;\n\n    if (isMount) {\n      hook = {\n        memoizedState: typeof initialState === 'function' ? initialState() : initialState,\n        next: null\n      };\n      if (!firstHook) {\n        firstHook = hook;\n      } else {\n        currentHook.next = hook;\n      }\n      currentHook = hook;\n    } else {\n      hook = currentHook;\n      currentHook = currentHook.next;\n    }\n\n    const setState = (action) => {\n      hook.memoizedState = typeof action === 'function' ? action(hook.memoizedState) : action;\n    };\n\n    return [hook.memoizedState, setState];\n  }\n\n  function prepareRender() {\n    isMount = firstHook === null;\n    currentHook = firstHook;\n  }\n\n  return { useState, prepareRender };\n}\n"
          },
          {
            "id": "hook-core-hard",
            "title": "Rules of Hooks Dynamic Validator",
            "difficulty": "Hard",
            "concept": "Detecting Conditional or Shuffled Hook Calls",
            "description": "Implement `validateHookSequence(mountHooks, updateHooks)` that compares the sequence of hook types called on mount vs update. If update calls fewer hooks, more hooks, or a different hook type at any index, throws an Error detailing the exact violation.",
            "starterCode": "function validateHookSequence(mountHookTypes, updateHookTypes) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact runtime error React throws: 'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.'",
            "testCases": [
              {
                "id": 1,
                "name": "Validates identical hook sequences across renders",
                "input": "['useState', 'useEffect'] -> ['useState', 'useEffect']",
                "expected": true,
                "testFn": "return validateHookSequence(['useState', 'useEffect'], ['useState', 'useEffect']).valid;"
              },
              {
                "id": 2,
                "name": "Throws error when hook count changes between renders",
                "input": "mount 3 hooks, update 2 hooks throws Error",
                "expected": true,
                "testFn": "try { validateHookSequence(['useState', 'useRef', 'useEffect'], ['useState', 'useEffect']); return false; } catch (e) { return true; }"
              },
              {
                "id": 3,
                "name": "Throws error when hook type order is transposed",
                "input": "swapped hooks throws type mismatch error",
                "expected": true,
                "testFn": "try { validateHookSequence(['useState', 'useEffect'], ['useEffect', 'useState']); return false; } catch (e) { return e.message.includes('Hook type mismatch'); }"
              }
            ],
            "solutionCode": "function validateHookSequence(mountHookTypes, updateHookTypes) {\n  if (mountHookTypes.length !== updateHookTypes.length) {\n    throw new Error(`Rendered fewer or more hooks than expected. Mounted: ${mountHookTypes.length}, Updated: ${updateHookTypes.length}`);\n  }\n\n  for (let i = 0; i < mountHookTypes.length; i++) {\n    if (mountHookTypes[i] !== updateHookTypes[i]) {\n      throw new Error(`Hook type mismatch at slot ${i}: expected ${mountHookTypes[i]}, received ${updateHookTypes[i]}`);\n    }\n  }\n\n  return { valid: true };\n}\n"
          }
        ]
      },
      {
        "id": "stale-closures-effect",
        "title": "Stale Closures & Functional State Updates",
        "tag": "Hooks Pitfalls",
        "summary": "Stale state in asynchronous callbacks, functional state updates, and useEvent RFC pattern.",
        "mentalModel": "Callbacks defined inside component bodies capture state variables as they existed during that specific render. If the callback runs later asynchronously without reading a ref or using functional update `prev => ...`, it reads stale snapshot values.",
        "traps": "Passing stale state to web socket listeners or intervals, causing updates to revert previous changes.",
        "challenges": {
          "Basic": {
            "id": "stale-effect-basic",
            "title": "Async State Updater Guard",
            "difficulty": "Basic",
            "concept": "Avoiding Stale Snapshots in Asynchronous Callbacks",
            "description": "Implement `createSafeAsyncAccumulator(initialVal)` that provides `addAsync(amount)`: it simulates an asynchronous API delay, then safely adds `amount` to the current state using a functional updater pattern.",
            "starterCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Reading `state + amount` after the await delay will drop any concurrent updates that finished while the promise was pending.",
            "testCases": [
              {
                "id": 1,
                "name": "Safely aggregates concurrent async updates without losing data",
                "input": "addAsync(10) and addAsync(20) fired concurrently",
                "expected": 30,
                "testFn": "const acc = createSafeAsyncAccumulator(0); await Promise.all([acc.addAsync(10, 20), acc.addAsync(20, 10)]); return acc.getState();"
              },
              {
                "id": 2,
                "name": "Maintains initial value",
                "input": "starts at 100",
                "expected": 100,
                "testFn": "const acc = createSafeAsyncAccumulator(100); return acc.getState();"
              },
              {
                "id": 3,
                "name": "Handles sequential updates",
                "input": "add 5 then add 10",
                "expected": 15,
                "testFn": "const acc = createSafeAsyncAccumulator(0); await acc.addAsync(5, 5); await acc.addAsync(10, 5); return acc.getState();"
              }
            ],
            "solutionCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  let state = initialVal;\n\n  function update(fn) {\n    state = fn(state);\n  }\n\n  async function addAsync(amount, delayMs = 10) {\n    await new Promise(r => setTimeout(r, delayMs));\n    update(prev => prev + amount);\n    return state;\n  }\n\n  return {\n    getState: () => state,\n    addAsync\n  };\n}\n"
          },
          "Medium": {
            "id": "stale-effect-medium",
            "title": "Implement useInterval (Dan Abramov Pattern)",
            "difficulty": "Medium",
            "concept": "Mutable Saved Callback Ref to Eliminate Interval Teardowns",
            "description": "Implement `createUseIntervalManager()` that accepts an interval callback and delay. Whenever the callback changes, update the internal saved reference WITHOUT restarting the interval timer.",
            "starterCode": "function createUseIntervalManager() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Setting `callback` in the `useEffect` dependency array restarts the interval on every render, resetting the timer tick.",
            "testCases": [
              {
                "id": 1,
                "name": "Invokes the freshest callback without restarting the timer",
                "input": "update callback mid-flight",
                "expected": "fresh-callback",
                "testFn": "const manager = createUseIntervalManager(); let calledWith = ''; manager.setCallback(() => { calledWith = 'old'; }); manager.start(20); manager.setCallback(() => { calledWith = 'fresh-callback'; }); await new Promise(r => setTimeout(r, 35)); manager.stop(); return calledWith;"
              },
              {
                "id": 2,
                "name": "stop() halts timer ticks cleanly",
                "input": "ticks stop after calling stop()",
                "expected": 1,
                "testFn": "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(15); await new Promise(r => setTimeout(r, 25)); manager.stop(); await new Promise(r => setTimeout(r, 30)); return count;"
              },
              {
                "id": 3,
                "name": "Does not start timer if delay is null",
                "input": "start(null) pauses timer",
                "expected": 0,
                "testFn": "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(null); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ],
            "solutionCode": "function createUseIntervalManager() {\n  let savedCallback = null;\n  let timerId = null;\n\n  function setCallback(fn) {\n    savedCallback = fn;\n  }\n\n  function start(delayMs) {\n    if (timerId !== null) clearInterval(timerId);\n    if (delayMs !== null && delayMs !== undefined) {\n      timerId = setInterval(() => {\n        if (savedCallback) savedCallback();\n      }, delayMs);\n    }\n  }\n\n  function stop() {\n    if (timerId !== null) {\n      clearInterval(timerId);\n      timerId = null;\n    }\n  }\n\n  return { setCallback, start, stop };\n}\n"
          },
          "Hard": {
            "id": "stale-effect-hard",
            "title": "Implement 'useEffectEvent' / useEvent Polyfill",
            "difficulty": "Hard",
            "concept": "Stable Identity Event Function with Always-Fresh Lexical Scope",
            "description": "Implement `useEffectEvent(handler)`: returns a function whose reference identity NEVER changes across renders, but when called, ALWAYS executes the latest `handler` passed on the most recent render.",
            "starterCode": "function createEffectEventManager() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Developers often wrap handlers in `useCallback(fn, [deps])`, causing child components or effects to re-run whenever dependencies change. `useEffectEvent` extracts non-reactive event logic cleanly.",
            "testCases": [
              {
                "id": 1,
                "name": "Stable function identity remains strictly identical across renders",
                "input": "stableEvent === stableEvent across renders",
                "expected": true,
                "testFn": "const manager = createEffectEventManager(); const fn1 = manager.stableEvent; manager.updateHandler(() => 1); const fn2 = manager.stableEvent; return fn1 === fn2;"
              },
              {
                "id": 2,
                "name": "Executes the newest handler reading fresh props",
                "input": "handler updated with new prop value",
                "expected": "Theme: dark",
                "testFn": "const manager = createEffectEventManager(); manager.updateHandler((msg) => `${msg}: light`); manager.updateHandler((msg) => `${msg}: dark`); return manager.stableEvent('Theme');"
              },
              {
                "id": 3,
                "name": "Passes all parameters and returns output correctly",
                "input": "stableEvent(10, 20)",
                "expected": 30,
                "testFn": "const manager = createEffectEventManager(); manager.updateHandler((a, b) => a + b); return manager.stableEvent(10, 20);"
              }
            ],
            "solutionCode": "function createEffectEventManager() {\n  let latestHandler = null;\n\n  function updateHandler(handler) {\n    latestHandler = handler;\n  }\n\n  // Stable function reference that delegates to latestHandler\n  const stableEvent = function(...args) {\n    if (typeof latestHandler !== 'function') {\n      throw new Error('Cannot call useEffectEvent when no handler is attached');\n    }\n    return latestHandler(...args);\n  };\n\n  return { updateHandler, stableEvent };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "stale-effect-basic",
          "title": "Async State Updater Guard",
          "difficulty": "Basic",
          "concept": "Avoiding Stale Snapshots in Asynchronous Callbacks",
          "description": "Implement `createSafeAsyncAccumulator(initialVal)` that provides `addAsync(amount)`: it simulates an asynchronous API delay, then safely adds `amount` to the current state using a functional updater pattern.",
          "starterCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Reading `state + amount` after the await delay will drop any concurrent updates that finished while the promise was pending.",
          "testCases": [
            {
              "id": 1,
              "name": "Safely aggregates concurrent async updates without losing data",
              "input": "addAsync(10) and addAsync(20) fired concurrently",
              "expected": 30,
              "testFn": "const acc = createSafeAsyncAccumulator(0); await Promise.all([acc.addAsync(10, 20), acc.addAsync(20, 10)]); return acc.getState();"
            },
            {
              "id": 2,
              "name": "Maintains initial value",
              "input": "starts at 100",
              "expected": 100,
              "testFn": "const acc = createSafeAsyncAccumulator(100); return acc.getState();"
            },
            {
              "id": 3,
              "name": "Handles sequential updates",
              "input": "add 5 then add 10",
              "expected": 15,
              "testFn": "const acc = createSafeAsyncAccumulator(0); await acc.addAsync(5, 5); await acc.addAsync(10, 5); return acc.getState();"
            }
          ],
          "solutionCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  let state = initialVal;\n\n  function update(fn) {\n    state = fn(state);\n  }\n\n  async function addAsync(amount, delayMs = 10) {\n    await new Promise(r => setTimeout(r, delayMs));\n    update(prev => prev + amount);\n    return state;\n  }\n\n  return {\n    getState: () => state,\n    addAsync\n  };\n}\n"
        },
        "questions": [
          {
            "id": "stale-effect-basic",
            "title": "Async State Updater Guard",
            "difficulty": "Basic",
            "concept": "Avoiding Stale Snapshots in Asynchronous Callbacks",
            "description": "Implement `createSafeAsyncAccumulator(initialVal)` that provides `addAsync(amount)`: it simulates an asynchronous API delay, then safely adds `amount` to the current state using a functional updater pattern.",
            "starterCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Reading `state + amount` after the await delay will drop any concurrent updates that finished while the promise was pending.",
            "testCases": [
              {
                "id": 1,
                "name": "Safely aggregates concurrent async updates without losing data",
                "input": "addAsync(10) and addAsync(20) fired concurrently",
                "expected": 30,
                "testFn": "const acc = createSafeAsyncAccumulator(0); await Promise.all([acc.addAsync(10, 20), acc.addAsync(20, 10)]); return acc.getState();"
              },
              {
                "id": 2,
                "name": "Maintains initial value",
                "input": "starts at 100",
                "expected": 100,
                "testFn": "const acc = createSafeAsyncAccumulator(100); return acc.getState();"
              },
              {
                "id": 3,
                "name": "Handles sequential updates",
                "input": "add 5 then add 10",
                "expected": 15,
                "testFn": "const acc = createSafeAsyncAccumulator(0); await acc.addAsync(5, 5); await acc.addAsync(10, 5); return acc.getState();"
              }
            ],
            "solutionCode": "function createSafeAsyncAccumulator(initialVal = 0) {\n  let state = initialVal;\n\n  function update(fn) {\n    state = fn(state);\n  }\n\n  async function addAsync(amount, delayMs = 10) {\n    await new Promise(r => setTimeout(r, delayMs));\n    update(prev => prev + amount);\n    return state;\n  }\n\n  return {\n    getState: () => state,\n    addAsync\n  };\n}\n"
          },
          {
            "id": "stale-effect-medium",
            "title": "Implement useInterval (Dan Abramov Pattern)",
            "difficulty": "Medium",
            "concept": "Mutable Saved Callback Ref to Eliminate Interval Teardowns",
            "description": "Implement `createUseIntervalManager()` that accepts an interval callback and delay. Whenever the callback changes, update the internal saved reference WITHOUT restarting the interval timer.",
            "starterCode": "function createUseIntervalManager() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Setting `callback` in the `useEffect` dependency array restarts the interval on every render, resetting the timer tick.",
            "testCases": [
              {
                "id": 1,
                "name": "Invokes the freshest callback without restarting the timer",
                "input": "update callback mid-flight",
                "expected": "fresh-callback",
                "testFn": "const manager = createUseIntervalManager(); let calledWith = ''; manager.setCallback(() => { calledWith = 'old'; }); manager.start(20); manager.setCallback(() => { calledWith = 'fresh-callback'; }); await new Promise(r => setTimeout(r, 35)); manager.stop(); return calledWith;"
              },
              {
                "id": 2,
                "name": "stop() halts timer ticks cleanly",
                "input": "ticks stop after calling stop()",
                "expected": 1,
                "testFn": "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(15); await new Promise(r => setTimeout(r, 25)); manager.stop(); await new Promise(r => setTimeout(r, 30)); return count;"
              },
              {
                "id": 3,
                "name": "Does not start timer if delay is null",
                "input": "start(null) pauses timer",
                "expected": 0,
                "testFn": "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(null); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ],
            "solutionCode": "function createUseIntervalManager() {\n  let savedCallback = null;\n  let timerId = null;\n\n  function setCallback(fn) {\n    savedCallback = fn;\n  }\n\n  function start(delayMs) {\n    if (timerId !== null) clearInterval(timerId);\n    if (delayMs !== null && delayMs !== undefined) {\n      timerId = setInterval(() => {\n        if (savedCallback) savedCallback();\n      }, delayMs);\n    }\n  }\n\n  function stop() {\n    if (timerId !== null) {\n      clearInterval(timerId);\n      timerId = null;\n    }\n  }\n\n  return { setCallback, start, stop };\n}\n"
          },
          {
            "id": "stale-effect-hard",
            "title": "Implement 'useEffectEvent' / useEvent Polyfill",
            "difficulty": "Hard",
            "concept": "Stable Identity Event Function with Always-Fresh Lexical Scope",
            "description": "Implement `useEffectEvent(handler)`: returns a function whose reference identity NEVER changes across renders, but when called, ALWAYS executes the latest `handler` passed on the most recent render.",
            "starterCode": "function createEffectEventManager() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Developers often wrap handlers in `useCallback(fn, [deps])`, causing child components or effects to re-run whenever dependencies change. `useEffectEvent` extracts non-reactive event logic cleanly.",
            "testCases": [
              {
                "id": 1,
                "name": "Stable function identity remains strictly identical across renders",
                "input": "stableEvent === stableEvent across renders",
                "expected": true,
                "testFn": "const manager = createEffectEventManager(); const fn1 = manager.stableEvent; manager.updateHandler(() => 1); const fn2 = manager.stableEvent; return fn1 === fn2;"
              },
              {
                "id": 2,
                "name": "Executes the newest handler reading fresh props",
                "input": "handler updated with new prop value",
                "expected": "Theme: dark",
                "testFn": "const manager = createEffectEventManager(); manager.updateHandler((msg) => `${msg}: light`); manager.updateHandler((msg) => `${msg}: dark`); return manager.stableEvent('Theme');"
              },
              {
                "id": 3,
                "name": "Passes all parameters and returns output correctly",
                "input": "stableEvent(10, 20)",
                "expected": 30,
                "testFn": "const manager = createEffectEventManager(); manager.updateHandler((a, b) => a + b); return manager.stableEvent(10, 20);"
              }
            ],
            "solutionCode": "function createEffectEventManager() {\n  let latestHandler = null;\n\n  function updateHandler(handler) {\n    latestHandler = handler;\n  }\n\n  // Stable function reference that delegates to latestHandler\n  const stableEvent = function(...args) {\n    if (typeof latestHandler !== 'function') {\n      throw new Error('Cannot call useEffectEvent when no handler is attached');\n    }\n    return latestHandler(...args);\n  };\n\n  return { updateHandler, stableEvent };\n}\n"
          }
        ]
      },
      {
        "id": "effect-timings",
        "title": "useEffect vs useLayoutEffect vs useInsertionEffect",
        "tag": "Lifecycle",
        "summary": "Paint blocking vs asynchronous passive effects, CSS-in-JS injection, and layout measurement.",
        "mentalModel": "`useInsertionEffect` fires synchronously BEFORE DOM mutations (for CSS-in-JS injection). `useLayoutEffect` fires synchronously AFTER DOM mutations but BEFORE browser paint (for measurements). `useEffect` fires asynchronously AFTER the browser has painted pixels to screen.",
        "traps": "Causing screen flickering by measuring DOM and setting state inside `useEffect` (requires `useLayoutEffect`).",
        "challenges": {
          "Basic": {
            "id": "effect-timings-basic",
            "title": "Effect Phase Order Logger",
            "difficulty": "Basic",
            "concept": "Hook Lifecycle Timing Sequence",
            "description": "Implement `logLifecyclePhases()` that returns an array with the exact execution order of: `'useInsertionEffect'`, `'DOM Mutation'`, `'useLayoutEffect'`, `'Browser Paint'`, and `'useEffect'`.",
            "starterCode": "function logLifecyclePhases() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useEffect` is passive and deferred until after paint. `useLayoutEffect` blocks painting.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns correct lifecycle sequence",
                "input": "logLifecyclePhases()",
                "expected": [
                  "useInsertionEffect",
                  "DOM Mutation",
                  "useLayoutEffect",
                  "Browser Paint",
                  "useEffect"
                ],
                "testFn": "return logLifecyclePhases();"
              },
              {
                "id": 2,
                "name": "useLayoutEffect runs before Browser Paint",
                "input": "layout effect precedes paint",
                "expected": true,
                "testFn": "const p = logLifecyclePhases(); return p.indexOf('useLayoutEffect') < p.indexOf('Browser Paint');"
              },
              {
                "id": 3,
                "name": "useEffect runs strictly after Browser Paint",
                "input": "useEffect follows paint",
                "expected": true,
                "testFn": "const p = logLifecyclePhases(); return p.indexOf('useEffect') > p.indexOf('Browser Paint');"
              }
            ],
            "solutionCode": "function logLifecyclePhases() {\n  return [\n    'useInsertionEffect',\n    'DOM Mutation',\n    'useLayoutEffect',\n    'Browser Paint',\n    'useEffect'\n  ];\n}\n"
          },
          "Medium": {
            "id": "effect-timings-medium",
            "title": "Simulate Synchronous Layout Measure Hook",
            "difficulty": "Medium",
            "concept": "useLayoutEffect DOM Mutation & Measurement Synchronization",
            "description": "Implement `measureElementSynchronously(element, measureFn)` that executes `measureFn(element)` synchronously immediately after element attributes are written, guaranteeing that measurements occur before paint without flicker.",
            "starterCode": "function measureElementSynchronously(element, measureFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Measuring in `useEffect` causes a visible flicker: the user sees the unstyled/unmeasured element for one frame before it repositions.",
            "testCases": [
              {
                "id": 1,
                "name": "Synchronously measures element geometry",
                "input": "measures width and height",
                "expected": {
                  "width": 100,
                  "height": 50
                },
                "testFn": "const el = document.createElement('div'); return measureElementSynchronously(el, r => ({ width: r.width, height: r.height }));"
              },
              {
                "id": 2,
                "name": "Computes derived layout position immediately",
                "input": "calculates center coordinate",
                "expected": 50,
                "testFn": "const el = document.createElement('div'); return measureElementSynchronously(el, r => r.width / 2);"
              },
              {
                "id": 3,
                "name": "Returns synchronously without promises or timeouts",
                "input": "synchronous execution return",
                "expected": true,
                "testFn": "let measured = false; const el = document.createElement('div'); measureElementSynchronously(el, () => { measured = true; }); return measured;"
              }
            ],
            "solutionCode": "function measureElementSynchronously(element, measureFn) {\n  // Synchronous layout step: DOM is mutated, immediately measure geometry\n  const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 100, height: 50 };\n  return measureFn(rect);\n}\n"
          },
          "Hard": {
            "id": "effect-timings-hard",
            "title": "Dual Queue Effect Scheduler (Layout Sync vs Passive Async)",
            "difficulty": "Hard",
            "concept": "Scheduler Separation of Layout and Passive Effect Queues",
            "description": "Implement `createEffectScheduler()` that maintains two effect queues: `layoutQueue` (executed synchronously during commit) and `passiveQueue` (executed asynchronously after a tick). Returns an object with `scheduleLayout(fn)`, `schedulePassive(fn)`, `flushLayout()`, and `flushPassive()`.",
            "starterCode": "function createEffectScheduler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If layout effects throw errors, the commit fails synchronously. If passive effects throw errors, they are surfaced in the next turn of the event loop.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes layout effects synchronously before passive effects",
                "input": "layout effects run first",
                "expected": [
                  "layout",
                  "passive"
                ],
                "testFn": "const s = createEffectScheduler(); const log = []; s.schedulePassive(() => log.push('passive')); s.scheduleLayout(() => log.push('layout')); s.flushLayout(); await s.flushPassive(); return log;"
              },
              {
                "id": 2,
                "name": "flushLayout clears all pending layout items",
                "input": "layout queue is drained",
                "expected": [
                  1,
                  2
                ],
                "testFn": "const s = createEffectScheduler(); s.scheduleLayout(() => 1); s.scheduleLayout(() => 2); return s.flushLayout();"
              },
              {
                "id": 3,
                "name": "flushPassive runs asynchronously after tick",
                "input": "passive flush resolves with executed values",
                "expected": [
                  "async-done"
                ],
                "testFn": "const s = createEffectScheduler(); s.schedulePassive(() => 'async-done'); return await s.flushPassive();"
              }
            ],
            "solutionCode": "function createEffectScheduler() {\n  const layoutQueue = [];\n  const passiveQueue = [];\n\n  return {\n    scheduleLayout(fn) {\n      layoutQueue.push(fn);\n    },\n    schedulePassive(fn) {\n      passiveQueue.push(fn);\n    },\n    flushLayout() {\n      const executed = [];\n      while (layoutQueue.length > 0) {\n        const fn = layoutQueue.shift();\n        executed.push(fn());\n      }\n      return executed;\n    },\n    async flushPassive() {\n      // Yield to macrotask/microtask to simulate post-paint delivery\n      await new Promise(r => setTimeout(r, 0));\n      const executed = [];\n      while (passiveQueue.length > 0) {\n        const fn = passiveQueue.shift();\n        executed.push(fn());\n      }\n      return executed;\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "effect-timings-basic",
          "title": "Effect Phase Order Logger",
          "difficulty": "Basic",
          "concept": "Hook Lifecycle Timing Sequence",
          "description": "Implement `logLifecyclePhases()` that returns an array with the exact execution order of: `'useInsertionEffect'`, `'DOM Mutation'`, `'useLayoutEffect'`, `'Browser Paint'`, and `'useEffect'`.",
          "starterCode": "function logLifecyclePhases() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "`useEffect` is passive and deferred until after paint. `useLayoutEffect` blocks painting.",
          "testCases": [
            {
              "id": 1,
              "name": "Returns correct lifecycle sequence",
              "input": "logLifecyclePhases()",
              "expected": [
                "useInsertionEffect",
                "DOM Mutation",
                "useLayoutEffect",
                "Browser Paint",
                "useEffect"
              ],
              "testFn": "return logLifecyclePhases();"
            },
            {
              "id": 2,
              "name": "useLayoutEffect runs before Browser Paint",
              "input": "layout effect precedes paint",
              "expected": true,
              "testFn": "const p = logLifecyclePhases(); return p.indexOf('useLayoutEffect') < p.indexOf('Browser Paint');"
            },
            {
              "id": 3,
              "name": "useEffect runs strictly after Browser Paint",
              "input": "useEffect follows paint",
              "expected": true,
              "testFn": "const p = logLifecyclePhases(); return p.indexOf('useEffect') > p.indexOf('Browser Paint');"
            }
          ],
          "solutionCode": "function logLifecyclePhases() {\n  return [\n    'useInsertionEffect',\n    'DOM Mutation',\n    'useLayoutEffect',\n    'Browser Paint',\n    'useEffect'\n  ];\n}\n"
        },
        "questions": [
          {
            "id": "effect-timings-basic",
            "title": "Effect Phase Order Logger",
            "difficulty": "Basic",
            "concept": "Hook Lifecycle Timing Sequence",
            "description": "Implement `logLifecyclePhases()` that returns an array with the exact execution order of: `'useInsertionEffect'`, `'DOM Mutation'`, `'useLayoutEffect'`, `'Browser Paint'`, and `'useEffect'`.",
            "starterCode": "function logLifecyclePhases() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useEffect` is passive and deferred until after paint. `useLayoutEffect` blocks painting.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns correct lifecycle sequence",
                "input": "logLifecyclePhases()",
                "expected": [
                  "useInsertionEffect",
                  "DOM Mutation",
                  "useLayoutEffect",
                  "Browser Paint",
                  "useEffect"
                ],
                "testFn": "return logLifecyclePhases();"
              },
              {
                "id": 2,
                "name": "useLayoutEffect runs before Browser Paint",
                "input": "layout effect precedes paint",
                "expected": true,
                "testFn": "const p = logLifecyclePhases(); return p.indexOf('useLayoutEffect') < p.indexOf('Browser Paint');"
              },
              {
                "id": 3,
                "name": "useEffect runs strictly after Browser Paint",
                "input": "useEffect follows paint",
                "expected": true,
                "testFn": "const p = logLifecyclePhases(); return p.indexOf('useEffect') > p.indexOf('Browser Paint');"
              }
            ],
            "solutionCode": "function logLifecyclePhases() {\n  return [\n    'useInsertionEffect',\n    'DOM Mutation',\n    'useLayoutEffect',\n    'Browser Paint',\n    'useEffect'\n  ];\n}\n"
          },
          {
            "id": "effect-timings-medium",
            "title": "Simulate Synchronous Layout Measure Hook",
            "difficulty": "Medium",
            "concept": "useLayoutEffect DOM Mutation & Measurement Synchronization",
            "description": "Implement `measureElementSynchronously(element, measureFn)` that executes `measureFn(element)` synchronously immediately after element attributes are written, guaranteeing that measurements occur before paint without flicker.",
            "starterCode": "function measureElementSynchronously(element, measureFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Measuring in `useEffect` causes a visible flicker: the user sees the unstyled/unmeasured element for one frame before it repositions.",
            "testCases": [
              {
                "id": 1,
                "name": "Synchronously measures element geometry",
                "input": "measures width and height",
                "expected": {
                  "width": 100,
                  "height": 50
                },
                "testFn": "const el = document.createElement('div'); return measureElementSynchronously(el, r => ({ width: r.width, height: r.height }));"
              },
              {
                "id": 2,
                "name": "Computes derived layout position immediately",
                "input": "calculates center coordinate",
                "expected": 50,
                "testFn": "const el = document.createElement('div'); return measureElementSynchronously(el, r => r.width / 2);"
              },
              {
                "id": 3,
                "name": "Returns synchronously without promises or timeouts",
                "input": "synchronous execution return",
                "expected": true,
                "testFn": "let measured = false; const el = document.createElement('div'); measureElementSynchronously(el, () => { measured = true; }); return measured;"
              }
            ],
            "solutionCode": "function measureElementSynchronously(element, measureFn) {\n  // Synchronous layout step: DOM is mutated, immediately measure geometry\n  const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 100, height: 50 };\n  return measureFn(rect);\n}\n"
          },
          {
            "id": "effect-timings-hard",
            "title": "Dual Queue Effect Scheduler (Layout Sync vs Passive Async)",
            "difficulty": "Hard",
            "concept": "Scheduler Separation of Layout and Passive Effect Queues",
            "description": "Implement `createEffectScheduler()` that maintains two effect queues: `layoutQueue` (executed synchronously during commit) and `passiveQueue` (executed asynchronously after a tick). Returns an object with `scheduleLayout(fn)`, `schedulePassive(fn)`, `flushLayout()`, and `flushPassive()`.",
            "starterCode": "function createEffectScheduler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If layout effects throw errors, the commit fails synchronously. If passive effects throw errors, they are surfaced in the next turn of the event loop.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes layout effects synchronously before passive effects",
                "input": "layout effects run first",
                "expected": [
                  "layout",
                  "passive"
                ],
                "testFn": "const s = createEffectScheduler(); const log = []; s.schedulePassive(() => log.push('passive')); s.scheduleLayout(() => log.push('layout')); s.flushLayout(); await s.flushPassive(); return log;"
              },
              {
                "id": 2,
                "name": "flushLayout clears all pending layout items",
                "input": "layout queue is drained",
                "expected": [
                  1,
                  2
                ],
                "testFn": "const s = createEffectScheduler(); s.scheduleLayout(() => 1); s.scheduleLayout(() => 2); return s.flushLayout();"
              },
              {
                "id": 3,
                "name": "flushPassive runs asynchronously after tick",
                "input": "passive flush resolves with executed values",
                "expected": [
                  "async-done"
                ],
                "testFn": "const s = createEffectScheduler(); s.schedulePassive(() => 'async-done'); return await s.flushPassive();"
              }
            ],
            "solutionCode": "function createEffectScheduler() {\n  const layoutQueue = [];\n  const passiveQueue = [];\n\n  return {\n    scheduleLayout(fn) {\n      layoutQueue.push(fn);\n    },\n    schedulePassive(fn) {\n      passiveQueue.push(fn);\n    },\n    flushLayout() {\n      const executed = [];\n      while (layoutQueue.length > 0) {\n        const fn = layoutQueue.shift();\n        executed.push(fn());\n      }\n      return executed;\n    },\n    async flushPassive() {\n      // Yield to macrotask/microtask to simulate post-paint delivery\n      await new Promise(r => setTimeout(r, 0));\n      const executed = [];\n      while (passiveQueue.length > 0) {\n        const fn = passiveQueue.shift();\n        executed.push(fn());\n      }\n      return executed;\n    }\n  };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "react-rerenders-performance",
    "category": "3. Re-render Cascades & Performance",
    "badge": "Optimization",
    "description": "Re-render cascades, memoization pitfalls, context churn, and composition over memo.",
    "topics": [
      {
        "id": "rerender-triggers-memo",
        "title": "Re-render Triggers & 'React.memo' Mechanics",
        "tag": "Performance",
        "summary": "Default re-render cascade, shallow prop comparison, and breaking memoization with inline callbacks.",
        "mentalModel": "Whenever a parent component re-renders, React re-renders every child component down the tree by default. `React.memo` stops this descent by checking if all props are identical using `Object.is`. Passing a new object or inline function reference `() => {}` forces re-rendering.",
        "traps": "Wrapping a component in `React.memo` but passing inline objects `<Child config={{ mode: 'dark' }} />`.",
        "challenges": {
          "Basic": {
            "id": "memo-basic",
            "title": "Detect Broken Memoization from Inline References",
            "difficulty": "Basic",
            "concept": "Reference Identity Drift in Inline Props",
            "description": "Implement `isMemoBypassed(oldProps, newProps)` that checks whether any object or function prop changed reference identity even if its serialized value looks identical.",
            "starterCode": "function isMemoBypassed(oldProps, newProps) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often say 'React deep compares props'. React NEVER deep compares props by default; it does a shallow `===` on each prop.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects new inline object reference breaking memo",
                "input": "{ style: {} } vs { style: {} }",
                "expected": true,
                "testFn": "return isMemoBypassed({ style: { color: 'red' } }, { style: { color: 'red' } });"
              },
              {
                "id": 2,
                "name": "Detects new inline callback reference breaking memo",
                "input": "onClick: () => {} recreated on every render",
                "expected": true,
                "testFn": "return isMemoBypassed({ onClick: () => 1 }, { onClick: () => 1 });"
              },
              {
                "id": 3,
                "name": "Passes when stable references are reused",
                "input": "shared stable object reference",
                "expected": false,
                "testFn": "const shared = { theme: 'dark' }; return isMemoBypassed({ conf: shared }, { conf: shared });"
              }
            ],
            "solutionCode": "function isMemoBypassed(oldProps, newProps) {\n  for (const key of Object.keys(oldProps)) {\n    const oldVal = oldProps[key];\n    const newVal = newProps[key];\n    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {\n      if (oldVal !== newVal) {\n        return true; // Reference identity changed! Memo is bypassed\n      }\n    }\n    if (typeof oldVal === 'function' && typeof newVal === 'function') {\n      if (oldVal !== newVal) {\n        return true;\n      }\n    }\n  }\n  return false;\n}\n"
          },
          "Medium": {
            "id": "memo-medium",
            "title": "Implement Custom useMemo & useCallback Engine",
            "difficulty": "Medium",
            "concept": "Hook-Level Memoization via Dependency Caching",
            "description": "Implement `createMemoEngine()` providing `useMemo(factory, deps)` and `useCallback(fn, deps)`. Only re-evaluates `factory` or returns a new function when `deps` change according to `Object.is`.",
            "starterCode": "function createMemoEngine() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useCallback(fn, deps)` is literally just syntactic sugar for `useMemo(() => fn, deps)`.",
            "testCases": [
              {
                "id": 1,
                "name": "useMemo caches computation when deps do not change",
                "input": "factory called once across multiple renders with same deps",
                "expected": 1,
                "testFn": "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 42; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [1]); return calls;"
              },
              {
                "id": 2,
                "name": "useMemo recomputes when deps change",
                "input": "dep changes from 1 to 2",
                "expected": 2,
                "testFn": "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 100; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [2]); return calls;"
              },
              {
                "id": 3,
                "name": "useCallback preserves function reference when deps match",
                "input": "stable callback identity",
                "expected": true,
                "testFn": "const engine = createMemoEngine(); const cb1 = engine.useCallback(() => 1, ['id']); const cb2 = engine.useCallback(() => 1, ['id']); return cb1 === cb2;"
              }
            ],
            "solutionCode": "function createMemoEngine() {\n  let memoSlot = null;\n  let callbackSlot = null;\n\n  function useMemo(factory, deps) {\n    if (memoSlot && deps && memoSlot.deps.every((d, i) => Object.is(d, deps[i]))) {\n      return memoSlot.value;\n    }\n    const value = factory();\n    memoSlot = { value, deps };\n    return value;\n  }\n\n  function useCallback(callback, deps) {\n    return useMemo(() => callback, deps);\n  }\n\n  return { useMemo, useCallback };\n}\n"
          },
          "Hard": {
            "id": "memo-hard",
            "title": "Reselect-Style Memoized Selector with Multi-Input Caching",
            "difficulty": "Hard",
            "concept": "Memoized Reselect Selector Architecture",
            "description": "Implement `createSelector(...inputSelectors, resultFn)` that only re-computes `resultFn` when the output of any input selector changes, returning the cached result otherwise.",
            "starterCode": "function createSelector(...args) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Recalculating expensive derivations (filtering, sorting) inside components triggers massive lag. Memoized selectors guarantee constant time lookups on re-renders.",
            "testCases": [
              {
                "id": 1,
                "name": "Computes output from input selectors",
                "input": "select sum of numbers",
                "expected": 30,
                "testFn": "const selectA = s => s.a; const selectB = s => s.b; const selectSum = createSelector(selectA, selectB, (a, b) => a + b); return selectSum({ a: 10, b: 20 });"
              },
              {
                "id": 2,
                "name": "Skips execution of resultFn when inputs are identical",
                "input": "calls resultFn once for identical inputs",
                "expected": 1,
                "testFn": "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 5 }); return calls;"
              },
              {
                "id": 3,
                "name": "Recomputes when selected state slice changes",
                "input": "recomputes on state change",
                "expected": 2,
                "testFn": "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 6 }); return calls;"
              }
            ],
            "solutionCode": "function createSelector(...args) {\n  const resultFn = args.pop();\n  const inputSelectors = args;\n\n  let lastInputs = null;\n  let lastResult = null;\n\n  return function(state) {\n    const currentInputs = inputSelectors.map(sel => sel(state));\n\n    if (lastInputs && currentInputs.every((val, i) => Object.is(val, lastInputs[i]))) {\n      return lastResult;\n    }\n\n    lastResult = resultFn(...currentInputs);\n    lastInputs = currentInputs;\n    return lastResult;\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "memo-basic",
          "title": "Detect Broken Memoization from Inline References",
          "difficulty": "Basic",
          "concept": "Reference Identity Drift in Inline Props",
          "description": "Implement `isMemoBypassed(oldProps, newProps)` that checks whether any object or function prop changed reference identity even if its serialized value looks identical.",
          "starterCode": "function isMemoBypassed(oldProps, newProps) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Candidates often say 'React deep compares props'. React NEVER deep compares props by default; it does a shallow `===` on each prop.",
          "testCases": [
            {
              "id": 1,
              "name": "Detects new inline object reference breaking memo",
              "input": "{ style: {} } vs { style: {} }",
              "expected": true,
              "testFn": "return isMemoBypassed({ style: { color: 'red' } }, { style: { color: 'red' } });"
            },
            {
              "id": 2,
              "name": "Detects new inline callback reference breaking memo",
              "input": "onClick: () => {} recreated on every render",
              "expected": true,
              "testFn": "return isMemoBypassed({ onClick: () => 1 }, { onClick: () => 1 });"
            },
            {
              "id": 3,
              "name": "Passes when stable references are reused",
              "input": "shared stable object reference",
              "expected": false,
              "testFn": "const shared = { theme: 'dark' }; return isMemoBypassed({ conf: shared }, { conf: shared });"
            }
          ],
          "solutionCode": "function isMemoBypassed(oldProps, newProps) {\n  for (const key of Object.keys(oldProps)) {\n    const oldVal = oldProps[key];\n    const newVal = newProps[key];\n    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {\n      if (oldVal !== newVal) {\n        return true; // Reference identity changed! Memo is bypassed\n      }\n    }\n    if (typeof oldVal === 'function' && typeof newVal === 'function') {\n      if (oldVal !== newVal) {\n        return true;\n      }\n    }\n  }\n  return false;\n}\n"
        },
        "questions": [
          {
            "id": "memo-basic",
            "title": "Detect Broken Memoization from Inline References",
            "difficulty": "Basic",
            "concept": "Reference Identity Drift in Inline Props",
            "description": "Implement `isMemoBypassed(oldProps, newProps)` that checks whether any object or function prop changed reference identity even if its serialized value looks identical.",
            "starterCode": "function isMemoBypassed(oldProps, newProps) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often say 'React deep compares props'. React NEVER deep compares props by default; it does a shallow `===` on each prop.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects new inline object reference breaking memo",
                "input": "{ style: {} } vs { style: {} }",
                "expected": true,
                "testFn": "return isMemoBypassed({ style: { color: 'red' } }, { style: { color: 'red' } });"
              },
              {
                "id": 2,
                "name": "Detects new inline callback reference breaking memo",
                "input": "onClick: () => {} recreated on every render",
                "expected": true,
                "testFn": "return isMemoBypassed({ onClick: () => 1 }, { onClick: () => 1 });"
              },
              {
                "id": 3,
                "name": "Passes when stable references are reused",
                "input": "shared stable object reference",
                "expected": false,
                "testFn": "const shared = { theme: 'dark' }; return isMemoBypassed({ conf: shared }, { conf: shared });"
              }
            ],
            "solutionCode": "function isMemoBypassed(oldProps, newProps) {\n  for (const key of Object.keys(oldProps)) {\n    const oldVal = oldProps[key];\n    const newVal = newProps[key];\n    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {\n      if (oldVal !== newVal) {\n        return true; // Reference identity changed! Memo is bypassed\n      }\n    }\n    if (typeof oldVal === 'function' && typeof newVal === 'function') {\n      if (oldVal !== newVal) {\n        return true;\n      }\n    }\n  }\n  return false;\n}\n"
          },
          {
            "id": "memo-medium",
            "title": "Implement Custom useMemo & useCallback Engine",
            "difficulty": "Medium",
            "concept": "Hook-Level Memoization via Dependency Caching",
            "description": "Implement `createMemoEngine()` providing `useMemo(factory, deps)` and `useCallback(fn, deps)`. Only re-evaluates `factory` or returns a new function when `deps` change according to `Object.is`.",
            "starterCode": "function createMemoEngine() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useCallback(fn, deps)` is literally just syntactic sugar for `useMemo(() => fn, deps)`.",
            "testCases": [
              {
                "id": 1,
                "name": "useMemo caches computation when deps do not change",
                "input": "factory called once across multiple renders with same deps",
                "expected": 1,
                "testFn": "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 42; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [1]); return calls;"
              },
              {
                "id": 2,
                "name": "useMemo recomputes when deps change",
                "input": "dep changes from 1 to 2",
                "expected": 2,
                "testFn": "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 100; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [2]); return calls;"
              },
              {
                "id": 3,
                "name": "useCallback preserves function reference when deps match",
                "input": "stable callback identity",
                "expected": true,
                "testFn": "const engine = createMemoEngine(); const cb1 = engine.useCallback(() => 1, ['id']); const cb2 = engine.useCallback(() => 1, ['id']); return cb1 === cb2;"
              }
            ],
            "solutionCode": "function createMemoEngine() {\n  let memoSlot = null;\n  let callbackSlot = null;\n\n  function useMemo(factory, deps) {\n    if (memoSlot && deps && memoSlot.deps.every((d, i) => Object.is(d, deps[i]))) {\n      return memoSlot.value;\n    }\n    const value = factory();\n    memoSlot = { value, deps };\n    return value;\n  }\n\n  function useCallback(callback, deps) {\n    return useMemo(() => callback, deps);\n  }\n\n  return { useMemo, useCallback };\n}\n"
          },
          {
            "id": "memo-hard",
            "title": "Reselect-Style Memoized Selector with Multi-Input Caching",
            "difficulty": "Hard",
            "concept": "Memoized Reselect Selector Architecture",
            "description": "Implement `createSelector(...inputSelectors, resultFn)` that only re-computes `resultFn` when the output of any input selector changes, returning the cached result otherwise.",
            "starterCode": "function createSelector(...args) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Recalculating expensive derivations (filtering, sorting) inside components triggers massive lag. Memoized selectors guarantee constant time lookups on re-renders.",
            "testCases": [
              {
                "id": 1,
                "name": "Computes output from input selectors",
                "input": "select sum of numbers",
                "expected": 30,
                "testFn": "const selectA = s => s.a; const selectB = s => s.b; const selectSum = createSelector(selectA, selectB, (a, b) => a + b); return selectSum({ a: 10, b: 20 });"
              },
              {
                "id": 2,
                "name": "Skips execution of resultFn when inputs are identical",
                "input": "calls resultFn once for identical inputs",
                "expected": 1,
                "testFn": "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 5 }); return calls;"
              },
              {
                "id": 3,
                "name": "Recomputes when selected state slice changes",
                "input": "recomputes on state change",
                "expected": 2,
                "testFn": "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 6 }); return calls;"
              }
            ],
            "solutionCode": "function createSelector(...args) {\n  const resultFn = args.pop();\n  const inputSelectors = args;\n\n  let lastInputs = null;\n  let lastResult = null;\n\n  return function(state) {\n    const currentInputs = inputSelectors.map(sel => sel(state));\n\n    if (lastInputs && currentInputs.every((val, i) => Object.is(val, lastInputs[i]))) {\n      return lastResult;\n    }\n\n    lastResult = resultFn(...currentInputs);\n    lastInputs = currentInputs;\n    return lastResult;\n  };\n}\n"
          }
        ]
      },
      {
        "id": "context-churn",
        "title": "Context Churn & Split Context Architecture",
        "tag": "Context Architecture",
        "summary": "Context value object identity, re-render cascades across all consumers, splitting state and dispatch.",
        "mentalModel": "When a Context Provider's `value` prop changes identity, EVERY component that calls `useContext(MyContext)` MUST re-render, bypassing any `React.memo` or `shouldComponentUpdate` checks. Splitting into separate `StateContext` and `DispatchContext` prevents dispatch consumers from re-rendering on state changes.",
        "traps": "Passing `{ state, dispatch }` directly into `<Context.Provider value={{ state, dispatch }}>` recreates the object on every render, triggering full app churn.",
        "challenges": {
          "Basic": {
            "id": "context-basic",
            "title": "Split Context Provider Simulator",
            "difficulty": "Basic",
            "concept": "Separating State from Dispatch in React Context",
            "description": "Implement `createSplitContext(initialState)` that creates distinct state and dispatch channels, allowing dispatch functions to maintain stable identity forever.",
            "starterCode": "function createSplitContext(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Components that only need `dispatch` (like buttons) should NEVER re-render when state changes. Splitting context achieves this.",
            "testCases": [
              {
                "id": 1,
                "name": "Dispatch function has strictly stable reference identity",
                "input": "getDispatch() === getDispatch() across calls",
                "expected": true,
                "testFn": "const ctx = createSplitContext({ count: 0 }); return ctx.getDispatch() === ctx.getDispatch();"
              },
              {
                "id": 2,
                "name": "Dispatching updates state listeners",
                "input": "dispatch updates count to 1",
                "expected": 1,
                "testFn": "const ctx = createSplitContext({ count: 0 }); let updated = 0; ctx.subscribeState(s => { updated = s.count; }); ctx.getDispatch()({ count: 1 }); return updated;"
              },
              {
                "id": 3,
                "name": "Supports functional action updates",
                "input": "dispatch(prev => ({ count: prev.count + 5 }))",
                "expected": 15,
                "testFn": "const ctx = createSplitContext({ count: 10 }); ctx.getDispatch()(prev => ({ count: prev.count + 5 })); return ctx.getState().count;"
              }
            ],
            "solutionCode": "function createSplitContext(initialState) {\n  let state = initialState;\n  const dispatchListeners = new Set();\n  const stateListeners = new Set();\n\n  const dispatch = (action) => {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = { ...state, ...action };\n    }\n    stateListeners.forEach(listener => listener(state));\n  };\n\n  return {\n    getState: () => state,\n    getDispatch: () => dispatch, // Stable reference forever\n    subscribeState: (fn) => { stateListeners.add(fn); return () => stateListeners.delete(fn); }\n  };\n}\n"
          },
          "Medium": {
            "id": "context-medium",
            "title": "Selective Context Slice Subscription",
            "difficulty": "Medium",
            "concept": "Avoiding Full Re-renders with Slice Selectors",
            "description": "Implement `createSelectiveContextStore(initialState)` that allows consumers to subscribe only to a selected slice of context. Consumers are notified ONLY when their selected slice changes.",
            "starterCode": "function createSelectiveContextStore(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Standard React Context cannot bail out of renders for partial state changes. Custom selector stores solve this problem.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies slice subscriber when its slice changes",
                "input": "update user.name notifies name subscriber",
                "expected": [
                  "Bob"
                ],
                "testFn": "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); const log = []; store.subscribeSlice(s => s.user, u => log.push(u)); store.setState({ user: 'Bob' }); return log;"
              },
              {
                "id": 2,
                "name": "Ignores updates to unrelated state slices",
                "input": "update theme does not notify user subscriber",
                "expected": 0,
                "testFn": "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); let calls = 0; store.subscribeSlice(s => s.user, () => calls++); store.setState({ theme: 'light' }); return calls;"
              },
              {
                "id": 3,
                "name": "Unsubscribe cleans up subscriber properly",
                "input": "unsub stops future notifications",
                "expected": 1,
                "testFn": "const store = createSelectiveContextStore({ count: 0 }); let count = 0; const unsub = store.subscribeSlice(s => s.count, () => count++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return count;"
              }
            ],
            "solutionCode": "function createSelectiveContextStore(initialState) {\n  let state = initialState;\n  const subscribers = new Set();\n\n  function setState(updater) {\n    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };\n    for (const sub of subscribers) {\n      sub.check();\n    }\n  }\n\n  function subscribeSlice(selector, callback) {\n    let currentSlice = selector(state);\n    const sub = {\n      check: () => {\n        const nextSlice = selector(state);\n        if (!Object.is(currentSlice, nextSlice)) {\n          currentSlice = nextSlice;\n          callback(nextSlice);\n        }\n      }\n    };\n    subscribers.add(sub);\n    return () => subscribers.delete(sub);\n  }\n\n  return { getState: () => state, setState, subscribeSlice };\n}\n"
          },
          "Hard": {
            "id": "context-hard",
            "title": "Fine-Grained Context Selector with Invalidation Channels",
            "difficulty": "Hard",
            "concept": "Zustand-Style Subscription Architecture",
            "description": "Implement `createContextChannel(initialState)` that supports fine-grained selector subscriptions with custom equality comparators (e.g. shallow array equality).",
            "starterCode": "function createContextChannel(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using deep comparison everywhere kills performance. Using `shallowEqual` on array slices avoids unnecessary notification without high diff cost.",
            "testCases": [
              {
                "id": 1,
                "name": "Suppresses notifications when shallow array contents match",
                "input": "array slice returns same items with shallow comparison",
                "expected": 0,
                "testFn": "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2] }); return notified;"
              },
              {
                "id": 2,
                "name": "Fires notification when array items differ",
                "input": "array items change",
                "expected": 1,
                "testFn": "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2, 3] }); return notified;"
              },
              {
                "id": 3,
                "name": "Maintains independent subscribers across different channels",
                "input": "two subscribers on different state properties",
                "expected": [
                  1,
                  0
                ],
                "testFn": "const channel = createContextChannel({ a: 1, b: 2 }); let callsA = 0; let callsB = 0; channel.subscribe(s => s.a, () => callsA++); channel.subscribe(s => s.b, () => callsB++); channel.emit({ a: 99 }); return [callsA, callsB];"
              }
            ],
            "solutionCode": "function createContextChannel(initialState) {\n  let state = initialState;\n  const listeners = new Set();\n\n  function subscribe(selector, onStoreChange, equalityFn = Object.is) {\n    let lastSelection = selector(state);\n\n    const listener = () => {\n      const nextSelection = selector(state);\n      if (!equalityFn(lastSelection, nextSelection)) {\n        lastSelection = nextSelection;\n        onStoreChange(nextSelection);\n      }\n    };\n\n    listeners.add(listener);\n    return () => listeners.delete(listener);\n  }\n\n  function emit(nextState) {\n    state = typeof nextState === 'function' ? nextState(state) : { ...state, ...nextState };\n    listeners.forEach(l => l());\n  }\n\n  return { subscribe, emit, getState: () => state };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "context-basic",
          "title": "Split Context Provider Simulator",
          "difficulty": "Basic",
          "concept": "Separating State from Dispatch in React Context",
          "description": "Implement `createSplitContext(initialState)` that creates distinct state and dispatch channels, allowing dispatch functions to maintain stable identity forever.",
          "starterCode": "function createSplitContext(initialState) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Components that only need `dispatch` (like buttons) should NEVER re-render when state changes. Splitting context achieves this.",
          "testCases": [
            {
              "id": 1,
              "name": "Dispatch function has strictly stable reference identity",
              "input": "getDispatch() === getDispatch() across calls",
              "expected": true,
              "testFn": "const ctx = createSplitContext({ count: 0 }); return ctx.getDispatch() === ctx.getDispatch();"
            },
            {
              "id": 2,
              "name": "Dispatching updates state listeners",
              "input": "dispatch updates count to 1",
              "expected": 1,
              "testFn": "const ctx = createSplitContext({ count: 0 }); let updated = 0; ctx.subscribeState(s => { updated = s.count; }); ctx.getDispatch()({ count: 1 }); return updated;"
            },
            {
              "id": 3,
              "name": "Supports functional action updates",
              "input": "dispatch(prev => ({ count: prev.count + 5 }))",
              "expected": 15,
              "testFn": "const ctx = createSplitContext({ count: 10 }); ctx.getDispatch()(prev => ({ count: prev.count + 5 })); return ctx.getState().count;"
            }
          ],
          "solutionCode": "function createSplitContext(initialState) {\n  let state = initialState;\n  const dispatchListeners = new Set();\n  const stateListeners = new Set();\n\n  const dispatch = (action) => {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = { ...state, ...action };\n    }\n    stateListeners.forEach(listener => listener(state));\n  };\n\n  return {\n    getState: () => state,\n    getDispatch: () => dispatch, // Stable reference forever\n    subscribeState: (fn) => { stateListeners.add(fn); return () => stateListeners.delete(fn); }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "context-basic",
            "title": "Split Context Provider Simulator",
            "difficulty": "Basic",
            "concept": "Separating State from Dispatch in React Context",
            "description": "Implement `createSplitContext(initialState)` that creates distinct state and dispatch channels, allowing dispatch functions to maintain stable identity forever.",
            "starterCode": "function createSplitContext(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Components that only need `dispatch` (like buttons) should NEVER re-render when state changes. Splitting context achieves this.",
            "testCases": [
              {
                "id": 1,
                "name": "Dispatch function has strictly stable reference identity",
                "input": "getDispatch() === getDispatch() across calls",
                "expected": true,
                "testFn": "const ctx = createSplitContext({ count: 0 }); return ctx.getDispatch() === ctx.getDispatch();"
              },
              {
                "id": 2,
                "name": "Dispatching updates state listeners",
                "input": "dispatch updates count to 1",
                "expected": 1,
                "testFn": "const ctx = createSplitContext({ count: 0 }); let updated = 0; ctx.subscribeState(s => { updated = s.count; }); ctx.getDispatch()({ count: 1 }); return updated;"
              },
              {
                "id": 3,
                "name": "Supports functional action updates",
                "input": "dispatch(prev => ({ count: prev.count + 5 }))",
                "expected": 15,
                "testFn": "const ctx = createSplitContext({ count: 10 }); ctx.getDispatch()(prev => ({ count: prev.count + 5 })); return ctx.getState().count;"
              }
            ],
            "solutionCode": "function createSplitContext(initialState) {\n  let state = initialState;\n  const dispatchListeners = new Set();\n  const stateListeners = new Set();\n\n  const dispatch = (action) => {\n    if (typeof action === 'function') {\n      state = action(state);\n    } else {\n      state = { ...state, ...action };\n    }\n    stateListeners.forEach(listener => listener(state));\n  };\n\n  return {\n    getState: () => state,\n    getDispatch: () => dispatch, // Stable reference forever\n    subscribeState: (fn) => { stateListeners.add(fn); return () => stateListeners.delete(fn); }\n  };\n}\n"
          },
          {
            "id": "context-medium",
            "title": "Selective Context Slice Subscription",
            "difficulty": "Medium",
            "concept": "Avoiding Full Re-renders with Slice Selectors",
            "description": "Implement `createSelectiveContextStore(initialState)` that allows consumers to subscribe only to a selected slice of context. Consumers are notified ONLY when their selected slice changes.",
            "starterCode": "function createSelectiveContextStore(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Standard React Context cannot bail out of renders for partial state changes. Custom selector stores solve this problem.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies slice subscriber when its slice changes",
                "input": "update user.name notifies name subscriber",
                "expected": [
                  "Bob"
                ],
                "testFn": "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); const log = []; store.subscribeSlice(s => s.user, u => log.push(u)); store.setState({ user: 'Bob' }); return log;"
              },
              {
                "id": 2,
                "name": "Ignores updates to unrelated state slices",
                "input": "update theme does not notify user subscriber",
                "expected": 0,
                "testFn": "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); let calls = 0; store.subscribeSlice(s => s.user, () => calls++); store.setState({ theme: 'light' }); return calls;"
              },
              {
                "id": 3,
                "name": "Unsubscribe cleans up subscriber properly",
                "input": "unsub stops future notifications",
                "expected": 1,
                "testFn": "const store = createSelectiveContextStore({ count: 0 }); let count = 0; const unsub = store.subscribeSlice(s => s.count, () => count++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return count;"
              }
            ],
            "solutionCode": "function createSelectiveContextStore(initialState) {\n  let state = initialState;\n  const subscribers = new Set();\n\n  function setState(updater) {\n    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };\n    for (const sub of subscribers) {\n      sub.check();\n    }\n  }\n\n  function subscribeSlice(selector, callback) {\n    let currentSlice = selector(state);\n    const sub = {\n      check: () => {\n        const nextSlice = selector(state);\n        if (!Object.is(currentSlice, nextSlice)) {\n          currentSlice = nextSlice;\n          callback(nextSlice);\n        }\n      }\n    };\n    subscribers.add(sub);\n    return () => subscribers.delete(sub);\n  }\n\n  return { getState: () => state, setState, subscribeSlice };\n}\n"
          },
          {
            "id": "context-hard",
            "title": "Fine-Grained Context Selector with Invalidation Channels",
            "difficulty": "Hard",
            "concept": "Zustand-Style Subscription Architecture",
            "description": "Implement `createContextChannel(initialState)` that supports fine-grained selector subscriptions with custom equality comparators (e.g. shallow array equality).",
            "starterCode": "function createContextChannel(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using deep comparison everywhere kills performance. Using `shallowEqual` on array slices avoids unnecessary notification without high diff cost.",
            "testCases": [
              {
                "id": 1,
                "name": "Suppresses notifications when shallow array contents match",
                "input": "array slice returns same items with shallow comparison",
                "expected": 0,
                "testFn": "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2] }); return notified;"
              },
              {
                "id": 2,
                "name": "Fires notification when array items differ",
                "input": "array items change",
                "expected": 1,
                "testFn": "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2, 3] }); return notified;"
              },
              {
                "id": 3,
                "name": "Maintains independent subscribers across different channels",
                "input": "two subscribers on different state properties",
                "expected": [
                  1,
                  0
                ],
                "testFn": "const channel = createContextChannel({ a: 1, b: 2 }); let callsA = 0; let callsB = 0; channel.subscribe(s => s.a, () => callsA++); channel.subscribe(s => s.b, () => callsB++); channel.emit({ a: 99 }); return [callsA, callsB];"
              }
            ],
            "solutionCode": "function createContextChannel(initialState) {\n  let state = initialState;\n  const listeners = new Set();\n\n  function subscribe(selector, onStoreChange, equalityFn = Object.is) {\n    let lastSelection = selector(state);\n\n    const listener = () => {\n      const nextSelection = selector(state);\n      if (!equalityFn(lastSelection, nextSelection)) {\n        lastSelection = nextSelection;\n        onStoreChange(nextSelection);\n      }\n    };\n\n    listeners.add(listener);\n    return () => listeners.delete(listener);\n  }\n\n  function emit(nextState) {\n    state = typeof nextState === 'function' ? nextState(state) : { ...state, ...nextState };\n    listeners.forEach(l => l());\n  }\n\n  return { subscribe, emit, getState: () => state };\n}\n"
          }
        ]
      },
      {
        "id": "composition-over-memo",
        "title": "Component Composition to Eliminate Re-renders",
        "tag": "Architecture",
        "summary": "Moving state down, lifting content up via `children`, slots, and avoiding premature `React.memo`.",
        "mentalModel": "Passing an expensive component as the `children` prop `<Parent><ExpensiveTree /></Parent>` prevents `ExpensiveTree` from re-rendering when `Parent`'s state changes! Because `ExpensiveTree` is evaluated in the grandparent's render scope, its element reference is identical across `Parent` re-renders.",
        "traps": "Reaching for `useMemo` or `React.memo` everywhere when simple component restructuring (`children` as props) solves re-renders naturally.",
        "challenges": {
          "Basic": {
            "id": "comp-basic",
            "title": "Children as Props Re-render Isolator",
            "difficulty": "Basic",
            "concept": "Children Prop Reference Stability Across Parent Re-renders",
            "description": "Implement `simulateChildrenPattern(parentRenders, childElement)` that tracks how many times `childElement` is re-created when its parent container re-renders 5 times.",
            "starterCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is one of Dan Abramov's most famous React mental models: 'Before You memo()', try moving state down or lifting content up.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves identical child reference across parent renders",
                "input": "children prop retains reference identity",
                "expected": true,
                "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).allIdentical;"
              },
              {
                "id": 2,
                "name": "Maintains render count",
                "input": "5 parent renders",
                "expected": 5,
                "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).count;"
              },
              {
                "id": 3,
                "name": "Works with nested component objects",
                "input": "nested children prop",
                "expected": true,
                "testFn": "const complex = { type: 'div', props: { items: [1, 2, 3] } }; return simulateChildrenPattern(3, complex).allIdentical;"
              }
            ],
            "solutionCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // When child is passed as a prop from an outer owner, its element reference is stable\n  const renderedChildrenInstances = [];\n  for (let i = 0; i < parentRendersCount; i++) {\n    // Parent re-renders, but receives the exact same childElement reference!\n    renderedChildrenInstances.push(childElement);\n  }\n  return {\n    allIdentical: renderedChildrenInstances.every(inst => inst === childElement),\n    count: renderedChildrenInstances.length\n  };\n}\n"
          },
          "Medium": {
            "id": "comp-medium",
            "title": "Render Prop / Slot Decoupler",
            "difficulty": "Medium",
            "concept": "Inverting Control via Render Props",
            "description": "Implement `createSlotContainer(renderHeader, renderBody)` that accepts slot render functions and generates UI output without tightly coupling internal layout state to children.",
            "starterCode": "function createSlotContainer(renderHeader, renderBody) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Creating slot components inside the render loop rather than passing them from outer scope recreates DOM nodes on every render.",
            "testCases": [
              {
                "id": 1,
                "name": "Supplies internal state to header and body slots",
                "input": "slots receive active user state",
                "expected": {
                  "header": "TITLE: Admin",
                  "body": "CONTENT: Admin"
                },
                "testFn": "const container = createSlotContainer(s => 'TITLE: ' + s.user, s => 'CONTENT: ' + s.user); return container({ user: 'Admin' });"
              },
              {
                "id": 2,
                "name": "Decouples slots cleanly",
                "input": "custom body rendering",
                "expected": 100,
                "testFn": "const container = createSlotContainer(() => 'header', s => s.count * 10); return container({ count: 10 }).body;"
              },
              {
                "id": 3,
                "name": "Handles static content slots",
                "input": "static slot text",
                "expected": "Static Header",
                "testFn": "const container = createSlotContainer(() => 'Static Header', () => 'Static Body'); return container({}).header;"
              }
            ],
            "solutionCode": "function createSlotContainer(renderHeader, renderBody) {\n  return function render(internalState) {\n    return {\n      header: renderHeader(internalState),\n      body: renderBody(internalState)\n    };\n  };\n}\n"
          },
          "Hard": {
            "id": "comp-hard",
            "title": "Compound Component Pattern with Context Sharing",
            "difficulty": "Hard",
            "concept": "Compound Components (Tabs, Accordions, Menus)",
            "description": "Implement `createCompoundAccordion()` with `Accordion(items)` and `Item(id, title, content)` that coordinates which panel is open without manual prop drilling.",
            "starterCode": "function createCompoundAccordion(defaultOpenId = null) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Passing `isOpen` and `onToggle` through multiple levels of parent-child-grandchild props creates fragile code. Compound components manage shared state implicitly.",
            "testCases": [
              {
                "id": 1,
                "name": "Opens default item on initialization",
                "input": "defaultOpenId = '1'",
                "expected": true,
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); return acc.render()[0].isOpen;"
              },
              {
                "id": 2,
                "name": "Switches active open panel on toggle",
                "input": "toggle('2') closes panel 1 and opens panel 2",
                "expected": [
                  false,
                  true
                ],
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); acc.toggle('2'); const r = acc.render(); return [r[0].isOpen, r[1].isOpen];"
              },
              {
                "id": 3,
                "name": "Toggling active panel closes it (accordion collapses)",
                "input": "toggle active panel collapses it to null",
                "expected": false,
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.toggle('1'); return acc.render()[0].isOpen;"
              }
            ],
            "solutionCode": "function createCompoundAccordion(defaultOpenId = null) {\n  let openId = defaultOpenId;\n  const items = [];\n\n  function addItem(id, title, content) {\n    items.push({ id, title, content });\n  }\n\n  function toggle(id) {\n    openId = openId === id ? null : id;\n  }\n\n  function render() {\n    return items.map(item => ({\n      id: item.id,\n      title: item.title,\n      content: item.content,\n      isOpen: item.id === openId\n    }));\n  }\n\n  return { addItem, toggle, render };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "comp-basic",
          "title": "Children as Props Re-render Isolator",
          "difficulty": "Basic",
          "concept": "Children Prop Reference Stability Across Parent Re-renders",
          "description": "Implement `simulateChildrenPattern(parentRenders, childElement)` that tracks how many times `childElement` is re-created when its parent container re-renders 5 times.",
          "starterCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "This is one of Dan Abramov's most famous React mental models: 'Before You memo()', try moving state down or lifting content up.",
          "testCases": [
            {
              "id": 1,
              "name": "Preserves identical child reference across parent renders",
              "input": "children prop retains reference identity",
              "expected": true,
              "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).allIdentical;"
            },
            {
              "id": 2,
              "name": "Maintains render count",
              "input": "5 parent renders",
              "expected": 5,
              "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).count;"
            },
            {
              "id": 3,
              "name": "Works with nested component objects",
              "input": "nested children prop",
              "expected": true,
              "testFn": "const complex = { type: 'div', props: { items: [1, 2, 3] } }; return simulateChildrenPattern(3, complex).allIdentical;"
            }
          ],
          "solutionCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // When child is passed as a prop from an outer owner, its element reference is stable\n  const renderedChildrenInstances = [];\n  for (let i = 0; i < parentRendersCount; i++) {\n    // Parent re-renders, but receives the exact same childElement reference!\n    renderedChildrenInstances.push(childElement);\n  }\n  return {\n    allIdentical: renderedChildrenInstances.every(inst => inst === childElement),\n    count: renderedChildrenInstances.length\n  };\n}\n"
        },
        "questions": [
          {
            "id": "comp-basic",
            "title": "Children as Props Re-render Isolator",
            "difficulty": "Basic",
            "concept": "Children Prop Reference Stability Across Parent Re-renders",
            "description": "Implement `simulateChildrenPattern(parentRenders, childElement)` that tracks how many times `childElement` is re-created when its parent container re-renders 5 times.",
            "starterCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is one of Dan Abramov's most famous React mental models: 'Before You memo()', try moving state down or lifting content up.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves identical child reference across parent renders",
                "input": "children prop retains reference identity",
                "expected": true,
                "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).allIdentical;"
              },
              {
                "id": 2,
                "name": "Maintains render count",
                "input": "5 parent renders",
                "expected": 5,
                "testFn": "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).count;"
              },
              {
                "id": 3,
                "name": "Works with nested component objects",
                "input": "nested children prop",
                "expected": true,
                "testFn": "const complex = { type: 'div', props: { items: [1, 2, 3] } }; return simulateChildrenPattern(3, complex).allIdentical;"
              }
            ],
            "solutionCode": "function simulateChildrenPattern(parentRendersCount, childElement) {\n  // When child is passed as a prop from an outer owner, its element reference is stable\n  const renderedChildrenInstances = [];\n  for (let i = 0; i < parentRendersCount; i++) {\n    // Parent re-renders, but receives the exact same childElement reference!\n    renderedChildrenInstances.push(childElement);\n  }\n  return {\n    allIdentical: renderedChildrenInstances.every(inst => inst === childElement),\n    count: renderedChildrenInstances.length\n  };\n}\n"
          },
          {
            "id": "comp-medium",
            "title": "Render Prop / Slot Decoupler",
            "difficulty": "Medium",
            "concept": "Inverting Control via Render Props",
            "description": "Implement `createSlotContainer(renderHeader, renderBody)` that accepts slot render functions and generates UI output without tightly coupling internal layout state to children.",
            "starterCode": "function createSlotContainer(renderHeader, renderBody) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Creating slot components inside the render loop rather than passing them from outer scope recreates DOM nodes on every render.",
            "testCases": [
              {
                "id": 1,
                "name": "Supplies internal state to header and body slots",
                "input": "slots receive active user state",
                "expected": {
                  "header": "TITLE: Admin",
                  "body": "CONTENT: Admin"
                },
                "testFn": "const container = createSlotContainer(s => 'TITLE: ' + s.user, s => 'CONTENT: ' + s.user); return container({ user: 'Admin' });"
              },
              {
                "id": 2,
                "name": "Decouples slots cleanly",
                "input": "custom body rendering",
                "expected": 100,
                "testFn": "const container = createSlotContainer(() => 'header', s => s.count * 10); return container({ count: 10 }).body;"
              },
              {
                "id": 3,
                "name": "Handles static content slots",
                "input": "static slot text",
                "expected": "Static Header",
                "testFn": "const container = createSlotContainer(() => 'Static Header', () => 'Static Body'); return container({}).header;"
              }
            ],
            "solutionCode": "function createSlotContainer(renderHeader, renderBody) {\n  return function render(internalState) {\n    return {\n      header: renderHeader(internalState),\n      body: renderBody(internalState)\n    };\n  };\n}\n"
          },
          {
            "id": "comp-hard",
            "title": "Compound Component Pattern with Context Sharing",
            "difficulty": "Hard",
            "concept": "Compound Components (Tabs, Accordions, Menus)",
            "description": "Implement `createCompoundAccordion()` with `Accordion(items)` and `Item(id, title, content)` that coordinates which panel is open without manual prop drilling.",
            "starterCode": "function createCompoundAccordion(defaultOpenId = null) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Passing `isOpen` and `onToggle` through multiple levels of parent-child-grandchild props creates fragile code. Compound components manage shared state implicitly.",
            "testCases": [
              {
                "id": 1,
                "name": "Opens default item on initialization",
                "input": "defaultOpenId = '1'",
                "expected": true,
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); return acc.render()[0].isOpen;"
              },
              {
                "id": 2,
                "name": "Switches active open panel on toggle",
                "input": "toggle('2') closes panel 1 and opens panel 2",
                "expected": [
                  false,
                  true
                ],
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); acc.toggle('2'); const r = acc.render(); return [r[0].isOpen, r[1].isOpen];"
              },
              {
                "id": 3,
                "name": "Toggling active panel closes it (accordion collapses)",
                "input": "toggle active panel collapses it to null",
                "expected": false,
                "testFn": "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.toggle('1'); return acc.render()[0].isOpen;"
              }
            ],
            "solutionCode": "function createCompoundAccordion(defaultOpenId = null) {\n  let openId = defaultOpenId;\n  const items = [];\n\n  function addItem(id, title, content) {\n    items.push({ id, title, content });\n  }\n\n  function toggle(id) {\n    openId = openId === id ? null : id;\n  }\n\n  function render() {\n    return items.map(item => ({\n      id: item.id,\n      title: item.title,\n      content: item.content,\n      isOpen: item.id === openId\n    }));\n  }\n\n  return { addItem, toggle, render };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "react-refs-dom",
    "category": "4. Refs, DOM & Imperative Handles",
    "badge": "DOM Interop",
    "description": "useRef mutable container vs state, forwardRef, and useImperativeHandle.",
    "topics": [
      {
        "id": "useref-internals",
        "title": "useRef: Mutable Container vs State",
        "tag": "Refs",
        "summary": "useRef vs useState, mutability without re-rendering, retaining previous values, timer handles.",
        "mentalModel": "`useRef(initial)` returns a plain JS object `{ current: initial }` that is guaranteed to be the exact same object reference on every render. Mutating `ref.current = value` is completely synchronous and NEVER triggers a component re-render.",
        "traps": "Writing or reading `ref.current` during the render phase (violating purity). Refs should only be read/written in effects or event handlers.",
        "challenges": {
          "Basic": {
            "id": "ref-basic",
            "title": "useRef Simulation (Stable Identity Across Renders)",
            "difficulty": "Basic",
            "concept": "Mutable Container Object Pattern",
            "description": "Implement `createRefContainer(initialValue)` that returns `{ current: initialValue }` whose reference identity remains strictly constant across all calls.",
            "starterCode": "function createRefContainer(initialValue) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Thinking updating a ref re-renders the component. If UI needs to visually update on change, you MUST use `useState`.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns stable object reference across calls",
                "input": "ref1 === ref2",
                "expected": true,
                "testFn": "const hook = createRefContainer(0); const r1 = hook(); const r2 = hook(); return r1 === r2;"
              },
              {
                "id": 2,
                "name": "Allows synchronous mutation of current property",
                "input": "ref.current = 42 persists",
                "expected": 42,
                "testFn": "const hook = createRefContainer('initial'); const r = hook(); r.current = 42; return hook().current;"
              },
              {
                "id": 3,
                "name": "Holds non-primitive object or DOM node reference",
                "input": "ref.current = document.createElement('div')",
                "expected": "DIV",
                "testFn": "const hook = createRefContainer(null); const r = hook(); r.current = { tagName: 'DIV' }; return hook().current.tagName;"
              }
            ],
            "solutionCode": "function createRefContainer(initialValue) {\n  let ref = null;\n  return function getRef() {\n    if (ref === null) {\n      ref = { current: initialValue };\n    }\n    return ref;\n  };\n}\n"
          },
          "Medium": {
            "id": "ref-medium",
            "title": "Implement useClickOutside Detector",
            "difficulty": "Medium",
            "concept": "DOM Node Containment via Refs",
            "description": "Implement `setupClickOutside(refNode, onOutsideClick)` that listens for document clicks and invokes `onOutsideClick()` only if the clicked target is outside `refNode`.",
            "starterCode": "function setupClickOutside(refNode, onOutsideClick) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that `ref.current` can be null before mounting or after unmounting.",
            "testCases": [
              {
                "id": 1,
                "name": "Fires callback when clicking outside referenced node",
                "input": "click outside container",
                "expected": true,
                "testFn": "const node = document.createElement('div'); const outside = document.createElement('span'); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: outside }); return called;"
              },
              {
                "id": 2,
                "name": "Does NOT fire callback when clicking inside referenced node",
                "input": "click inside container child",
                "expected": false,
                "testFn": "const node = document.createElement('div'); const child = document.createElement('button'); node.appendChild(child); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: child }); return called;"
              },
              {
                "id": 3,
                "name": "Handles null ref gracefully",
                "input": "ref is null",
                "expected": false,
                "testFn": "let called = false; const listener = setupClickOutside(null, () => { called = true; }); listener({ target: document.createElement('div') }); return called;"
              }
            ],
            "solutionCode": "function setupClickOutside(refNode, onOutsideClick) {\n  function handler(event) {\n    if (!refNode || !refNode.contains) return;\n    if (!refNode.contains(event.target)) {\n      onOutsideClick(event);\n    }\n  }\n\n  return handler;\n}\n"
          },
          "Hard": {
            "id": "ref-hard",
            "title": "Undo/Redo History Stack using Mutable Refs",
            "difficulty": "Hard",
            "concept": "Fast History Buffer without Component State Re-renders",
            "description": "Implement `createHistoryBuffer(initialState, maxDepth = 10)` that maintains undo/redo stacks within a mutable ref buffer. Provides `set(state)`, `undo()`, `redo()`, and `canUndo() / canRedo()`.",
            "starterCode": "function createHistoryBuffer(initialState, maxDepth = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Storing undo/redo stacks in React state causes every intermediate history snapshot to re-render the whole editor. Storing history in refs avoids re-renders until an actual restore occurs.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly steps backward with undo()",
                "input": "set(1) -> set(2) -> undo() returns 1",
                "expected": 1,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); return h.undo();"
              },
              {
                "id": 2,
                "name": "Correctly steps forward with redo()",
                "input": "undo() -> redo() returns 2",
                "expected": 2,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); return h.redo();"
              },
              {
                "id": 3,
                "name": "Clears future redo stack when new state is pushed",
                "input": "undo() -> set(3) -> canRedo() is false",
                "expected": false,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); h.set(3); return h.canRedo();"
              }
            ],
            "solutionCode": "function createHistoryBuffer(initialState, maxDepth = 10) {\n  let past = [];\n  let present = initialState;\n  let future = [];\n\n  return {\n    get: () => present,\n    set(newState) {\n      past.push(present);\n      if (past.length > maxDepth) past.shift();\n      present = newState;\n      future = []; // Clear redo stack on new action\n    },\n    undo() {\n      if (past.length === 0) return present;\n      future.unshift(present);\n      present = past.pop();\n      return present;\n    },\n    redo() {\n      if (future.length === 0) return present;\n      past.push(present);\n      present = future.shift();\n      return present;\n    },\n    canUndo: () => past.length > 0,\n    canRedo: () => future.length > 0\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "ref-basic",
          "title": "useRef Simulation (Stable Identity Across Renders)",
          "difficulty": "Basic",
          "concept": "Mutable Container Object Pattern",
          "description": "Implement `createRefContainer(initialValue)` that returns `{ current: initialValue }` whose reference identity remains strictly constant across all calls.",
          "starterCode": "function createRefContainer(initialValue) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Thinking updating a ref re-renders the component. If UI needs to visually update on change, you MUST use `useState`.",
          "testCases": [
            {
              "id": 1,
              "name": "Returns stable object reference across calls",
              "input": "ref1 === ref2",
              "expected": true,
              "testFn": "const hook = createRefContainer(0); const r1 = hook(); const r2 = hook(); return r1 === r2;"
            },
            {
              "id": 2,
              "name": "Allows synchronous mutation of current property",
              "input": "ref.current = 42 persists",
              "expected": 42,
              "testFn": "const hook = createRefContainer('initial'); const r = hook(); r.current = 42; return hook().current;"
            },
            {
              "id": 3,
              "name": "Holds non-primitive object or DOM node reference",
              "input": "ref.current = document.createElement('div')",
              "expected": "DIV",
              "testFn": "const hook = createRefContainer(null); const r = hook(); r.current = { tagName: 'DIV' }; return hook().current.tagName;"
            }
          ],
          "solutionCode": "function createRefContainer(initialValue) {\n  let ref = null;\n  return function getRef() {\n    if (ref === null) {\n      ref = { current: initialValue };\n    }\n    return ref;\n  };\n}\n"
        },
        "questions": [
          {
            "id": "ref-basic",
            "title": "useRef Simulation (Stable Identity Across Renders)",
            "difficulty": "Basic",
            "concept": "Mutable Container Object Pattern",
            "description": "Implement `createRefContainer(initialValue)` that returns `{ current: initialValue }` whose reference identity remains strictly constant across all calls.",
            "starterCode": "function createRefContainer(initialValue) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Thinking updating a ref re-renders the component. If UI needs to visually update on change, you MUST use `useState`.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns stable object reference across calls",
                "input": "ref1 === ref2",
                "expected": true,
                "testFn": "const hook = createRefContainer(0); const r1 = hook(); const r2 = hook(); return r1 === r2;"
              },
              {
                "id": 2,
                "name": "Allows synchronous mutation of current property",
                "input": "ref.current = 42 persists",
                "expected": 42,
                "testFn": "const hook = createRefContainer('initial'); const r = hook(); r.current = 42; return hook().current;"
              },
              {
                "id": 3,
                "name": "Holds non-primitive object or DOM node reference",
                "input": "ref.current = document.createElement('div')",
                "expected": "DIV",
                "testFn": "const hook = createRefContainer(null); const r = hook(); r.current = { tagName: 'DIV' }; return hook().current.tagName;"
              }
            ],
            "solutionCode": "function createRefContainer(initialValue) {\n  let ref = null;\n  return function getRef() {\n    if (ref === null) {\n      ref = { current: initialValue };\n    }\n    return ref;\n  };\n}\n"
          },
          {
            "id": "ref-medium",
            "title": "Implement useClickOutside Detector",
            "difficulty": "Medium",
            "concept": "DOM Node Containment via Refs",
            "description": "Implement `setupClickOutside(refNode, onOutsideClick)` that listens for document clicks and invokes `onOutsideClick()` only if the clicked target is outside `refNode`.",
            "starterCode": "function setupClickOutside(refNode, onOutsideClick) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that `ref.current` can be null before mounting or after unmounting.",
            "testCases": [
              {
                "id": 1,
                "name": "Fires callback when clicking outside referenced node",
                "input": "click outside container",
                "expected": true,
                "testFn": "const node = document.createElement('div'); const outside = document.createElement('span'); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: outside }); return called;"
              },
              {
                "id": 2,
                "name": "Does NOT fire callback when clicking inside referenced node",
                "input": "click inside container child",
                "expected": false,
                "testFn": "const node = document.createElement('div'); const child = document.createElement('button'); node.appendChild(child); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: child }); return called;"
              },
              {
                "id": 3,
                "name": "Handles null ref gracefully",
                "input": "ref is null",
                "expected": false,
                "testFn": "let called = false; const listener = setupClickOutside(null, () => { called = true; }); listener({ target: document.createElement('div') }); return called;"
              }
            ],
            "solutionCode": "function setupClickOutside(refNode, onOutsideClick) {\n  function handler(event) {\n    if (!refNode || !refNode.contains) return;\n    if (!refNode.contains(event.target)) {\n      onOutsideClick(event);\n    }\n  }\n\n  return handler;\n}\n"
          },
          {
            "id": "ref-hard",
            "title": "Undo/Redo History Stack using Mutable Refs",
            "difficulty": "Hard",
            "concept": "Fast History Buffer without Component State Re-renders",
            "description": "Implement `createHistoryBuffer(initialState, maxDepth = 10)` that maintains undo/redo stacks within a mutable ref buffer. Provides `set(state)`, `undo()`, `redo()`, and `canUndo() / canRedo()`.",
            "starterCode": "function createHistoryBuffer(initialState, maxDepth = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Storing undo/redo stacks in React state causes every intermediate history snapshot to re-render the whole editor. Storing history in refs avoids re-renders until an actual restore occurs.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly steps backward with undo()",
                "input": "set(1) -> set(2) -> undo() returns 1",
                "expected": 1,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); return h.undo();"
              },
              {
                "id": 2,
                "name": "Correctly steps forward with redo()",
                "input": "undo() -> redo() returns 2",
                "expected": 2,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); return h.redo();"
              },
              {
                "id": 3,
                "name": "Clears future redo stack when new state is pushed",
                "input": "undo() -> set(3) -> canRedo() is false",
                "expected": false,
                "testFn": "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); h.set(3); return h.canRedo();"
              }
            ],
            "solutionCode": "function createHistoryBuffer(initialState, maxDepth = 10) {\n  let past = [];\n  let present = initialState;\n  let future = [];\n\n  return {\n    get: () => present,\n    set(newState) {\n      past.push(present);\n      if (past.length > maxDepth) past.shift();\n      present = newState;\n      future = []; // Clear redo stack on new action\n    },\n    undo() {\n      if (past.length === 0) return present;\n      future.unshift(present);\n      present = past.pop();\n      return present;\n    },\n    redo() {\n      if (future.length === 0) return present;\n      past.push(present);\n      present = future.shift();\n      return present;\n    },\n    canUndo: () => past.length > 0,\n    canRedo: () => future.length > 0\n  };\n}\n"
          }
        ]
      },
      {
        "id": "forwardref-imperative",
        "title": "forwardRef & useImperativeHandle",
        "tag": "Imperative APIs",
        "summary": "Ref forwarding to child DOM nodes, exposing custom methods via useImperativeHandle, encapsulation.",
        "mentalModel": "Normally, refs point directly to the underlying DOM node (`<input>`). `useImperativeHandle(ref, () => ({ customMethod }))` customizes the ref instance exposed to the parent component, hiding raw DOM methods and exposing only clean, intentional APIs.",
        "traps": "Exposing the raw DOM element when only specific actions (`focus()`, `scrollTo()`) should be allowed.",
        "challenges": {
          "Basic": {
            "id": "forwardref-basic",
            "title": "Simulate forwardRef Pipe",
            "difficulty": "Basic",
            "concept": "Ref Forwarding Through Higher-Order Components",
            "description": "Implement `simulateForwardRef(Component)` that forwards a provided `ref` object as the second argument to `Component(props, ref)`.",
            "starterCode": "function simulateForwardRef(renderFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Regular React function components do not accept a `ref` prop; trying to pass `ref` to a normal component warns with 'Function components cannot be given refs'. `forwardRef` is required.",
            "testCases": [
              {
                "id": 1,
                "name": "Passes ref object to wrapped component",
                "input": "ref forwarded to renderFn",
                "expected": "custom-ref-val",
                "testFn": "const Comp = simulateForwardRef((props, ref) => ({ type: 'input', refVal: ref.current })); const ref = { current: 'custom-ref-val' }; return Comp({}, ref).refVal;"
              },
              {
                "id": 2,
                "name": "Passes props along with ref",
                "input": "props and ref delivered simultaneously",
                "expected": "username",
                "testFn": "const Comp = simulateForwardRef((props, ref) => ({ name: props.name })); return Comp({ name: 'username' }, {}).name;"
              },
              {
                "id": 3,
                "name": "Handles null ref gracefully",
                "input": "ref is null",
                "expected": "no-ref",
                "testFn": "const Comp = simulateForwardRef((props, ref) => (ref ? 'has-ref' : 'no-ref')); return Comp({}, null);"
              }
            ],
            "solutionCode": "function simulateForwardRef(renderFn) {\n  return function Forwarded(props, ref) {\n    return renderFn(props, ref);\n  };\n}\n"
          },
          "Medium": {
            "id": "forwardref-medium",
            "title": "Implement useImperativeHandle Custom Method Exposer",
            "difficulty": "Medium",
            "concept": "Restricted Imperative API Encapsulation",
            "description": "Implement `createImperativeHandle(ref, createHandleFn)` that assigns the object returned by `createHandleFn()` directly onto `ref.current`, exposing only explicitly chosen methods.",
            "starterCode": "function createImperativeHandle(ref, createHandleFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Allowing parents to directly manipulate `ref.current.style` breaks component encapsulation. `useImperativeHandle` creates clean public contracts.",
            "testCases": [
              {
                "id": 1,
                "name": "Attaches only explicit methods to ref.current",
                "input": "exposes focus() and blur() but not raw DOM",
                "expected": [
                  "focus",
                  "blur"
                ],
                "testFn": "const ref = {}; createImperativeHandle(ref, () => ({ focus: () => {}, blur: () => {} })); return Object.keys(ref.current);"
              },
              {
                "id": 2,
                "name": "Invokes custom handler method properly",
                "input": "calling focus() triggers custom logic",
                "expected": true,
                "testFn": "let focused = false; const ref = {}; createImperativeHandle(ref, () => ({ focus: () => { focused = true; } })); ref.current.focus(); return focused;"
              },
              {
                "id": 3,
                "name": "Hides unexposed properties on target DOM node",
                "input": "raw input value is not directly exposed",
                "testFn": "const ref = {}; createImperativeHandle(ref, () => ({ reset: () => {} })); return ref.current.rawDOMNode;"
              }
            ],
            "solutionCode": "function createImperativeHandle(ref, createHandleFn) {\n  if (ref && typeof ref === 'object') {\n    ref.current = createHandleFn();\n  }\n}\n"
          },
          "Hard": {
            "id": "forwardref-hard",
            "title": "Virtual Scroll Container Controller via Imperative Handle",
            "difficulty": "Hard",
            "concept": "Imperative Scroll Controller with Bounds Clamping",
            "description": "Implement `createVirtualScrollHandle(ref, { totalItems, itemHeight, viewportHeight })` that attaches `scrollToIndex(index)` and `getVisibleRange()` to `ref.current`, clamping indices and calculating visible items accurately.",
            "starterCode": "function createVirtualScrollHandle(ref, config) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not clamping index bounds causes virtual scroll calculations to display empty white screens.",
            "testCases": [
              {
                "id": 1,
                "name": "Scrolls to item index and computes correct offset",
                "input": "itemHeight 40, scrollToIndex(10) -> offset 400",
                "expected": 400,
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); return ref.current.scrollToIndex(10);"
              },
              {
                "id": 2,
                "name": "Calculates visible items range based on viewport height",
                "input": "viewport 200 / itemHeight 40 = 5 visible items",
                "expected": {
                  "startIndex": 10,
                  "endIndex": 15
                },
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); ref.current.scrollToIndex(10); const range = ref.current.getVisibleRange(); return { startIndex: range.startIndex, endIndex: range.endIndex };"
              },
              {
                "id": 3,
                "name": "Clamps negative index to 0",
                "input": "scrollToIndex(-5) clamps to 0",
                "expected": 0,
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 50, itemHeight: 20, viewportHeight: 100 }); return ref.current.scrollToIndex(-5);"
              }
            ],
            "solutionCode": "function createVirtualScrollHandle(ref, config) {\n  const { totalItems, itemHeight, viewportHeight } = config;\n  let scrollOffset = 0;\n\n  ref.current = {\n    scrollToIndex(index) {\n      const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));\n      scrollOffset = clampedIndex * itemHeight;\n      return scrollOffset;\n    },\n    getVisibleRange() {\n      const startIndex = Math.floor(scrollOffset / itemHeight);\n      const visibleCount = Math.ceil(viewportHeight / itemHeight);\n      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount);\n      return { startIndex, endIndex, scrollOffset };\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "forwardref-basic",
          "title": "Simulate forwardRef Pipe",
          "difficulty": "Basic",
          "concept": "Ref Forwarding Through Higher-Order Components",
          "description": "Implement `simulateForwardRef(Component)` that forwards a provided `ref` object as the second argument to `Component(props, ref)`.",
          "starterCode": "function simulateForwardRef(renderFn) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Regular React function components do not accept a `ref` prop; trying to pass `ref` to a normal component warns with 'Function components cannot be given refs'. `forwardRef` is required.",
          "testCases": [
            {
              "id": 1,
              "name": "Passes ref object to wrapped component",
              "input": "ref forwarded to renderFn",
              "expected": "custom-ref-val",
              "testFn": "const Comp = simulateForwardRef((props, ref) => ({ type: 'input', refVal: ref.current })); const ref = { current: 'custom-ref-val' }; return Comp({}, ref).refVal;"
            },
            {
              "id": 2,
              "name": "Passes props along with ref",
              "input": "props and ref delivered simultaneously",
              "expected": "username",
              "testFn": "const Comp = simulateForwardRef((props, ref) => ({ name: props.name })); return Comp({ name: 'username' }, {}).name;"
            },
            {
              "id": 3,
              "name": "Handles null ref gracefully",
              "input": "ref is null",
              "expected": "no-ref",
              "testFn": "const Comp = simulateForwardRef((props, ref) => (ref ? 'has-ref' : 'no-ref')); return Comp({}, null);"
            }
          ],
          "solutionCode": "function simulateForwardRef(renderFn) {\n  return function Forwarded(props, ref) {\n    return renderFn(props, ref);\n  };\n}\n"
        },
        "questions": [
          {
            "id": "forwardref-basic",
            "title": "Simulate forwardRef Pipe",
            "difficulty": "Basic",
            "concept": "Ref Forwarding Through Higher-Order Components",
            "description": "Implement `simulateForwardRef(Component)` that forwards a provided `ref` object as the second argument to `Component(props, ref)`.",
            "starterCode": "function simulateForwardRef(renderFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Regular React function components do not accept a `ref` prop; trying to pass `ref` to a normal component warns with 'Function components cannot be given refs'. `forwardRef` is required.",
            "testCases": [
              {
                "id": 1,
                "name": "Passes ref object to wrapped component",
                "input": "ref forwarded to renderFn",
                "expected": "custom-ref-val",
                "testFn": "const Comp = simulateForwardRef((props, ref) => ({ type: 'input', refVal: ref.current })); const ref = { current: 'custom-ref-val' }; return Comp({}, ref).refVal;"
              },
              {
                "id": 2,
                "name": "Passes props along with ref",
                "input": "props and ref delivered simultaneously",
                "expected": "username",
                "testFn": "const Comp = simulateForwardRef((props, ref) => ({ name: props.name })); return Comp({ name: 'username' }, {}).name;"
              },
              {
                "id": 3,
                "name": "Handles null ref gracefully",
                "input": "ref is null",
                "expected": "no-ref",
                "testFn": "const Comp = simulateForwardRef((props, ref) => (ref ? 'has-ref' : 'no-ref')); return Comp({}, null);"
              }
            ],
            "solutionCode": "function simulateForwardRef(renderFn) {\n  return function Forwarded(props, ref) {\n    return renderFn(props, ref);\n  };\n}\n"
          },
          {
            "id": "forwardref-medium",
            "title": "Implement useImperativeHandle Custom Method Exposer",
            "difficulty": "Medium",
            "concept": "Restricted Imperative API Encapsulation",
            "description": "Implement `createImperativeHandle(ref, createHandleFn)` that assigns the object returned by `createHandleFn()` directly onto `ref.current`, exposing only explicitly chosen methods.",
            "starterCode": "function createImperativeHandle(ref, createHandleFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Allowing parents to directly manipulate `ref.current.style` breaks component encapsulation. `useImperativeHandle` creates clean public contracts.",
            "testCases": [
              {
                "id": 1,
                "name": "Attaches only explicit methods to ref.current",
                "input": "exposes focus() and blur() but not raw DOM",
                "expected": [
                  "focus",
                  "blur"
                ],
                "testFn": "const ref = {}; createImperativeHandle(ref, () => ({ focus: () => {}, blur: () => {} })); return Object.keys(ref.current);"
              },
              {
                "id": 2,
                "name": "Invokes custom handler method properly",
                "input": "calling focus() triggers custom logic",
                "expected": true,
                "testFn": "let focused = false; const ref = {}; createImperativeHandle(ref, () => ({ focus: () => { focused = true; } })); ref.current.focus(); return focused;"
              },
              {
                "id": 3,
                "name": "Hides unexposed properties on target DOM node",
                "input": "raw input value is not directly exposed",
                "testFn": "const ref = {}; createImperativeHandle(ref, () => ({ reset: () => {} })); return ref.current.rawDOMNode;"
              }
            ],
            "solutionCode": "function createImperativeHandle(ref, createHandleFn) {\n  if (ref && typeof ref === 'object') {\n    ref.current = createHandleFn();\n  }\n}\n"
          },
          {
            "id": "forwardref-hard",
            "title": "Virtual Scroll Container Controller via Imperative Handle",
            "difficulty": "Hard",
            "concept": "Imperative Scroll Controller with Bounds Clamping",
            "description": "Implement `createVirtualScrollHandle(ref, { totalItems, itemHeight, viewportHeight })` that attaches `scrollToIndex(index)` and `getVisibleRange()` to `ref.current`, clamping indices and calculating visible items accurately.",
            "starterCode": "function createVirtualScrollHandle(ref, config) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not clamping index bounds causes virtual scroll calculations to display empty white screens.",
            "testCases": [
              {
                "id": 1,
                "name": "Scrolls to item index and computes correct offset",
                "input": "itemHeight 40, scrollToIndex(10) -> offset 400",
                "expected": 400,
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); return ref.current.scrollToIndex(10);"
              },
              {
                "id": 2,
                "name": "Calculates visible items range based on viewport height",
                "input": "viewport 200 / itemHeight 40 = 5 visible items",
                "expected": {
                  "startIndex": 10,
                  "endIndex": 15
                },
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); ref.current.scrollToIndex(10); const range = ref.current.getVisibleRange(); return { startIndex: range.startIndex, endIndex: range.endIndex };"
              },
              {
                "id": 3,
                "name": "Clamps negative index to 0",
                "input": "scrollToIndex(-5) clamps to 0",
                "expected": 0,
                "testFn": "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 50, itemHeight: 20, viewportHeight: 100 }); return ref.current.scrollToIndex(-5);"
              }
            ],
            "solutionCode": "function createVirtualScrollHandle(ref, config) {\n  const { totalItems, itemHeight, viewportHeight } = config;\n  let scrollOffset = 0;\n\n  ref.current = {\n    scrollToIndex(index) {\n      const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));\n      scrollOffset = clampedIndex * itemHeight;\n      return scrollOffset;\n    },\n    getVisibleRange() {\n      const startIndex = Math.floor(scrollOffset / itemHeight);\n      const visibleCount = Math.ceil(viewportHeight / itemHeight);\n      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount);\n      return { startIndex, endIndex, scrollOffset };\n    }\n  };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "react-concurrency-18",
    "category": "5. Modern React: Concurrency & React 18/19",
    "badge": "Modern Architecture",
    "description": "useTransition, useDeferredValue, and React 18 automatic batching vs flushSync.",
    "topics": [
      {
        "id": "transitions-concurrency",
        "title": "useTransition & useDeferredValue Mechanics",
        "tag": "Concurrency",
        "summary": "Urgent vs non-urgent updates, interruptible rendering, keeping UI responsive during heavy filtering.",
        "mentalModel": "React categorizes updates into Urgent (typing in an `<input>`, clicks) and Non-Urgent / Transition (filtering a 10,000 item list). Wrapping an update in `startTransition(() => setQuery(text))` allows React to interrupt the list render if the user types another keystroke.",
        "traps": "Using `useTransition` for controlled input values directly (inputs MUST remain urgent, or typing lags).",
        "challenges": {
          "Basic": {
            "id": "trans-basic",
            "title": "Simulate useTransition Pending State",
            "difficulty": "Basic",
            "concept": "Non-Urgent Update Flagging with isPending",
            "description": "Implement `createTransitionRunner()` that provides `startTransition(callback)` and `isPending()`. It flags `isPending()` as `true` during the async execution of non-urgent transitions and returns to `false` when finished.",
            "starterCode": "function createTransitionRunner() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Transitions are for low-priority updates. Using transitions for input state causes inputs to drop characters.",
            "testCases": [
              {
                "id": 1,
                "name": "Reports isPending = true while transition is executing",
                "input": "transition in-flight",
                "expected": true,
                "testFn": "const runner = createTransitionRunner(); runner.startTransition(async () => { await new Promise(r => setTimeout(r, 20)); }); return runner.isPending();"
              },
              {
                "id": 2,
                "name": "Returns isPending = false after transition finishes",
                "input": "transition completes",
                "expected": false,
                "testFn": "const runner = createTransitionRunner(); await runner.startTransition(async () => { await new Promise(r => setTimeout(r, 5)); }); return runner.isPending();"
              },
              {
                "id": 3,
                "name": "Handles synchronous callbacks",
                "input": "synchronous transition execution",
                "expected": false,
                "testFn": "const runner = createTransitionRunner(); await runner.startTransition(() => {}); return runner.isPending();"
              }
            ],
            "solutionCode": "function createTransitionRunner() {\n  let pending = false;\n\n  async function startTransition(callback) {\n    pending = true;\n    try {\n      await callback();\n    } finally {\n      pending = false;\n    }\n  }\n\n  return {\n    startTransition,\n    isPending: () => pending\n  };\n}\n"
          },
          "Medium": {
            "id": "trans-medium",
            "title": "useDeferredValue Simulation with Debounced Low-Priority Clone",
            "difficulty": "Medium",
            "concept": "Lagged Rendering via useDeferredValue",
            "description": "Implement `createDeferredValue(initialValue, delayMs = 15)` that receives urgent value updates, but delays updating the returned deferred value to keep rendering responsive.",
            "starterCode": "function createDeferredValue(initialValue, delayMs = 15) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useDeferredValue` is not just a debounce; in true React 18, React begins rendering the deferred value in memory and aborts it immediately if another urgent update arrives.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns initial value immediately",
                "input": "get() before update",
                "expected": "init",
                "testFn": "const d = createDeferredValue('init'); return d.get();"
              },
              {
                "id": 2,
                "name": "Defers update until delay window finishes",
                "input": "get() immediately after update reflects old value",
                "expected": "init",
                "testFn": "const d = createDeferredValue('init', 30); d.update('urgent'); return d.get();"
              },
              {
                "id": 3,
                "name": "Updates deferred value after delay expires",
                "input": "get() after delay reflects new value",
                "expected": "urgent",
                "testFn": "const d = createDeferredValue('init', 10); d.update('urgent'); await new Promise(r => setTimeout(r, 25)); return d.get();"
              }
            ],
            "solutionCode": "function createDeferredValue(initialValue, delayMs = 15) {\n  let deferred = initialValue;\n  let timerId = null;\n\n  function update(newVal) {\n    if (timerId !== null) clearTimeout(timerId);\n    timerId = setTimeout(() => {\n      deferred = newVal;\n      timerId = null;\n    }, delayMs);\n  }\n\n  function get() {\n    return deferred;\n  }\n\n  return { update, get };\n}\n"
          },
          "Hard": {
            "id": "trans-hard",
            "title": "Urgent vs Non-Urgent Priority Task Queue",
            "difficulty": "Hard",
            "concept": "Lanes / Priority-Based Task Scheduling",
            "description": "Implement `createPriorityScheduler()` that queues tasks labeled `'urgent'` (Priority 1) and `'transition'` (Priority 2). `flush()` must ALWAYS execute all urgent tasks before executing any transition tasks.",
            "starterCode": "function createPriorityScheduler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In React 18's Lane model, urgent events (keystrokes) interrupt running transition fibers, discarding in-progress work to preserve 60fps input responsiveness.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes urgent tasks before older transition tasks",
                "input": "transition scheduled before urgent task",
                "expected": [
                  "urgent-1",
                  "transition-1"
                ],
                "testFn": "const s = createPriorityScheduler(); s.schedule(() => 'transition-1', 'transition'); s.schedule(() => 'urgent-1', 'urgent'); return s.flush();"
              },
              {
                "id": 2,
                "name": "Maintains FIFO order within same priority level",
                "input": "multiple urgent tasks execute in insertion order",
                "expected": [
                  "u1",
                  "u2",
                  "t1"
                ],
                "testFn": "const s = createPriorityScheduler(); s.schedule(() => 'u1', 'urgent'); s.schedule(() => 't1', 'transition'); s.schedule(() => 'u2', 'urgent'); return s.flush();"
              },
              {
                "id": 3,
                "name": "Handles empty queues safely",
                "input": "flush with no tasks",
                "expected": [],
                "testFn": "const s = createPriorityScheduler(); return s.flush();"
              }
            ],
            "solutionCode": "function createPriorityScheduler() {\n  const urgentQueue = [];\n  const transitionQueue = [];\n\n  function schedule(task, priority = 'transition') {\n    if (priority === 'urgent') {\n      urgentQueue.push(task);\n    } else {\n      transitionQueue.push(task);\n    }\n  }\n\n  function flush() {\n    const executed = [];\n    // 1. Drain all urgent tasks first\n    while (urgentQueue.length > 0) {\n      const task = urgentQueue.shift();\n      executed.push(task());\n    }\n    // 2. Drain transition tasks\n    while (transitionQueue.length > 0) {\n      const task = transitionQueue.shift();\n      executed.push(task());\n    }\n    return executed;\n  }\n\n  return { schedule, flush };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "trans-basic",
          "title": "Simulate useTransition Pending State",
          "difficulty": "Basic",
          "concept": "Non-Urgent Update Flagging with isPending",
          "description": "Implement `createTransitionRunner()` that provides `startTransition(callback)` and `isPending()`. It flags `isPending()` as `true` during the async execution of non-urgent transitions and returns to `false` when finished.",
          "starterCode": "function createTransitionRunner() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Transitions are for low-priority updates. Using transitions for input state causes inputs to drop characters.",
          "testCases": [
            {
              "id": 1,
              "name": "Reports isPending = true while transition is executing",
              "input": "transition in-flight",
              "expected": true,
              "testFn": "const runner = createTransitionRunner(); runner.startTransition(async () => { await new Promise(r => setTimeout(r, 20)); }); return runner.isPending();"
            },
            {
              "id": 2,
              "name": "Returns isPending = false after transition finishes",
              "input": "transition completes",
              "expected": false,
              "testFn": "const runner = createTransitionRunner(); await runner.startTransition(async () => { await new Promise(r => setTimeout(r, 5)); }); return runner.isPending();"
            },
            {
              "id": 3,
              "name": "Handles synchronous callbacks",
              "input": "synchronous transition execution",
              "expected": false,
              "testFn": "const runner = createTransitionRunner(); await runner.startTransition(() => {}); return runner.isPending();"
            }
          ],
          "solutionCode": "function createTransitionRunner() {\n  let pending = false;\n\n  async function startTransition(callback) {\n    pending = true;\n    try {\n      await callback();\n    } finally {\n      pending = false;\n    }\n  }\n\n  return {\n    startTransition,\n    isPending: () => pending\n  };\n}\n"
        },
        "questions": [
          {
            "id": "trans-basic",
            "title": "Simulate useTransition Pending State",
            "difficulty": "Basic",
            "concept": "Non-Urgent Update Flagging with isPending",
            "description": "Implement `createTransitionRunner()` that provides `startTransition(callback)` and `isPending()`. It flags `isPending()` as `true` during the async execution of non-urgent transitions and returns to `false` when finished.",
            "starterCode": "function createTransitionRunner() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Transitions are for low-priority updates. Using transitions for input state causes inputs to drop characters.",
            "testCases": [
              {
                "id": 1,
                "name": "Reports isPending = true while transition is executing",
                "input": "transition in-flight",
                "expected": true,
                "testFn": "const runner = createTransitionRunner(); runner.startTransition(async () => { await new Promise(r => setTimeout(r, 20)); }); return runner.isPending();"
              },
              {
                "id": 2,
                "name": "Returns isPending = false after transition finishes",
                "input": "transition completes",
                "expected": false,
                "testFn": "const runner = createTransitionRunner(); await runner.startTransition(async () => { await new Promise(r => setTimeout(r, 5)); }); return runner.isPending();"
              },
              {
                "id": 3,
                "name": "Handles synchronous callbacks",
                "input": "synchronous transition execution",
                "expected": false,
                "testFn": "const runner = createTransitionRunner(); await runner.startTransition(() => {}); return runner.isPending();"
              }
            ],
            "solutionCode": "function createTransitionRunner() {\n  let pending = false;\n\n  async function startTransition(callback) {\n    pending = true;\n    try {\n      await callback();\n    } finally {\n      pending = false;\n    }\n  }\n\n  return {\n    startTransition,\n    isPending: () => pending\n  };\n}\n"
          },
          {
            "id": "trans-medium",
            "title": "useDeferredValue Simulation with Debounced Low-Priority Clone",
            "difficulty": "Medium",
            "concept": "Lagged Rendering via useDeferredValue",
            "description": "Implement `createDeferredValue(initialValue, delayMs = 15)` that receives urgent value updates, but delays updating the returned deferred value to keep rendering responsive.",
            "starterCode": "function createDeferredValue(initialValue, delayMs = 15) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`useDeferredValue` is not just a debounce; in true React 18, React begins rendering the deferred value in memory and aborts it immediately if another urgent update arrives.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns initial value immediately",
                "input": "get() before update",
                "expected": "init",
                "testFn": "const d = createDeferredValue('init'); return d.get();"
              },
              {
                "id": 2,
                "name": "Defers update until delay window finishes",
                "input": "get() immediately after update reflects old value",
                "expected": "init",
                "testFn": "const d = createDeferredValue('init', 30); d.update('urgent'); return d.get();"
              },
              {
                "id": 3,
                "name": "Updates deferred value after delay expires",
                "input": "get() after delay reflects new value",
                "expected": "urgent",
                "testFn": "const d = createDeferredValue('init', 10); d.update('urgent'); await new Promise(r => setTimeout(r, 25)); return d.get();"
              }
            ],
            "solutionCode": "function createDeferredValue(initialValue, delayMs = 15) {\n  let deferred = initialValue;\n  let timerId = null;\n\n  function update(newVal) {\n    if (timerId !== null) clearTimeout(timerId);\n    timerId = setTimeout(() => {\n      deferred = newVal;\n      timerId = null;\n    }, delayMs);\n  }\n\n  function get() {\n    return deferred;\n  }\n\n  return { update, get };\n}\n"
          },
          {
            "id": "trans-hard",
            "title": "Urgent vs Non-Urgent Priority Task Queue",
            "difficulty": "Hard",
            "concept": "Lanes / Priority-Based Task Scheduling",
            "description": "Implement `createPriorityScheduler()` that queues tasks labeled `'urgent'` (Priority 1) and `'transition'` (Priority 2). `flush()` must ALWAYS execute all urgent tasks before executing any transition tasks.",
            "starterCode": "function createPriorityScheduler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In React 18's Lane model, urgent events (keystrokes) interrupt running transition fibers, discarding in-progress work to preserve 60fps input responsiveness.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes urgent tasks before older transition tasks",
                "input": "transition scheduled before urgent task",
                "expected": [
                  "urgent-1",
                  "transition-1"
                ],
                "testFn": "const s = createPriorityScheduler(); s.schedule(() => 'transition-1', 'transition'); s.schedule(() => 'urgent-1', 'urgent'); return s.flush();"
              },
              {
                "id": 2,
                "name": "Maintains FIFO order within same priority level",
                "input": "multiple urgent tasks execute in insertion order",
                "expected": [
                  "u1",
                  "u2",
                  "t1"
                ],
                "testFn": "const s = createPriorityScheduler(); s.schedule(() => 'u1', 'urgent'); s.schedule(() => 't1', 'transition'); s.schedule(() => 'u2', 'urgent'); return s.flush();"
              },
              {
                "id": 3,
                "name": "Handles empty queues safely",
                "input": "flush with no tasks",
                "expected": [],
                "testFn": "const s = createPriorityScheduler(); return s.flush();"
              }
            ],
            "solutionCode": "function createPriorityScheduler() {\n  const urgentQueue = [];\n  const transitionQueue = [];\n\n  function schedule(task, priority = 'transition') {\n    if (priority === 'urgent') {\n      urgentQueue.push(task);\n    } else {\n      transitionQueue.push(task);\n    }\n  }\n\n  function flush() {\n    const executed = [];\n    // 1. Drain all urgent tasks first\n    while (urgentQueue.length > 0) {\n      const task = urgentQueue.shift();\n      executed.push(task());\n    }\n    // 2. Drain transition tasks\n    while (transitionQueue.length > 0) {\n      const task = transitionQueue.shift();\n      executed.push(task());\n    }\n    return executed;\n  }\n\n  return { schedule, flush };\n}\n"
          }
        ]
      },
      {
        "id": "automatic-batching",
        "title": "Automatic Batching in React 18 vs flushSync",
        "tag": "Batching",
        "summary": "Batching inside Promises, setTimeout, and native event handlers in React 18 vs opt-out using flushSync.",
        "mentalModel": "In React 17, state updates inside `setTimeout` or `Promise.then` were NOT batched, triggering multiple re-renders. React 18 automatically batches ALL state updates regardless of origin. `flushSync(() => { ... })` opts out of batching, forcing an immediate synchronous DOM flush.",
        "traps": "Using `flushSync` excessively hurts rendering performance; it should only be used when immediate DOM measurement (e.g. scroll position) is strictly required.",
        "challenges": {
          "Basic": {
            "id": "batch-basic",
            "title": "Microtask State Dispatch Batcher",
            "difficulty": "Basic",
            "concept": "Turn-Based Update Batching",
            "description": "Implement `createBatchingStore(initialState, onRender)` that batches multiple synchronous `setState` calls so that `onRender` fires only ONCE with the merged state at the end of the microtask turn.",
            "starterCode": "function createBatchingStore(initialState, onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Before React 18, updates inside `fetch().then()` triggered 2 renders for 2 `setState` calls. React 18 batches them into 1 render.",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple synchronous state updates into 1 render call",
                "input": "3 setState calls result in 1 render",
                "expected": 1,
                "testFn": "let renders = 0; const store = createBatchingStore({ a: 1, b: 2 }, () => renders++); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return renders;"
              },
              {
                "id": 2,
                "name": "Applies all sequential updates to final state",
                "input": "final state reflects all batched changes",
                "expected": {
                  "a": 30,
                  "b": 20
                },
                "testFn": "let finalState = null; const store = createBatchingStore({ a: 1, b: 2 }, s => { finalState = s; }); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return finalState;"
              },
              {
                "id": 3,
                "name": "Supports functional updaters during batching",
                "input": "setState(prev => prev + 1) three times",
                "expected": 3,
                "testFn": "let finalState = null; const store = createBatchingStore(0, s => { finalState = s; }); store.setState(p => p + 1); store.setState(p => p + 1); store.setState(p => p + 1); await Promise.resolve(); return finalState;"
              }
            ],
            "solutionCode": "function createBatchingStore(initialState, onRender) {\n  let state = initialState;\n  let pendingUpdates = [];\n  let isScheduled = false;\n\n  function setState(partial) {\n    pendingUpdates.push(partial);\n\n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => {\n        for (const update of pendingUpdates) {\n          state = typeof update === 'function' ? update(state) : { ...state, ...update };\n        }\n        pendingUpdates = [];\n        isScheduled = false;\n        onRender(state);\n      });\n    }\n  }\n\n  return { setState, getState: () => state };\n}\n"
          },
          "Medium": {
            "id": "batch-medium",
            "title": "Simulate Automatic Batching Across Async Boundaries",
            "difficulty": "Medium",
            "concept": "React 18 Universal Batching across Promises & Timeouts",
            "description": "Implement `simulateAsyncBatching(actionFns, onRender)` that executes async callbacks (like `fetch.then`) and verifies that multiple dispatches inside the async handler are batched together.",
            "starterCode": "async function simulateAsyncBatching(asyncTask, onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In React 17, `setTimeout(() => { setCount(1); setFlag(true); })` fired 2 renders. In React 18, it fires 1 render.",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple dispatches inside an async timeout into 1 render",
                "input": "2 dispatches in setTimeout fire 1 render",
                "expected": 1,
                "testFn": "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.renders;"
              },
              {
                "id": 2,
                "name": "Merges state properties accurately",
                "input": "state has both count and text updated",
                "expected": {
                  "count": 1,
                  "text": "ready"
                },
                "testFn": "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.state;"
              },
              {
                "id": 3,
                "name": "Dispatches across different async turns create separate renders",
                "input": "dispatches in separate timeouts produce 2 renders",
                "expected": 2,
                "testFn": "let renderCount = 0; await simulateAsyncBatching(async (dispatch) => { dispatch({ count: 1 }); await new Promise(r => setTimeout(r, 15)); dispatch({ count: 2 }); }, (s, r) => { renderCount = r; }); return renderCount;"
              }
            ],
            "solutionCode": "async function simulateAsyncBatching(asyncTask, onRender) {\n  let renders = 0;\n  let state = { count: 0, text: '' };\n  let pendingQueue = [];\n  let isFlushing = false;\n\n  function dispatch(update) {\n    pendingQueue.push(update);\n    if (!isFlushing) {\n      isFlushing = true;\n      queueMicrotask(() => {\n        for (const u of pendingQueue) {\n          state = { ...state, ...u };\n        }\n        pendingQueue = [];\n        renders++;\n        isFlushing = false;\n        onRender(state, renders);\n      });\n    }\n  }\n\n  await asyncTask(dispatch);\n  await new Promise(r => setTimeout(r, 10)); // Wait for microtask drain\n  return { state, renders };\n}\n"
          },
          "Hard": {
            "id": "batch-hard",
            "title": "Implement flushSync Immediate Commit Engine",
            "difficulty": "Hard",
            "concept": "Bypassing Batching to Force Synchronous DOM Flush",
            "description": "Implement `createBatchingWithFlushSync(onRender)` that provides standard batched `setState()` and `flushSync(callback)`. Calling `flushSync` forces all pending updates AND any updates inside `callback` to flush synchronously before `flushSync` returns.",
            "starterCode": "function createBatchingWithFlushSync(onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Calling `flushSync` inside a lifecycle hook or during another component's render will trigger a React warning. It is reserved for top-level event handlers needing synchronous DOM geometry.",
            "testCases": [
              {
                "id": 1,
                "name": "flushSync commits state immediately without waiting for microtask",
                "input": "flushSync forces synchronous commit",
                "expected": 1,
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.flushSync(() => { store.setState({ count: 10 }); }); return renders;"
              },
              {
                "id": 2,
                "name": "Normal setState remains batched until microtask",
                "input": "normal setState has not committed synchronously",
                "expected": 0,
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 5 }); return renders;"
              },
              {
                "id": 3,
                "name": "flushSync flushes both previously pending updates and current callback updates",
                "input": "pending + flushSync combined in single immediate commit",
                "expected": {
                  "count": 20,
                  "renders": 1
                },
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 10 }); store.flushSync(() => { store.setState({ count: 20 }); }); return { count: store.getState().count, renders };"
              }
            ],
            "solutionCode": "function createBatchingWithFlushSync(onRender) {\n  let state = { count: 0 };\n  let pending = [];\n  let isScheduled = false;\n\n  function commit() {\n    if (pending.length === 0) return;\n    for (const update of pending) {\n      state = typeof update === 'function' ? update(state) : { ...state, ...update };\n    }\n    pending = [];\n    isScheduled = false;\n    onRender(state);\n  }\n\n  function setState(update) {\n    pending.push(update);\n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => commit());\n    }\n  }\n\n  function flushSync(callback) {\n    if (callback) {\n      callback();\n    }\n    // Force immediate synchronous commit!\n    commit();\n    return state;\n  }\n\n  return { setState, flushSync, getState: () => state };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "batch-basic",
          "title": "Microtask State Dispatch Batcher",
          "difficulty": "Basic",
          "concept": "Turn-Based Update Batching",
          "description": "Implement `createBatchingStore(initialState, onRender)` that batches multiple synchronous `setState` calls so that `onRender` fires only ONCE with the merged state at the end of the microtask turn.",
          "starterCode": "function createBatchingStore(initialState, onRender) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Before React 18, updates inside `fetch().then()` triggered 2 renders for 2 `setState` calls. React 18 batches them into 1 render.",
          "testCases": [
            {
              "id": 1,
              "name": "Batches multiple synchronous state updates into 1 render call",
              "input": "3 setState calls result in 1 render",
              "expected": 1,
              "testFn": "let renders = 0; const store = createBatchingStore({ a: 1, b: 2 }, () => renders++); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return renders;"
            },
            {
              "id": 2,
              "name": "Applies all sequential updates to final state",
              "input": "final state reflects all batched changes",
              "expected": {
                "a": 30,
                "b": 20
              },
              "testFn": "let finalState = null; const store = createBatchingStore({ a: 1, b: 2 }, s => { finalState = s; }); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return finalState;"
            },
            {
              "id": 3,
              "name": "Supports functional updaters during batching",
              "input": "setState(prev => prev + 1) three times",
              "expected": 3,
              "testFn": "let finalState = null; const store = createBatchingStore(0, s => { finalState = s; }); store.setState(p => p + 1); store.setState(p => p + 1); store.setState(p => p + 1); await Promise.resolve(); return finalState;"
            }
          ],
          "solutionCode": "function createBatchingStore(initialState, onRender) {\n  let state = initialState;\n  let pendingUpdates = [];\n  let isScheduled = false;\n\n  function setState(partial) {\n    pendingUpdates.push(partial);\n\n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => {\n        for (const update of pendingUpdates) {\n          state = typeof update === 'function' ? update(state) : { ...state, ...update };\n        }\n        pendingUpdates = [];\n        isScheduled = false;\n        onRender(state);\n      });\n    }\n  }\n\n  return { setState, getState: () => state };\n}\n"
        },
        "questions": [
          {
            "id": "batch-basic",
            "title": "Microtask State Dispatch Batcher",
            "difficulty": "Basic",
            "concept": "Turn-Based Update Batching",
            "description": "Implement `createBatchingStore(initialState, onRender)` that batches multiple synchronous `setState` calls so that `onRender` fires only ONCE with the merged state at the end of the microtask turn.",
            "starterCode": "function createBatchingStore(initialState, onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Before React 18, updates inside `fetch().then()` triggered 2 renders for 2 `setState` calls. React 18 batches them into 1 render.",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple synchronous state updates into 1 render call",
                "input": "3 setState calls result in 1 render",
                "expected": 1,
                "testFn": "let renders = 0; const store = createBatchingStore({ a: 1, b: 2 }, () => renders++); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return renders;"
              },
              {
                "id": 2,
                "name": "Applies all sequential updates to final state",
                "input": "final state reflects all batched changes",
                "expected": {
                  "a": 30,
                  "b": 20
                },
                "testFn": "let finalState = null; const store = createBatchingStore({ a: 1, b: 2 }, s => { finalState = s; }); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return finalState;"
              },
              {
                "id": 3,
                "name": "Supports functional updaters during batching",
                "input": "setState(prev => prev + 1) three times",
                "expected": 3,
                "testFn": "let finalState = null; const store = createBatchingStore(0, s => { finalState = s; }); store.setState(p => p + 1); store.setState(p => p + 1); store.setState(p => p + 1); await Promise.resolve(); return finalState;"
              }
            ],
            "solutionCode": "function createBatchingStore(initialState, onRender) {\n  let state = initialState;\n  let pendingUpdates = [];\n  let isScheduled = false;\n\n  function setState(partial) {\n    pendingUpdates.push(partial);\n\n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => {\n        for (const update of pendingUpdates) {\n          state = typeof update === 'function' ? update(state) : { ...state, ...update };\n        }\n        pendingUpdates = [];\n        isScheduled = false;\n        onRender(state);\n      });\n    }\n  }\n\n  return { setState, getState: () => state };\n}\n"
          },
          {
            "id": "batch-medium",
            "title": "Simulate Automatic Batching Across Async Boundaries",
            "difficulty": "Medium",
            "concept": "React 18 Universal Batching across Promises & Timeouts",
            "description": "Implement `simulateAsyncBatching(actionFns, onRender)` that executes async callbacks (like `fetch.then`) and verifies that multiple dispatches inside the async handler are batched together.",
            "starterCode": "async function simulateAsyncBatching(asyncTask, onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In React 17, `setTimeout(() => { setCount(1); setFlag(true); })` fired 2 renders. In React 18, it fires 1 render.",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple dispatches inside an async timeout into 1 render",
                "input": "2 dispatches in setTimeout fire 1 render",
                "expected": 1,
                "testFn": "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.renders;"
              },
              {
                "id": 2,
                "name": "Merges state properties accurately",
                "input": "state has both count and text updated",
                "expected": {
                  "count": 1,
                  "text": "ready"
                },
                "testFn": "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.state;"
              },
              {
                "id": 3,
                "name": "Dispatches across different async turns create separate renders",
                "input": "dispatches in separate timeouts produce 2 renders",
                "expected": 2,
                "testFn": "let renderCount = 0; await simulateAsyncBatching(async (dispatch) => { dispatch({ count: 1 }); await new Promise(r => setTimeout(r, 15)); dispatch({ count: 2 }); }, (s, r) => { renderCount = r; }); return renderCount;"
              }
            ],
            "solutionCode": "async function simulateAsyncBatching(asyncTask, onRender) {\n  let renders = 0;\n  let state = { count: 0, text: '' };\n  let pendingQueue = [];\n  let isFlushing = false;\n\n  function dispatch(update) {\n    pendingQueue.push(update);\n    if (!isFlushing) {\n      isFlushing = true;\n      queueMicrotask(() => {\n        for (const u of pendingQueue) {\n          state = { ...state, ...u };\n        }\n        pendingQueue = [];\n        renders++;\n        isFlushing = false;\n        onRender(state, renders);\n      });\n    }\n  }\n\n  await asyncTask(dispatch);\n  await new Promise(r => setTimeout(r, 10)); // Wait for microtask drain\n  return { state, renders };\n}\n"
          },
          {
            "id": "batch-hard",
            "title": "Implement flushSync Immediate Commit Engine",
            "difficulty": "Hard",
            "concept": "Bypassing Batching to Force Synchronous DOM Flush",
            "description": "Implement `createBatchingWithFlushSync(onRender)` that provides standard batched `setState()` and `flushSync(callback)`. Calling `flushSync` forces all pending updates AND any updates inside `callback` to flush synchronously before `flushSync` returns.",
            "starterCode": "function createBatchingWithFlushSync(onRender) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Calling `flushSync` inside a lifecycle hook or during another component's render will trigger a React warning. It is reserved for top-level event handlers needing synchronous DOM geometry.",
            "testCases": [
              {
                "id": 1,
                "name": "flushSync commits state immediately without waiting for microtask",
                "input": "flushSync forces synchronous commit",
                "expected": 1,
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.flushSync(() => { store.setState({ count: 10 }); }); return renders;"
              },
              {
                "id": 2,
                "name": "Normal setState remains batched until microtask",
                "input": "normal setState has not committed synchronously",
                "expected": 0,
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 5 }); return renders;"
              },
              {
                "id": 3,
                "name": "flushSync flushes both previously pending updates and current callback updates",
                "input": "pending + flushSync combined in single immediate commit",
                "expected": {
                  "count": 20,
                  "renders": 1
                },
                "testFn": "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 10 }); store.flushSync(() => { store.setState({ count: 20 }); }); return { count: store.getState().count, renders };"
              }
            ],
            "solutionCode": "function createBatchingWithFlushSync(onRender) {\n  let state = { count: 0 };\n  let pending = [];\n  let isScheduled = false;\n\n  function commit() {\n    if (pending.length === 0) return;\n    for (const update of pending) {\n      state = typeof update === 'function' ? update(state) : { ...state, ...update };\n    }\n    pending = [];\n    isScheduled = false;\n    onRender(state);\n  }\n\n  function setState(update) {\n    pending.push(update);\n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => commit());\n    }\n  }\n\n  function flushSync(callback) {\n    if (callback) {\n      callback();\n    }\n    // Force immediate synchronous commit!\n    commit();\n    return state;\n  }\n\n  return { setState, flushSync, getState: () => state };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "component-architecture-state",
    "category": "6. Component Architecture & State Management",
    "badge": "Architecture & State",
    "description": "Master controlled vs uncontrolled components, synthetic event dispatching, custom state machines, and the state reducer pattern.",
    "topics": [
      {
        "id": "controlled-uncontrolled",
        "title": "Controlled vs Uncontrolled & Synthetic Events",
        "tag": "Forms & Events",
        "summary": "Value synchronization, defaultValue, event pooling, synthetic event normalization, and zero re-render forms.",
        "mentalModel": "A controlled component's single source of truth is React state; an uncontrolled component delegates state to the DOM node via a ref. Bridging both requires synchronizing internal fallback state with incoming prop state.",
        "traps": "Switching from uncontrolled to controlled (undefined -> value) triggers React console warnings and breaks cursor position.",
        "challenges": {
          "Basic": {
            "id": "controlled-state-sync-basic",
            "title": "Universal Input Controller Sync",
            "difficulty": "Basic",
            "concept": "Props vs State Controlled-to-Uncontrolled Synchronization",
            "description": "Implement `createInputController({ value, defaultValue, onChange })` that correctly determines if an input is controlled (`value !== undefined`), manages an internal fallback state when uncontrolled, and synchronizes changes without triggering warnings.",
            "starterCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If an input starts with value={undefined} and later receives a string, React logs: 'A component is changing an uncontrolled input to be controlled'. Setting defaultValue or an empty string fallback prevents this.",
            "testCases": [
              {
                "id": 1,
                "name": "Manages internal state when uncontrolled",
                "input": "uncontrolled input updates internal value",
                "expected": "Hello",
                "testFn": "const ctrl = createInputController({ defaultValue: '' }); ctrl.setValue('Hello'); return ctrl.getValue();"
              },
              {
                "id": 2,
                "name": "Defers to prop value when controlled",
                "input": "controlled input always returns prop value",
                "expected": "ControlledText",
                "testFn": "const ctrl = createInputController({ value: 'ControlledText' }); return ctrl.getValue();"
              },
              {
                "id": 3,
                "name": "Invokes onChange callback on value change",
                "input": "onChange triggered on setValue",
                "expected": "NewVal",
                "testFn": "let captured = ''; const ctrl = createInputController({ onChange: v => captured = v }); ctrl.setValue('NewVal'); return captured;"
              }
            ],
            "solutionCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  const isControlled = value !== undefined;\n  let internalValue = defaultValue;\n\n  return {\n    isControlled() {\n      return isControlled;\n    },\n    getValue() {\n      return isControlled ? value : internalValue;\n    },\n    setValue(nextVal) {\n      if (!isControlled) {\n        internalValue = nextVal;\n      }\n      if (typeof onChange === 'function') {\n        onChange(nextVal);\n      }\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "custom-use-controlled-medium",
            "title": "Custom useControlled State Hook (Radix / MUI Pattern)",
            "difficulty": "Medium",
            "concept": "Derived State & Controlled Prop Inversion",
            "description": "Implement `useControlledState({ controlled, default: defaultVal })` that mimics the standard pattern used in Radix UI and Material UI, returning `[currentValue, setValue]`.",
            "starterCode": "/**\n * Reusable controlled/uncontrolled state helper for polymorphic UI widgets.\n */\nfunction useControlledState({ controlled, default: defaultVal } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Components often need to be either controlled by a parent or self-contained. The useControlled pattern allows reusable UI widgets (accordion, modal, combobox) to support both flawlessly.",
            "testCases": [
              {
                "id": 1,
                "name": "Uncontrolled mode updates internal value",
                "input": "setState updates default state",
                "expected": "opened",
                "testFn": "const [val, setVal] = useControlledState({ default: 'closed' }); return setVal('opened');"
              },
              {
                "id": 2,
                "name": "Controlled mode reflects external prop value",
                "input": "controlled: 'fixed'",
                "expected": "fixed",
                "testFn": "const [val] = useControlledState({ controlled: 'fixed', default: 'ignored' }); return val;"
              },
              {
                "id": 3,
                "name": "Supports functional updater syntax",
                "input": "setVal(prev => prev + 1)",
                "expected": 6,
                "testFn": "const [val, setVal] = useControlledState({ default: 5 }); return setVal(prev => prev + 1);"
              }
            ],
            "solutionCode": "/**\n * Reusable controlled/uncontrolled state helper for polymorphic UI widgets.\n */\nfunction useControlledState({ controlled, default: defaultVal } = {}) {\n  const isControlled = controlled !== undefined;\n  let state = isControlled ? controlled : defaultVal;\n\n  function setState(updater) {\n    const nextVal = typeof updater === 'function' ? updater(state) : updater;\n    if (!isControlled) {\n      state = nextVal;\n    }\n    return nextVal;\n  }\n\n  return [state, setState];\n}\n"
          },
          "Hard": {
            "id": "zero-rerender-form-hard",
            "title": "Zero Re-render Form State Engine (React Hook Form Core)",
            "difficulty": "Hard",
            "concept": "Uncontrolled Refs with Event Subscriptions for High-Performance Forms",
            "description": "Implement `createFormEngine(initialValues)` that registers input fields via refs, tracks touched and dirty states, validates fields without re-rendering parent components, and returns serialized values on submit.",
            "starterCode": "/**\n * Micro form engine utilizing uncontrolled ref subscriptions to eliminate re-renders.\n */\nfunction createFormEngine(initialValues = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Storing form values in top-level useState forces the entire form component tree to re-render on every keystroke. Using uncontrolled ref-based subscription isolated to inputs scales to thousands of inputs smoothly.",
            "testCases": [
              {
                "id": 1,
                "name": "Updates field value on change without external rerenders",
                "input": "email field updated to alex@test.com",
                "expected": {
                  "email": "alex@test.com"
                },
                "testFn": "const form = createFormEngine(); const emailField = form.register('email'); emailField.onChange('alex@test.com'); return form.getValues();"
              },
              {
                "id": 2,
                "name": "Validates field and records error message",
                "input": "password field fails length validator",
                "expected": {
                  "password": "Too short"
                },
                "testFn": "const form = createFormEngine(); const pass = form.register('password', val => val.length < 8 ? 'Too short' : null); pass.onChange('123'); return form.getErrors();"
              },
              {
                "id": 3,
                "name": "Accurately calculates overall form validity status",
                "input": "check isValid() when errors exist vs cleared",
                "expected": true,
                "testFn": "const form = createFormEngine(); const name = form.register('name', v => !v ? 'Required' : null); name.onChange('Antigravity'); return form.isValid();"
              }
            ],
            "solutionCode": "/**\n * Micro form engine utilizing uncontrolled ref subscriptions to eliminate re-renders.\n */\nfunction createFormEngine(initialValues = {}) {\n  const values = { ...initialValues };\n  const touched = new Set();\n  const errors = {};\n\n  return {\n    register(name, validator) {\n      return {\n        name,\n        onChange(val) {\n          values[name] = val;\n          touched.add(name);\n          if (validator) {\n            const err = validator(val);\n            if (err) errors[name] = err;\n            else delete errors[name];\n          }\n        },\n        onBlur() {\n          touched.add(name);\n        }\n      };\n    },\n    getValues() {\n      return { ...values };\n    },\n    getErrors() {\n      return { ...errors };\n    },\n    isValid() {\n      return Object.keys(errors).length === 0;\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "controlled-state-sync-basic",
          "title": "Universal Input Controller Sync",
          "difficulty": "Basic",
          "concept": "Props vs State Controlled-to-Uncontrolled Synchronization",
          "description": "Implement `createInputController({ value, defaultValue, onChange })` that correctly determines if an input is controlled (`value !== undefined`), manages an internal fallback state when uncontrolled, and synchronizes changes without triggering warnings.",
          "starterCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "If an input starts with value={undefined} and later receives a string, React logs: 'A component is changing an uncontrolled input to be controlled'. Setting defaultValue or an empty string fallback prevents this.",
          "testCases": [
            {
              "id": 1,
              "name": "Manages internal state when uncontrolled",
              "input": "uncontrolled input updates internal value",
              "expected": "Hello",
              "testFn": "const ctrl = createInputController({ defaultValue: '' }); ctrl.setValue('Hello'); return ctrl.getValue();"
            },
            {
              "id": 2,
              "name": "Defers to prop value when controlled",
              "input": "controlled input always returns prop value",
              "expected": "ControlledText",
              "testFn": "const ctrl = createInputController({ value: 'ControlledText' }); return ctrl.getValue();"
            },
            {
              "id": 3,
              "name": "Invokes onChange callback on value change",
              "input": "onChange triggered on setValue",
              "expected": "NewVal",
              "testFn": "let captured = ''; const ctrl = createInputController({ onChange: v => captured = v }); ctrl.setValue('NewVal'); return captured;"
            }
          ],
          "solutionCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  const isControlled = value !== undefined;\n  let internalValue = defaultValue;\n\n  return {\n    isControlled() {\n      return isControlled;\n    },\n    getValue() {\n      return isControlled ? value : internalValue;\n    },\n    setValue(nextVal) {\n      if (!isControlled) {\n        internalValue = nextVal;\n      }\n      if (typeof onChange === 'function') {\n        onChange(nextVal);\n      }\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "controlled-state-sync-basic",
            "title": "Universal Input Controller Sync",
            "difficulty": "Basic",
            "concept": "Props vs State Controlled-to-Uncontrolled Synchronization",
            "description": "Implement `createInputController({ value, defaultValue, onChange })` that correctly determines if an input is controlled (`value !== undefined`), manages an internal fallback state when uncontrolled, and synchronizes changes without triggering warnings.",
            "starterCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If an input starts with value={undefined} and later receives a string, React logs: 'A component is changing an uncontrolled input to be controlled'. Setting defaultValue or an empty string fallback prevents this.",
            "testCases": [
              {
                "id": 1,
                "name": "Manages internal state when uncontrolled",
                "input": "uncontrolled input updates internal value",
                "expected": "Hello",
                "testFn": "const ctrl = createInputController({ defaultValue: '' }); ctrl.setValue('Hello'); return ctrl.getValue();"
              },
              {
                "id": 2,
                "name": "Defers to prop value when controlled",
                "input": "controlled input always returns prop value",
                "expected": "ControlledText",
                "testFn": "const ctrl = createInputController({ value: 'ControlledText' }); return ctrl.getValue();"
              },
              {
                "id": 3,
                "name": "Invokes onChange callback on value change",
                "input": "onChange triggered on setValue",
                "expected": "NewVal",
                "testFn": "let captured = ''; const ctrl = createInputController({ onChange: v => captured = v }); ctrl.setValue('NewVal'); return captured;"
              }
            ],
            "solutionCode": "/**\n * Manages dual controlled/uncontrolled input state cleanly.\n */\nfunction createInputController({ value, defaultValue = '', onChange } = {}) {\n  const isControlled = value !== undefined;\n  let internalValue = defaultValue;\n\n  return {\n    isControlled() {\n      return isControlled;\n    },\n    getValue() {\n      return isControlled ? value : internalValue;\n    },\n    setValue(nextVal) {\n      if (!isControlled) {\n        internalValue = nextVal;\n      }\n      if (typeof onChange === 'function') {\n        onChange(nextVal);\n      }\n    }\n  };\n}\n"
          },
          {
            "id": "custom-use-controlled-medium",
            "title": "Custom useControlled State Hook (Radix / MUI Pattern)",
            "difficulty": "Medium",
            "concept": "Derived State & Controlled Prop Inversion",
            "description": "Implement `useControlledState({ controlled, default: defaultVal })` that mimics the standard pattern used in Radix UI and Material UI, returning `[currentValue, setValue]`.",
            "starterCode": "/**\n * Reusable controlled/uncontrolled state helper for polymorphic UI widgets.\n */\nfunction useControlledState({ controlled, default: defaultVal } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Components often need to be either controlled by a parent or self-contained. The useControlled pattern allows reusable UI widgets (accordion, modal, combobox) to support both flawlessly.",
            "testCases": [
              {
                "id": 1,
                "name": "Uncontrolled mode updates internal value",
                "input": "setState updates default state",
                "expected": "opened",
                "testFn": "const [val, setVal] = useControlledState({ default: 'closed' }); return setVal('opened');"
              },
              {
                "id": 2,
                "name": "Controlled mode reflects external prop value",
                "input": "controlled: 'fixed'",
                "expected": "fixed",
                "testFn": "const [val] = useControlledState({ controlled: 'fixed', default: 'ignored' }); return val;"
              },
              {
                "id": 3,
                "name": "Supports functional updater syntax",
                "input": "setVal(prev => prev + 1)",
                "expected": 6,
                "testFn": "const [val, setVal] = useControlledState({ default: 5 }); return setVal(prev => prev + 1);"
              }
            ],
            "solutionCode": "/**\n * Reusable controlled/uncontrolled state helper for polymorphic UI widgets.\n */\nfunction useControlledState({ controlled, default: defaultVal } = {}) {\n  const isControlled = controlled !== undefined;\n  let state = isControlled ? controlled : defaultVal;\n\n  function setState(updater) {\n    const nextVal = typeof updater === 'function' ? updater(state) : updater;\n    if (!isControlled) {\n      state = nextVal;\n    }\n    return nextVal;\n  }\n\n  return [state, setState];\n}\n"
          },
          {
            "id": "zero-rerender-form-hard",
            "title": "Zero Re-render Form State Engine (React Hook Form Core)",
            "difficulty": "Hard",
            "concept": "Uncontrolled Refs with Event Subscriptions for High-Performance Forms",
            "description": "Implement `createFormEngine(initialValues)` that registers input fields via refs, tracks touched and dirty states, validates fields without re-rendering parent components, and returns serialized values on submit.",
            "starterCode": "/**\n * Micro form engine utilizing uncontrolled ref subscriptions to eliminate re-renders.\n */\nfunction createFormEngine(initialValues = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Storing form values in top-level useState forces the entire form component tree to re-render on every keystroke. Using uncontrolled ref-based subscription isolated to inputs scales to thousands of inputs smoothly.",
            "testCases": [
              {
                "id": 1,
                "name": "Updates field value on change without external rerenders",
                "input": "email field updated to alex@test.com",
                "expected": {
                  "email": "alex@test.com"
                },
                "testFn": "const form = createFormEngine(); const emailField = form.register('email'); emailField.onChange('alex@test.com'); return form.getValues();"
              },
              {
                "id": 2,
                "name": "Validates field and records error message",
                "input": "password field fails length validator",
                "expected": {
                  "password": "Too short"
                },
                "testFn": "const form = createFormEngine(); const pass = form.register('password', val => val.length < 8 ? 'Too short' : null); pass.onChange('123'); return form.getErrors();"
              },
              {
                "id": 3,
                "name": "Accurately calculates overall form validity status",
                "input": "check isValid() when errors exist vs cleared",
                "expected": true,
                "testFn": "const form = createFormEngine(); const name = form.register('name', v => !v ? 'Required' : null); name.onChange('Antigravity'); return form.isValid();"
              }
            ],
            "solutionCode": "/**\n * Micro form engine utilizing uncontrolled ref subscriptions to eliminate re-renders.\n */\nfunction createFormEngine(initialValues = {}) {\n  const values = { ...initialValues };\n  const touched = new Set();\n  const errors = {};\n\n  return {\n    register(name, validator) {\n      return {\n        name,\n        onChange(val) {\n          values[name] = val;\n          touched.add(name);\n          if (validator) {\n            const err = validator(val);\n            if (err) errors[name] = err;\n            else delete errors[name];\n          }\n        },\n        onBlur() {\n          touched.add(name);\n        }\n      };\n    },\n    getValues() {\n      return { ...values };\n    },\n    getErrors() {\n      return { ...errors };\n    },\n    isValid() {\n      return Object.keys(errors).length === 0;\n    }\n  };\n}\n"
          }
        ]
      },
      {
        "id": "custom-hooks-reducer",
        "title": "Custom Hooks & State Reducer Pattern",
        "tag": "State Reducer",
        "summary": "Inversion of control with useReducer, action interceptors, state machines, and headless hook logic.",
        "mentalModel": "The State Reducer pattern allows the consumer of a custom hook to intercept and customize state transitions before they are committed, giving developers total control without modifying hook internals.",
        "traps": "Mutating state inside a reducer violates pure function rules and causes React to miss re-renders.",
        "challenges": {
          "Basic": {
            "id": "use-counter-constraints-basic",
            "title": "Bounded Counter Hook with Step & Clamp Constraints",
            "difficulty": "Basic",
            "concept": "Custom Hook Composition & State Guards",
            "description": "Implement `createCounter({ min, max, initial, step })` with `increment()`, `decrement()`, `reset()`, and `setValue(val)` ensuring the value is strictly clamped between `min` and `max`.",
            "starterCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to clamp the initial value or direct setValue input leads to invalid boundary violations in child consumers.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments and decrements within bounds",
                "input": "increment from 0 with step 5",
                "expected": 5,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 0, step: 5 }); return c.increment();"
              },
              {
                "id": 2,
                "name": "Clamps strictly at maximum threshold",
                "input": "incrementing past max limit",
                "expected": 10,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 8, step: 5 }); return c.increment();"
              },
              {
                "id": 3,
                "name": "Resets cleanly to initial value",
                "input": "modify value then call reset()",
                "expected": 2,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 2 }); c.setValue(9); c.reset(); return c.value;"
              }
            ],
            "solutionCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  let val = Math.min(Math.max(initial, min), max);\n\n  return {\n    get value() { return val; },\n    increment() {\n      val = Math.min(val + step, max);\n      return val;\n    },\n    decrement() {\n      val = Math.max(val - step, min);\n      return val;\n    },\n    setValue(next) {\n      val = Math.min(Math.max(next, min), max);\n      return val;\n    },\n    reset() {\n      val = Math.min(Math.max(initial, min), max);\n      return val;\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "use-undo-redo-medium",
            "title": "Undo/Redo State Machine with History Stack",
            "difficulty": "Medium",
            "concept": "Immutable History State Reducer",
            "description": "Implement `createUndoRedo(initialPresent)` supporting `set(newPresent)`, `undo()`, `redo()`, `canUndo()`, and `canRedo()`. Setting a new value clears the future stack.",
            "starterCode": "/**\n * Manages an immutable past/present/future history timeline.\n */\nfunction createUndoRedo(initialPresent) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A common bug is forgetting to clear the future/redo stack when a new mutation is made after an undo, resulting in corrupted parallel history timelines.",
            "testCases": [
              {
                "id": 1,
                "name": "Performs basic undo and restores previous state",
                "input": "set 1, set 2, undo()",
                "expected": 1,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.set(2); hist.undo(); return hist.present;"
              },
              {
                "id": 2,
                "name": "New mutation after undo clears the redo stack",
                "input": "undo, then set 3 -> canRedo must be false",
                "expected": false,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.set(99); return hist.canRedo();"
              },
              {
                "id": 3,
                "name": "Redo restores undone state",
                "input": "undo then redo",
                "expected": 1,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.redo(); return hist.present;"
              }
            ],
            "solutionCode": "/**\n * Manages an immutable past/present/future history timeline.\n */\nfunction createUndoRedo(initialPresent) {\n  let past = [];\n  let present = initialPresent;\n  let future = [];\n\n  return {\n    get present() { return present; },\n    set(newPresent) {\n      if (newPresent === present) return;\n      past.push(present);\n      present = newPresent;\n      future = []; // Clear redo stack on new action\n    },\n    undo() {\n      if (past.length === 0) return false;\n      future.unshift(present);\n      present = past.pop();\n      return true;\n    },\n    redo() {\n      if (future.length === 0) return false;\n      past.push(present);\n      present = future.shift();\n      return true;\n    },\n    canUndo() { return past.length > 0; },\n    canRedo() { return future.length > 0; }\n  };\n}\n"
          },
          "Hard": {
            "id": "state-reducer-inversion-hard",
            "title": "Inversion of Control via Custom State Reducer",
            "difficulty": "Hard",
            "concept": "State Reducer Pattern & Middleware Action Interception",
            "description": "Implement `createReducibleStore(baseReducer, initialState, customReducer)` where state transitions run through `customReducer(state, action, defaultNextState)` before updating, allowing callers to override or prevent specific actions.",
            "starterCode": "/**\n * Downshift-style State Reducer enabling consumer action overrides.\n */\nfunction createReducibleStore(baseReducer, initialState, customReducer) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The State Reducer pattern (popularized by Downshift) empowers library users to block specific internal actions (e.g. preventing a dropdown from closing on Enter) without forking the component.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes default reducer transitions normally",
                "input": "dispatch INCREMENT",
                "expected": {
                  "count": 1
                },
                "testFn": "const base = (s, a) => a.type === 'INC' ? { count: s.count + 1 } : s; const store = createReducibleStore(base, { count: 0 }); store.dispatch({ type: 'INC' }); return store.getState();"
              },
              {
                "id": 2,
                "name": "User custom reducer intercepts and overrides specific actions",
                "input": "custom reducer blocks decrement below zero",
                "expected": {
                  "count": 0
                },
                "testFn": "const base = (s, a) => a.type === 'DEC' ? { count: s.count - 1 } : s; const custom = (s, a, next) => next.count < 0 ? s : next; const store = createReducibleStore(base, { count: 0 }, custom); store.dispatch({ type: 'DEC' }); return store.getState();"
              },
              {
                "id": 3,
                "name": "Preserves state identity when actions are blocked",
                "input": "verify state object reference equality when action is prevented",
                "expected": true,
                "testFn": "const base = (s) => ({ ...s }); const custom = (s) => s; const initial = { val: 1 }; const store = createReducibleStore(base, initial, custom); store.dispatch({ type: 'TEST' }); return store.getState() === initial;"
              }
            ],
            "solutionCode": "/**\n * Downshift-style State Reducer enabling consumer action overrides.\n */\nfunction createReducibleStore(baseReducer, initialState, customReducer) {\n  let state = initialState;\n\n  return {\n    getState() { return state; },\n    dispatch(action) {\n      const defaultNextState = baseReducer(state, action);\n      if (typeof customReducer === 'function') {\n        state = customReducer(state, action, defaultNextState);\n      } else {\n        state = defaultNextState;\n      }\n      return state;\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "use-counter-constraints-basic",
          "title": "Bounded Counter Hook with Step & Clamp Constraints",
          "difficulty": "Basic",
          "concept": "Custom Hook Composition & State Guards",
          "description": "Implement `createCounter({ min, max, initial, step })` with `increment()`, `decrement()`, `reset()`, and `setValue(val)` ensuring the value is strictly clamped between `min` and `max`.",
          "starterCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Failing to clamp the initial value or direct setValue input leads to invalid boundary violations in child consumers.",
          "testCases": [
            {
              "id": 1,
              "name": "Increments and decrements within bounds",
              "input": "increment from 0 with step 5",
              "expected": 5,
              "testFn": "const c = createCounter({ min: 0, max: 10, initial: 0, step: 5 }); return c.increment();"
            },
            {
              "id": 2,
              "name": "Clamps strictly at maximum threshold",
              "input": "incrementing past max limit",
              "expected": 10,
              "testFn": "const c = createCounter({ min: 0, max: 10, initial: 8, step: 5 }); return c.increment();"
            },
            {
              "id": 3,
              "name": "Resets cleanly to initial value",
              "input": "modify value then call reset()",
              "expected": 2,
              "testFn": "const c = createCounter({ min: 0, max: 10, initial: 2 }); c.setValue(9); c.reset(); return c.value;"
            }
          ],
          "solutionCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  let val = Math.min(Math.max(initial, min), max);\n\n  return {\n    get value() { return val; },\n    increment() {\n      val = Math.min(val + step, max);\n      return val;\n    },\n    decrement() {\n      val = Math.max(val - step, min);\n      return val;\n    },\n    setValue(next) {\n      val = Math.min(Math.max(next, min), max);\n      return val;\n    },\n    reset() {\n      val = Math.min(Math.max(initial, min), max);\n      return val;\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "use-counter-constraints-basic",
            "title": "Bounded Counter Hook with Step & Clamp Constraints",
            "difficulty": "Basic",
            "concept": "Custom Hook Composition & State Guards",
            "description": "Implement `createCounter({ min, max, initial, step })` with `increment()`, `decrement()`, `reset()`, and `setValue(val)` ensuring the value is strictly clamped between `min` and `max`.",
            "starterCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to clamp the initial value or direct setValue input leads to invalid boundary violations in child consumers.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments and decrements within bounds",
                "input": "increment from 0 with step 5",
                "expected": 5,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 0, step: 5 }); return c.increment();"
              },
              {
                "id": 2,
                "name": "Clamps strictly at maximum threshold",
                "input": "incrementing past max limit",
                "expected": 10,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 8, step: 5 }); return c.increment();"
              },
              {
                "id": 3,
                "name": "Resets cleanly to initial value",
                "input": "modify value then call reset()",
                "expected": 2,
                "testFn": "const c = createCounter({ min: 0, max: 10, initial: 2 }); c.setValue(9); c.reset(); return c.value;"
              }
            ],
            "solutionCode": "/**\n * Creates a bounded counter state manager respecting min/max clamps.\n */\nfunction createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {\n  let val = Math.min(Math.max(initial, min), max);\n\n  return {\n    get value() { return val; },\n    increment() {\n      val = Math.min(val + step, max);\n      return val;\n    },\n    decrement() {\n      val = Math.max(val - step, min);\n      return val;\n    },\n    setValue(next) {\n      val = Math.min(Math.max(next, min), max);\n      return val;\n    },\n    reset() {\n      val = Math.min(Math.max(initial, min), max);\n      return val;\n    }\n  };\n}\n"
          },
          {
            "id": "use-undo-redo-medium",
            "title": "Undo/Redo State Machine with History Stack",
            "difficulty": "Medium",
            "concept": "Immutable History State Reducer",
            "description": "Implement `createUndoRedo(initialPresent)` supporting `set(newPresent)`, `undo()`, `redo()`, `canUndo()`, and `canRedo()`. Setting a new value clears the future stack.",
            "starterCode": "/**\n * Manages an immutable past/present/future history timeline.\n */\nfunction createUndoRedo(initialPresent) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A common bug is forgetting to clear the future/redo stack when a new mutation is made after an undo, resulting in corrupted parallel history timelines.",
            "testCases": [
              {
                "id": 1,
                "name": "Performs basic undo and restores previous state",
                "input": "set 1, set 2, undo()",
                "expected": 1,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.set(2); hist.undo(); return hist.present;"
              },
              {
                "id": 2,
                "name": "New mutation after undo clears the redo stack",
                "input": "undo, then set 3 -> canRedo must be false",
                "expected": false,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.set(99); return hist.canRedo();"
              },
              {
                "id": 3,
                "name": "Redo restores undone state",
                "input": "undo then redo",
                "expected": 1,
                "testFn": "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.redo(); return hist.present;"
              }
            ],
            "solutionCode": "/**\n * Manages an immutable past/present/future history timeline.\n */\nfunction createUndoRedo(initialPresent) {\n  let past = [];\n  let present = initialPresent;\n  let future = [];\n\n  return {\n    get present() { return present; },\n    set(newPresent) {\n      if (newPresent === present) return;\n      past.push(present);\n      present = newPresent;\n      future = []; // Clear redo stack on new action\n    },\n    undo() {\n      if (past.length === 0) return false;\n      future.unshift(present);\n      present = past.pop();\n      return true;\n    },\n    redo() {\n      if (future.length === 0) return false;\n      past.push(present);\n      present = future.shift();\n      return true;\n    },\n    canUndo() { return past.length > 0; },\n    canRedo() { return future.length > 0; }\n  };\n}\n"
          },
          {
            "id": "state-reducer-inversion-hard",
            "title": "Inversion of Control via Custom State Reducer",
            "difficulty": "Hard",
            "concept": "State Reducer Pattern & Middleware Action Interception",
            "description": "Implement `createReducibleStore(baseReducer, initialState, customReducer)` where state transitions run through `customReducer(state, action, defaultNextState)` before updating, allowing callers to override or prevent specific actions.",
            "starterCode": "/**\n * Downshift-style State Reducer enabling consumer action overrides.\n */\nfunction createReducibleStore(baseReducer, initialState, customReducer) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The State Reducer pattern (popularized by Downshift) empowers library users to block specific internal actions (e.g. preventing a dropdown from closing on Enter) without forking the component.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes default reducer transitions normally",
                "input": "dispatch INCREMENT",
                "expected": {
                  "count": 1
                },
                "testFn": "const base = (s, a) => a.type === 'INC' ? { count: s.count + 1 } : s; const store = createReducibleStore(base, { count: 0 }); store.dispatch({ type: 'INC' }); return store.getState();"
              },
              {
                "id": 2,
                "name": "User custom reducer intercepts and overrides specific actions",
                "input": "custom reducer blocks decrement below zero",
                "expected": {
                  "count": 0
                },
                "testFn": "const base = (s, a) => a.type === 'DEC' ? { count: s.count - 1 } : s; const custom = (s, a, next) => next.count < 0 ? s : next; const store = createReducibleStore(base, { count: 0 }, custom); store.dispatch({ type: 'DEC' }); return store.getState();"
              },
              {
                "id": 3,
                "name": "Preserves state identity when actions are blocked",
                "input": "verify state object reference equality when action is prevented",
                "expected": true,
                "testFn": "const base = (s) => ({ ...s }); const custom = (s) => s; const initial = { val: 1 }; const store = createReducibleStore(base, initial, custom); store.dispatch({ type: 'TEST' }); return store.getState() === initial;"
              }
            ],
            "solutionCode": "/**\n * Downshift-style State Reducer enabling consumer action overrides.\n */\nfunction createReducibleStore(baseReducer, initialState, customReducer) {\n  let state = initialState;\n\n  return {\n    getState() { return state; },\n    dispatch(action) {\n      const defaultNextState = baseReducer(state, action);\n      if (typeof customReducer === 'function') {\n        state = customReducer(state, action, defaultNextState);\n      } else {\n        state = defaultNextState;\n      }\n      return state;\n    }\n  };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "suspense-error-boundaries-ssr",
    "category": "7. Suspense, Error Boundaries & Streaming SSR",
    "badge": "Suspense & Server",
    "description": "Master Promise throwing suspension, error boundaries, streaming SSR, and Selective Hydration.",
    "topics": [
      {
        "id": "suspense-error-boundaries",
        "title": "Suspense Internals & Error Boundaries",
        "tag": "Suspense",
        "summary": "Promise suspension protocol, componentDidCatch, getDerivedStateFromError, fallback boundaries, and recovery.",
        "mentalModel": "When a component suspends, it throws a Promise up the Fiber tree. React catches the promise, pauses the render phase for that branch, renders the nearest Suspense fallback, and resumes when the promise resolves.",
        "traps": "Suspense cannot catch errors inside event handlers or setTimeout. Calling wrapPromise inside the render function creates a new promise every render, causing infinite suspend loops.",
        "challenges": {
          "Basic": {
            "id": "suspense-resource-wrapper-basic",
            "title": "Suspense Resource Promise Wrapper (wrapPromise)",
            "difficulty": "Basic",
            "concept": "Suspense Protocol: Throwing Promises on Pending State",
            "description": "Implement `wrapPromise(promise)` that returns an object with a `read()` method. If the promise is pending, `read()` MUST throw the promise itself. If rejected, it throws the error. If resolved, it returns the resolved data.",
            "starterCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Throwing a promise is how React Suspense detects async loading. If wrapPromise is instantiated inside the render body instead of cached, a new Promise is created on every render, locking the UI in an infinite suspension loop.",
            "testCases": [
              {
                "id": 1,
                "name": "Throws the suspender promise while pending",
                "input": "resource.read() on pending promise throws Promise",
                "expected": true,
                "testFn": "const p = new Promise(() => {}); const resource = wrapPromise(p); try { resource.read(); return false; } catch (thrown) { return thrown instanceof Promise; }"
              },
              {
                "id": 2,
                "name": "Returns data synchronously once resolved",
                "input": "resource.read() after promise resolution",
                "expected": "DataLoaded",
                "testFn": "const p = Promise.resolve('DataLoaded'); const resource = wrapPromise(p); return p.then(() => resource.read());"
              },
              {
                "id": 3,
                "name": "Throws error when rejected",
                "input": "resource.read() on rejected promise",
                "expected": "NetworkFail",
                "testFn": "const p = Promise.reject(new Error('NetworkFail')); const resource = wrapPromise(p); return p.catch(() => {}).then(() => { try { resource.read(); return false; } catch (e) { return e.message; } });"
              }
            ],
            "solutionCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  let status = 'pending';\n  let result;\n  const suspender = promise.then(\n    res => {\n      status = 'success';\n      result = res;\n    },\n    err => {\n      status = 'error';\n      result = err;\n    }\n  );\n\n  return {\n    read() {\n      if (status === 'pending') {\n        throw suspender;\n      } else if (status === 'error') {\n        throw result;\n      } else if (status === 'success') {\n        return result;\n      }\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "resilient-error-boundary-medium",
            "title": "Resilient Error Boundary State Machine with Reset Trigger",
            "difficulty": "Medium",
            "concept": "Error Boundary Lifecycle & Recovery Coordination",
            "description": "Implement `createErrorBoundaryManager({ fallbackRenderer, onError })` that intercepts component exceptions, transitions to an error state with the captured error info, and provides a `reset()` method to restore normal rendering.",
            "starterCode": "/**\n * Simulates the Error Boundary state lifecycle and recovery mechanics.\n */\nfunction createErrorBoundaryManager({ fallbackRenderer, onError } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Error boundaries do NOT catch errors in: event handlers, asynchronous code (setTimeout), server-side rendering, or errors thrown in the error boundary itself.",
            "testCases": [
              {
                "id": 1,
                "name": "Catches runtime error and activates fallback renderer",
                "input": "catchError then render",
                "expected": "Fallback: Crash",
                "testFn": "const eb = createErrorBoundaryManager({ fallbackRenderer: (err) => 'Fallback: ' + err.message }); eb.catchError(new Error('Crash')); return eb.render(() => 'Child');"
              },
              {
                "id": 2,
                "name": "Reset method clears error state and restores child renderer",
                "input": "reset restores child rendering",
                "expected": "ChildHealthy",
                "testFn": "const eb = createErrorBoundaryManager({ fallbackRenderer: (err, reset) => { reset(); return 'resetting'; } }); eb.catchError(new Error('Crash')); eb.reset(); return eb.render(() => 'ChildHealthy');"
              },
              {
                "id": 3,
                "name": "Invokes onError callback with diagnostic error",
                "input": "captured error passed to onError",
                "expected": "LoggedError",
                "testFn": "let logged = ''; const eb = createErrorBoundaryManager({ onError: e => logged = e.message }); eb.catchError(new Error('LoggedError')); return logged;"
              }
            ],
            "solutionCode": "/**\n * Simulates the Error Boundary state lifecycle and recovery mechanics.\n */\nfunction createErrorBoundaryManager({ fallbackRenderer, onError } = {}) {\n  let state = { hasError: false, error: null };\n\n  return {\n    getState() { return state; },\n    catchError(error) {\n      state = { hasError: true, error };\n      if (typeof onError === 'function') onError(error);\n    },\n    reset() {\n      state = { hasError: false, error: null };\n    },\n    render(childRenderer) {\n      if (state.hasError) {\n        return fallbackRenderer ? fallbackRenderer(state.error, () => this.reset()) : null;\n      }\n      return childRenderer();\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "suspense-cache-dedup-hard",
            "title": "Concurrent Suspense Resource Cache with Deduplication",
            "difficulty": "Hard",
            "concept": "Resource Keying, Concurrent Request Deduplication & Invalidation",
            "description": "Implement `createSuspenseCache()` with `get(key, fetcher)` that deduplicates in-flight promises across concurrent suspended components, caches resolved results, and supports selective `invalidate(key)`.",
            "starterCode": "/**\n * Shared Suspense resource cache with concurrent promise deduplication.\n */\nfunction createSuspenseCache() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Without request deduplication in a shared Suspense cache, three child components suspending on the same user ID will fire three redundant network requests simultaneously.",
            "testCases": [
              {
                "id": 1,
                "name": "Deduplicates multiple calls for identical key to single fetch invocation",
                "input": "two calls to cache.get('u1')",
                "expected": 1,
                "testFn": "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.get('u1', fetcher); return fetches;"
              },
              {
                "id": 2,
                "name": "Invalidation causes subsequent call to fetch fresh data",
                "input": "invalidate('u1') forces re-fetch",
                "expected": 2,
                "testFn": "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.invalidate('u1'); cache.get('u1', fetcher); return fetches;"
              },
              {
                "id": 3,
                "name": "Suspends correctly on pending record",
                "input": "record.read() throws pending promise",
                "expected": true,
                "testFn": "const cache = createSuspenseCache(); const record = cache.get('u2', () => new Promise(() => {})); try { record.read(); return false; } catch (p) { return p instanceof Promise; }"
              }
            ],
            "solutionCode": "/**\n * Shared Suspense resource cache with concurrent promise deduplication.\n */\nfunction createSuspenseCache() {\n  const cache = new Map();\n\n  return {\n    get(key, fetcher) {\n      if (cache.has(key)) {\n        return cache.get(key);\n      }\n      const record = { status: 'pending', value: null, promise: null };\n      record.promise = fetcher()\n        .then(val => {\n          record.status = 'success';\n          record.value = val;\n        })\n        .catch(err => {\n          record.status = 'error';\n          record.value = err;\n        });\n\n      record.read = function() {\n        if (record.status === 'pending') throw record.promise;\n        if (record.status === 'error') throw record.value;\n        return record.value;\n      };\n\n      cache.set(key, record);\n      return record;\n    },\n    invalidate(key) {\n      cache.delete(key);\n    },\n    clear() {\n      cache.clear();\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "suspense-resource-wrapper-basic",
          "title": "Suspense Resource Promise Wrapper (wrapPromise)",
          "difficulty": "Basic",
          "concept": "Suspense Protocol: Throwing Promises on Pending State",
          "description": "Implement `wrapPromise(promise)` that returns an object with a `read()` method. If the promise is pending, `read()` MUST throw the promise itself. If rejected, it throws the error. If resolved, it returns the resolved data.",
          "starterCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Throwing a promise is how React Suspense detects async loading. If wrapPromise is instantiated inside the render body instead of cached, a new Promise is created on every render, locking the UI in an infinite suspension loop.",
          "testCases": [
            {
              "id": 1,
              "name": "Throws the suspender promise while pending",
              "input": "resource.read() on pending promise throws Promise",
              "expected": true,
              "testFn": "const p = new Promise(() => {}); const resource = wrapPromise(p); try { resource.read(); return false; } catch (thrown) { return thrown instanceof Promise; }"
            },
            {
              "id": 2,
              "name": "Returns data synchronously once resolved",
              "input": "resource.read() after promise resolution",
              "expected": "DataLoaded",
              "testFn": "const p = Promise.resolve('DataLoaded'); const resource = wrapPromise(p); return p.then(() => resource.read());"
            },
            {
              "id": 3,
              "name": "Throws error when rejected",
              "input": "resource.read() on rejected promise",
              "expected": "NetworkFail",
              "testFn": "const p = Promise.reject(new Error('NetworkFail')); const resource = wrapPromise(p); return p.catch(() => {}).then(() => { try { resource.read(); return false; } catch (e) { return e.message; } });"
            }
          ],
          "solutionCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  let status = 'pending';\n  let result;\n  const suspender = promise.then(\n    res => {\n      status = 'success';\n      result = res;\n    },\n    err => {\n      status = 'error';\n      result = err;\n    }\n  );\n\n  return {\n    read() {\n      if (status === 'pending') {\n        throw suspender;\n      } else if (status === 'error') {\n        throw result;\n      } else if (status === 'success') {\n        return result;\n      }\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "suspense-resource-wrapper-basic",
            "title": "Suspense Resource Promise Wrapper (wrapPromise)",
            "difficulty": "Basic",
            "concept": "Suspense Protocol: Throwing Promises on Pending State",
            "description": "Implement `wrapPromise(promise)` that returns an object with a `read()` method. If the promise is pending, `read()` MUST throw the promise itself. If rejected, it throws the error. If resolved, it returns the resolved data.",
            "starterCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Throwing a promise is how React Suspense detects async loading. If wrapPromise is instantiated inside the render body instead of cached, a new Promise is created on every render, locking the UI in an infinite suspension loop.",
            "testCases": [
              {
                "id": 1,
                "name": "Throws the suspender promise while pending",
                "input": "resource.read() on pending promise throws Promise",
                "expected": true,
                "testFn": "const p = new Promise(() => {}); const resource = wrapPromise(p); try { resource.read(); return false; } catch (thrown) { return thrown instanceof Promise; }"
              },
              {
                "id": 2,
                "name": "Returns data synchronously once resolved",
                "input": "resource.read() after promise resolution",
                "expected": "DataLoaded",
                "testFn": "const p = Promise.resolve('DataLoaded'); const resource = wrapPromise(p); return p.then(() => resource.read());"
              },
              {
                "id": 3,
                "name": "Throws error when rejected",
                "input": "resource.read() on rejected promise",
                "expected": "NetworkFail",
                "testFn": "const p = Promise.reject(new Error('NetworkFail')); const resource = wrapPromise(p); return p.catch(() => {}).then(() => { try { resource.read(); return false; } catch (e) { return e.message; } });"
              }
            ],
            "solutionCode": "/**\n * Converts a native Promise into a React Suspense-compatible resource.\n */\nfunction wrapPromise(promise) {\n  let status = 'pending';\n  let result;\n  const suspender = promise.then(\n    res => {\n      status = 'success';\n      result = res;\n    },\n    err => {\n      status = 'error';\n      result = err;\n    }\n  );\n\n  return {\n    read() {\n      if (status === 'pending') {\n        throw suspender;\n      } else if (status === 'error') {\n        throw result;\n      } else if (status === 'success') {\n        return result;\n      }\n    }\n  };\n}\n"
          },
          {
            "id": "resilient-error-boundary-medium",
            "title": "Resilient Error Boundary State Machine with Reset Trigger",
            "difficulty": "Medium",
            "concept": "Error Boundary Lifecycle & Recovery Coordination",
            "description": "Implement `createErrorBoundaryManager({ fallbackRenderer, onError })` that intercepts component exceptions, transitions to an error state with the captured error info, and provides a `reset()` method to restore normal rendering.",
            "starterCode": "/**\n * Simulates the Error Boundary state lifecycle and recovery mechanics.\n */\nfunction createErrorBoundaryManager({ fallbackRenderer, onError } = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Error boundaries do NOT catch errors in: event handlers, asynchronous code (setTimeout), server-side rendering, or errors thrown in the error boundary itself.",
            "testCases": [
              {
                "id": 1,
                "name": "Catches runtime error and activates fallback renderer",
                "input": "catchError then render",
                "expected": "Fallback: Crash",
                "testFn": "const eb = createErrorBoundaryManager({ fallbackRenderer: (err) => 'Fallback: ' + err.message }); eb.catchError(new Error('Crash')); return eb.render(() => 'Child');"
              },
              {
                "id": 2,
                "name": "Reset method clears error state and restores child renderer",
                "input": "reset restores child rendering",
                "expected": "ChildHealthy",
                "testFn": "const eb = createErrorBoundaryManager({ fallbackRenderer: (err, reset) => { reset(); return 'resetting'; } }); eb.catchError(new Error('Crash')); eb.reset(); return eb.render(() => 'ChildHealthy');"
              },
              {
                "id": 3,
                "name": "Invokes onError callback with diagnostic error",
                "input": "captured error passed to onError",
                "expected": "LoggedError",
                "testFn": "let logged = ''; const eb = createErrorBoundaryManager({ onError: e => logged = e.message }); eb.catchError(new Error('LoggedError')); return logged;"
              }
            ],
            "solutionCode": "/**\n * Simulates the Error Boundary state lifecycle and recovery mechanics.\n */\nfunction createErrorBoundaryManager({ fallbackRenderer, onError } = {}) {\n  let state = { hasError: false, error: null };\n\n  return {\n    getState() { return state; },\n    catchError(error) {\n      state = { hasError: true, error };\n      if (typeof onError === 'function') onError(error);\n    },\n    reset() {\n      state = { hasError: false, error: null };\n    },\n    render(childRenderer) {\n      if (state.hasError) {\n        return fallbackRenderer ? fallbackRenderer(state.error, () => this.reset()) : null;\n      }\n      return childRenderer();\n    }\n  };\n}\n"
          },
          {
            "id": "suspense-cache-dedup-hard",
            "title": "Concurrent Suspense Resource Cache with Deduplication",
            "difficulty": "Hard",
            "concept": "Resource Keying, Concurrent Request Deduplication & Invalidation",
            "description": "Implement `createSuspenseCache()` with `get(key, fetcher)` that deduplicates in-flight promises across concurrent suspended components, caches resolved results, and supports selective `invalidate(key)`.",
            "starterCode": "/**\n * Shared Suspense resource cache with concurrent promise deduplication.\n */\nfunction createSuspenseCache() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Without request deduplication in a shared Suspense cache, three child components suspending on the same user ID will fire three redundant network requests simultaneously.",
            "testCases": [
              {
                "id": 1,
                "name": "Deduplicates multiple calls for identical key to single fetch invocation",
                "input": "two calls to cache.get('u1')",
                "expected": 1,
                "testFn": "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.get('u1', fetcher); return fetches;"
              },
              {
                "id": 2,
                "name": "Invalidation causes subsequent call to fetch fresh data",
                "input": "invalidate('u1') forces re-fetch",
                "expected": 2,
                "testFn": "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.invalidate('u1'); cache.get('u1', fetcher); return fetches;"
              },
              {
                "id": 3,
                "name": "Suspends correctly on pending record",
                "input": "record.read() throws pending promise",
                "expected": true,
                "testFn": "const cache = createSuspenseCache(); const record = cache.get('u2', () => new Promise(() => {})); try { record.read(); return false; } catch (p) { return p instanceof Promise; }"
              }
            ],
            "solutionCode": "/**\n * Shared Suspense resource cache with concurrent promise deduplication.\n */\nfunction createSuspenseCache() {\n  const cache = new Map();\n\n  return {\n    get(key, fetcher) {\n      if (cache.has(key)) {\n        return cache.get(key);\n      }\n      const record = { status: 'pending', value: null, promise: null };\n      record.promise = fetcher()\n        .then(val => {\n          record.status = 'success';\n          record.value = val;\n        })\n        .catch(err => {\n          record.status = 'error';\n          record.value = err;\n        });\n\n      record.read = function() {\n        if (record.status === 'pending') throw record.promise;\n        if (record.status === 'error') throw record.value;\n        return record.value;\n      };\n\n      cache.set(key, record);\n      return record;\n    },\n    invalidate(key) {\n      cache.delete(key);\n    },\n    clear() {\n      cache.clear();\n    }\n  };\n}\n"
          }
        ]
      },
      {
        "id": "rsc-streaming-hydration",
        "title": "React Server Components (RSC) & Streaming Hydration",
        "tag": "RSC & SSR",
        "summary": "RSC flight data wire format, Server vs Client boundary, module references, and Selective Hydration.",
        "mentalModel": "React Server Components execute strictly on the server and stream a JSON-like Flight wire format (not HTML, not JS bundle). Client components are represented as module references ($L/esm) that hydrate selectively.",
        "traps": "Passing non-serializable values (functions, class instances) across the RSC boundary throws serialization errors.",
        "challenges": {
          "Basic": {
            "id": "rsc-flight-parser-basic",
            "title": "RSC Flight Wire Format Parser",
            "difficulty": "Basic",
            "concept": "RSC Serialization Protocol & Client Reference Deserialization",
            "description": "Implement `parseRscFlightPayload(wireText)` that parses RSC stream chunks into an element dictionary.",
            "starterCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "RSC does not replace SSR. SSR sends initial static HTML for fast First Contentful Paint. RSC sends an interactive component model that avoids bundling server dependencies into the client JavaScript bundle.",
            "testCases": [
              {
                "id": 1,
                "name": "Parses single flight chunk",
                "input": "0:{\"type\":\"div\"}",
                "expected": {
                  "0": {
                    "type": "div"
                  }
                },
                "testFn": "return parseRscFlightPayload('0:{\"type\":\"div\"}');"
              },
              {
                "id": 2,
                "name": "Parses multiple indexed flight chunks across newlines",
                "input": "0:{\"a\":1}\\n1:{\"b\":2}",
                "expected": {
                  "0": {
                    "a": 1
                  },
                  "1": {
                    "b": 2
                  }
                },
                "testFn": "return parseRscFlightPayload(['0:{\"a\":1}', '1:{\"b\":2}'].join(String.fromCharCode(10)));"
              },
              {
                "id": 3,
                "name": "Correctly parses client module reference string tokens",
                "input": "M1:\"$LClient\"",
                "expected": "$LClient",
                "testFn": "const res = parseRscFlightPayload('M1:\"$LClient\"'); return res.M1;"
              }
            ],
            "solutionCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  const lines = wireText.trim().split(/[\\r\\n]+/);\n  const chunks = {};\n\n  for (const line of lines) {\n    const colonIdx = line.indexOf(':');\n    if (colonIdx === -1) continue;\n    const id = line.slice(0, colonIdx);\n    const jsonStr = line.slice(colonIdx + 1);\n    chunks[id] = JSON.parse(jsonStr);\n  }\n\n  return chunks;\n}\n"
          },
          "Medium": {
            "id": "selective-hydration-queue-medium",
            "title": "Selective Hydration Priority Queue Simulator",
            "difficulty": "Medium",
            "concept": "Event-Driven Hydration Prioritization (React 18 Selective Hydration)",
            "description": "Implement `createHydrationScheduler(chunks)` that hydrates chunks in background order unless a user click event occurs on a specific chunk, which immediately elevates that chunk to the front of the hydration queue.",
            "starterCode": "/**\n * Simulates React 18 event-driven selective hydration prioritization.\n */\nfunction createHydrationScheduler(initialChunks = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In traditional SSR, the user must wait for the entire page to hydrate before any button responds. React 18 Selective Hydration intercepts clicks on un-hydrated islands and hydrates them synchronously before dispatching the event.",
            "testCases": [
              {
                "id": 1,
                "name": "Hydrates chunks in sequential queue order by default",
                "input": "hydrateNext from ['c1', 'c2']",
                "expected": "c1",
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2']); return sched.hydrateNext();"
              },
              {
                "id": 2,
                "name": "User interaction jumps chunk to front of hydration queue",
                "input": "click on c3 moves it ahead of c1 and c2",
                "expected": "c3",
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2', 'c3']); sched.userInteractedWith('c3'); return sched.hydrateNext();"
              },
              {
                "id": 3,
                "name": "Correctly records and tracks hydrated chunks",
                "input": "isHydrated('c1') after hydrateNext()",
                "expected": true,
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2']); sched.hydrateNext(); return sched.isHydrated('c1');"
              }
            ],
            "solutionCode": "/**\n * Simulates React 18 event-driven selective hydration prioritization.\n */\nfunction createHydrationScheduler(initialChunks = []) {\n  let queue = [...initialChunks];\n  const hydrated = new Set();\n\n  return {\n    userInteractedWith(chunkId) {\n      const idx = queue.indexOf(chunkId);\n      if (idx > -1) {\n        queue.splice(idx, 1);\n        queue.unshift(chunkId);\n      }\n    },\n    hydrateNext() {\n      if (queue.length === 0) return null;\n      const next = queue.shift();\n      hydrated.add(next);\n      return next;\n    },\n    getPending() { return [...queue]; },\n    isHydrated(chunkId) { return hydrated.has(chunkId); }\n  };\n}\n"
          },
          "Hard": {
            "id": "rsc-boundary-serialization-hard",
            "title": "RSC Server-to-Client Boundary Serialization Validator",
            "difficulty": "Hard",
            "concept": "Boundary Serialization Rules & Non-Serializable Props Rejection",
            "description": "Implement `validateRscBoundaryProps(props)` that recursively inspects props passed to a Client Component from a Server Component. It must return `{ valid: true }` for JSON-serializable primitives/arrays/objects and throw a descriptive TypeError if a function or non-serializable symbol is detected.",
            "starterCode": "/**\n * Validates props passed across the React Server Component boundary.\n */\nfunction validateRscBoundaryProps(props) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "You cannot pass an onClick handler function from a Server Component to a Client Component because Server Components cannot send executable JavaScript across the network wire.",
            "testCases": [
              {
                "id": 1,
                "name": "Validates JSON-serializable data structures cleanly",
                "input": "{ title: 'Hello', count: 42, tags: ['a', 'b'] }",
                "expected": true,
                "testFn": "return validateRscBoundaryProps({ title: 'Hello', count: 42, tags: ['a', 'b'] }).valid;"
              },
              {
                "id": 2,
                "name": "Throws TypeError when passing functions across boundary",
                "input": "{ onClick: () => {} }",
                "expected": "Cannot pass function across Server-to-Client boundary at prop: onClick",
                "testFn": "try { validateRscBoundaryProps({ onClick: () => {} }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Detects deeply nested non-serializable properties with exact path",
                "input": "{ config: { callback: fn } }",
                "expected": "Cannot pass function across Server-to-Client boundary at prop: config.callback",
                "testFn": "try { validateRscBoundaryProps({ config: { callback: () => {} } }); return 'no-error'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "/**\n * Validates props passed across the React Server Component boundary.\n */\nfunction validateRscBoundaryProps(props) {\n  function check(val, path) {\n    if (val === null || val === undefined) return;\n    if (typeof val === 'function') {\n      throw new TypeError('Cannot pass function across Server-to-Client boundary at prop: ' + path);\n    }\n    if (typeof val === 'symbol') {\n      throw new TypeError('Cannot pass symbol across Server-to-Client boundary at prop: ' + path);\n    }\n    if (typeof val === 'object') {\n      for (const [k, v] of Object.entries(val)) {\n        check(v, path ? path + '.' + k : k);\n      }\n    }\n  }\n\n  check(props, '');\n  return { valid: true };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "rsc-flight-parser-basic",
          "title": "RSC Flight Wire Format Parser",
          "difficulty": "Basic",
          "concept": "RSC Serialization Protocol & Client Reference Deserialization",
          "description": "Implement `parseRscFlightPayload(wireText)` that parses RSC stream chunks into an element dictionary.",
          "starterCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "RSC does not replace SSR. SSR sends initial static HTML for fast First Contentful Paint. RSC sends an interactive component model that avoids bundling server dependencies into the client JavaScript bundle.",
          "testCases": [
            {
              "id": 1,
              "name": "Parses single flight chunk",
              "input": "0:{\"type\":\"div\"}",
              "expected": {
                "0": {
                  "type": "div"
                }
              },
              "testFn": "return parseRscFlightPayload('0:{\"type\":\"div\"}');"
            },
            {
              "id": 2,
              "name": "Parses multiple indexed flight chunks across newlines",
              "input": "0:{\"a\":1}\\n1:{\"b\":2}",
              "expected": {
                "0": {
                  "a": 1
                },
                "1": {
                  "b": 2
                }
              },
              "testFn": "return parseRscFlightPayload(['0:{\"a\":1}', '1:{\"b\":2}'].join(String.fromCharCode(10)));"
            },
            {
              "id": 3,
              "name": "Correctly parses client module reference string tokens",
              "input": "M1:\"$LClient\"",
              "expected": "$LClient",
              "testFn": "const res = parseRscFlightPayload('M1:\"$LClient\"'); return res.M1;"
            }
          ],
          "solutionCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  const lines = wireText.trim().split(/[\\r\\n]+/);\n  const chunks = {};\n\n  for (const line of lines) {\n    const colonIdx = line.indexOf(':');\n    if (colonIdx === -1) continue;\n    const id = line.slice(0, colonIdx);\n    const jsonStr = line.slice(colonIdx + 1);\n    chunks[id] = JSON.parse(jsonStr);\n  }\n\n  return chunks;\n}\n"
        },
        "questions": [
          {
            "id": "rsc-flight-parser-basic",
            "title": "RSC Flight Wire Format Parser",
            "difficulty": "Basic",
            "concept": "RSC Serialization Protocol & Client Reference Deserialization",
            "description": "Implement `parseRscFlightPayload(wireText)` that parses RSC stream chunks into an element dictionary.",
            "starterCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "RSC does not replace SSR. SSR sends initial static HTML for fast First Contentful Paint. RSC sends an interactive component model that avoids bundling server dependencies into the client JavaScript bundle.",
            "testCases": [
              {
                "id": 1,
                "name": "Parses single flight chunk",
                "input": "0:{\"type\":\"div\"}",
                "expected": {
                  "0": {
                    "type": "div"
                  }
                },
                "testFn": "return parseRscFlightPayload('0:{\"type\":\"div\"}');"
              },
              {
                "id": 2,
                "name": "Parses multiple indexed flight chunks across newlines",
                "input": "0:{\"a\":1}\\n1:{\"b\":2}",
                "expected": {
                  "0": {
                    "a": 1
                  },
                  "1": {
                    "b": 2
                  }
                },
                "testFn": "return parseRscFlightPayload(['0:{\"a\":1}', '1:{\"b\":2}'].join(String.fromCharCode(10)));"
              },
              {
                "id": 3,
                "name": "Correctly parses client module reference string tokens",
                "input": "M1:\"$LClient\"",
                "expected": "$LClient",
                "testFn": "const res = parseRscFlightPayload('M1:\"$LClient\"'); return res.M1;"
              }
            ],
            "solutionCode": "/**\n * Parses React Server Component Flight wire format stream chunks.\n */\nfunction parseRscFlightPayload(wireText) {\n  const lines = wireText.trim().split(/[\\r\\n]+/);\n  const chunks = {};\n\n  for (const line of lines) {\n    const colonIdx = line.indexOf(':');\n    if (colonIdx === -1) continue;\n    const id = line.slice(0, colonIdx);\n    const jsonStr = line.slice(colonIdx + 1);\n    chunks[id] = JSON.parse(jsonStr);\n  }\n\n  return chunks;\n}\n"
          },
          {
            "id": "selective-hydration-queue-medium",
            "title": "Selective Hydration Priority Queue Simulator",
            "difficulty": "Medium",
            "concept": "Event-Driven Hydration Prioritization (React 18 Selective Hydration)",
            "description": "Implement `createHydrationScheduler(chunks)` that hydrates chunks in background order unless a user click event occurs on a specific chunk, which immediately elevates that chunk to the front of the hydration queue.",
            "starterCode": "/**\n * Simulates React 18 event-driven selective hydration prioritization.\n */\nfunction createHydrationScheduler(initialChunks = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In traditional SSR, the user must wait for the entire page to hydrate before any button responds. React 18 Selective Hydration intercepts clicks on un-hydrated islands and hydrates them synchronously before dispatching the event.",
            "testCases": [
              {
                "id": 1,
                "name": "Hydrates chunks in sequential queue order by default",
                "input": "hydrateNext from ['c1', 'c2']",
                "expected": "c1",
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2']); return sched.hydrateNext();"
              },
              {
                "id": 2,
                "name": "User interaction jumps chunk to front of hydration queue",
                "input": "click on c3 moves it ahead of c1 and c2",
                "expected": "c3",
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2', 'c3']); sched.userInteractedWith('c3'); return sched.hydrateNext();"
              },
              {
                "id": 3,
                "name": "Correctly records and tracks hydrated chunks",
                "input": "isHydrated('c1') after hydrateNext()",
                "expected": true,
                "testFn": "const sched = createHydrationScheduler(['c1', 'c2']); sched.hydrateNext(); return sched.isHydrated('c1');"
              }
            ],
            "solutionCode": "/**\n * Simulates React 18 event-driven selective hydration prioritization.\n */\nfunction createHydrationScheduler(initialChunks = []) {\n  let queue = [...initialChunks];\n  const hydrated = new Set();\n\n  return {\n    userInteractedWith(chunkId) {\n      const idx = queue.indexOf(chunkId);\n      if (idx > -1) {\n        queue.splice(idx, 1);\n        queue.unshift(chunkId);\n      }\n    },\n    hydrateNext() {\n      if (queue.length === 0) return null;\n      const next = queue.shift();\n      hydrated.add(next);\n      return next;\n    },\n    getPending() { return [...queue]; },\n    isHydrated(chunkId) { return hydrated.has(chunkId); }\n  };\n}\n"
          },
          {
            "id": "rsc-boundary-serialization-hard",
            "title": "RSC Server-to-Client Boundary Serialization Validator",
            "difficulty": "Hard",
            "concept": "Boundary Serialization Rules & Non-Serializable Props Rejection",
            "description": "Implement `validateRscBoundaryProps(props)` that recursively inspects props passed to a Client Component from a Server Component. It must return `{ valid: true }` for JSON-serializable primitives/arrays/objects and throw a descriptive TypeError if a function or non-serializable symbol is detected.",
            "starterCode": "/**\n * Validates props passed across the React Server Component boundary.\n */\nfunction validateRscBoundaryProps(props) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "You cannot pass an onClick handler function from a Server Component to a Client Component because Server Components cannot send executable JavaScript across the network wire.",
            "testCases": [
              {
                "id": 1,
                "name": "Validates JSON-serializable data structures cleanly",
                "input": "{ title: 'Hello', count: 42, tags: ['a', 'b'] }",
                "expected": true,
                "testFn": "return validateRscBoundaryProps({ title: 'Hello', count: 42, tags: ['a', 'b'] }).valid;"
              },
              {
                "id": 2,
                "name": "Throws TypeError when passing functions across boundary",
                "input": "{ onClick: () => {} }",
                "expected": "Cannot pass function across Server-to-Client boundary at prop: onClick",
                "testFn": "try { validateRscBoundaryProps({ onClick: () => {} }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Detects deeply nested non-serializable properties with exact path",
                "input": "{ config: { callback: fn } }",
                "expected": "Cannot pass function across Server-to-Client boundary at prop: config.callback",
                "testFn": "try { validateRscBoundaryProps({ config: { callback: () => {} } }); return 'no-error'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "/**\n * Validates props passed across the React Server Component boundary.\n */\nfunction validateRscBoundaryProps(props) {\n  function check(val, path) {\n    if (val === null || val === undefined) return;\n    if (typeof val === 'function') {\n      throw new TypeError('Cannot pass function across Server-to-Client boundary at prop: ' + path);\n    }\n    if (typeof val === 'symbol') {\n      throw new TypeError('Cannot pass symbol across Server-to-Client boundary at prop: ' + path);\n    }\n    if (typeof val === 'object') {\n      for (const [k, v] of Object.entries(val)) {\n        check(v, path ? path + '.' + k : k);\n      }\n    }\n  }\n\n  check(props, '');\n  return { valid: true };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "compiler-custom-reconciler",
    "category": "8. React Internals: Compiler & Custom Reconcilers",
    "badge": "Compiler & Internals",
    "description": "Explore the React Compiler (Forget) auto-memoization mechanics and custom host renderers via react-reconciler.",
    "topics": [
      {
        "id": "compiler-forget-internals",
        "title": "React Compiler (Forget) & Static Analysis",
        "tag": "React Compiler",
        "summary": "Auto-memoization, reactive scope inference, memo cache slots, and purity rule enforcement.",
        "mentalModel": "The React Compiler analyzes the Control Flow Graph (CFG) at build time, identifying reactive values and automatically wrapping computations and JSX in memo caches, rendering manual useMemo and useCallback obsolete.",
        "traps": "Mutating props, mutating state, or calling impure functions breaks the compiler's static safety guarantees.",
        "challenges": {
          "Basic": {
            "id": "compiler-purity-linter-basic",
            "title": "Static Purity Rule Analyzer for React Compiler",
            "difficulty": "Basic",
            "concept": "Rules of React Violation Detection for Compiler Optimization",
            "description": "Implement `analyzeHookPurity(codeString)` that scans a function body for illegal mutations like `props.x =` or direct `state.x =` mutations, returning `{ compilable: boolean, violations: string[] }`.",
            "starterCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If a component mutates existing props or state objects, the React Compiler marks the component as 'un-optimizable' and falls back to standard non-memoized compilation.",
            "testCases": [
              {
                "id": 1,
                "name": "Approves clean pure functional component code",
                "input": "const double = count * 2; return double;",
                "expected": true,
                "testFn": "return analyzeHookPurity('const double = count * 2; return double;').compilable;"
              },
              {
                "id": 2,
                "name": "Catches direct props mutation violation",
                "input": "props.name = 10",
                "expected": [
                  "Direct mutation of props"
                ],
                "testFn": "return analyzeHookPurity('function Comp(props) { props.name = 10; }').violations;"
              },
              {
                "id": 3,
                "name": "Catches direct state mutation violation",
                "input": "state.count = 10",
                "expected": false,
                "testFn": "return analyzeHookPurity('function Comp() { state.count = 10; }').compilable;"
              }
            ],
            "solutionCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  const violations = [];\n  if (/props\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of props');\n  }\n  if (/state\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of state');\n  }\n  return {\n    compilable: violations.length === 0,\n    violations\n  };\n}\n"
          },
          "Medium": {
            "id": "compiler-memo-cache-medium",
            "title": "Compiler Memo Cache Slot Simulator (c[0], c[1])",
            "difficulty": "Medium",
            "concept": "React Compiler $empty Cache Slot Reuse Mechanics",
            "description": "Implement `createMemoCache(size)` that provides `useMemoBlock(slotIndex, inputs, computeFn)` emulating the compiled output of the React Compiler with cache slot checks.",
            "starterCode": "/**\n * Simulates React Compiler indexed memo cache slot array.\n */\nfunction createMemoCache(size = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The React Compiler transforms complex components into indexed memo cache lookups: let t0 = $empty; if ($[0] !== a) { t0 = compute(a); $[0] = a; $[1] = t0; }, minimizing allocation overhead.",
            "testCases": [
              {
                "id": 1,
                "name": "Computes and returns value on initial slot read",
                "input": "useMemoBlock with 2 + 2",
                "expected": 4,
                "testFn": "const c = createMemoCache(4); return c.useMemoBlock(0, [2], () => 2 + 2);"
              },
              {
                "id": 2,
                "name": "Returns cached result without invoking compute function when inputs match",
                "input": "second call with identical input [2]",
                "expected": 1,
                "testFn": "const c = createMemoCache(4); let runs = 0; c.useMemoBlock(0, [2], () => { runs++; return 4; }); c.useMemoBlock(0, [2], () => { runs++; return 4; }); return runs;"
              },
              {
                "id": 3,
                "name": "Re-computes value when input changes",
                "input": "input changes from [2] to [3]",
                "expected": 6,
                "testFn": "const c = createMemoCache(4); c.useMemoBlock(0, [2], () => 4); return c.useMemoBlock(0, [3], () => 6);"
              }
            ],
            "solutionCode": "/**\n * Simulates React Compiler indexed memo cache slot array.\n */\nfunction createMemoCache(size = 10) {\n  const cache = new Array(size);\n  const EMPTY = Symbol('empty');\n  for (let i = 0; i < size; i++) cache[i] = EMPTY;\n\n  return {\n    useMemoBlock(slotIndex, inputs, computeFn) {\n      const slot = cache[slotIndex];\n      if (slot !== EMPTY && Array.isArray(slot.inputs)) {\n        const inputsUnchanged = inputs.every((val, i) => val === slot.inputs[i]);\n        if (inputsUnchanged) {\n          return slot.result;\n        }\n      }\n      const result = computeFn();\n      cache[slotIndex] = { inputs: [...inputs], result };\n      return result;\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "reconciler-dirty-subgraph-hard",
            "title": "Reconciler Minimal Dirty Sub-tree Invalidation",
            "difficulty": "Hard",
            "concept": "Fiber Invalidation Propagation & Bailout Detection",
            "description": "Implement `calculateDirtySubtree(rootFiber, changedFiberId)` that traverses a tree of fiber nodes and returns a list of fiber IDs that must re-render, bailing out of branches whose props and state did not change.",
            "starterCode": "/**\n * Computes minimal dirty fiber nodes invalidation list.\n */\nfunction calculateDirtySubtree(root, targetId) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React's bailout mechanism skips an entire subtree only if both props AND context AND state have reference equality with workInProgress fiber counterparts.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies changed node and non-memoized children",
                "input": "node A changes with un-memoized child B",
                "expected": [
                  "A",
                  "B"
                ],
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'B', isMemoized: false }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                "id": 2,
                "name": "Bails out on memoized child nodes",
                "input": "node A changes with memoized child C",
                "expected": [
                  "A"
                ],
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'C', isMemoized: true }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                "id": 3,
                "name": "Unaffected sibling branches are completely untouched",
                "input": "mutation in A does not touch branch D",
                "expected": false,
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [] }, { id: 'D', children: [] }] }; const dirty = calculateDirtySubtree(tree, 'A'); return dirty.includes('D');"
              }
            ],
            "solutionCode": "/**\n * Computes minimal dirty fiber nodes invalidation list.\n */\nfunction calculateDirtySubtree(root, targetId) {\n  const dirty = [];\n\n  function markAndCollect(node) {\n    if (!node) return;\n    if (node.id === targetId || node.hasChanged) {\n      dirty.push(node.id);\n      for (const child of node.children || []) {\n        if (!child.isMemoized) {\n          dirty.push(child.id);\n        }\n      }\n      return;\n    }\n    for (const child of node.children || []) {\n      markAndCollect(child);\n    }\n  }\n\n  markAndCollect(root);\n  return dirty;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "compiler-purity-linter-basic",
          "title": "Static Purity Rule Analyzer for React Compiler",
          "difficulty": "Basic",
          "concept": "Rules of React Violation Detection for Compiler Optimization",
          "description": "Implement `analyzeHookPurity(codeString)` that scans a function body for illegal mutations like `props.x =` or direct `state.x =` mutations, returning `{ compilable: boolean, violations: string[] }`.",
          "starterCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "If a component mutates existing props or state objects, the React Compiler marks the component as 'un-optimizable' and falls back to standard non-memoized compilation.",
          "testCases": [
            {
              "id": 1,
              "name": "Approves clean pure functional component code",
              "input": "const double = count * 2; return double;",
              "expected": true,
              "testFn": "return analyzeHookPurity('const double = count * 2; return double;').compilable;"
            },
            {
              "id": 2,
              "name": "Catches direct props mutation violation",
              "input": "props.name = 10",
              "expected": [
                "Direct mutation of props"
              ],
              "testFn": "return analyzeHookPurity('function Comp(props) { props.name = 10; }').violations;"
            },
            {
              "id": 3,
              "name": "Catches direct state mutation violation",
              "input": "state.count = 10",
              "expected": false,
              "testFn": "return analyzeHookPurity('function Comp() { state.count = 10; }').compilable;"
            }
          ],
          "solutionCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  const violations = [];\n  if (/props\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of props');\n  }\n  if (/state\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of state');\n  }\n  return {\n    compilable: violations.length === 0,\n    violations\n  };\n}\n"
        },
        "questions": [
          {
            "id": "compiler-purity-linter-basic",
            "title": "Static Purity Rule Analyzer for React Compiler",
            "difficulty": "Basic",
            "concept": "Rules of React Violation Detection for Compiler Optimization",
            "description": "Implement `analyzeHookPurity(codeString)` that scans a function body for illegal mutations like `props.x =` or direct `state.x =` mutations, returning `{ compilable: boolean, violations: string[] }`.",
            "starterCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If a component mutates existing props or state objects, the React Compiler marks the component as 'un-optimizable' and falls back to standard non-memoized compilation.",
            "testCases": [
              {
                "id": 1,
                "name": "Approves clean pure functional component code",
                "input": "const double = count * 2; return double;",
                "expected": true,
                "testFn": "return analyzeHookPurity('const double = count * 2; return double;').compilable;"
              },
              {
                "id": 2,
                "name": "Catches direct props mutation violation",
                "input": "props.name = 10",
                "expected": [
                  "Direct mutation of props"
                ],
                "testFn": "return analyzeHookPurity('function Comp(props) { props.name = 10; }').violations;"
              },
              {
                "id": 3,
                "name": "Catches direct state mutation violation",
                "input": "state.count = 10",
                "expected": false,
                "testFn": "return analyzeHookPurity('function Comp() { state.count = 10; }').compilable;"
              }
            ],
            "solutionCode": "/**\n * Statically detects purity violations that disqualify components from React Compiler optimizations.\n */\nfunction analyzeHookPurity(codeString) {\n  const violations = [];\n  if (/props\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of props');\n  }\n  if (/state\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {\n    violations.push('Direct mutation of state');\n  }\n  return {\n    compilable: violations.length === 0,\n    violations\n  };\n}\n"
          },
          {
            "id": "compiler-memo-cache-medium",
            "title": "Compiler Memo Cache Slot Simulator (c[0], c[1])",
            "difficulty": "Medium",
            "concept": "React Compiler $empty Cache Slot Reuse Mechanics",
            "description": "Implement `createMemoCache(size)` that provides `useMemoBlock(slotIndex, inputs, computeFn)` emulating the compiled output of the React Compiler with cache slot checks.",
            "starterCode": "/**\n * Simulates React Compiler indexed memo cache slot array.\n */\nfunction createMemoCache(size = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The React Compiler transforms complex components into indexed memo cache lookups: let t0 = $empty; if ($[0] !== a) { t0 = compute(a); $[0] = a; $[1] = t0; }, minimizing allocation overhead.",
            "testCases": [
              {
                "id": 1,
                "name": "Computes and returns value on initial slot read",
                "input": "useMemoBlock with 2 + 2",
                "expected": 4,
                "testFn": "const c = createMemoCache(4); return c.useMemoBlock(0, [2], () => 2 + 2);"
              },
              {
                "id": 2,
                "name": "Returns cached result without invoking compute function when inputs match",
                "input": "second call with identical input [2]",
                "expected": 1,
                "testFn": "const c = createMemoCache(4); let runs = 0; c.useMemoBlock(0, [2], () => { runs++; return 4; }); c.useMemoBlock(0, [2], () => { runs++; return 4; }); return runs;"
              },
              {
                "id": 3,
                "name": "Re-computes value when input changes",
                "input": "input changes from [2] to [3]",
                "expected": 6,
                "testFn": "const c = createMemoCache(4); c.useMemoBlock(0, [2], () => 4); return c.useMemoBlock(0, [3], () => 6);"
              }
            ],
            "solutionCode": "/**\n * Simulates React Compiler indexed memo cache slot array.\n */\nfunction createMemoCache(size = 10) {\n  const cache = new Array(size);\n  const EMPTY = Symbol('empty');\n  for (let i = 0; i < size; i++) cache[i] = EMPTY;\n\n  return {\n    useMemoBlock(slotIndex, inputs, computeFn) {\n      const slot = cache[slotIndex];\n      if (slot !== EMPTY && Array.isArray(slot.inputs)) {\n        const inputsUnchanged = inputs.every((val, i) => val === slot.inputs[i]);\n        if (inputsUnchanged) {\n          return slot.result;\n        }\n      }\n      const result = computeFn();\n      cache[slotIndex] = { inputs: [...inputs], result };\n      return result;\n    }\n  };\n}\n"
          },
          {
            "id": "reconciler-dirty-subgraph-hard",
            "title": "Reconciler Minimal Dirty Sub-tree Invalidation",
            "difficulty": "Hard",
            "concept": "Fiber Invalidation Propagation & Bailout Detection",
            "description": "Implement `calculateDirtySubtree(rootFiber, changedFiberId)` that traverses a tree of fiber nodes and returns a list of fiber IDs that must re-render, bailing out of branches whose props and state did not change.",
            "starterCode": "/**\n * Computes minimal dirty fiber nodes invalidation list.\n */\nfunction calculateDirtySubtree(root, targetId) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React's bailout mechanism skips an entire subtree only if both props AND context AND state have reference equality with workInProgress fiber counterparts.",
            "testCases": [
              {
                "id": 1,
                "name": "Identifies changed node and non-memoized children",
                "input": "node A changes with un-memoized child B",
                "expected": [
                  "A",
                  "B"
                ],
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'B', isMemoized: false }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                "id": 2,
                "name": "Bails out on memoized child nodes",
                "input": "node A changes with memoized child C",
                "expected": [
                  "A"
                ],
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'C', isMemoized: true }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                "id": 3,
                "name": "Unaffected sibling branches are completely untouched",
                "input": "mutation in A does not touch branch D",
                "expected": false,
                "testFn": "const tree = { id: 'root', children: [{ id: 'A', children: [] }, { id: 'D', children: [] }] }; const dirty = calculateDirtySubtree(tree, 'A'); return dirty.includes('D');"
              }
            ],
            "solutionCode": "/**\n * Computes minimal dirty fiber nodes invalidation list.\n */\nfunction calculateDirtySubtree(root, targetId) {\n  const dirty = [];\n\n  function markAndCollect(node) {\n    if (!node) return;\n    if (node.id === targetId || node.hasChanged) {\n      dirty.push(node.id);\n      for (const child of node.children || []) {\n        if (!child.isMemoized) {\n          dirty.push(child.id);\n        }\n      }\n      return;\n    }\n    for (const child of node.children || []) {\n      markAndCollect(child);\n    }\n  }\n\n  markAndCollect(root);\n  return dirty;\n}\n"
          }
        ]
      },
      {
        "id": "custom-reconciler",
        "title": "Custom Reconcilers: Host Config & react-reconciler",
        "tag": "Custom Reconciler",
        "summary": "createInstance, appendInitialChild, commitUpdate, and host config implementations for non-DOM platforms.",
        "mentalModel": "React Reconciler is platform-agnostic. By defining a Host Config object with methods like createInstance, createTextInstance, and appendChild, React can render to Canvas, Three.js, PDF, or Terminal.",
        "traps": "Mutating the host instance during the render phase causes visual tearing and concurrent mode corruption. Mutations belong strictly in the commit phase.",
        "challenges": {
          "Basic": {
            "id": "custom-reconciler-mini-basic",
            "title": "Mini JSON Virtual Tree Host Reconciler",
            "difficulty": "Basic",
            "concept": "Host Config Interface: createInstance & appendChild",
            "description": "Implement `createMiniReconciler()` with `createInstance(type, props)`, `createTextInstance(text)`, and `appendChild(parent, child)` producing a pure JavaScript object tree representing the host structure.",
            "starterCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React separates the reconciliation algorithm (reconciler) from the host mutation operations (renderer). This abstraction powers React Native, React Three Fiber, and Ink.",
            "testCases": [
              {
                "id": 1,
                "name": "Creates host element instance with props",
                "input": "createInstance('view', { color: 'blue' })",
                "expected": {
                  "type": "view",
                  "props": {
                    "color": "blue"
                  },
                  "children": []
                },
                "testFn": "const r = createMiniReconciler(); return r.createInstance('view', { color: 'blue' });"
              },
              {
                "id": 2,
                "name": "Creates text instance",
                "input": "createTextInstance('Hello')",
                "expected": {
                  "type": "TEXT",
                  "text": "Hello"
                },
                "testFn": "const r = createMiniReconciler(); return r.createTextInstance('Hello');"
              },
              {
                "id": 3,
                "name": "Appends children into tree hierarchy accurately",
                "input": "append text child to container",
                "expected": 1,
                "testFn": "const r = createMiniReconciler(); const parent = r.createInstance('container'); const text = r.createTextInstance('Hi'); r.appendChild(parent, text); return parent.children.length;"
              }
            ],
            "solutionCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  return {\n    createInstance(type, props = {}) {\n      return {\n        type,\n        props: { ...props },\n        children: []\n      };\n    },\n    createTextInstance(text) {\n      return {\n        type: 'TEXT',\n        text: String(text)\n      };\n    },\n    appendChild(parent, child) {\n      parent.children.push(child);\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "canvas-grid-reconciler-medium",
            "title": "Terminal / Canvas 2D Text Buffer Reconciler",
            "difficulty": "Medium",
            "concept": "Host Config Mutation & Canvas Grid Painting",
            "description": "Implement `createGridRenderer(width, height)` that mounts instances with `{ x, y, char }` props onto a 2D character buffer and renders the composed screen string via `renderScreen()`.",
            "starterCode": "/**\n * Renders virtual React elements onto an ASCII 2D grid matrix.\n */\nfunction createGridRenderer(width = 10, height = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Host configs provide commitMount or finalizeInitialChildren to perform post-insertion side-effects like focusing inputs or painting coordinates.",
            "testCases": [
              {
                "id": 1,
                "name": "Mounts character at specific x, y coordinate",
                "input": "place '@' at x: 1, y: 1 in 3x3 grid",
                "expected": "...|.@.|...",
                "testFn": "const r = createGridRenderer(3, 3); const node = r.createInstance('char', { x: 1, y: 1, char: '@' }); r.commitMount(node); return r.renderScreen();"
              },
              {
                "id": 2,
                "name": "Renders composite 2D grid screen string with multiple instances",
                "input": "render two chars on screen",
                "expected": "X.O",
                "testFn": "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 0, y: 0, char: 'X' })); r.commitMount(r.createInstance('c', { x: 2, y: 0, char: 'O' })); return r.renderScreen();"
              },
              {
                "id": 3,
                "name": "Ignores out-of-bounds coordinates safely without crash",
                "input": "place char at x: 99, y: 99",
                "expected": "...",
                "testFn": "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 99, y: 99, char: 'Z' })); return r.renderScreen();"
              }
            ],
            "solutionCode": "/**\n * Renders virtual React elements onto an ASCII 2D grid matrix.\n */\nfunction createGridRenderer(width = 10, height = 5) {\n  const grid = Array.from({ length: height }, () => Array(width).fill('.'));\n\n  return {\n    createInstance(type, props) {\n      return { type, props: { ...props } };\n    },\n    commitMount(instance) {\n      const { x, y, char = '#' } = instance.props;\n      if (y >= 0 && y < height && x >= 0 && x < width) {\n        grid[y][x] = char;\n      }\n    },\n    renderScreen() {\n      return grid.map(row => row.join('')).join('|');\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "transactional-reconciler-commit-hard",
            "title": "Transactional Commit Queue with Rollback Support",
            "difficulty": "Hard",
            "concept": "Two-Phase Commit & Rollback on Host Mutation Failures",
            "description": "Implement `createTransactionalReconciler()` that stages host mutations in a queue. If any mutation in the batch throws during commit, all previously executed mutations in that batch MUST be rolled back to their previous state.",
            "starterCode": "/**\n * Reconciler commit queue with atomic rollback on mutation failure.\n */\nfunction createTransactionalReconciler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "During Concurrent Mode, if React aborts a render, work-in-progress fibers are simply discarded without touching the host DOM. But once the commit phase starts, mutations must either succeed cleanly or trigger an error boundary.",
            "testCases": [
              {
                "id": 1,
                "name": "Commits staged mutations successfully",
                "input": "stage 2 ops and commit",
                "expected": true,
                "testFn": "let a = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => a += 1, rollback: () => a -= 1 }); const res = r.commit(); return res.success && a === 1;"
              },
              {
                "id": 2,
                "name": "Rolls back previously executed mutations if an error occurs mid-commit",
                "input": "first op modifies val, second op throws -> val restored",
                "expected": 0,
                "testFn": "let state = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => state = 10, rollback: () => state = 0 }); r.stage({ execute: () => { throw new Error('DOM Error'); }, rollback: () => {} }); r.commit(); return state;"
              },
              {
                "id": 3,
                "name": "Clears staged operations queue after execution",
                "input": "re-committing empty queue succeeds with no extra operations",
                "expected": true,
                "testFn": "const r = createTransactionalReconciler(); r.stage({ execute: () => {}, rollback: () => {} }); r.commit(); return r.commit().success;"
              }
            ],
            "solutionCode": "/**\n * Reconciler commit queue with atomic rollback on mutation failure.\n */\nfunction createTransactionalReconciler() {\n  const operations = [];\n\n  return {\n    stage(op) {\n      operations.push(op);\n    },\n    commit() {\n      const executed = [];\n      try {\n        for (const op of operations) {\n          op.execute();\n          executed.push(op);\n        }\n        operations.length = 0;\n        return { success: true };\n      } catch (err) {\n        while (executed.length > 0) {\n          const op = executed.pop();\n          op.rollback();\n        }\n        operations.length = 0;\n        return { success: false, error: err.message };\n      }\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "custom-reconciler-mini-basic",
          "title": "Mini JSON Virtual Tree Host Reconciler",
          "difficulty": "Basic",
          "concept": "Host Config Interface: createInstance & appendChild",
          "description": "Implement `createMiniReconciler()` with `createInstance(type, props)`, `createTextInstance(text)`, and `appendChild(parent, child)` producing a pure JavaScript object tree representing the host structure.",
          "starterCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "React separates the reconciliation algorithm (reconciler) from the host mutation operations (renderer). This abstraction powers React Native, React Three Fiber, and Ink.",
          "testCases": [
            {
              "id": 1,
              "name": "Creates host element instance with props",
              "input": "createInstance('view', { color: 'blue' })",
              "expected": {
                "type": "view",
                "props": {
                  "color": "blue"
                },
                "children": []
              },
              "testFn": "const r = createMiniReconciler(); return r.createInstance('view', { color: 'blue' });"
            },
            {
              "id": 2,
              "name": "Creates text instance",
              "input": "createTextInstance('Hello')",
              "expected": {
                "type": "TEXT",
                "text": "Hello"
              },
              "testFn": "const r = createMiniReconciler(); return r.createTextInstance('Hello');"
            },
            {
              "id": 3,
              "name": "Appends children into tree hierarchy accurately",
              "input": "append text child to container",
              "expected": 1,
              "testFn": "const r = createMiniReconciler(); const parent = r.createInstance('container'); const text = r.createTextInstance('Hi'); r.appendChild(parent, text); return parent.children.length;"
            }
          ],
          "solutionCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  return {\n    createInstance(type, props = {}) {\n      return {\n        type,\n        props: { ...props },\n        children: []\n      };\n    },\n    createTextInstance(text) {\n      return {\n        type: 'TEXT',\n        text: String(text)\n      };\n    },\n    appendChild(parent, child) {\n      parent.children.push(child);\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "custom-reconciler-mini-basic",
            "title": "Mini JSON Virtual Tree Host Reconciler",
            "difficulty": "Basic",
            "concept": "Host Config Interface: createInstance & appendChild",
            "description": "Implement `createMiniReconciler()` with `createInstance(type, props)`, `createTextInstance(text)`, and `appendChild(parent, child)` producing a pure JavaScript object tree representing the host structure.",
            "starterCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "React separates the reconciliation algorithm (reconciler) from the host mutation operations (renderer). This abstraction powers React Native, React Three Fiber, and Ink.",
            "testCases": [
              {
                "id": 1,
                "name": "Creates host element instance with props",
                "input": "createInstance('view', { color: 'blue' })",
                "expected": {
                  "type": "view",
                  "props": {
                    "color": "blue"
                  },
                  "children": []
                },
                "testFn": "const r = createMiniReconciler(); return r.createInstance('view', { color: 'blue' });"
              },
              {
                "id": 2,
                "name": "Creates text instance",
                "input": "createTextInstance('Hello')",
                "expected": {
                  "type": "TEXT",
                  "text": "Hello"
                },
                "testFn": "const r = createMiniReconciler(); return r.createTextInstance('Hello');"
              },
              {
                "id": 3,
                "name": "Appends children into tree hierarchy accurately",
                "input": "append text child to container",
                "expected": 1,
                "testFn": "const r = createMiniReconciler(); const parent = r.createInstance('container'); const text = r.createTextInstance('Hi'); r.appendChild(parent, text); return parent.children.length;"
              }
            ],
            "solutionCode": "/**\n * Implements the core Host Config abstraction for custom rendering.\n */\nfunction createMiniReconciler() {\n  return {\n    createInstance(type, props = {}) {\n      return {\n        type,\n        props: { ...props },\n        children: []\n      };\n    },\n    createTextInstance(text) {\n      return {\n        type: 'TEXT',\n        text: String(text)\n      };\n    },\n    appendChild(parent, child) {\n      parent.children.push(child);\n    }\n  };\n}\n"
          },
          {
            "id": "canvas-grid-reconciler-medium",
            "title": "Terminal / Canvas 2D Text Buffer Reconciler",
            "difficulty": "Medium",
            "concept": "Host Config Mutation & Canvas Grid Painting",
            "description": "Implement `createGridRenderer(width, height)` that mounts instances with `{ x, y, char }` props onto a 2D character buffer and renders the composed screen string via `renderScreen()`.",
            "starterCode": "/**\n * Renders virtual React elements onto an ASCII 2D grid matrix.\n */\nfunction createGridRenderer(width = 10, height = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Host configs provide commitMount or finalizeInitialChildren to perform post-insertion side-effects like focusing inputs or painting coordinates.",
            "testCases": [
              {
                "id": 1,
                "name": "Mounts character at specific x, y coordinate",
                "input": "place '@' at x: 1, y: 1 in 3x3 grid",
                "expected": "...|.@.|...",
                "testFn": "const r = createGridRenderer(3, 3); const node = r.createInstance('char', { x: 1, y: 1, char: '@' }); r.commitMount(node); return r.renderScreen();"
              },
              {
                "id": 2,
                "name": "Renders composite 2D grid screen string with multiple instances",
                "input": "render two chars on screen",
                "expected": "X.O",
                "testFn": "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 0, y: 0, char: 'X' })); r.commitMount(r.createInstance('c', { x: 2, y: 0, char: 'O' })); return r.renderScreen();"
              },
              {
                "id": 3,
                "name": "Ignores out-of-bounds coordinates safely without crash",
                "input": "place char at x: 99, y: 99",
                "expected": "...",
                "testFn": "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 99, y: 99, char: 'Z' })); return r.renderScreen();"
              }
            ],
            "solutionCode": "/**\n * Renders virtual React elements onto an ASCII 2D grid matrix.\n */\nfunction createGridRenderer(width = 10, height = 5) {\n  const grid = Array.from({ length: height }, () => Array(width).fill('.'));\n\n  return {\n    createInstance(type, props) {\n      return { type, props: { ...props } };\n    },\n    commitMount(instance) {\n      const { x, y, char = '#' } = instance.props;\n      if (y >= 0 && y < height && x >= 0 && x < width) {\n        grid[y][x] = char;\n      }\n    },\n    renderScreen() {\n      return grid.map(row => row.join('')).join('|');\n    }\n  };\n}\n"
          },
          {
            "id": "transactional-reconciler-commit-hard",
            "title": "Transactional Commit Queue with Rollback Support",
            "difficulty": "Hard",
            "concept": "Two-Phase Commit & Rollback on Host Mutation Failures",
            "description": "Implement `createTransactionalReconciler()` that stages host mutations in a queue. If any mutation in the batch throws during commit, all previously executed mutations in that batch MUST be rolled back to their previous state.",
            "starterCode": "/**\n * Reconciler commit queue with atomic rollback on mutation failure.\n */\nfunction createTransactionalReconciler() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "During Concurrent Mode, if React aborts a render, work-in-progress fibers are simply discarded without touching the host DOM. But once the commit phase starts, mutations must either succeed cleanly or trigger an error boundary.",
            "testCases": [
              {
                "id": 1,
                "name": "Commits staged mutations successfully",
                "input": "stage 2 ops and commit",
                "expected": true,
                "testFn": "let a = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => a += 1, rollback: () => a -= 1 }); const res = r.commit(); return res.success && a === 1;"
              },
              {
                "id": 2,
                "name": "Rolls back previously executed mutations if an error occurs mid-commit",
                "input": "first op modifies val, second op throws -> val restored",
                "expected": 0,
                "testFn": "let state = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => state = 10, rollback: () => state = 0 }); r.stage({ execute: () => { throw new Error('DOM Error'); }, rollback: () => {} }); r.commit(); return state;"
              },
              {
                "id": 3,
                "name": "Clears staged operations queue after execution",
                "input": "re-committing empty queue succeeds with no extra operations",
                "expected": true,
                "testFn": "const r = createTransactionalReconciler(); r.stage({ execute: () => {}, rollback: () => {} }); r.commit(); return r.commit().success;"
              }
            ],
            "solutionCode": "/**\n * Reconciler commit queue with atomic rollback on mutation failure.\n */\nfunction createTransactionalReconciler() {\n  const operations = [];\n\n  return {\n    stage(op) {\n      operations.push(op);\n    },\n    commit() {\n      const executed = [];\n      try {\n        for (const op of operations) {\n          op.execute();\n          executed.push(op);\n        }\n        operations.length = 0;\n        return { success: true };\n      } catch (err) {\n        while (executed.length > 0) {\n          const op = executed.pop();\n          op.rollback();\n        }\n        operations.length = 0;\n        return { success: false, error: err.message };\n      }\n    }\n  };\n}\n"
          }
        ]
      }
    ]
  }
];
