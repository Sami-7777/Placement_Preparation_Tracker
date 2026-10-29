from sqlalchemy.orm import Session
from .models import (
    UserSettings, DsaPattern, DsaSubtopic, CoreCsTopic, PythonTopic, SqlProblem
)

DSA_PATTERNS_DATA = [
    {
        "name": "Two Pointers",
        "stage": 1,
        "order_index": 1,
        "recognition_clues": "Sorted arrays, searching for pairs/triplets, opposite-end or fast/slow movement in linear sequences.",
        "when_and_why": "Reduces brute-force O(N^2) search down to O(N) by leveraging monotonicity or dual boundaries.",
        "common_mistakes": "Off-by-one errors with pointer updates; forgetting to sort the array first when required; infinite loops when conditions don't advance pointers.",
        "complexity_notes": "Time: O(N) (or O(N log N) if sorting needed). Space: O(1) auxiliary.",
        "subtopics": [
            "Opposite-direction pointers",
            "Same-direction pointers",
            "Pair and triplet problems",
            "Removing duplicates",
            "Array rearrangement",
            "Sorted-array problems"
        ]
    },
    {
        "name": "Fast & Slow Pointers",
        "stage": 2,
        "order_index": 2,
        "recognition_clues": "Linked list or sequence cycles, finding the midpoint without calculating length upfront, finding repeats in restricted ranges.",
        "when_and_why": "Detects cycles in O(N) time and O(1) space (Floyd's Tortoise and Hare) without extra hash sets.",
        "common_mistakes": "Null pointer exceptions when fast.next is null; incorrect termination condition fast && fast.next.",
        "complexity_notes": "Time: O(N), Space: O(1).",
        "subtopics": [
            "Linked-list cycle detection",
            "Finding the start of a cycle",
            "Finding the middle of a linked list",
            "Happy Number",
            "Duplicate Number"
        ]
    },
    {
        "name": "Sliding Window",
        "stage": 1,
        "order_index": 3,
        "recognition_clues": "Contiguous subarrays or substrings matching length k or dynamic constraint (e.g. longest substring without repeating chars).",
        "when_and_why": "Converts nested loop recalculations into sliding window with incremental add/remove in O(N).",
        "common_mistakes": "Shrinking the window prematurely; forgetting to restore frequency map counts when discarding elements.",
        "complexity_notes": "Time: O(N), Space: O(K) where K is unique characters or window size.",
        "subtopics": [
            "Fixed-size window",
            "Variable-size window",
            "Longest substring",
            "Frequency-based window",
            "Minimum window",
            "Permutation and anagram problems"
        ]
    },
    {
        "name": "Kadane's Algorithm",
        "stage": 1,
        "order_index": 4,
        "recognition_clues": "Finding maximum or minimum contiguous subarray sum or product in an array containing positive and negative values.",
        "when_and_why": "Dynamic programming in O(N) time and O(1) space by choosing whether to extend existing subarray or start fresh.",
        "common_mistakes": "Initializing max_sum to 0 instead of float('-inf') or first element when all numbers are negative.",
        "complexity_notes": "Time: O(N), Space: O(1).",
        "subtopics": [
            "Maximum subarray sum",
            "Minimum subarray sum",
            "Maximum product subarray",
            "Circular subarray variants"
        ]
    },
    {
        "name": "Prefix Sum",
        "stage": 1,
        "order_index": 5,
        "recognition_clues": "Range sum queries, finding subarrays with specific sum k or divisible by k.",
        "when_and_why": "Precomputes cumulative sums so any subarray sum (i..j) can be queried in O(1) time.",
        "common_mistakes": "Zero-index offset errors; not handling sum equals 0 with prefix_map[0] = 1.",
        "complexity_notes": "Time: O(N) preprocessing, O(1) query. Space: O(N) for map/array.",
        "subtopics": [
            "Running prefix sums",
            "Pivot Index",
            "Subarray Sum Equals K",
            "Subarray sums divisible by K",
            "Prefix sum with hashing"
        ]
    },
    {
        "name": "Merge Intervals",
        "stage": 2,
        "order_index": 6,
        "recognition_clues": "Overlapping intervals, scheduling meetings, disjoint intervals, timeline sweeps.",
        "when_and_why": "Sort intervals by start time, then merge or detect conflicts in a single linear pass.",
        "common_mistakes": "Forgetting to sort intervals first; mishandling boundary equality [start, end] vs (start, end).",
        "complexity_notes": "Time: O(N log N) sorting + O(N) pass. Space: O(N) for output.",
        "subtopics": [
            "Merge Intervals",
            "Insert Interval",
            "Interval Intersections",
            "Overlapping Intervals",
            "Meeting Rooms"
        ]
    },
    {
        "name": "In-place Reversal of a Linked List",
        "stage": 2,
        "order_index": 7,
        "recognition_clues": "Modifying linked list direction in-place without allocating new nodes or using auxiliary arrays.",
        "when_and_why": "Achieves O(1) auxiliary space pointer manipulation: prev, curr, next_node.",
        "common_mistakes": "Losing references to remaining nodes before changing curr.next; wrong reconnection of reversed sublist heads/tails.",
        "complexity_notes": "Time: O(N), Space: O(1).",
        "subtopics": [
            "Reverse a linked list",
            "Reverse a sublist",
            "Reverse nodes in pairs",
            "Reverse nodes in groups",
            "Rotate a linked list"
        ]
    },
    {
        "name": "Stack",
        "stage": 2,
        "order_index": 8,
        "recognition_clues": "LIFO processing, bracket matching, nested expressions, next greater/smaller element (monotonic stack).",
        "when_and_why": "Maintains element orders or monotonic trends, popping when an incoming element violates the invariant.",
        "common_mistakes": "Checking empty stack before pop/peek; popping wrong elements in monotonic stack; recursion stack overflow.",
        "complexity_notes": "Time: Amortized O(N) (each item pushed and popped at most once). Space: O(N).",
        "subtopics": [
            "Balanced Parentheses",
            "Adjacent duplicate removal",
            "Next Greater Element",
            "Daily Temperatures",
            "Monotonic Stack",
            "Remove K Digits"
        ]
    },
    {
        "name": "Hash Maps",
        "stage": 1,
        "order_index": 9,
        "recognition_clues": "Frequency counts, pairs with target difference, constant time lookups, grouping anagrams.",
        "when_and_why": "O(1) average lookup/insert replaces linear scans and turns O(N^2) searches into O(N).",
        "common_mistakes": "Key hashing mutability errors; assuming insertion order unless using OrderedDict/Python 3.7+; memory overhead.",
        "complexity_notes": "Time: O(1) average lookup/insert. Space: O(N).",
        "subtopics": [
            "Frequency counting",
            "First Non-repeating Character",
            "Ransom Note",
            "Longest Palindrome",
            "Hashing with arrays and strings"
        ]
    },
    {
        "name": "Binary Search",
        "stage": 2,
        "order_index": 10,
        "recognition_clues": "Monotonic search spaces, sorted arrays, find lower/upper bound, 'minimum maximum' or 'maximum minimum' optimization problems.",
        "when_and_why": "Halves candidate space each iteration in O(log N) instead of linear scan O(N).",
        "common_mistakes": "Integer overflow with (low+high)/2 (use low + (high-low)//2); while low <= high vs low < high; boundary update low = mid + 1.",
        "complexity_notes": "Time: O(log N), Space: O(1).",
        "subtopics": [
            "Standard Binary Search",
            "First and Last Position",
            "Lower and Upper Bound",
            "Search in Rotated Sorted Array",
            "Peak Element",
            "Binary Search on Answer",
            "Koko Eating Bananas",
            "Capacity to Ship Packages",
            "Book Allocation"
        ]
    },
    {
        "name": "Heap / Priority Queue",
        "stage": 2,
        "order_index": 11,
        "recognition_clues": "Top K elements, running median, stream processing, shortest-path algorithms.",
        "when_and_why": "Maintains min or max in O(log K) insertion/extraction without sorting the entire array.",
        "common_mistakes": "Using max-heap where min-heap is required; Python heapq is min-heap by default (negate for max-heap).",
        "complexity_notes": "Time: O(N log K), Space: O(K).",
        "subtopics": [
            "Kth Smallest and Kth Largest",
            "Top K Frequent Elements",
            "K Closest Elements",
            "Merge K Sorted Arrays",
            "Two Heaps",
            "Scheduling problems"
        ]
    },
    {
        "name": "Recursion and Backtracking",
        "stage": 3,
        "order_index": 12,
        "recognition_clues": "Permutations, combinations, subsets, constraint satisfaction, explore all valid possibilities.",
        "when_and_why": "Explores decision tree branch-by-branch and backtracks when a state violates conditions.",
        "common_mistakes": "Missing base case leading to recursion depth error; forgetting to undo state mutation after recursive call.",
        "complexity_notes": "Time: O(2^N) or O(N!), Space: O(N) recursion stack.",
        "subtopics": [
            "Base cases and recursive calls",
            "Fibonacci",
            "Palindrome checking",
            "Generate Parentheses",
            "Permutations",
            "Combination Sum",
            "Palindrome Partitioning"
        ]
    },
    {
        "name": "Tree Patterns",
        "stage": 3,
        "order_index": 13,
        "recognition_clues": "Hierarchical structures, traversals, binary search trees, ancestors, path sums, tree serialization.",
        "when_and_why": "Recursive DFS (pre/in/postorder) or iterative BFS (level-order) to inspect or transform nodes.",
        "common_mistakes": "Not checking if root is None; confusing BST properties with general binary tree; incorrect level-order queue handling.",
        "complexity_notes": "Time: O(N), Space: O(H) where H is tree height.",
        "subtopics": [
            "Inorder Preorder and Postorder",
            "Level Order and Zigzag Traversal",
            "Tree Symmetry",
            "Tree Search",
            "Lowest Common Ancestor",
            "Tree Depth and Diameter",
            "Path Sum",
            "Tree Construction",
            "Binary Search Tree validation"
        ]
    },
    {
        "name": "Graph Patterns",
        "stage": 3,
        "order_index": 14,
        "recognition_clues": "Networks, grid mazes, connected components, dependency ordering, cycle detection, shortest paths.",
        "when_and_why": "Traverses non-linear nodes using visited sets to avoid infinite loops; uses topological sorting for DAGs.",
        "common_mistakes": "Forgetting visited set; using Dijkstra on graphs with negative weights; disconnected components.",
        "complexity_notes": "Time: O(V + E), Space: O(V + E).",
        "subtopics": [
            "Adjacency List",
            "DFS and BFS",
            "Number of Islands",
            "Connected Components",
            "Cycle Detection",
            "Topological Sort",
            "Bipartite Graph",
            "Shortest Paths",
            "Dijkstra's Algorithm",
            "Minimum Spanning Tree"
        ]
    },
    {
        "name": "Dynamic Programming",
        "stage": 3,
        "order_index": 15,
        "recognition_clues": "Overlapping subproblems and optimal substructure; counting ways, min/max cost, subset decisions.",
        "when_and_why": "Stores solutions to subproblems (memoization or tabulation) avoiding exponential recomputation.",
        "common_mistakes": "Incorrect state definition; wrong base cases; wrong transition order in bottom-up table.",
        "complexity_notes": "Time: O(States * Transitions), Space: O(States) (often reducible to O(1) or O(N)).",
        "subtopics": [
            "Fibonacci",
            "Climbing Stairs",
            "House Robber",
            "0/1 Knapsack",
            "Subset Sum",
            "Target Sum",
            "Longest Increasing Subsequence",
            "Longest Common Subsequence",
            "Unique Paths",
            "Stock Buy/Sell",
            "Interval DP fundamentals"
        ]
    },
    {
        "name": "Greedy Algorithms",
        "stage": 3,
        "order_index": 16,
        "recognition_clues": "Making locally optimal choice at each step leads to globally optimal solution; sorting by deadline, value, or weight.",
        "when_and_why": "Faster and simpler than DP when greedy choice property and optimal substructure hold.",
        "common_mistakes": "Assuming a problem is greedy when it requires DP; not proving correctness of the greedy choice.",
        "complexity_notes": "Time: Typically O(N log N) due to sorting, Space: O(1) or O(N).",
        "subtopics": [
            "Assign Cookies",
            "Lemonade Change",
            "Jump Game",
            "Fractional Knapsack",
            "Greedy selection and scheduling"
        ]
    }
]

