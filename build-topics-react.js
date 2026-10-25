// Builder script to construct rich, validated topics-react.js with Basic, Medium, Hard categories and test cases
const fs = require('fs');
const path = require('path');

const reactTopicsData = [
  {
    id: "react-engine-fiber",
    category: "1. Fiber Architecture & Reconciliation",
    badge: "Core Architecture",
    description: "Understand the Virtual DOM, the Fiber linked list, Render vs Commit phases, and the reconciliation algorithm.",
    topics: [
      {
        id: "fiber-nodes-trees",
        title: "Fiber Tree & Linked List Traversal",
        tag: "Fiber Architecture",
        summary: "Child, Sibling, Return pointers, current vs workInProgress trees, and double buffering.",
        mentalModel: "React 16+ models UI as a singly linked list of Fiber nodes rather than a recursive tree. Each fiber has `child`, `sibling`, and `return` (parent) pointers. During updates, React clones the `current` tree into a `workInProgress` tree (double buffering) and switches the pointer during the synchronous commit phase.",
        traps: "Believing reconciliation is immediate/synchronous; forgetting that the render phase can be paused, aborted, or restarted in Concurrent Mode.",
        challenges: {
          Basic: {
            id: "fiber-tree-basic",
            title: "Fiber Node Factory for React Elements",
            difficulty: "Basic",
            concept: "Fiber Node Structure & Pointers",
            description: "Implement `createFiber(tag, type, props)` that creates a standard React Fiber node with initialized `child: null`, `sibling: null`, `return: null`, `memoizedState: null`, and `pendingProps`.",
            starterCode: `function createFiber(tag, type, props = {}) {
  return {
    tag, // e.g. 'HostComponent', 'FunctionComponent'
    type, // 'div', 'span', or Component function
    pendingProps: props,
    memoizedProps: null,
    memoizedState: null,
    child: null,
    sibling: null,
    return: null,
    alternate: null
  };
}
`,
            interviewTrap: "Confusing React elements (ephemeral, plain JS objects) with Fiber nodes (stateful, long-lived runtime nodes).",
            testCases: [
              {
                id: 1,
                name: "Creates fiber with null relational pointers",
                input: "createFiber('HostComponent', 'div')",
                expected: { child: null, sibling: null, return: null },
                testFn: "const f = createFiber('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                id: 2,
                name: "Stores pendingProps accurately",
                input: "createFiber with className prop",
                expected: "btn-primary",
                testFn: "const f = createFiber('HostComponent', 'button', { className: 'btn-primary' }); return f.pendingProps.className;"
              },
              {
                id: 3,
                name: "Prepares alternate slot for double buffering",
                input: "alternate property is null",
                expected: null,
                testFn: "const f = createFiber('FunctionComponent', () => {}); return f.alternate;"
              }
            ]
          },
          Medium: {
            id: "fiber-tree-medium",
            title: "Iterative Fiber Depth-First Walker",
            difficulty: "Medium",
            concept: "Non-Recursive Tree Traversal via Fiber Pointers",
            description: "Implement `walkFiberTree(root, onVisit)` that visits every node in a Fiber tree in depth-first order using ONLY `child`, `sibling`, and `return` without recursion or array stacks.",
            starterCode: `function walkFiberTree(root, onVisit) {
  let current = root;

  while (current) {
    onVisit(current);

    if (current.child) {
      current = current.child;
      continue;
    }

    if (current === root) break;

    while (!current.sibling) {
      if (!current.return || current.return === root) {
        return;
      }
      current = current.return;
    }

    current = current.sibling;
  }
}
`,
            interviewTrap: "Using recursion will overflow the call stack when React reconciles large DOM trees of 10,000+ nodes.",
            testCases: [
              {
                id: 1,
                name: "Traverses root and children in pre-order",
                input: "Root -> A, B",
                expected: ['Root', 'A', 'B'],
                testFn: "const root = { id: 'Root', child: null, sibling: null, return: null }; const a = { id: 'A', child: null, return: root }; const b = { id: 'B', child: null, sibling: null, return: root }; root.child = a; a.sibling = b; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                id: 2,
                name: "Navigates multi-level nested children",
                input: "Root -> A -> A1, then B",
                expected: ['Root', 'A', 'A1', 'B'],
                testFn: "const root = { id: 'Root', child: null, return: null }; const b = { id: 'B', child: null, sibling: null, return: root }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', child: a1, sibling: b, return: root }; a1.return = a; root.child = a; const visited = []; walkFiberTree(root, f => visited.push(f.id)); return visited;"
              },
              {
                id: 3,
                name: "Handles leaf node with no children gracefully",
                input: "Single node",
                expected: ['OnlyOne'],
                testFn: "const node = { id: 'OnlyOne', child: null, sibling: null, return: null }; const visited = []; walkFiberTree(node, f => visited.push(f.id)); return visited;"
              }
            ]
          },
          Hard: {
            id: "fiber-tree-hard",
            title: "Fiber Double Buffering (WorkInProgress Tree Cloner)",
            difficulty: "Hard",
            concept: "Double Buffering & Pointer Flipping in Commit Phase",
            description: "Implement `createWorkInProgress(currentFiber, pendingProps)` that creates or reuses the `alternate` Fiber node. It must clone the current node into its alternate, update `pendingProps`, link their mutual `alternate` references, and return the workInProgress node.",
            starterCode: `function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // Initial alternate creation
    workInProgress = {
      tag: current.tag,
      type: current.type,
      child: current.child,
      sibling: current.sibling,
      return: current.return,
      memoizedProps: current.memoizedProps,
      memoizedState: current.memoizedState,
      alternate: current
    };
    current.alternate = workInProgress;
  } else {
    // Reuse existing alternate (zero allocation!)
    workInProgress.child = current.child;
    workInProgress.sibling = current.sibling;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
  }

  workInProgress.pendingProps = pendingProps;
  return workInProgress;
}
`,
            interviewTrap: "Re-allocating new objects on every render causes GC churn. React reuses the existing `current.alternate` node whenever available to maintain peak performance.",
            testCases: [
              {
                id: 1,
                name: "Creates new alternate and links mutual references",
                input: "first call links current <-> workInProgress",
                expected: true,
                testFn: "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip = createWorkInProgress(current, { id: 'wip' }); return current.alternate === wip && wip.alternate === current;"
              },
              {
                id: 2,
                name: "Reuses existing alternate on subsequent renders (zero new object allocation)",
                input: "subsequent call reuses current.alternate",
                expected: true,
                testFn: "const current = { tag: 'Host', type: 'div', memoizedProps: {}, alternate: null }; const wip1 = createWorkInProgress(current, { count: 1 }); const wip2 = createWorkInProgress(current, { count: 2 }); return wip1 === wip2 && wip2.pendingProps.count === 2;"
              },
              {
                id: 3,
                name: "Updates pendingProps while preserving memoizedProps until commit",
                input: "pendingProps updated, memoizedProps unchanged",
                expected: { pending: 'new', memoized: 'old' },
                testFn: "const current = { tag: 'Host', type: 'div', memoizedProps: 'old', alternate: null }; const wip = createWorkInProgress(current, 'new'); return { pending: wip.pendingProps, memoized: wip.memoizedProps };"
              }
            ]
          }
        }
      },
      {
        id: "reconciliation-keys",
        title: "Diffing Algorithm & The 'key' Prop Trap",
        tag: "Reconciliation",
        summary: "O(n) heuristic diffing, element type comparison, key stability, and index-as-key state corruption.",
        mentalModel: "React diffs level-by-level with 2 assumptions: elements with different types produce different trees, and keys uniquely identify siblings across renders. If element types differ, the entire subtree is unmounted and rebuilt from scratch.",
        traps: "Using array index as key when list items can be reordered, inserted, or filtered (leads to state attached to wrong inputs/components).",
        challenges: {
          Basic: {
            id: "keys-basic",
            title: "Detect Missing or Duplicate Keys in Children",
            difficulty: "Basic",
            concept: "Key Uniqueness Verification",
            description: "Implement `validateKeys(children)` that inspects an array of child objects `{ key, type }` and returns `{ valid: boolean, duplicateKeys: string[], missingCount: number }`.",
            starterCode: `function validateKeys(children) {
  const seen = new Set();
  const duplicateKeys = [];
  let missingCount = 0;

  for (const child of children) {
    if (child.key === undefined || child.key === null) {
      missingCount++;
      continue;
    }
    const k = String(child.key);
    if (seen.has(k)) {
      if (!duplicateKeys.includes(k)) duplicateKeys.push(k);
    } else {
      seen.add(k);
    }
  }

  return {
    valid: missingCount === 0 && duplicateKeys.length === 0,
    duplicateKeys,
    missingCount
  };
}
`,
            interviewTrap: "Keys must be unique strictly among SIBLINGS, not across the entire application.",
            testCases: [
              {
                id: 1,
                name: "Validates list with unique stable keys",
                input: "children with keys 'a', 'b', 'c'",
                expected: { valid: true, missingCount: 0, duplicateCount: 0 },
                testFn: "const res = validateKeys([{ key: 'a' }, { key: 'b' }, { key: 'c' }]); return { valid: res.valid, missingCount: res.missingCount, duplicateCount: res.duplicateKeys.length };"
              },
              {
                id: 2,
                name: "Detects duplicate keys in sibling list",
                input: "children with duplicate key 'item-1'",
                expected: ['item-1'],
                testFn: "const res = validateKeys([{ key: 'item-1' }, { key: 'item-2' }, { key: 'item-1' }]); return res.duplicateKeys;"
              },
              {
                id: 3,
                name: "Counts children with missing keys",
                input: "children missing keys",
                expected: 2,
                testFn: "const res = validateKeys([{ key: 'x' }, {}, { type: 'div' }]); return res.missingCount;"
              }
            ]
          },
          Medium: {
            id: "keys-medium",
            title: "Key-Based List Reconciler (Minimal DOM Operations)",
            difficulty: "Medium",
            concept: "O(n) Sibling Diffing using Key Maps",
            description: "Implement `reconcileChildren(oldChildren, newChildren)` that matches old and new list items by `key`. Returns `{ reused: string[], created: string[], deleted: string[] }`.",
            starterCode: `function reconcileChildren(oldChildren, newChildren) {
  const oldKeyMap = new Map();
  oldChildren.forEach(child => oldKeyMap.set(child.key, child));

  const reused = [];
  const created = [];
  const seenNewKeys = new Set();

  newChildren.forEach(child => {
    seenNewKeys.add(child.key);
    if (oldKeyMap.has(child.key)) {
      reused.push(child.key);
    } else {
      created.push(child.key);
    }
  });

  const deleted = [];
  oldChildren.forEach(child => {
    if (!seenNewKeys.has(child.key)) {
      deleted.push(child.key);
    }
  });

  return { reused, created, deleted };
}
`,
            interviewTrap: "Without keys, React falls back to index comparison. Inserting an item at the beginning causes ALL subsequent items to re-render and mutate.",
            testCases: [
              {
                id: 1,
                name: "Identifies reused, created, and deleted items correctly",
                input: "[A, B, C] -> [B, C, D]",
                expected: { reused: ['B', 'C'], created: ['D'], deleted: ['A'] },
                testFn: "return reconcileChildren([{ key: 'A' }, { key: 'B' }, { key: 'C' }], [{ key: 'B' }, { key: 'C' }, { key: 'D' }]);"
              },
              {
                id: 2,
                name: "Handles complete replacement",
                input: "[1, 2] -> [3, 4]",
                expected: { reused: [], created: ['3', '4'], deleted: ['1', '2'] },
                testFn: "return reconcileChildren([{ key: '1' }, { key: '2' }], [{ key: '3' }, { key: '4' }]);"
              },
              {
                id: 3,
                name: "Handles unchanged re-ordering",
                input: "[X, Y] -> [Y, X]",
                expected: { reused: ['Y', 'X'], created: [], deleted: [] },
                testFn: "return reconcileChildren([{ key: 'X' }, { key: 'Y' }], [{ key: 'Y' }, { key: 'X' }]);"
              }
            ]
          },
          Hard: {
            id: "keys-hard",
            title: "Diagnose & Fix State Corruption from Index-as-Key",
            difficulty: "Hard",
            concept: "Uncontrolled State Retention across Key Changes",
            description: "Implement `simulateTodoDeletion(todos, deleteIndex, useStableKey)` that demonstrates why using index as key causes state corruption when items are removed. When `useStableKey` is true, state stays bound to the item's true ID; when false, state stays bound to the array index.",
            starterCode: `function simulateTodoDeletion(todos, deleteIndex, useStableKey = true) {
  // Each todo has: { id: string, text: string, userTextInInput: string }
  if (useStableKey) {
    // Stable key maps input by id
    const remaining = todos.filter((_, i) => i !== deleteIndex);
    return remaining.map(t => ({ id: t.id, displayedText: t.userTextInInput }));
  } else {
    // Index key associates input state with index!
    const remaining = todos.filter((_, i) => i !== deleteIndex);
    // When deleting index 0, index 0 keeps old index 0's input state!
    return remaining.map((t, idx) => ({
      id: t.id,
      displayedText: todos[idx].userTextInInput // Stale state bleed!
    }));
  }
}
`,
            interviewTrap: "This is the classic senior interview question: when deleting item 0, the input at index 0 still displays item 0's text if index was used as key!",
            testCases: [
              {
                id: 1,
                name: "Stable key preserves correct text on each item after deletion",
                input: "Delete top item with stable key",
                expected: [{ id: '2', displayedText: 'two' }],
                testFn: "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; return simulateTodoDeletion(todos, 0, true);"
              },
              {
                id: 2,
                name: "Index-as-key causes state bleed where remaining item gets deleted item's input state",
                input: "Delete top item with index as key",
                expected: 'one',
                testFn: "const todos = [{ id: '1', text: 'Item 1', userTextInInput: 'one' }, { id: '2', text: 'Item 2', userTextInInput: 'two' }]; const res = simulateTodoDeletion(todos, 0, false); return res[0].displayedText;"
              },
              {
                id: 3,
                name: "Stable keys prevent corruption on middle deletions",
                input: "3 items deleting middle with stable keys",
                expected: ['A', 'C'],
                testFn: "const todos = [{ id: 'a', userTextInInput: 'A' }, { id: 'b', userTextInInput: 'B' }, { id: 'c', userTextInInput: 'C' }]; return simulateTodoDeletion(todos, 1, true).map(t => t.displayedText);"
              }
            ]
          }
        }
      },
      {
        id: "render-vs-commit",
        title: "Render Phase vs Commit Phase Mechanics",
        tag: "Lifecycle",
        summary: "Pure render functions, side effects placement, synchronously flushing DOM changes in commit phase.",
        mentalModel: "The Render Phase calls component functions and reconciles virtual fibers. It MUST be pure with zero side effects, because React may abort or restart it multiple times. The Commit Phase applies DOM changes synchronously, then runs layout and passive effects.",
        traps: "Mutating global variables, making network calls, or setting state inside the render function body.",
        challenges: {
          Basic: {
            id: "phases-basic",
            title: "Pure Component Render Inspector",
            difficulty: "Basic",
            concept: "Idempotence and Purity in Component Body",
            description: "Implement `verifyRenderPurity(componentFn, props)` that runs `componentFn(props)` twice consecutively. If the output varies or side-effect counters change between runs, returns `{ isPure: false }`, otherwise `{ isPure: true, output }`.",
            starterCode: `function verifyRenderPurity(componentFn, props) {
  const run1 = JSON.stringify(componentFn(props));
  const run2 = JSON.stringify(componentFn(props));

  return {
    isPure: run1 === run2,
    output: JSON.parse(run1)
  };
}
`,
            interviewTrap: "React StrictMode renders components TWICE in development specifically to uncover impure renders and accidental side effects.",
            testCases: [
              {
                id: 1,
                name: "Identifies pure deterministic render",
                input: "pure component returns same output",
                expected: true,
                testFn: "const PureComp = p => ({ tag: 'h1', text: p.name }); return verifyRenderPurity(PureComp, { name: 'Alice' }).isPure;"
              },
              {
                id: 2,
                name: "Flags impure component mutating external counter",
                input: "impure component increments global variable",
                expected: false,
                testFn: "let globalCount = 0; const ImpureComp = () => ({ val: ++globalCount }); return verifyRenderPurity(ImpureComp, {}).isPure;"
              },
              {
                id: 3,
                name: "Returns component output safely",
                input: "output text verified",
                expected: "Hello",
                testFn: "const Comp = () => ({ text: 'Hello' }); return verifyRenderPurity(Comp, {}).output.text;"
              }
            ]
          },
          Medium: {
            id: "phases-medium",
            title: "Simulate Two-Phase Render and Commit Pipeline",
            difficulty: "Medium",
            concept: "Separation of VDOM Calculation and DOM Mutation",
            description: "Implement `createUpdatePipeline()` that splits updates into two distinct phases: `renderPhase(components)` which computes DOM changes without touching the DOM, and `commitPhase(changes, targetDOM)` which applies all DOM mutations synchronously.",
            starterCode: `function createUpdatePipeline() {
  let pendingMutations = [];

  return {
    renderPhase(virtualUpdates) {
      // Pure calculation phase: calculate operations
      pendingMutations = virtualUpdates.map(u => ({
        type: u.action, // 'INSERT' | 'UPDATE' | 'REMOVE'
        elementId: u.id,
        content: u.content
      }));
      return pendingMutations.length;
    },
    commitPhase(domContainer) {
      // Synchronous commit phase: flush all mutations into DOM
      const applied = [];
      for (const mut of pendingMutations) {
        applied.push(\`\${mut.type} \${mut.elementId}: \${mut.content}\`);
      }
      pendingMutations = [];
      return applied;
    }
  };
}
`,
            interviewTrap: "Directly modifying the DOM during the render phase causes partial, broken UI states if the render gets aborted.",
            testCases: [
              {
                id: 1,
                name: "Calculates mutations in render phase without executing commit",
                input: "renderPhase stages mutations",
                expected: 2,
                testFn: "const p = createUpdatePipeline(); return p.renderPhase([{ action: 'INSERT', id: '1', content: 'A' }, { action: 'UPDATE', id: '2', content: 'B' }]);"
              },
              {
                id: 2,
                name: "Flushes all staged mutations synchronously during commit",
                input: "commitPhase executes applied mutations",
                expected: ['INSERT 1: Hello', 'UPDATE 2: World'],
                testFn: "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'Hello' }, { action: 'UPDATE', id: '2', content: 'World' }]); return p.commitPhase();"
              },
              {
                id: 3,
                name: "Clears mutation buffer after commit",
                input: "subsequent commit returns empty",
                expected: [],
                testFn: "const p = createUpdatePipeline(); p.renderPhase([{ action: 'INSERT', id: '1', content: 'x' }]); p.commitPhase(); return p.commitPhase();"
              }
            ]
          },
          Hard: {
            id: "phases-hard",
            title: "Interruptible Work Loop with Time-Slicing Simulation",
            difficulty: "Hard",
            concept: "Scheduler Yielding & Concurrent Render Loop",
            description: "Implement `runWorkLoop(workUnits, deadlineMs)` that processes an array of work units. It checks elapsed time after each unit, and if `deadlineMs` is exceeded, pauses execution, yields control, and returns `{ done: false, remainingCount }`. If all units finish within budget, returns `{ done: true, remainingCount: 0 }`.",
            starterCode: `function runWorkLoop(workUnits, deadlineMs = 5) {
  const startTime = performance.now();
  let index = 0;

  while (index < workUnits.length) {
    if (performance.now() - startTime >= deadlineMs) {
      return {
        done: false,
        processedCount: index,
        remainingCount: workUnits.length - index
      };
    }
    workUnits[index]();
    index++;
  }

  return {
    done: true,
    processedCount: index,
    remainingCount: 0
  };
}
`,
            interviewTrap: "This is the exact design of React Concurrent Mode's `shouldYield()` workLoop. Synchronous blocking renders drop 60fps frame rates.",
            testCases: [
              {
                id: 1,
                name: "Completes all units when well within time deadline",
                input: "3 quick units with 50ms deadline",
                expected: { done: true, remainingCount: 0 },
                testFn: "const units = [() => {}, () => {}, () => {}]; const res = runWorkLoop(units, 50); return { done: res.done, remainingCount: res.remainingCount };"
              },
              {
                id: 2,
                name: "Interrupts work loop and yields when deadline is exceeded",
                input: "units exceeding 1ms deadline yield",
                expected: false,
                testFn: "const units = Array.from({ length: 100 }, () => () => { const start = performance.now(); while (performance.now() - start < 1); }); const res = runWorkLoop(units, 2); return res.done;"
              },
              {
                id: 3,
                name: "Processes units sequentially",
                input: "verifies units execute in order",
                expected: [1, 2, 3],
                testFn: "const log = []; const units = [() => log.push(1), () => log.push(2), () => log.push(3)]; runWorkLoop(units, 50); return log;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "react-hooks-state-machine",
    category: "2. Hooks State Machine & Closures",
    badge: "Hooks Internals",
    description: "Hooks linked-list memoizedState, stale closures in useEffect, and effect timings.",
    topics: [
      {
        id: "hooks-under-the-hood",
        title: "Hooks Linked List & Rules of Hooks",
        tag: "Hooks Core",
        summary: "memoizedState pointer list on fiber, call order stability, why hooks cannot be in if-statements.",
        mentalModel: "React stores hook states on the Fiber's `memoizedState` property as a singly linked list (`hook.next`). On every render, React traverses this list in the exact order hooks are called. If a hook call is conditional, the list indices drift, corrupting all subsequent hook states.",
        traps: "Calling hooks inside `if (condition)`, loops, or nested functions, causing silent state corruption or invariant crashes.",
        challenges: {
          Basic: {
            id: "hook-core-basic",
            title: "Simulate useState Hook in Pure JS",
            difficulty: "Basic",
            concept: "Hook State Holder and Setter Dispatcher",
            description: "Implement `createSimpleUseState(initialValue)` that returns a pair `[getState, setState]`. Calling `setState(newValueOrFn)` updates state, and `getState()` returns the current value.",
            starterCode: `function createSimpleUseState(initialValue) {
  let state = typeof initialValue === 'function' ? initialValue() : initialValue;

  function getState() {
    return state;
  }

  function setState(action) {
    if (typeof action === 'function') {
      state = action(state);
    } else {
      state = action;
    }
  }

  return [getState, setState];
}
`,
            interviewTrap: "Not supporting functional updates `setState(prev => prev + 1)`.",
            testCases: [
              {
                id: 1,
                name: "Initializes and updates with direct values",
                input: "setState(42)",
                expected: 42,
                testFn: "const [get, set] = createSimpleUseState(0); set(42); return get();"
              },
              {
                id: 2,
                name: "Supports functional updater syntax",
                input: "set(prev => prev + 5)",
                expected: 15,
                testFn: "const [get, set] = createSimpleUseState(10); set(prev => prev + 5); return get();"
              },
              {
                id: 3,
                name: "Supports lazy initial state function",
                input: "createSimpleUseState(() => 'computed')",
                expected: "computed",
                testFn: "const [get] = createSimpleUseState(() => 'computed'); return get();"
              }
            ]
          },
          Medium: {
            id: "hook-core-medium",
            title: "Multi-Hook Linked List Runner",
            difficulty: "Medium",
            concept: "Fiber memoizedState Linked List & Sequential Traversal",
            description: "Implement `createHookRunner()` that supports multiple calls to `useState()` across consecutive render passes, storing them in a linked-list structure and maintaining state continuity.",
            starterCode: `function createHookRunner() {
  let firstHook = null;
  let currentHook = null;
  let isMount = true;

  function useState(initialState) {
    let hook;

    if (isMount) {
      hook = {
        memoizedState: typeof initialState === 'function' ? initialState() : initialState,
        next: null
      };
      if (!firstHook) {
        firstHook = hook;
      } else {
        currentHook.next = hook;
      }
      currentHook = hook;
    } else {
      hook = currentHook;
      currentHook = currentHook.next;
    }

    const setState = (action) => {
      hook.memoizedState = typeof action === 'function' ? action(hook.memoizedState) : action;
    };

    return [hook.memoizedState, setState];
  }

  function prepareRender() {
    isMount = firstHook === null;
    currentHook = firstHook;
  }

  return { useState, prepareRender };
}
`,
            interviewTrap: "React does not use key names for hooks! It relies 100% on execution call order to pair each hook with its corresponding slot in the linked list.",
            testCases: [
              {
                id: 1,
                name: "Maintains multiple independent hook states in order",
                input: "useState('name') and useState('age')",
                expected: ['Alice', 25],
                testFn: "const r = createHookRunner(); r.prepareRender(); const [name] = r.useState('Alice'); const [age] = r.useState(25); return [name, age];"
              },
              {
                id: 2,
                name: "Preserves updated values across multiple renders",
                input: "setState updates state on next render pass",
                expected: ['Bob', 26],
                testFn: "const r = createHookRunner(); r.prepareRender(); const [, setName] = r.useState('Alice'); const [, setAge] = r.useState(25); setName('Bob'); setAge(prev => prev + 1); r.prepareRender(); const [name2] = r.useState(); const [age2] = r.useState(); return [name2, age2];"
              },
              {
                id: 3,
                name: "Handles 3 or more hooks in strict sequence",
                input: "3 hooks preserved accurately",
                expected: [1, 2, 3],
                testFn: "const r = createHookRunner(); r.prepareRender(); r.useState(1); r.useState(2); r.useState(3); r.prepareRender(); return [r.useState()[0], r.useState()[0], r.useState()[0]];"
              }
            ]
          },
          Hard: {
            id: "hook-core-hard",
            title: "Rules of Hooks Dynamic Validator",
            difficulty: "Hard",
            concept: "Detecting Conditional or Shuffled Hook Calls",
            description: "Implement `validateHookSequence(mountHooks, updateHooks)` that compares the sequence of hook types called on mount vs update. If update calls fewer hooks, more hooks, or a different hook type at any index, throws an Error detailing the exact violation.",
            starterCode: `function validateHookSequence(mountHookTypes, updateHookTypes) {
  if (mountHookTypes.length !== updateHookTypes.length) {
    throw new Error(\`Rendered fewer or more hooks than expected. Mounted: \${mountHookTypes.length}, Updated: \${updateHookTypes.length}\`);
  }

  for (let i = 0; i < mountHookTypes.length; i++) {
    if (mountHookTypes[i] !== updateHookTypes[i]) {
      throw new Error(\`Hook type mismatch at slot \${i}: expected \${mountHookTypes[i]}, received \${updateHookTypes[i]}\`);
    }
  }

  return { valid: true };
}
`,
            interviewTrap: "This is the exact runtime error React throws: 'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.'",
            testCases: [
              {
                id: 1,
                name: "Validates identical hook sequences across renders",
                input: "['useState', 'useEffect'] -> ['useState', 'useEffect']",
                expected: true,
                testFn: "return validateHookSequence(['useState', 'useEffect'], ['useState', 'useEffect']).valid;"
              },
              {
                id: 2,
                name: "Throws error when hook count changes between renders",
                input: "mount 3 hooks, update 2 hooks throws Error",
                expected: true,
                testFn: "try { validateHookSequence(['useState', 'useRef', 'useEffect'], ['useState', 'useEffect']); return false; } catch (e) { return true; }"
              },
              {
                id: 3,
                name: "Throws error when hook type order is transposed",
                input: "swapped hooks throws type mismatch error",
                expected: true,
                testFn: "try { validateHookSequence(['useState', 'useEffect'], ['useEffect', 'useState']); return false; } catch (e) { return e.message.includes('Hook type mismatch'); }"
              }
            ]
          }
        }
      },
      {
        id: "stale-closures-effect",
        title: "Stale Closures & Functional State Updates",
        tag: "Hooks Pitfalls",
        summary: "Stale state in asynchronous callbacks, functional state updates, and useEvent RFC pattern.",
        mentalModel: "Callbacks defined inside component bodies capture state variables as they existed during that specific render. If the callback runs later asynchronously without reading a ref or using functional update `prev => ...`, it reads stale snapshot values.",
        traps: "Passing stale state to web socket listeners or intervals, causing updates to revert previous changes.",
        challenges: {
          Basic: {
            id: "stale-effect-basic",
            title: "Async State Updater Guard",
            difficulty: "Basic",
            concept: "Avoiding Stale Snapshots in Asynchronous Callbacks",
            description: "Implement `createSafeAsyncAccumulator(initialVal)` that provides `addAsync(amount)`: it simulates an asynchronous API delay, then safely adds `amount` to the current state using a functional updater pattern.",
            starterCode: `function createSafeAsyncAccumulator(initialVal = 0) {
  let state = initialVal;

  function update(fn) {
    state = fn(state);
  }

  async function addAsync(amount, delayMs = 10) {
    await new Promise(r => setTimeout(r, delayMs));
    update(prev => prev + amount);
    return state;
  }

  return {
    getState: () => state,
    addAsync
  };
}
`,
            interviewTrap: "Reading `state + amount` after the await delay will drop any concurrent updates that finished while the promise was pending.",
            testCases: [
              {
                id: 1,
                name: "Safely aggregates concurrent async updates without losing data",
                input: "addAsync(10) and addAsync(20) fired concurrently",
                expected: 30,
                testFn: "const acc = createSafeAsyncAccumulator(0); await Promise.all([acc.addAsync(10, 20), acc.addAsync(20, 10)]); return acc.getState();"
              },
              {
                id: 2,
                name: "Maintains initial value",
                input: "starts at 100",
                expected: 100,
                testFn: "const acc = createSafeAsyncAccumulator(100); return acc.getState();"
              },
              {
                id: 3,
                name: "Handles sequential updates",
                input: "add 5 then add 10",
                expected: 15,
                testFn: "const acc = createSafeAsyncAccumulator(0); await acc.addAsync(5, 5); await acc.addAsync(10, 5); return acc.getState();"
              }
            ]
          },
          Medium: {
            id: "stale-effect-medium",
            title: "Implement useInterval (Dan Abramov Pattern)",
            difficulty: "Medium",
            concept: "Mutable Saved Callback Ref to Eliminate Interval Teardowns",
            description: "Implement `createUseIntervalManager()` that accepts an interval callback and delay. Whenever the callback changes, update the internal saved reference WITHOUT restarting the interval timer.",
            starterCode: `function createUseIntervalManager() {
  let savedCallback = null;
  let timerId = null;

  function setCallback(fn) {
    savedCallback = fn;
  }

  function start(delayMs) {
    if (timerId !== null) clearInterval(timerId);
    if (delayMs !== null && delayMs !== undefined) {
      timerId = setInterval(() => {
        if (savedCallback) savedCallback();
      }, delayMs);
    }
  }

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return { setCallback, start, stop };
}
`,
            interviewTrap: "Setting `callback` in the `useEffect` dependency array restarts the interval on every render, resetting the timer tick.",
            testCases: [
              {
                id: 1,
                name: "Invokes the freshest callback without restarting the timer",
                input: "update callback mid-flight",
                expected: "fresh-callback",
                testFn: "const manager = createUseIntervalManager(); let calledWith = ''; manager.setCallback(() => { calledWith = 'old'; }); manager.start(20); manager.setCallback(() => { calledWith = 'fresh-callback'; }); await new Promise(r => setTimeout(r, 35)); manager.stop(); return calledWith;"
              },
              {
                id: 2,
                name: "stop() halts timer ticks cleanly",
                input: "ticks stop after calling stop()",
                expected: 1,
                testFn: "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(15); await new Promise(r => setTimeout(r, 25)); manager.stop(); await new Promise(r => setTimeout(r, 30)); return count;"
              },
              {
                id: 3,
                name: "Does not start timer if delay is null",
                input: "start(null) pauses timer",
                expected: 0,
                testFn: "const manager = createUseIntervalManager(); let count = 0; manager.setCallback(() => count++); manager.start(null); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ]
          },
          Hard: {
            id: "stale-effect-hard",
            title: "Implement 'useEffectEvent' / useEvent Polyfill",
            difficulty: "Hard",
            concept: "Stable Identity Event Function with Always-Fresh Lexical Scope",
            description: "Implement `useEffectEvent(handler)`: returns a function whose reference identity NEVER changes across renders, but when called, ALWAYS executes the latest `handler` passed on the most recent render.",
            starterCode: `function createEffectEventManager() {
  let latestHandler = null;

  function updateHandler(handler) {
    latestHandler = handler;
  }

  // Stable function reference that delegates to latestHandler
  const stableEvent = function(...args) {
    if (typeof latestHandler !== 'function') {
      throw new Error('Cannot call useEffectEvent when no handler is attached');
    }
    return latestHandler(...args);
  };

  return { updateHandler, stableEvent };
}
`,
            interviewTrap: "Developers often wrap handlers in `useCallback(fn, [deps])`, causing child components or effects to re-run whenever dependencies change. `useEffectEvent` extracts non-reactive event logic cleanly.",
            testCases: [
              {
                id: 1,
                name: "Stable function identity remains strictly identical across renders",
                input: "stableEvent === stableEvent across renders",
                expected: true,
                testFn: "const manager = createEffectEventManager(); const fn1 = manager.stableEvent; manager.updateHandler(() => 1); const fn2 = manager.stableEvent; return fn1 === fn2;"
              },
              {
                id: 2,
                name: "Executes the newest handler reading fresh props",
                input: "handler updated with new prop value",
                expected: "Theme: dark",
                testFn: "const manager = createEffectEventManager(); manager.updateHandler((msg) => \`\${msg}: light\`); manager.updateHandler((msg) => \`\${msg}: dark\`); return manager.stableEvent('Theme');"
              },
              {
                id: 3,
                name: "Passes all parameters and returns output correctly",
                input: "stableEvent(10, 20)",
                expected: 30,
                testFn: "const manager = createEffectEventManager(); manager.updateHandler((a, b) => a + b); return manager.stableEvent(10, 20);"
              }
            ]
          }
        }
      },
      {
        id: "effect-timings",
        title: "useEffect vs useLayoutEffect vs useInsertionEffect",
        tag: "Lifecycle",
        summary: "Paint blocking vs asynchronous passive effects, CSS-in-JS injection, and layout measurement.",
        mentalModel: "`useInsertionEffect` fires synchronously BEFORE DOM mutations (for CSS-in-JS injection). `useLayoutEffect` fires synchronously AFTER DOM mutations but BEFORE browser paint (for measurements). `useEffect` fires asynchronously AFTER the browser has painted pixels to screen.",
        traps: "Causing screen flickering by measuring DOM and setting state inside `useEffect` (requires `useLayoutEffect`).",
        challenges: {
          Basic: {
            id: "effect-timings-basic",
            title: "Effect Phase Order Logger",
            difficulty: "Basic",
            concept: "Hook Lifecycle Timing Sequence",
            description: "Implement `logLifecyclePhases()` that returns an array with the exact execution order of: `'useInsertionEffect'`, `'DOM Mutation'`, `'useLayoutEffect'`, `'Browser Paint'`, and `'useEffect'`.",
            starterCode: `function logLifecyclePhases() {
  return [
    'useInsertionEffect',
    'DOM Mutation',
    'useLayoutEffect',
    'Browser Paint',
    'useEffect'
  ];
}
`,
            interviewTrap: "`useEffect` is passive and deferred until after paint. `useLayoutEffect` blocks painting.",
            testCases: [
              {
                id: 1,
                name: "Returns correct lifecycle sequence",
                input: "logLifecyclePhases()",
                expected: [
                  'useInsertionEffect',
                  'DOM Mutation',
                  'useLayoutEffect',
                  'Browser Paint',
                  'useEffect'
                ],
                testFn: "return logLifecyclePhases();"
              },
              {
                id: 2,
                name: "useLayoutEffect runs before Browser Paint",
                input: "layout effect precedes paint",
                expected: true,
                testFn: "const p = logLifecyclePhases(); return p.indexOf('useLayoutEffect') < p.indexOf('Browser Paint');"
              },
              {
                id: 3,
                name: "useEffect runs strictly after Browser Paint",
                input: "useEffect follows paint",
                expected: true,
                testFn: "const p = logLifecyclePhases(); return p.indexOf('useEffect') > p.indexOf('Browser Paint');"
              }
            ]
          },
          Medium: {
            id: "effect-timings-medium",
            title: "Simulate Synchronous Layout Measure Hook",
            difficulty: "Medium",
            concept: "useLayoutEffect DOM Mutation & Measurement Synchronization",
            description: "Implement `measureElementSynchronously(element, measureFn)` that executes `measureFn(element)` synchronously immediately after element attributes are written, guaranteeing that measurements occur before paint without flicker.",
            starterCode: `function measureElementSynchronously(element, measureFn) {
  // Synchronous layout step: DOM is mutated, immediately measure geometry
  const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 100, height: 50 };
  return measureFn(rect);
}
`,
            interviewTrap: "Measuring in `useEffect` causes a visible flicker: the user sees the unstyled/unmeasured element for one frame before it repositions.",
            testCases: [
              {
                id: 1,
                name: "Synchronously measures element geometry",
                input: "measures width and height",
                expected: { width: 100, height: 50 },
                testFn: "const el = document.createElement('div'); return measureElementSynchronously(el, r => ({ width: r.width, height: r.height }));"
              },
              {
                id: 2,
                name: "Computes derived layout position immediately",
                input: "calculates center coordinate",
                expected: 50,
                testFn: "const el = document.createElement('div'); return measureElementSynchronously(el, r => r.width / 2);"
              },
              {
                id: 3,
                name: "Returns synchronously without promises or timeouts",
                input: "synchronous execution return",
                expected: true,
                testFn: "let measured = false; const el = document.createElement('div'); measureElementSynchronously(el, () => { measured = true; }); return measured;"
              }
            ]
          },
          Hard: {
            id: "effect-timings-hard",
            title: "Dual Queue Effect Scheduler (Layout Sync vs Passive Async)",
            difficulty: "Hard",
            concept: "Scheduler Separation of Layout and Passive Effect Queues",
            description: "Implement `createEffectScheduler()` that maintains two effect queues: `layoutQueue` (executed synchronously during commit) and `passiveQueue` (executed asynchronously after a tick). Returns an object with `scheduleLayout(fn)`, `schedulePassive(fn)`, `flushLayout()`, and `flushPassive()`.",
            starterCode: `function createEffectScheduler() {
  const layoutQueue = [];
  const passiveQueue = [];

  return {
    scheduleLayout(fn) {
      layoutQueue.push(fn);
    },
    schedulePassive(fn) {
      passiveQueue.push(fn);
    },
    flushLayout() {
      const executed = [];
      while (layoutQueue.length > 0) {
        const fn = layoutQueue.shift();
        executed.push(fn());
      }
      return executed;
    },
    async flushPassive() {
      // Yield to macrotask/microtask to simulate post-paint delivery
      await new Promise(r => setTimeout(r, 0));
      const executed = [];
      while (passiveQueue.length > 0) {
        const fn = passiveQueue.shift();
        executed.push(fn());
      }
      return executed;
    }
  };
}
`,
            interviewTrap: "If layout effects throw errors, the commit fails synchronously. If passive effects throw errors, they are surfaced in the next turn of the event loop.",
            testCases: [
              {
                id: 1,
                name: "Executes layout effects synchronously before passive effects",
                input: "layout effects run first",
                expected: ['layout', 'passive'],
                testFn: "const s = createEffectScheduler(); const log = []; s.schedulePassive(() => log.push('passive')); s.scheduleLayout(() => log.push('layout')); s.flushLayout(); await s.flushPassive(); return log;"
              },
              {
                id: 2,
                name: "flushLayout clears all pending layout items",
                input: "layout queue is drained",
                expected: [1, 2],
                testFn: "const s = createEffectScheduler(); s.scheduleLayout(() => 1); s.scheduleLayout(() => 2); return s.flushLayout();"
              },
              {
                id: 3,
                name: "flushPassive runs asynchronously after tick",
                input: "passive flush resolves with executed values",
                expected: ['async-done'],
                testFn: "const s = createEffectScheduler(); s.schedulePassive(() => 'async-done'); return await s.flushPassive();"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "react-rerenders-performance",
    category: "3. Re-render Cascades & Performance",
    badge: "Optimization",
    description: "Re-render cascades, memoization pitfalls, context churn, and composition over memo.",
    topics: [
      {
        id: "rerender-triggers-memo",
        title: "Re-render Triggers & 'React.memo' Mechanics",
        tag: "Performance",
        summary: "Default re-render cascade, shallow prop comparison, and breaking memoization with inline callbacks.",
        mentalModel: "Whenever a parent component re-renders, React re-renders every child component down the tree by default. `React.memo` stops this descent by checking if all props are identical using `Object.is`. Passing a new object or inline function reference `() => {}` forces re-rendering.",
        traps: "Wrapping a component in `React.memo` but passing inline objects `<Child config={{ mode: 'dark' }} />`.",
        challenges: {
          Basic: {
            id: "memo-basic",
            title: "Detect Broken Memoization from Inline References",
            difficulty: "Basic",
            concept: "Reference Identity Drift in Inline Props",
            description: "Implement `isMemoBypassed(oldProps, newProps)` that checks whether any object or function prop changed reference identity even if its serialized value looks identical.",
            starterCode: `function isMemoBypassed(oldProps, newProps) {
  for (const key of Object.keys(oldProps)) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
      if (oldVal !== newVal) {
        return true; // Reference identity changed! Memo is bypassed
      }
    }
    if (typeof oldVal === 'function' && typeof newVal === 'function') {
      if (oldVal !== newVal) {
        return true;
      }
    }
  }
  return false;
}
`,
            interviewTrap: "Candidates often say 'React deep compares props'. React NEVER deep compares props by default; it does a shallow `===` on each prop.",
            testCases: [
              {
                id: 1,
                name: "Detects new inline object reference breaking memo",
                input: "{ style: {} } vs { style: {} }",
                expected: true,
                testFn: "return isMemoBypassed({ style: { color: 'red' } }, { style: { color: 'red' } });"
              },
              {
                id: 2,
                name: "Detects new inline callback reference breaking memo",
                input: "onClick: () => {} recreated on every render",
                expected: true,
                testFn: "return isMemoBypassed({ onClick: () => 1 }, { onClick: () => 1 });"
              },
              {
                id: 3,
                name: "Passes when stable references are reused",
                input: "shared stable object reference",
                expected: false,
                testFn: "const shared = { theme: 'dark' }; return isMemoBypassed({ conf: shared }, { conf: shared });"
              }
            ]
          },
          Medium: {
            id: "memo-medium",
            title: "Implement Custom useMemo & useCallback Engine",
            difficulty: "Medium",
            concept: "Hook-Level Memoization via Dependency Caching",
            description: "Implement `createMemoEngine()` providing `useMemo(factory, deps)` and `useCallback(fn, deps)`. Only re-evaluates `factory` or returns a new function when `deps` change according to `Object.is`.",
            starterCode: `function createMemoEngine() {
  let memoSlot = null;
  let callbackSlot = null;

  function useMemo(factory, deps) {
    if (memoSlot && deps && memoSlot.deps.every((d, i) => Object.is(d, deps[i]))) {
      return memoSlot.value;
    }
    const value = factory();
    memoSlot = { value, deps };
    return value;
  }

  function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
  }

  return { useMemo, useCallback };
}
`,
            interviewTrap: "`useCallback(fn, deps)` is literally just syntactic sugar for `useMemo(() => fn, deps)`.",
            testCases: [
              {
                id: 1,
                name: "useMemo caches computation when deps do not change",
                input: "factory called once across multiple renders with same deps",
                expected: 1,
                testFn: "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 42; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [1]); return calls;"
              },
              {
                id: 2,
                name: "useMemo recomputes when deps change",
                input: "dep changes from 1 to 2",
                expected: 2,
                testFn: "const engine = createMemoEngine(); let calls = 0; const compute = () => { calls++; return 100; }; engine.useMemo(compute, [1]); engine.useMemo(compute, [2]); return calls;"
              },
              {
                id: 3,
                name: "useCallback preserves function reference when deps match",
                input: "stable callback identity",
                expected: true,
                testFn: "const engine = createMemoEngine(); const cb1 = engine.useCallback(() => 1, ['id']); const cb2 = engine.useCallback(() => 1, ['id']); return cb1 === cb2;"
              }
            ]
          },
          Hard: {
            id: "memo-hard",
            title: "Reselect-Style Memoized Selector with Multi-Input Caching",
            difficulty: "Hard",
            concept: "Memoized Reselect Selector Architecture",
            description: "Implement `createSelector(...inputSelectors, resultFn)` that only re-computes `resultFn` when the output of any input selector changes, returning the cached result otherwise.",
            starterCode: `function createSelector(...args) {
  const resultFn = args.pop();
  const inputSelectors = args;

  let lastInputs = null;
  let lastResult = null;

  return function(state) {
    const currentInputs = inputSelectors.map(sel => sel(state));

    if (lastInputs && currentInputs.every((val, i) => Object.is(val, lastInputs[i]))) {
      return lastResult;
    }

    lastResult = resultFn(...currentInputs);
    lastInputs = currentInputs;
    return lastResult;
  };
}
`,
            interviewTrap: "Recalculating expensive derivations (filtering, sorting) inside components triggers massive lag. Memoized selectors guarantee constant time lookups on re-renders.",
            testCases: [
              {
                id: 1,
                name: "Computes output from input selectors",
                input: "select sum of numbers",
                expected: 30,
                testFn: "const selectA = s => s.a; const selectB = s => s.b; const selectSum = createSelector(selectA, selectB, (a, b) => a + b); return selectSum({ a: 10, b: 20 });"
              },
              {
                id: 2,
                name: "Skips execution of resultFn when inputs are identical",
                input: "calls resultFn once for identical inputs",
                expected: 1,
                testFn: "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 5 }); return calls;"
              },
              {
                id: 3,
                name: "Recomputes when selected state slice changes",
                input: "recomputes on state change",
                expected: 2,
                testFn: "let calls = 0; const selectSum = createSelector(s => s.x, x => { calls++; return x * 2; }); selectSum({ x: 5 }); selectSum({ x: 6 }); return calls;"
              }
            ]
          }
        }
      },
      {
        id: "context-churn",
        title: "Context Churn & Split Context Architecture",
        tag: "Context Architecture",
        summary: "Context value object identity, re-render cascades across all consumers, splitting state and dispatch.",
        mentalModel: "When a Context Provider's `value` prop changes identity, EVERY component that calls `useContext(MyContext)` MUST re-render, bypassing any `React.memo` or `shouldComponentUpdate` checks. Splitting into separate `StateContext` and `DispatchContext` prevents dispatch consumers from re-rendering on state changes.",
        traps: "Passing `{ state, dispatch }` directly into `<Context.Provider value={{ state, dispatch }}>` recreates the object on every render, triggering full app churn.",
        challenges: {
          Basic: {
            id: "context-basic",
            title: "Split Context Provider Simulator",
            difficulty: "Basic",
            concept: "Separating State from Dispatch in React Context",
            description: "Implement `createSplitContext(initialState)` that creates distinct state and dispatch channels, allowing dispatch functions to maintain stable identity forever.",
            starterCode: `function createSplitContext(initialState) {
  let state = initialState;
  const dispatchListeners = new Set();
  const stateListeners = new Set();

  const dispatch = (action) => {
    if (typeof action === 'function') {
      state = action(state);
    } else {
      state = { ...state, ...action };
    }
    stateListeners.forEach(listener => listener(state));
  };

  return {
    getState: () => state,
    getDispatch: () => dispatch, // Stable reference forever
    subscribeState: (fn) => { stateListeners.add(fn); return () => stateListeners.delete(fn); }
  };
}
`,
            interviewTrap: "Components that only need `dispatch` (like buttons) should NEVER re-render when state changes. Splitting context achieves this.",
            testCases: [
              {
                id: 1,
                name: "Dispatch function has strictly stable reference identity",
                input: "getDispatch() === getDispatch() across calls",
                expected: true,
                testFn: "const ctx = createSplitContext({ count: 0 }); return ctx.getDispatch() === ctx.getDispatch();"
              },
              {
                id: 2,
                name: "Dispatching updates state listeners",
                input: "dispatch updates count to 1",
                expected: 1,
                testFn: "const ctx = createSplitContext({ count: 0 }); let updated = 0; ctx.subscribeState(s => { updated = s.count; }); ctx.getDispatch()({ count: 1 }); return updated;"
              },
              {
                id: 3,
                name: "Supports functional action updates",
                input: "dispatch(prev => ({ count: prev.count + 5 }))",
                expected: 15,
                testFn: "const ctx = createSplitContext({ count: 10 }); ctx.getDispatch()(prev => ({ count: prev.count + 5 })); return ctx.getState().count;"
              }
            ]
          },
          Medium: {
            id: "context-medium",
            title: "Selective Context Slice Subscription",
            difficulty: "Medium",
            concept: "Avoiding Full Re-renders with Slice Selectors",
            description: "Implement `createSelectiveContextStore(initialState)` that allows consumers to subscribe only to a selected slice of context. Consumers are notified ONLY when their selected slice changes.",
            starterCode: `function createSelectiveContextStore(initialState) {
  let state = initialState;
  const subscribers = new Set();

  function setState(updater) {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    for (const sub of subscribers) {
      sub.check();
    }
  }

  function subscribeSlice(selector, callback) {
    let currentSlice = selector(state);
    const sub = {
      check: () => {
        const nextSlice = selector(state);
        if (!Object.is(currentSlice, nextSlice)) {
          currentSlice = nextSlice;
          callback(nextSlice);
        }
      }
    };
    subscribers.add(sub);
    return () => subscribers.delete(sub);
  }

  return { getState: () => state, setState, subscribeSlice };
}
`,
            interviewTrap: "Standard React Context cannot bail out of renders for partial state changes. Custom selector stores solve this problem.",
            testCases: [
              {
                id: 1,
                name: "Notifies slice subscriber when its slice changes",
                input: "update user.name notifies name subscriber",
                expected: ['Bob'],
                testFn: "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); const log = []; store.subscribeSlice(s => s.user, u => log.push(u)); store.setState({ user: 'Bob' }); return log;"
              },
              {
                id: 2,
                name: "Ignores updates to unrelated state slices",
                input: "update theme does not notify user subscriber",
                expected: 0,
                testFn: "const store = createSelectiveContextStore({ user: 'Alice', theme: 'dark' }); let calls = 0; store.subscribeSlice(s => s.user, () => calls++); store.setState({ theme: 'light' }); return calls;"
              },
              {
                id: 3,
                name: "Unsubscribe cleans up subscriber properly",
                input: "unsub stops future notifications",
                expected: 1,
                testFn: "const store = createSelectiveContextStore({ count: 0 }); let count = 0; const unsub = store.subscribeSlice(s => s.count, () => count++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return count;"
              }
            ]
          },
          Hard: {
            id: "context-hard",
            title: "Fine-Grained Context Selector with Invalidation Channels",
            difficulty: "Hard",
            concept: "Zustand-Style Subscription Architecture",
            description: "Implement `createContextChannel(initialState)` that supports fine-grained selector subscriptions with custom equality comparators (e.g. shallow array equality).",
            starterCode: `function createContextChannel(initialState) {
  let state = initialState;
  const listeners = new Set();

  function subscribe(selector, onStoreChange, equalityFn = Object.is) {
    let lastSelection = selector(state);

    const listener = () => {
      const nextSelection = selector(state);
      if (!equalityFn(lastSelection, nextSelection)) {
        lastSelection = nextSelection;
        onStoreChange(nextSelection);
      }
    };

    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function emit(nextState) {
    state = typeof nextState === 'function' ? nextState(state) : { ...state, ...nextState };
    listeners.forEach(l => l());
  }

  return { subscribe, emit, getState: () => state };
}
`,
            interviewTrap: "Using deep comparison everywhere kills performance. Using `shallowEqual` on array slices avoids unnecessary notification without high diff cost.",
            testCases: [
              {
                id: 1,
                name: "Suppresses notifications when shallow array contents match",
                input: "array slice returns same items with shallow comparison",
                expected: 0,
                testFn: "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2] }); return notified;"
              },
              {
                id: 2,
                name: "Fires notification when array items differ",
                input: "array items change",
                expected: 1,
                testFn: "const channel = createContextChannel({ items: [1, 2] }); let notified = 0; const shallowArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); channel.subscribe(s => s.items, () => notified++, shallowArray); channel.emit({ items: [1, 2, 3] }); return notified;"
              },
              {
                id: 3,
                name: "Maintains independent subscribers across different channels",
                input: "two subscribers on different state properties",
                expected: [1, 0],
                testFn: "const channel = createContextChannel({ a: 1, b: 2 }); let callsA = 0; let callsB = 0; channel.subscribe(s => s.a, () => callsA++); channel.subscribe(s => s.b, () => callsB++); channel.emit({ a: 99 }); return [callsA, callsB];"
              }
            ]
          }
        }
      },
      {
        id: "composition-over-memo",
        title: "Component Composition to Eliminate Re-renders",
        tag: "Architecture",
        summary: "Moving state down, lifting content up via `children`, slots, and avoiding premature `React.memo`.",
        mentalModel: "Passing an expensive component as the `children` prop `<Parent><ExpensiveTree /></Parent>` prevents `ExpensiveTree` from re-rendering when `Parent`'s state changes! Because `ExpensiveTree` is evaluated in the grandparent's render scope, its element reference is identical across `Parent` re-renders.",
        traps: "Reaching for `useMemo` or `React.memo` everywhere when simple component restructuring (`children` as props) solves re-renders naturally.",
        challenges: {
          Basic: {
            id: "comp-basic",
            title: "Children as Props Re-render Isolator",
            difficulty: "Basic",
            concept: "Children Prop Reference Stability Across Parent Re-renders",
            description: "Implement `simulateChildrenPattern(parentRenders, childElement)` that tracks how many times `childElement` is re-created when its parent container re-renders 5 times.",
            starterCode: `function simulateChildrenPattern(parentRendersCount, childElement) {
  // When child is passed as a prop from an outer owner, its element reference is stable
  const renderedChildrenInstances = [];
  for (let i = 0; i < parentRendersCount; i++) {
    // Parent re-renders, but receives the exact same childElement reference!
    renderedChildrenInstances.push(childElement);
  }
  return {
    allIdentical: renderedChildrenInstances.every(inst => inst === childElement),
    count: renderedChildrenInstances.length
  };
}
`,
            interviewTrap: "This is one of Dan Abramov's most famous React mental models: 'Before You memo()', try moving state down or lifting content up.",
            testCases: [
              {
                id: 1,
                name: "Preserves identical child reference across parent renders",
                input: "children prop retains reference identity",
                expected: true,
                testFn: "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).allIdentical;"
              },
              {
                id: 2,
                name: "Maintains render count",
                input: "5 parent renders",
                expected: 5,
                testFn: "const child = { type: 'ExpensiveTree' }; return simulateChildrenPattern(5, child).count;"
              },
              {
                id: 3,
                name: "Works with nested component objects",
                input: "nested children prop",
                expected: true,
                testFn: "const complex = { type: 'div', props: { items: [1, 2, 3] } }; return simulateChildrenPattern(3, complex).allIdentical;"
              }
            ]
          },
          Medium: {
            id: "comp-medium",
            title: "Render Prop / Slot Decoupler",
            difficulty: "Medium",
            concept: "Inverting Control via Render Props",
            description: "Implement `createSlotContainer(renderHeader, renderBody)` that accepts slot render functions and generates UI output without tightly coupling internal layout state to children.",
            starterCode: `function createSlotContainer(renderHeader, renderBody) {
  return function render(internalState) {
    return {
      header: renderHeader(internalState),
      body: renderBody(internalState)
    };
  };
}
`,
            interviewTrap: "Creating slot components inside the render loop rather than passing them from outer scope recreates DOM nodes on every render.",
            testCases: [
              {
                id: 1,
                name: "Supplies internal state to header and body slots",
                input: "slots receive active user state",
                expected: { header: 'TITLE: Admin', body: 'CONTENT: Admin' },
                testFn: "const container = createSlotContainer(s => 'TITLE: ' + s.user, s => 'CONTENT: ' + s.user); return container({ user: 'Admin' });"
              },
              {
                id: 2,
                name: "Decouples slots cleanly",
                input: "custom body rendering",
                expected: 100,
                testFn: "const container = createSlotContainer(() => 'header', s => s.count * 10); return container({ count: 10 }).body;"
              },
              {
                id: 3,
                name: "Handles static content slots",
                input: "static slot text",
                expected: 'Static Header',
                testFn: "const container = createSlotContainer(() => 'Static Header', () => 'Static Body'); return container({}).header;"
              }
            ]
          },
          Hard: {
            id: "comp-hard",
            title: "Compound Component Pattern with Context Sharing",
            difficulty: "Hard",
            concept: "Compound Components (Tabs, Accordions, Menus)",
            description: "Implement `createCompoundAccordion()` with `Accordion(items)` and `Item(id, title, content)` that coordinates which panel is open without manual prop drilling.",
            starterCode: `function createCompoundAccordion(defaultOpenId = null) {
  let openId = defaultOpenId;
  const items = [];

  function addItem(id, title, content) {
    items.push({ id, title, content });
  }

  function toggle(id) {
    openId = openId === id ? null : id;
  }

  function render() {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      isOpen: item.id === openId
    }));
  }

  return { addItem, toggle, render };
}
`,
            interviewTrap: "Passing `isOpen` and `onToggle` through multiple levels of parent-child-grandchild props creates fragile code. Compound components manage shared state implicitly.",
            testCases: [
              {
                id: 1,
                name: "Opens default item on initialization",
                input: "defaultOpenId = '1'",
                expected: true,
                testFn: "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); return acc.render()[0].isOpen;"
              },
              {
                id: 2,
                name: "Switches active open panel on toggle",
                input: "toggle('2') closes panel 1 and opens panel 2",
                expected: [false, true],
                testFn: "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.addItem('2', 'T2', 'C2'); acc.toggle('2'); const r = acc.render(); return [r[0].isOpen, r[1].isOpen];"
              },
              {
                id: 3,
                name: "Toggling active panel closes it (accordion collapses)",
                input: "toggle active panel collapses it to null",
                expected: false,
                testFn: "const acc = createCompoundAccordion('1'); acc.addItem('1', 'T1', 'C1'); acc.toggle('1'); return acc.render()[0].isOpen;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "react-refs-dom",
    category: "4. Refs, DOM & Imperative Handles",
    badge: "DOM Interop",
    description: "useRef mutable container vs state, forwardRef, and useImperativeHandle.",
    topics: [
      {
        id: "useref-internals",
        title: "useRef: Mutable Container vs State",
        tag: "Refs",
        summary: "useRef vs useState, mutability without re-rendering, retaining previous values, timer handles.",
        mentalModel: "`useRef(initial)` returns a plain JS object `{ current: initial }` that is guaranteed to be the exact same object reference on every render. Mutating `ref.current = value` is completely synchronous and NEVER triggers a component re-render.",
        traps: "Writing or reading `ref.current` during the render phase (violating purity). Refs should only be read/written in effects or event handlers.",
        challenges: {
          Basic: {
            id: "ref-basic",
            title: "useRef Simulation (Stable Identity Across Renders)",
            difficulty: "Basic",
            concept: "Mutable Container Object Pattern",
            description: "Implement `createRefContainer(initialValue)` that returns `{ current: initialValue }` whose reference identity remains strictly constant across all calls.",
            starterCode: `function createRefContainer(initialValue) {
  let ref = null;
  return function getRef() {
    if (ref === null) {
      ref = { current: initialValue };
    }
    return ref;
  };
}
`,
            interviewTrap: "Thinking updating a ref re-renders the component. If UI needs to visually update on change, you MUST use `useState`.",
            testCases: [
              {
                id: 1,
                name: "Returns stable object reference across calls",
                input: "ref1 === ref2",
                expected: true,
                testFn: "const hook = createRefContainer(0); const r1 = hook(); const r2 = hook(); return r1 === r2;"
              },
              {
                id: 2,
                name: "Allows synchronous mutation of current property",
                input: "ref.current = 42 persists",
                expected: 42,
                testFn: "const hook = createRefContainer('initial'); const r = hook(); r.current = 42; return hook().current;"
              },
              {
                id: 3,
                name: "Holds non-primitive object or DOM node reference",
                input: "ref.current = document.createElement('div')",
                expected: 'DIV',
                testFn: "const hook = createRefContainer(null); const r = hook(); r.current = { tagName: 'DIV' }; return hook().current.tagName;"
              }
            ]
          },
          Medium: {
            id: "ref-medium",
            title: "Implement useClickOutside Detector",
            difficulty: "Medium",
            concept: "DOM Node Containment via Refs",
            description: "Implement `setupClickOutside(refNode, onOutsideClick)` that listens for document clicks and invokes `onOutsideClick()` only if the clicked target is outside `refNode`.",
            starterCode: `function setupClickOutside(refNode, onOutsideClick) {
  function handler(event) {
    if (!refNode || !refNode.contains) return;
    if (!refNode.contains(event.target)) {
      onOutsideClick(event);
    }
  }

  return handler;
}
`,
            interviewTrap: "Forgetting that `ref.current` can be null before mounting or after unmounting.",
            testCases: [
              {
                id: 1,
                name: "Fires callback when clicking outside referenced node",
                input: "click outside container",
                expected: true,
                testFn: "const node = document.createElement('div'); const outside = document.createElement('span'); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: outside }); return called;"
              },
              {
                id: 2,
                name: "Does NOT fire callback when clicking inside referenced node",
                input: "click inside container child",
                expected: false,
                testFn: "const node = document.createElement('div'); const child = document.createElement('button'); node.appendChild(child); let called = false; const listener = setupClickOutside(node, () => { called = true; }); listener({ target: child }); return called;"
              },
              {
                id: 3,
                name: "Handles null ref gracefully",
                input: "ref is null",
                expected: false,
                testFn: "let called = false; const listener = setupClickOutside(null, () => { called = true; }); listener({ target: document.createElement('div') }); return called;"
              }
            ]
          },
          Hard: {
            id: "ref-hard",
            title: "Undo/Redo History Stack using Mutable Refs",
            difficulty: "Hard",
            concept: "Fast History Buffer without Component State Re-renders",
            description: "Implement `createHistoryBuffer(initialState, maxDepth = 10)` that maintains undo/redo stacks within a mutable ref buffer. Provides `set(state)`, `undo()`, `redo()`, and `canUndo() / canRedo()`.",
            starterCode: `function createHistoryBuffer(initialState, maxDepth = 10) {
  let past = [];
  let present = initialState;
  let future = [];

  return {
    get: () => present,
    set(newState) {
      past.push(present);
      if (past.length > maxDepth) past.shift();
      present = newState;
      future = []; // Clear redo stack on new action
    },
    undo() {
      if (past.length === 0) return present;
      future.unshift(present);
      present = past.pop();
      return present;
    },
    redo() {
      if (future.length === 0) return present;
      past.push(present);
      present = future.shift();
      return present;
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0
  };
}
`,
            interviewTrap: "Storing undo/redo stacks in React state causes every intermediate history snapshot to re-render the whole editor. Storing history in refs avoids re-renders until an actual restore occurs.",
            testCases: [
              {
                id: 1,
                name: "Correctly steps backward with undo()",
                input: "set(1) -> set(2) -> undo() returns 1",
                expected: 1,
                testFn: "const h = createHistoryBuffer(0); h.set(1); h.set(2); return h.undo();"
              },
              {
                id: 2,
                name: "Correctly steps forward with redo()",
                input: "undo() -> redo() returns 2",
                expected: 2,
                testFn: "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); return h.redo();"
              },
              {
                id: 3,
                name: "Clears future redo stack when new state is pushed",
                input: "undo() -> set(3) -> canRedo() is false",
                expected: false,
                testFn: "const h = createHistoryBuffer(0); h.set(1); h.set(2); h.undo(); h.set(3); return h.canRedo();"
              }
            ]
          }
        }
      },
      {
        id: "forwardref-imperative",
        title: "forwardRef & useImperativeHandle",
        tag: "Imperative APIs",
        summary: "Ref forwarding to child DOM nodes, exposing custom methods via useImperativeHandle, encapsulation.",
        mentalModel: "Normally, refs point directly to the underlying DOM node (`<input>`). `useImperativeHandle(ref, () => ({ customMethod }))` customizes the ref instance exposed to the parent component, hiding raw DOM methods and exposing only clean, intentional APIs.",
        traps: "Exposing the raw DOM element when only specific actions (`focus()`, `scrollTo()`) should be allowed.",
        challenges: {
          Basic: {
            id: "forwardref-basic",
            title: "Simulate forwardRef Pipe",
            difficulty: "Basic",
            concept: "Ref Forwarding Through Higher-Order Components",
            description: "Implement `simulateForwardRef(Component)` that forwards a provided `ref` object as the second argument to `Component(props, ref)`.",
            starterCode: `function simulateForwardRef(renderFn) {
  return function Forwarded(props, ref) {
    return renderFn(props, ref);
  };
}
`,
            interviewTrap: "Regular React function components do not accept a `ref` prop; trying to pass `ref` to a normal component warns with 'Function components cannot be given refs'. `forwardRef` is required.",
            testCases: [
              {
                id: 1,
                name: "Passes ref object to wrapped component",
                input: "ref forwarded to renderFn",
                expected: 'custom-ref-val',
                testFn: "const Comp = simulateForwardRef((props, ref) => ({ type: 'input', refVal: ref.current })); const ref = { current: 'custom-ref-val' }; return Comp({}, ref).refVal;"
              },
              {
                id: 2,
                name: "Passes props along with ref",
                input: "props and ref delivered simultaneously",
                expected: 'username',
                testFn: "const Comp = simulateForwardRef((props, ref) => ({ name: props.name })); return Comp({ name: 'username' }, {}).name;"
              },
              {
                id: 3,
                name: "Handles null ref gracefully",
                input: "ref is null",
                expected: 'no-ref',
                testFn: "const Comp = simulateForwardRef((props, ref) => (ref ? 'has-ref' : 'no-ref')); return Comp({}, null);"
              }
            ]
          },
          Medium: {
            id: "forwardref-medium",
            title: "Implement useImperativeHandle Custom Method Exposer",
            difficulty: "Medium",
            concept: "Restricted Imperative API Encapsulation",
            description: "Implement `createImperativeHandle(ref, createHandleFn)` that assigns the object returned by `createHandleFn()` directly onto `ref.current`, exposing only explicitly chosen methods.",
            starterCode: `function createImperativeHandle(ref, createHandleFn) {
  if (ref && typeof ref === 'object') {
    ref.current = createHandleFn();
  }
}
`,
            interviewTrap: "Allowing parents to directly manipulate `ref.current.style` breaks component encapsulation. `useImperativeHandle` creates clean public contracts.",
            testCases: [
              {
                id: 1,
                name: "Attaches only explicit methods to ref.current",
                input: "exposes focus() and blur() but not raw DOM",
                expected: ['focus', 'blur'],
                testFn: "const ref = {}; createImperativeHandle(ref, () => ({ focus: () => {}, blur: () => {} })); return Object.keys(ref.current);"
              },
              {
                id: 2,
                name: "Invokes custom handler method properly",
                input: "calling focus() triggers custom logic",
                expected: true,
                testFn: "let focused = false; const ref = {}; createImperativeHandle(ref, () => ({ focus: () => { focused = true; } })); ref.current.focus(); return focused;"
              },
              {
                id: 3,
                name: "Hides unexposed properties on target DOM node",
                input: "raw input value is not directly exposed",
                expected: undefined,
                testFn: "const ref = {}; createImperativeHandle(ref, () => ({ reset: () => {} })); return ref.current.rawDOMNode;"
              }
            ]
          },
          Hard: {
            id: "forwardref-hard",
            title: "Virtual Scroll Container Controller via Imperative Handle",
            difficulty: "Hard",
            concept: "Imperative Scroll Controller with Bounds Clamping",
            description: "Implement `createVirtualScrollHandle(ref, { totalItems, itemHeight, viewportHeight })` that attaches `scrollToIndex(index)` and `getVisibleRange()` to `ref.current`, clamping indices and calculating visible items accurately.",
            starterCode: `function createVirtualScrollHandle(ref, config) {
  const { totalItems, itemHeight, viewportHeight } = config;
  let scrollOffset = 0;

  ref.current = {
    scrollToIndex(index) {
      const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));
      scrollOffset = clampedIndex * itemHeight;
      return scrollOffset;
    },
    getVisibleRange() {
      const startIndex = Math.floor(scrollOffset / itemHeight);
      const visibleCount = Math.ceil(viewportHeight / itemHeight);
      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount);
      return { startIndex, endIndex, scrollOffset };
    }
  };
}
`,
            interviewTrap: "Not clamping index bounds causes virtual scroll calculations to display empty white screens.",
            testCases: [
              {
                id: 1,
                name: "Scrolls to item index and computes correct offset",
                input: "itemHeight 40, scrollToIndex(10) -> offset 400",
                expected: 400,
                testFn: "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); return ref.current.scrollToIndex(10);"
              },
              {
                id: 2,
                name: "Calculates visible items range based on viewport height",
                input: "viewport 200 / itemHeight 40 = 5 visible items",
                expected: { startIndex: 10, endIndex: 15 },
                testFn: "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 100, itemHeight: 40, viewportHeight: 200 }); ref.current.scrollToIndex(10); const range = ref.current.getVisibleRange(); return { startIndex: range.startIndex, endIndex: range.endIndex };"
              },
              {
                id: 3,
                name: "Clamps negative index to 0",
                input: "scrollToIndex(-5) clamps to 0",
                expected: 0,
                testFn: "const ref = {}; createVirtualScrollHandle(ref, { totalItems: 50, itemHeight: 20, viewportHeight: 100 }); return ref.current.scrollToIndex(-5);"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "react-concurrency-18",
    category: "5. Modern React: Concurrency & React 18/19",
    badge: "Modern Architecture",
    description: "useTransition, useDeferredValue, and React 18 automatic batching vs flushSync.",
    topics: [
      {
        id: "transitions-concurrency",
        title: "useTransition & useDeferredValue Mechanics",
        tag: "Concurrency",
        summary: "Urgent vs non-urgent updates, interruptible rendering, keeping UI responsive during heavy filtering.",
        mentalModel: "React categorizes updates into Urgent (typing in an `<input>`, clicks) and Non-Urgent / Transition (filtering a 10,000 item list). Wrapping an update in `startTransition(() => setQuery(text))` allows React to interrupt the list render if the user types another keystroke.",
        traps: "Using `useTransition` for controlled input values directly (inputs MUST remain urgent, or typing lags).",
        challenges: {
          Basic: {
            id: "trans-basic",
            title: "Simulate useTransition Pending State",
            difficulty: "Basic",
            concept: "Non-Urgent Update Flagging with isPending",
            description: "Implement `createTransitionRunner()` that provides `startTransition(callback)` and `isPending()`. It flags `isPending()` as `true` during the async execution of non-urgent transitions and returns to `false` when finished.",
            starterCode: `function createTransitionRunner() {
  let pending = false;

  async function startTransition(callback) {
    pending = true;
    try {
      await callback();
    } finally {
      pending = false;
    }
  }

  return {
    startTransition,
    isPending: () => pending
  };
}
`,
            interviewTrap: "Transitions are for low-priority updates. Using transitions for input state causes inputs to drop characters.",
            testCases: [
              {
                id: 1,
                name: "Reports isPending = true while transition is executing",
                input: "transition in-flight",
                expected: true,
                testFn: "const runner = createTransitionRunner(); runner.startTransition(async () => { await new Promise(r => setTimeout(r, 20)); }); return runner.isPending();"
              },
              {
                id: 2,
                name: "Returns isPending = false after transition finishes",
                input: "transition completes",
                expected: false,
                testFn: "const runner = createTransitionRunner(); await runner.startTransition(async () => { await new Promise(r => setTimeout(r, 5)); }); return runner.isPending();"
              },
              {
                id: 3,
                name: "Handles synchronous callbacks",
                input: "synchronous transition execution",
                expected: false,
                testFn: "const runner = createTransitionRunner(); await runner.startTransition(() => {}); return runner.isPending();"
              }
            ]
          },
          Medium: {
            id: "trans-medium",
            title: "useDeferredValue Simulation with Debounced Low-Priority Clone",
            difficulty: "Medium",
            concept: "Lagged Rendering via useDeferredValue",
            description: "Implement `createDeferredValue(initialValue, delayMs = 15)` that receives urgent value updates, but delays updating the returned deferred value to keep rendering responsive.",
            starterCode: `function createDeferredValue(initialValue, delayMs = 15) {
  let deferred = initialValue;
  let timerId = null;

  function update(newVal) {
    if (timerId !== null) clearTimeout(timerId);
    timerId = setTimeout(() => {
      deferred = newVal;
      timerId = null;
    }, delayMs);
  }

  function get() {
    return deferred;
  }

  return { update, get };
}
`,
            interviewTrap: "`useDeferredValue` is not just a debounce; in true React 18, React begins rendering the deferred value in memory and aborts it immediately if another urgent update arrives.",
            testCases: [
              {
                id: 1,
                name: "Returns initial value immediately",
                input: "get() before update",
                expected: 'init',
                testFn: "const d = createDeferredValue('init'); return d.get();"
              },
              {
                id: 2,
                name: "Defers update until delay window finishes",
                input: "get() immediately after update reflects old value",
                expected: 'init',
                testFn: "const d = createDeferredValue('init', 30); d.update('urgent'); return d.get();"
              },
              {
                id: 3,
                name: "Updates deferred value after delay expires",
                input: "get() after delay reflects new value",
                expected: 'urgent',
                testFn: "const d = createDeferredValue('init', 10); d.update('urgent'); await new Promise(r => setTimeout(r, 25)); return d.get();"
              }
            ]
          },
          Hard: {
            id: "trans-hard",
            title: "Urgent vs Non-Urgent Priority Task Queue",
            difficulty: "Hard",
            concept: "Lanes / Priority-Based Task Scheduling",
            description: "Implement `createPriorityScheduler()` that queues tasks labeled `'urgent'` (Priority 1) and `'transition'` (Priority 2). `flush()` must ALWAYS execute all urgent tasks before executing any transition tasks.",
            starterCode: `function createPriorityScheduler() {
  const urgentQueue = [];
  const transitionQueue = [];

  function schedule(task, priority = 'transition') {
    if (priority === 'urgent') {
      urgentQueue.push(task);
    } else {
      transitionQueue.push(task);
    }
  }

  function flush() {
    const executed = [];
    // 1. Drain all urgent tasks first
    while (urgentQueue.length > 0) {
      const task = urgentQueue.shift();
      executed.push(task());
    }
    // 2. Drain transition tasks
    while (transitionQueue.length > 0) {
      const task = transitionQueue.shift();
      executed.push(task());
    }
    return executed;
  }

  return { schedule, flush };
}
`,
            interviewTrap: "In React 18's Lane model, urgent events (keystrokes) interrupt running transition fibers, discarding in-progress work to preserve 60fps input responsiveness.",
            testCases: [
              {
                id: 1,
                name: "Executes urgent tasks before older transition tasks",
                input: "transition scheduled before urgent task",
                expected: ['urgent-1', 'transition-1'],
                testFn: "const s = createPriorityScheduler(); s.schedule(() => 'transition-1', 'transition'); s.schedule(() => 'urgent-1', 'urgent'); return s.flush();"
              },
              {
                id: 2,
                name: "Maintains FIFO order within same priority level",
                input: "multiple urgent tasks execute in insertion order",
                expected: ['u1', 'u2', 't1'],
                testFn: "const s = createPriorityScheduler(); s.schedule(() => 'u1', 'urgent'); s.schedule(() => 't1', 'transition'); s.schedule(() => 'u2', 'urgent'); return s.flush();"
              },
              {
                id: 3,
                name: "Handles empty queues safely",
                input: "flush with no tasks",
                expected: [],
                testFn: "const s = createPriorityScheduler(); return s.flush();"
              }
            ]
          }
        }
      },
      {
        id: "automatic-batching",
        title: "Automatic Batching in React 18 vs flushSync",
        tag: "Batching",
        summary: "Batching inside Promises, setTimeout, and native event handlers in React 18 vs opt-out using flushSync.",
        mentalModel: "In React 17, state updates inside `setTimeout` or `Promise.then` were NOT batched, triggering multiple re-renders. React 18 automatically batches ALL state updates regardless of origin. `flushSync(() => { ... })` opts out of batching, forcing an immediate synchronous DOM flush.",
        traps: "Using `flushSync` excessively hurts rendering performance; it should only be used when immediate DOM measurement (e.g. scroll position) is strictly required.",
        challenges: {
          Basic: {
            id: "batch-basic",
            title: "Microtask State Dispatch Batcher",
            difficulty: "Basic",
            concept: "Turn-Based Update Batching",
            description: "Implement `createBatchingStore(initialState, onRender)` that batches multiple synchronous `setState` calls so that `onRender` fires only ONCE with the merged state at the end of the microtask turn.",
            starterCode: `function createBatchingStore(initialState, onRender) {
  let state = initialState;
  let pendingUpdates = [];
  let isScheduled = false;

  function setState(partial) {
    pendingUpdates.push(partial);

    if (!isScheduled) {
      isScheduled = true;
      queueMicrotask(() => {
        for (const update of pendingUpdates) {
          state = typeof update === 'function' ? update(state) : { ...state, ...update };
        }
        pendingUpdates = [];
        isScheduled = false;
        onRender(state);
      });
    }
  }

  return { setState, getState: () => state };
}
`,
            interviewTrap: "Before React 18, updates inside `fetch().then()` triggered 2 renders for 2 `setState` calls. React 18 batches them into 1 render.",
            testCases: [
              {
                id: 1,
                name: "Batches multiple synchronous state updates into 1 render call",
                input: "3 setState calls result in 1 render",
                expected: 1,
                testFn: "let renders = 0; const store = createBatchingStore({ a: 1, b: 2 }, () => renders++); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return renders;"
              },
              {
                id: 2,
                name: "Applies all sequential updates to final state",
                input: "final state reflects all batched changes",
                expected: { a: 30, b: 20 },
                testFn: "let finalState = null; const store = createBatchingStore({ a: 1, b: 2 }, s => { finalState = s; }); store.setState({ a: 10 }); store.setState({ b: 20 }); store.setState({ a: 30 }); await Promise.resolve(); return finalState;"
              },
              {
                id: 3,
                name: "Supports functional updaters during batching",
                input: "setState(prev => prev + 1) three times",
                expected: 3,
                testFn: "let finalState = null; const store = createBatchingStore(0, s => { finalState = s; }); store.setState(p => p + 1); store.setState(p => p + 1); store.setState(p => p + 1); await Promise.resolve(); return finalState;"
              }
            ]
          },
          Medium: {
            id: "batch-medium",
            title: "Simulate Automatic Batching Across Async Boundaries",
            difficulty: "Medium",
            concept: "React 18 Universal Batching across Promises & Timeouts",
            description: "Implement `simulateAsyncBatching(actionFns, onRender)` that executes async callbacks (like `fetch.then`) and verifies that multiple dispatches inside the async handler are batched together.",
            starterCode: `async function simulateAsyncBatching(asyncTask, onRender) {
  let renders = 0;
  let state = { count: 0, text: '' };
  let pendingQueue = [];
  let isFlushing = false;

  function dispatch(update) {
    pendingQueue.push(update);
    if (!isFlushing) {
      isFlushing = true;
      queueMicrotask(() => {
        for (const u of pendingQueue) {
          state = { ...state, ...u };
        }
        pendingQueue = [];
        renders++;
        isFlushing = false;
        onRender(state, renders);
      });
    }
  }

  await asyncTask(dispatch);
  await new Promise(r => setTimeout(r, 10)); // Wait for microtask drain
  return { state, renders };
}
`,
            interviewTrap: "In React 17, `setTimeout(() => { setCount(1); setFlag(true); })` fired 2 renders. In React 18, it fires 1 render.",
            testCases: [
              {
                id: 1,
                name: "Batches multiple dispatches inside an async timeout into 1 render",
                input: "2 dispatches in setTimeout fire 1 render",
                expected: 1,
                testFn: "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.renders;"
              },
              {
                id: 2,
                name: "Merges state properties accurately",
                input: "state has both count and text updated",
                expected: { count: 1, text: 'ready' },
                testFn: "const res = await simulateAsyncBatching(async (dispatch) => { await new Promise(r => setTimeout(r, 5)); dispatch({ count: 1 }); dispatch({ text: 'ready' }); }, () => {}); return res.state;"
              },
              {
                id: 3,
                name: "Dispatches across different async turns create separate renders",
                input: "dispatches in separate timeouts produce 2 renders",
                expected: 2,
                testFn: "let renderCount = 0; await simulateAsyncBatching(async (dispatch) => { dispatch({ count: 1 }); await new Promise(r => setTimeout(r, 15)); dispatch({ count: 2 }); }, (s, r) => { renderCount = r; }); return renderCount;"
              }
            ]
          },
          Hard: {
            id: "batch-hard",
            title: "Implement flushSync Immediate Commit Engine",
            difficulty: "Hard",
            concept: "Bypassing Batching to Force Synchronous DOM Flush",
            description: "Implement `createBatchingWithFlushSync(onRender)` that provides standard batched `setState()` and `flushSync(callback)`. Calling `flushSync` forces all pending updates AND any updates inside `callback` to flush synchronously before `flushSync` returns.",
            starterCode: `function createBatchingWithFlushSync(onRender) {
  let state = { count: 0 };
  let pending = [];
  let isScheduled = false;

  function commit() {
    if (pending.length === 0) return;
    for (const update of pending) {
      state = typeof update === 'function' ? update(state) : { ...state, ...update };
    }
    pending = [];
    isScheduled = false;
    onRender(state);
  }

  function setState(update) {
    pending.push(update);
    if (!isScheduled) {
      isScheduled = true;
      queueMicrotask(() => commit());
    }
  }

  function flushSync(callback) {
    if (callback) {
      callback();
    }
    // Force immediate synchronous commit!
    commit();
    return state;
  }

  return { setState, flushSync, getState: () => state };
}
`,
            interviewTrap: "Calling `flushSync` inside a lifecycle hook or during another component's render will trigger a React warning. It is reserved for top-level event handlers needing synchronous DOM geometry.",
            testCases: [
              {
                id: 1,
                name: "flushSync commits state immediately without waiting for microtask",
                input: "flushSync forces synchronous commit",
                expected: 1,
                testFn: "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.flushSync(() => { store.setState({ count: 10 }); }); return renders;"
              },
              {
                id: 2,
                name: "Normal setState remains batched until microtask",
                input: "normal setState has not committed synchronously",
                expected: 0,
                testFn: "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 5 }); return renders;"
              },
              {
                id: 3,
                name: "flushSync flushes both previously pending updates and current callback updates",
                input: "pending + flushSync combined in single immediate commit",
                expected: { count: 20, renders: 1 },
                testFn: "let renders = 0; const store = createBatchingWithFlushSync(() => renders++); store.setState({ count: 10 }); store.flushSync(() => { store.setState({ count: 20 }); }); return { count: store.getState().count, renders };"
              }
            ]
          }
        }
      }
    ]
  }
];

// Append extra advanced categories (Controlled vs Uncontrolled, Custom Hooks & Reducer, Suspense & SSR, Compiler & Custom Reconcilers)
const extraReactCategories = require('./topics-extra-react');
reactTopicsData.push(...extraReactCategories);

const { createStub } = require('./stub-generator');

// Add starterChallenge property to each topic pointing to Basic by default
// Preserve full working solution in solutionCode, and generate clean empty stub in starterCode
reactTopicsData.forEach(cat => {
  cat.topics.forEach(t => {
    ['Basic', 'Medium', 'Hard'].forEach(diff => {
      const q = t.challenges[diff];
      if (q) {
        q.solutionCode = q.starterCode;
        q.starterCode = createStub(q.starterCode);
      }
    });
    t.starterChallenge = t.challenges.Basic;
    t.questions = [t.challenges.Basic, t.challenges.Medium, t.challenges.Hard];
  });
});

const content = `// Exhaustive React.js Mastery Topics Catalog
// Curated with Basic, Medium, and Hard challenges with runnable test cases.

module.exports = ${JSON.stringify(reactTopicsData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'topics-react.js'), content, 'utf8');
console.log('Successfully generated topics-react.js!');