CORE_CS_DATA = [
    # DBMS
    ("DBMS", "Keys and constraints", "Primary key, foreign key, candidate keys, super keys, unique and check constraints."),
    ("DBMS", "Normalization", "1NF, 2NF, 3NF, BCNF, functional dependencies and anomaly prevention."),
    ("DBMS", "Joins", "Inner join, left/right outer joins, full outer join, cross join, natural join, join algorithms."),
    ("DBMS", "Indexes", "B-Trees, B+ Trees, clustered vs non-clustered indexing, hashing indexes, indexing tradeoffs."),
    ("DBMS", "Transactions", "ACID properties, transaction states, write-ahead logging, commit and rollback mechanisms."),
    ("DBMS", "ACID", "Atomicity, Consistency, Isolation, Durability deep dive with practical concurrency examples."),
    ("DBMS", "Isolation levels", "Read Uncommitted, Read Committed, Repeatable Read, Serializable; dirty reads, phantom reads."),
    ("DBMS", "Query optimization", "Execution plans, EXPLAIN queries, index utilization, avoiding full table scans."),

    # OOP
    ("OOP", "Encapsulation", "Data hiding, access modifiers, getters/setters, properties in Python."),
    ("OOP", "Abstraction", "Hiding implementation complexity, abstract base classes, abc module in Python."),
    ("OOP", "Inheritance", "Single, multiple, multilevel inheritance, method resolution order (MRO) in Python."),
    ("OOP", "Polymorphism", "Method overriding, duck typing in Python, operator overloading, dynamic dispatch."),
    ("OOP", "Composition", "Favoring composition over inheritance, 'has-a' vs 'is-a' relationships."),
    ("OOP", "Interfaces and abstract classes", "Abstract methods, protocols, design contracts, separation of concerns."),
    ("OOP", "Practical Python examples", "Real-world OOP design: banking system, payment processor, LRU cache."),

    # Operating Systems
    ("OS", "Processes and threads", "Process control block, process lifecycle, thread vs process, user vs kernel threads."),
    ("OS", "CPU scheduling", "FCFS, SJF, Round Robin, Priority Scheduling, Multi-level queue, starvation."),
    ("OS", "Deadlocks", "Four conditions (Mutual exclusion, Hold & wait, No preemption, Circular wait), Banker's algorithm."),
    ("OS", "Synchronization", "Race conditions, critical section, mutex, semaphores, monitors, producer-consumer problem."),
    ("OS", "Memory management", "Paging, segmentation, address translation, internal and external fragmentation."),
    ("OS", "Virtual memory", "Demand paging, page faults, page replacement algorithms (FIFO, LRU, Optimal), thrashing."),

    # Computer Networks
    ("Networks", "OSI model", "7 layers, functions, protocols at each layer, encapsulation and decapsulation."),
    ("Networks", "TCP/IP", "4-layer architecture, comparison with OSI model, IP packet format."),
    ("Networks", "TCP versus UDP", "Connection-oriented vs connectionless, reliability, 3-way handshake, 4-way termination, flow & congestion control."),
    ("Networks", "HTTP and HTTPS", "HTTP methods, status codes, headers, cookies vs sessions, TLS/SSL handshake, HTTP/1.1 vs HTTP/2 vs HTTP/3."),
    ("Networks", "DNS", "Domain name resolution, DNS hierarchy, root servers, recursive vs iterative queries, DNS caching."),
    ("Networks", "IP addressing", "IPv4 vs IPv6, subnetting, CIDR notation, private vs public IP, NAT."),
    ("Networks", "Ports and common protocols", "Well-known ports (80, 443, 22, 53, 3306), ARP, DHCP, ICMP, FTP, SMTP.")
]

PYTHON_TOPICS_DATA = [
    ("HTML & CSS", "Mastered", True, "Completed at fundamentals level. Modern semantic HTML5, Flexbox, CSS Grid."),
    ("Python fundamentals", "Revised", True, "Variables, datatypes, operators, conditionals, loops, solved 200+ basic problems."),
    ("Functions and collections", "In Progress", True, "Lists, tuples, sets, dictionaries, list comprehensions, lambda, args & kwargs."),
    ("Python OOP", "Not Started", True, "Classes, instances, inheritance, dunder methods (__init__, __str__, __repr__), decorators."),
    ("Advanced Python", "Not Started", False, "Generators, iterators, context managers, closures, itertools, functools."),
    ("Exceptions and file handling", "Not Started", False, "Try-except-finally blocks, custom exceptions, JSON parsing, file I/O."),
    ("SQL and database connectivity", "Not Started", False, "sqlite3, psycopg2, SQLAlchemy connection pools, parameterized queries."),
    ("JavaScript", "Not Started", False, "ES6+ syntax, arrow functions, promises, async/await, DOM events, fetch API."),
    ("React", "Not Started", False, "Components, JSX, hooks (useState, useEffect, useMemo), state management."),
    ("Django", "Not Started", False, "MVT architecture, ORM, migrations, views, URL routing, admin interface."),
    ("FastAPI", "Not Started", False, "Pydantic validation, dependency injection, async endpoints, OpenAPI auto-docs."),
    ("API integration", "Not Started", False, "REST principles, status codes, authentication tokens (JWT), testing APIs."),
    ("Git and GitHub", "Not Started", False, "Git commits, branching, merging, pull requests, resolving merge conflicts."),
    ("Testing and debugging", "Not Started", False, "pytest, unit tests, mock objects, debugging with pdb and IDE tools."),
    ("Deployment fundamentals", "Not Started", False, "Virtual environments, requirements.txt, environment variables, cloud deployment basics.")
]

def seed_initial_data(db: Session):
    # Check if settings exist
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings(
            id=1,
            target_date="2027-03-30",
            timezone="Asia/Kolkata",
            daily_target_minutes=360,
            dsa_target_minutes=150,
            sql_target_minutes=60,
            core_cs_target_minutes=60,
            python_target_minutes=45,
            placement_target_minutes=45,
            revision_intervals="1,3,7",
            current_dsa_pattern_id=1,
            theme_mode="light"
        )
        db.add(settings)
        db.commit()

    # Check DSA Patterns
    patterns_count = db.query(DsaPattern).count()
    if patterns_count == 0:
        for p_data in DSA_PATTERNS_DATA:
            pattern = DsaPattern(
                name=p_data["name"],
                stage=p_data["stage"],
                order_index=p_data["order_index"],
                status="Not Started",
                confidence_rating=1,
                recognition_clues=p_data["recognition_clues"],
                when_and_why=p_data["when_and_why"],
                common_mistakes=p_data["common_mistakes"],
                complexity_notes=p_data["complexity_notes"],
                personal_notes="",
                daily_goal="Understand core mechanics and solve 2 representative problems independently.",
                revision_schedule="1-day, 3-day, 7-day recall",
                can_explain_use=False,
                can_implement_core=False,
                can_solve_unfamiliar=False,
                can_explain_complexity=False,
                can_resolve_delayed=False
            )
            db.add(pattern)
            db.flush()

            # Add subtopics
            for idx, sub_title in enumerate(p_data["subtopics"]):
                subtopic = DsaSubtopic(
                    pattern_id=pattern.id,
                    title=sub_title,
                    is_completed=False,
                    order_index=idx + 1,
                    is_disabled=False
                )
                db.add(subtopic)
        db.commit()

    # Check Core CS Topics
    core_count = db.query(CoreCsTopic).count()
    if core_count == 0:
        for idx, (subject, topic_name, notes) in enumerate(CORE_CS_DATA):
            core_topic = CoreCsTopic(
                subject=subject,
                topic_name=topic_name,
                status="Not Started",
                confidence_rating=1,
                notes=notes,
                interview_questions="",
                practice_questions="",
                is_completed=False,
                order_index=idx + 1
            )
            db.add(core_topic)
        db.commit()

    # Check Python Topics
    python_count = db.query(PythonTopic).count()
    if python_count == 0:
        for idx, (name, status, is_active, notes) in enumerate(PYTHON_TOPICS_DATA):
            p_topic = PythonTopic(
                name=name,
                status=status,
                notes=notes,
                code_snippets="",
                doubts="",
                is_active=is_active,
                order_index=idx + 1
            )
            db.add(p_topic)
        db.commit()
