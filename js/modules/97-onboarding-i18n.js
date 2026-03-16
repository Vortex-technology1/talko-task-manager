'use strict';
// ─── ONBOARDING i18n ───────────────────────────────────────
// OB_I18N[lang][stepId] = { title, subtitle, est, description, tipText, actionLabel, tasks:[{text,detail}] }
// UA — базова мова в OB_STEPS (хардкод). Решта — тут.

window.OB_I18N = {

// ══════════════════════════════════════════════════════════
// ENGLISH
// ══════════════════════════════════════════════════════════
en: {
  _blocks: {
    start:'Start', tasks:'Tasks', myday:'My Day', system:'System',
    projects:'Projects', coordination:'Coordination', analytics:'Analytics',
    finance:'Finance', business:'Business', learning:'Learning',
  },
  _ui: {
    skip:'Skip', prev:'Previous', done:'Onboarding complete!',
    askAI:'Ask AI Assistant', minUnit:'min', overview:'Overview',
    completed:'completed', complete:'Complete', estLabel:'Estimated time:',
    next:'Next step', stepsOf:'steps', stepsLabel:'Steps completed',
  },

  setup_company: {
    title:'Company Setup', subtitle:'Block 0 · Start', est:'5 min',
    actionLabel:'Open settings',
    description:'<b>First step before everything.</b> Without basic settings the system works incorrectly — wrong time in deadlines, unnamed company, missing notifications.<br><br><b>Company name</b> — displayed everywhere: in invitations, reports, coordination protocols.<br><b>Timezone</b> — critical for deadlines and reminders.<br><b>Weekly report</b> — the owner receives a task completion summary every week automatically.<br><br><b>Where to find:</b> System → Employees → "Company" tab (visible to Owner only).',
    tipText:'Company setup takes 5 minutes once. Without the correct timezone all reminders will be shifted.',
    tasks:[
      {text:'Open System → Employees → "Company" tab', detail:'This tab is visible to the Owner only.'},
      {text:'Enter company name and save', detail:'The name appears in invitations, reports, and the system header.'},
      {text:'Check timezone — set the correct one', detail:'Default is Kyiv (UTC+2/+3). Change if your team is in another timezone.'},
      {text:'Enable weekly report for the owner', detail:'Every Monday you receive a task completion summary automatically.'},
    ],
  },

  setup_telegram: {
    title:'Connect Telegram', subtitle:'Block 0 · Start', est:'5 min',
    actionLabel:'Open profile',
    description:'<b>Pain without this:</b> task is assigned — the assignee doesn\'t know. Deadline arrives — nothing reminds them.<br><br>Without Telegram notifications:<br>— New tasks are not announced<br>— Deadlines are not reminded<br>— Overdue tasks signal nowhere<br>— Coordination decisions don\'t arrive<br><br><b>How to connect:</b> open your profile (button with your name, top right) → "Telegram Notifications" section → "Connect Telegram" → bot → /start.<br><br><b>Each employee connects independently</b> after registration.',
    tipText:'Telegram is not a bonus — it is mandatory. Anyone who hasn\'t connected is outside the system.',
    tasks:[
      {text:'Open profile → find the "Telegram Notifications" section', detail:'Click your name or avatar in the top right.'},
      {text:'Click "Connect Telegram" and complete the process', detail:'The TALKO bot will open. Press /start → system confirms connection.'},
      {text:'Verify — send yourself a test task', detail:'Assign a task to yourself → a notification should arrive in 10–20 seconds.'},
      {text:'Ask each employee to connect Telegram after registration', detail:'Without this, notifications don\'t work. Make it a mandatory onboarding condition.'},
    ],
  },

  setup_invite: {
    title:'Invite Your Team', subtitle:'Block 0 · Start', est:'10 min',
    actionLabel:'Open employees',
    description:'<b>Pain without this:</b> the system is set up — but only the owner is in it. The entire value of TALKO is that the team is in the system.<br><br><b>Process:</b> System → Employees → "Invite" → Email → role → send.<br><br><b>Roles:</b><br>— <b>Owner</b> — sees and can do everything<br>— <b>Manager</b> — sees their team and analytics<br>— <b>Employee</b> — sees only their own tasks<br><br><b>Rule:</b> start with the minimum necessary permissions.',
    tipText:'Mistake: inviting everyone at once. Better to start with 3–5 key people → establish the process → then add the rest.',
    tasks:[
      {text:'Compile a list of employees to invite', detail:'Start with 3–5 key people. Not everyone at once.'},
      {text:'Invite the first employee via System → Employees', detail:'"Invite" button → email → role → send. The person receives an email within a minute.'},
      {text:'Confirm the invitee has registered and appears in the list', detail:'Refresh the list. The new team member should appear with status "Active".'},
      {text:'Assign the new employee their first test task', detail:'This reinforces the habit and shows the system is live.'},
    ],
  },

  tasks_views: {
    title:'Tasks: Views and Filters', subtitle:'Block 1 · Tasks', est:'10 min',
    actionLabel:'Open tasks',
    description:'<b>Pain without this:</b> the manager doesn\'t understand what\'s happening, the team keeps tasks in messengers.<br><br><b>6 view types:</b><br>— <b>Day</b> — what to do today<br>— <b>Week</b> — picture for 7 days<br>— <b>Month</b> — strategic view<br>— <b>List</b> — all tasks in a row<br>— <b>Kanban</b> — by status columns<br>— <b>Timeline</b> — Gantt chart<br><br><b>Filters:</b> by assignee, status, function, deadline, priority.',
    tipText:'Kanban view is ideal for weekly team reviews. You can see where things are stuck and why.',
    tasks:[
      {text:'Open "All Tasks" and switch through all 6 views', detail:'Each view serves a different management purpose. Kanban and List — for daily work.'},
      {text:'Apply a filter: select a specific assignee', detail:'Filter panel is above the task list. Select a name — see only their tasks instantly.'},
      {text:'Apply the "Overdue" status filter', detail:'Critical filter for managers. Immediately see what\'s burning and whose it is.'},
      {text:'Find a task using global search', detail:'Search bar at the top. Searches by title, comments, names. Instant results.'},
    ],
  },

  tasks_anatomy: {
    title:'Tasks: Anatomy and Proper Setup', subtitle:'Block 1 · Tasks', est:'15 min',
    actionLabel:'Open tasks',
    description:'<b>Pain without this:</b> the assignee did "their thing", the manager expected "something else". Rework, wasted time.<br><br>A proper task answers: <i>who, what, by when, what is the result, who reviews.</i><br><br>— <b>Title</b> — a specific action (not "Advertising", but "Launch Facebook ad by Friday")<br>— <b>Assignee</b> — one person<br>— <b>Deadline</b> — specific date and time<br>— <b>Priority</b> — Critical / High / Medium / Low<br>— <b>Expected result</b> — WHAT must be done<br>— <b>Report format</b> — HOW the assignee reports<br>— <b>Checklist, reminders, review, comments and files</b>',
    tipText:'Rule: if the assignee can complete the task without a single additional question — it\'s set up correctly.',
    tasks:[
      {text:'Create a test task filling in all fields completely', detail:'Title, assignee, deadline, priority, expected result, report format.'},
      {text:'Add a checklist with 3 sub-items to the task', detail:'Inside the task — "Checklist" section → "Add item".'},
      {text:'Set a reminder for tomorrow at 9:00', detail:'The assignee receives a Telegram notification at the specified time.'},
      {text:'Enable "Review after completion"', detail:'After marking done — status becomes "Under review". The reviewer gets a signal.'},
      {text:'Write a comment and attach a file', detail:'All correspondence stays inside the task forever.'},
    ],
  },

  regular_tasks: {
    title:'Recurring Tasks: Automating Routine', subtitle:'Block 1 · Tasks', est:'10 min',
    actionLabel:'Open recurring',
    description:'<b>Pain without this:</b> every week you manually set the same tasks. That\'s 2–3 hours per month just for setup.<br><br>Set up once → system assigns automatically → assignee receives a Telegram notification.<br><br>— <b>Daily</b> — appear every morning<br>— <b>Weekly</b> — on a set day of the week<br>— <b>Monthly</b> — on a set date of the month',
    tipText:'Golden rule: any task you set more than twice — automate it.',
    tasks:[
      {text:'Open the "Recurring Tasks" tab', detail:'Tasks → "Recurring" or via "All Tasks" menu.'},
      {text:'Identify 3 tasks you set manually every week', detail:'For example: report, planning meeting, metrics review.'},
      {text:'Create a weekly recurring task with a reminder', detail:'"+ Recurring" → assignee, day of week, reminder time, expected result.'},
      {text:'Verify the task appeared automatically for the assignee', detail:'Filter by assignee → the recurring task is already there with a deadline.'},
    ],
  },

  myday: {
    title:'My Day: Focus and Planning', subtitle:'Block 2 · My Day', est:'5 min',
    actionLabel:'Open My Day',
    description:'<b>Pain without this:</b> a person comes to work and doesn\'t know where to start. Or jumps at everything and finishes nothing.<br><br><b>"My Day"</b> — a personal screen. Shows only what needs to be done TODAY.<br><br>— <b>Normal view</b> — all today\'s tasks with deadlines by priority<br>— <b>"Focus" mode</b> — one task on the full screen. Done → "Complete" → next. No distractions.',
    tipText:'Ask the team to start each day with "My Day". 5 minutes in the morning — everyone knows their plan.',
    tasks:[
      {text:'Open "My Day" and review today\'s tasks', detail:'If there are no tasks — create a test one with today\'s deadline.'},
      {text:'Switch to "Focus" mode and complete one task', detail:'"Focus" button at the top of the tab. Click "Done" — system moves to the next.'},
    ],
  },

  functions: {
    title:'Functions: Departments and Business KPIs', subtitle:'Block 3 · System', est:'15 min',
    actionLabel:'Open functions',
    description:'<b>Pain without this:</b> tasks hang "in the air" without being linked to a department. Analytics doesn\'t show where the load is and where the gaps are.<br><br><b>Functions</b> — these are the departments of your business. Each function has:<br>— <b>Responsible</b> — who manages this area<br>— <b>KPI</b> — specific result numbers<br>— <b>Tasks</b> — everything done in this department<br><br><b>Example functions:</b> Sales, Marketing, Finance, HR, Operations, Customer Service.<br><br><b>KPI — numbers, not wishes:</b><br>— Correct: "20 new clients per month"<br>— Incorrect: "Increase sales"<br><br><b>Two view modes:</b><br>— <b>Cards</b> — detailed information per function<br>— <b>Structure</b> — connection diagram between departments',
    tipText:'Minimum: 3–5 functions with KPIs. This is the analytics foundation. Without functions the department report is empty.',
    tasks:[
      {text:'Open System → Functions', detail:'Without functions the department analytics don\'t work.'},
      {text:'Create at least 3 key business functions', detail:'"+ Function" → department name → assign responsible. Start with: Sales, Operations, Finance.'},
      {text:'Add at least 1 KPI with a specific number to each function', detail:'Inside the function → "KPI" section → "+ Add KPI". Example: New deals — 20 — pcs/month.'},
      {text:'Switch to "Structure" view and review the diagram', detail:'"Structure" button at the top. Shows department hierarchy and connections.'},
      {text:'Link existing tasks to their respective functions', detail:'Open any task → "Function" field → select department.'},
    ],
  },

  bizstructure: {
    title:'Structure: Organizational Chart', subtitle:'Block 3 · System', est:'10 min',
    actionLabel:'Open structure',
    description:'<b>Pain without this:</b> the team doesn\'t understand who reports to whom. A new employee doesn\'t know who to contact. The manager can\'t see the full picture at once.<br><br><b>Structure</b> — an interactive organizational chart of your company:<br>— Departments and subdivisions<br>— Reporting hierarchy<br>— Each employee in their place<br>— Number of tasks and workload per person<br><br><b>Structure builds automatically</b> based on functions and employees. If functions are filled — the structure is already there.<br><br><b>What\'s visible in the employee card:</b><br>— Role and department<br>— Active tasks and statuses<br>— Workload and efficiency',
    tipText:'Structure is the first thing to show a new manager. They immediately understand where they are, who\'s nearby, who\'s above. Saves 2–3 weeks of onboarding.',
    tasks:[
      {text:'Open System → Structure', detail:'Shows the org chart. If empty — fill in Functions first (previous step).'},
      {text:'Verify all departments and sub-departments display correctly', detail:'Compare with your real business structure.'},
      {text:'Click on any employee card and review the details', detail:'See: role, department, active tasks, workload.'},
      {text:'Verify each employee is linked to their department', detail:'If someone is "without department" — open their card → change function/department.'},
    ],
  },

  team_management: {
    title:'Employees: Roles, Access and Invitations', subtitle:'Block 3 · System', est:'15 min',
    actionLabel:'Open employees',
    description:'<b>Pain without this:</b> everyone sees everything — or conversely, someone can\'t see what they need. Access rights "by suspicion", not by logic.<br><br><b>Employees tab</b> has 4 sections:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">LIST</b><br>All employees with role, department, status and workload. From here — into each person\'s card.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">INVITE</b><br>Send an email invitation → person registers → immediately in the system with the correct role.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ROLES</b><br><b>Owner</b> — full access to everything. <b>Manager</b> — their department and analytics. <b>Employee</b> — only their own tasks. Set to minimum necessary.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">COMPANY</b><br>Name, timezone, weekly report for owner. Visible to Owner only.</div></div>',
    tipText:'Mistake #1: giving everyone Owner access. Then wondering why a regular employee sees salaries. Set roles correctly once.',
    tasks:[
      {text:'Open System → Employees → "List" tab', detail:'Review all active employees. Each card shows role, department, task count.'},
      {text:'Verify each person\'s role matches their actual responsibilities', detail:'Click employee → "Change role". Rule: minimum necessary access.'},
      {text:'Go to "Roles" tab and study the access matrix', detail:'Owner — everything. Manager — their dept + analytics. Employee — only their own tasks.'},
      {text:'Invite a new employee via the "Invite" tab', detail:'Email → role → function → "Send". Person receives an email. After registration — appears in the list.'},
      {text:'Open the "Company" tab and review settings (Owner only)', detail:'Company name, timezone, weekly report. If timezone is wrong — all reminders are shifted.'},
    ],
  },

  system_integrations: {
    title:'Integrations: Connecting External Services', subtitle:'Block 3 · System', est:'15 min',
    actionLabel:'Open integrations',
    description:'<b>Pain without this:</b> data is scattered across different services. A call in telephony — separate. A calendar event — separate. TALKO doesn\'t know what\'s happening outside the system.<br><br><b>Available integrations:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Notifications about new tasks, deadlines, coordination decisions. Each employee connects independently in their profile.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Task deadline sync with calendar. All deadlines — automatically in Google Calendar.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEPHONY: BINOTEL / RINGOSTAT / STREAM</b><br>Calls are recorded automatically. Missed call → "Call back" task → assignee → deadline. Zero manual work.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Connect any external systems: your website, forms, other CRMs. Leads and events — automatically in TALKO.</div></div>',
    tipText:'Telephony is the biggest loss point for businesses with incoming calls. Without integration: missed call = lost client. With integration: missed call → auto-task → callback in 5 minutes.',
    tasks:[
      {text:'Open Business → Integrations and review all available', detail:'You\'ll see a list of services with "Connected" or "Not connected" status.'},
      {text:'Verify Telegram is connected in your profile', detail:'Click your name top right → "Telegram Notifications" → should show "Connected".'},
      {text:'Connect Google Calendar or review the connection guide', detail:'Integrations → Google Calendar → "Connect" → Google authorization.'},
      {text:'If using Binotel, Ringostat or Stream — connect telephony', detail:'Integrations → select provider → API key → save.'},
      {text:'Ask each employee to connect Telegram after registration', detail:'Without this notifications don\'t come. Make it mandatory in employee onboarding.'},
    ],
  },

  projects: {
    title:'Projects: Complex Tasks with Timeline', subtitle:'Block 4 · Projects & Processes', est:'10 min',
    actionLabel:'Open projects',
    description:'<b>Pain without this:</b> a complex project with 20 tasks "falls apart" in the general list. Unclear what\'s done, where the delay is.<br><br><b>Three views:</b> Cards (kanban), List, Timeline (Gantt).<br><b>Progress</b> — calculated automatically from completed tasks.<br><br>Examples: "Opening a new location", "Product launch", "CRM implementation".',
    tipText:'Timeline view immediately shows the bottleneck and who is blocking the rest of the team.',
    tasks:[
      {text:'Open "Projects" tab and review existing ones', detail:'If none — create a test one. Name + deadline + a few tasks.'},
      {text:'Switch views: Cards → List → Timeline', detail:'Timeline is the most informative view for control.'},
      {text:'Add a few tasks and verify the progress', detail:'Add 3–4 tasks → check the timeline.'},
    ],
  },

  processes: {
    title:'Processes: Templates for Recurring Situations', subtitle:'Block 4 · Projects & Processes', est:'15 min',
    actionLabel:'Open processes',
    description:'<b>Pain without this:</b> every time a new client arrives — you explain "from scratch", or something gets forgotten.<br><br><b>Processes</b> — templates for sequences of actions. Set up once → launch with a click → all tasks are created automatically with assignees and deadlines.<br><br>Examples: client intake, employee onboarding, month-end closing.',
    tipText:'1 configured process = hundreds of hours saved per year.',
    tasks:[
      {text:'Open "Processes" tab and review the logic', detail:'Find demo templates. Note: template → launch → active process.'},
      {text:'Identify 1 recurring process in your business', detail:'What do you do the same way several times a month? That\'s a candidate.'},
      {text:'Create a process template with 3–4 steps', detail:'Processes → "New template" → add steps. Each: who + how many days + result.'},
      {text:'Launch the process and verify tasks were created', detail:'Go to "All Tasks" — tasks are already there with assignees and deadlines.'},
    ],
  },

  coordination_types: {
    title:'Coordinations: Types and When to Use', subtitle:'Block 5 · Coordination', est:'10 min',
    actionLabel:'Open coordination',
    description:'<b>Pain without this:</b> a meeting happens — a week later nothing is done. Decisions "got lost in the messenger".<br><br><b>8 coordination types:</b> Daily · Weekly · Monthly · Advisory Board · Board of Directors · Executive Board · Founders Board · One-time.<br><br>Every decision → immediately becomes a task with an assignee and deadline.',
    tipText:'Weekly planning meeting — the basic business rhythm. Without it the team falls apart into isolated islands.',
    tasks:[
      {text:'Open "Coordination" tab and review all 8 types', detail:'Each type has its own agenda template and duration.'},
      {text:'Determine which types your business needs', detail:'Minimum: Weekly + Monthly. For executives — Executive Board.'},
      {text:'Set up a regular weekly coordination', detail:'"New coordination" → type → day → time → participants.'},
    ],
  },

  coordination_process: {
    title:'Coordinations: How to Run and Record Results', subtitle:'Block 5 · Coordination', est:'15 min',
    actionLabel:'Open coordination',
    description:'<b>Pain without this:</b> even if a meeting was held — decisions "got lost". No protocol, no responsible persons.<br><br><b>Weekly coordination order:</b><br>1. Participant statistics<br>2. Previous task completion<br>3. Participant reports<br>4. Questions<br>5. Decisions — record each one directly in the system<br>6. New tasks — every decision immediately becomes a task<br><br><b>Timer, protocol (PDF), escalation</b> — all built in.',
    tipText:'Rule: every meeting ends with a protocol containing tasks.',
    tasks:[
      {text:'Create a "Weekly" coordination and add participants', detail:'"New coordination" → type → name → participants.'},
      {text:'Launch the coordination and complete the agenda', detail:'"Start" → agenda → record at least 1 decision.'},
      {text:'Record a decision and assign an executor with deadline', detail:'"+ Add decision" → text → assignee → deadline. Immediately becomes a task.'},
      {text:'Complete the coordination and verify tasks appeared', detail:'Go to "All Tasks" — all decisions are already there.'},
      {text:'Open the automatically generated protocol', detail:'In archive → completed coordination → "Protocol" button. Ready PDF.'},
    ],
  },

  control: {
    title:'Control: Business Pulse in 5 Minutes Daily', subtitle:'Block 5 · Control', est:'15 min',
    actionLabel:'Open control',
    description:'<b>Pain without this:</b> the manager finds out about a problem when it\'s already a "fire".<br><br><b>Critical Attention</b> — dashboard: overdue tasks, without assignee, without deadline. 2 minutes — you know where the "fire" is.<br><b>Workload</b> — who has how many tasks.<br><b>Delegation Funnel</b> — where tasks get "stuck".<br><b>Management Issue Log</b> — a register of systemic problems.',
    tipText:'Morning ritual: 5 minutes in "Critical Attention" — business status without a single meeting.',
    tasks:[
      {text:'Open "Control" → click "Critical Attention"', detail:'This is your morning ritual. 2 minutes — you know where the fire is.'},
      {text:'Review "Workload" — see the team distribution', detail:'Who has 15 tasks vs who has 2? Imbalance signals poor delegation.'},
      {text:'Open "Delegation Funnel" and understand the logic', detail:'If most tasks are at step 1 — assignees aren\'t picking them up.'},
      {text:'Add the first entry to "Management Issue Log"', detail:'Fact → cause → solution. After 3 months you see systemic patterns.'},
    ],
  },

  analytics: {
    title:'Efficiency & Statistics: Numbers Instead of Feelings', subtitle:'Block 6 · Analytics', est:'10 min',
    actionLabel:'Open analytics',
    description:'<b>Pain without this:</b> the owner manages "by feeling". A problem arises — unclear where and when it started.<br><br><b>Efficiency</b> — KPIs per employee: how many completed on time, how many overdue, weekly dynamics.<br><b>Statistics</b> — your business metrics that you add yourself (revenue, clients, calls, etc.).',
    tipText:'If a metric isn\'t measured — it can\'t be managed. 3 numbers daily — minimum.',
    tasks:[
      {text:'Open "Efficiency" — review task statistics', detail:'Who completes on time vs who keeps postponing. Objective data, no emotions.'},
      {text:'Open "Statistics" and add 3 key business metrics', detail:'Examples: "Daily Revenue", "New Clients", "Orders Completed".'},
      {text:'Switch metrics between Day / Week / Month', detail:'Month shows trend, day shows current pulse.'},
    ],
  },

  finance_dashboard: {
    title:'Finance: Dashboard and Big Picture', subtitle:'Block 7 · Finance', est:'10 min',
    actionLabel:'Open finance',
    description:'<b>Pain without this:</b> the owner doesn\'t know how much the business actually earns. There\'s money — but it\'s not profit.<br><br><b>Dashboard</b> shows: Income, Expenses, Profit, Margin for the month.<br>Income/expense chart for 6 months — trend and seasonality.<br>Top expenses by category. Automatic signals.',
    tipText:'Finance without data — a beautiful but empty dashboard. Start entering transactions today.',
    tasks:[
      {text:'Open Business → Finance and review the dashboard', detail:'Select the current month.'},
      {text:'Review all sub-tabs: Income, Expenses, Accounts, Planning', detail:'Go through each — understand the logic before entering data.'},
      {text:'Set up accounts (cash, bank, card)', detail:'Finance → Settings → Accounts. Add at least 2: cash and current account.'},
    ],
  },

  finance_transactions: {
    title:'Finance: Income, Expenses and Categories', subtitle:'Block 7 · Finance', est:'15 min',
    actionLabel:'Open finance',
    description:'<b>Pain without this:</b> at month-end it\'s unclear where the money went. No categories — all expenses in one pile.<br><br><b>Income and expenses</b> by categories. <b>Recurring transactions</b> (rent, salary, subscriptions) — set up once, debited automatically.',
    tipText:'Standard: enter transactions daily or at least every 2–3 days.',
    tasks:[
      {text:'Enter 3 test income items in different categories', detail:'Finance → Income → "+ Income". Category, amount, account, date.'},
      {text:'Enter 3 test expenses in different categories', detail:'Link to a function — then department analytics work.'},
      {text:'Set up a recurring transaction (e.g. rent)', detail:'Finance → Recurring → "+ Recurring" → monthly, amount, category.'},
      {text:'Check the dashboard after entering data', detail:'Now charts and top expenses are filled with real data.'},
    ],
  },

  finance_planning: {
    title:'Finance: Budgeting, Invoices and P&L', subtitle:'Block 7 · Finance', est:'15 min',
    actionLabel:'Open finance',
    description:'<b>Pain without this:</b> at month-end — expenses exceeded the plan. The budget exists "in someone\'s head".<br><br><b>Planning</b> — budget Plan vs Fact with variances.<br><b>Invoices</b> — issue to clients. Paid → automatically creates an income transaction.<br><b>P&L</b> — profit and loss report. Generated automatically.',
    tipText:'P&L — the first document in a conversation with an investor or bank. Now generated automatically.',
    tasks:[
      {text:'Open Finance → Planning and enter the monthly income plan', detail:'Expected income by category.'},
      {text:'Enter expense plan by categories', detail:'Salary, rent, marketing, materials — break it down.'},
      {text:'Create a test invoice for a client and check statuses', detail:'Finance → Invoices → "+ Invoice". Items → deadline → mark "Paid".'},
      {text:'Review the P&L report for the current month', detail:'If there are transactions — P&L fills automatically.'},
    ],
  },

  crm: {
    title:'CRM: Clients, Deals, Sales', subtitle:'Block 8 · Business', est:'15 min',
    actionLabel:'Open CRM',
    description:'<b>Pain without this:</b> clients are in Excel or in the salesperson\'s head. They quit — the business loses the entire database.<br><br><b>Deal kanban:</b> Lead → Negotiation → Proposal → Invoice → Payment.<br><b>Clients</b> — contact database with all deals, correspondence, next contact date.<br><b>Deal → invoice → automatically into Finance.</b>',
    tipText:'Main CRM rule: every client interaction gets recorded. In 6 months this log becomes your most valuable asset.',
    tasks:[
      {text:'Open CRM and review the deal kanban', detail:'Customize stage names for your business: CRM → Settings → Pipelines.'},
      {text:'Create a test deal and drag it between stages', detail:'"+ Deal". Name, amount, client, stage. Try drag & drop.'},
      {text:'Add a client and link them to a deal', detail:'CRM → Clients → "+ Client".'},
      {text:'From the deal, create a "Call back" task with a deadline', detail:'Open deal → "Task". Appears in the system.'},
    ],
  },

  bots_sites: {
    title:'Marketing, Bots and My Sites', subtitle:'Block 8 · Business', est:'10 min',
    actionLabel:'Open bots',
    description:'<b>Bots</b> — Telegram bot builder without code. Leads automatically into CRM.<br><b>My Sites</b> — landing page builder. Forms → automatically into CRM.<br><b>Marketing</b> — templates, channel statistics.',
    tipText:'Even a simple bot that responds and passes the contact to CRM is better than nothing.',
    tasks:[
      {text:'Open "Bots" and see how to connect a Telegram bot', detail:'Bots → "+ New bot" → token from @BotFather → welcome message.'},
      {text:'Browse the message sequence builder', detail:'In the bot → "Flows" → "+ New flow". Drag & drop: Message, Question, Condition.'},
      {text:'Open "My Sites" and review the builder', detail:'Sites → "+ New site". Template → edit → publish. Form → goes to CRM.'},
    ],
  },

  warehouse: {
    title:'Warehouse: product and material tracking', subtitle:'Block 8 · Business', est:'10 min',
    actionLabel:'Open warehouse',
    description:'<b>Pain without this:</b> materials are written off by eye, warehouse exists only in one manager\'s head, inventory once a year.<br><br><b>Product catalog</b> — each item with SKU, unit, minimum stock.<br><b>Material flow:</b> Incoming, Outgoing, Write-off, Adjustment.<br><b>Alerts</b> — system notifies when stock falls below minimum.',
    tipText:'Set minimum stock for critical materials — system will warn automatically.',
    tasks:[
      {text:'Open Business → Warehouse', detail:'Warehouse tab is in the Business menu.'},
      {text:'Add 2-3 products to catalog', detail:'"+ Add item" → name, SKU, unit, minimum stock.'},
      {text:'Perform an "Incoming" operation', detail:'Operations → "Incoming" → select item → enter quantity and supplier.'},
      {text:'Check warehouse dashboard — alerts and balances', detail:'Dashboard → check for minimum stock alerts.'}
    ]
  },

  booking: {
    title:'Booking: online client appointments', subtitle:'Block 8 · Business', est:'10 min',
    actionLabel:'Open booking',
    description:'<b>Pain without this:</b> clients write in DMs to book, manager moves to spreadsheet, time conflicts, manual confirmation.<br><br><b>Booking</b> — your own Calendly inside TALKO:<br>• Set up services and duration<br>• Set working days and hours<br>• Get a public booking link<br>• Requests automatically in the system',
    tipText:'Put the link in Instagram bio or Telegram bot — clients will book themselves without a manager.',
    tasks:[
      {text:'Open Business → Booking', detail:'Booking tab in Business menu.'},
      {text:'Add a service with duration and name', detail:'"+ Service" → name, duration (min), description.'},
      {text:'Set working days and hours', detail:'Select weekdays and set start/end of workday.'},
      {text:'Copy link and open in browser', detail:'"Copy link" → open in new tab → check how it looks to client.'}
    ]
  },

  learning_start: {
    title:'Learning: Program Roadmap and First Modules', subtitle:'Block 9 · Learning', est:'20 min',
    actionLabel:'Open learning',
    description:'<b>Learning is not a bonus — it\'s the foundation.</b> Without methodology the owner will "click buttons" without understanding why.<br><br>The <b>"Learning"</b> tab is now in the main menu at the top. There are 15 modules.<br><br><b>Where to start — first 5 modules:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODULE 0</b><br><b>Program Roadmap</b> — step-by-step implementation map. <b>Start here.</b></div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODULE 4</b><br><b>Task Delegation System</b> — how to assign tasks so they get done.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODULE 5</b><br><b>RADAR System</b> — how to stop being a "firefighter" for the team.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODULE 9</b><br><b>Goal, Intent, Functional Structure</b> — the foundation of a systematic business.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODULE 13</b><br><b>Statistics System</b> — how to see your business in numbers.</div></div>',
    tipText:'Learning and implementation — in parallel. Complete a module → immediately configure in the system → it sticks.',
    tasks:[
      {text:'Open the "Learning" tab in the main menu', detail:'New button in the desktop menu. On mobile — in the bottom menu.'},
      {text:'View Module 0 "Program Roadmap"', detail:'This is the map of the entire journey. After viewing, the sequence becomes clear.'},
      {text:'View Module 4 "Task Delegation System"', detail:'After this module, delegation quality improves immediately.'},
      {text:'Plan to complete remaining modules — 1 per week', detail:'Don\'t try to do everything at once. 1 module per week = understood and implemented.'},
    ],
  },

  learning_ai: {
    title:'AI Assistant and Integrations', subtitle:'Block 9 · Learning', est:'5 min',
    actionLabel:'Open integrations',
    description:'<b>The green button at the top</b> — an AI assistant that knows the entire TALKO system. It can:<br>— Answer any question about functionality<br>— Help properly set up a task<br>— Suggest how to configure a process or bot<br><br>This is not generic ChatGPT — this is a TALKO consultant.<br><br><b>Integrations:</b> Google Calendar (deadline sync), Telegram (notifications), Webhook API.',
    tipText:'AI Assistant 24/7 — first point of help. Before contacting the developer — ask the assistant.',
    tasks:[
      {text:'Click the green button and ask a question about the platform', detail:'For example: "How to set up a recurring task?"'},
      {text:'Open "Integrations" and review available connections', detail:'Google Calendar, Telegram, Webhook.'},
      {text:'Connect Google Calendar or confirm Telegram is connected', detail:'Select integration → follow the instructions. 3–5 minutes.'},
    ],
  },
}, // end en

// ══════════════════════════════════════════════════════════
// RUSSIAN
// ══════════════════════════════════════════════════════════
ru: {
  _blocks: {
    start:'Старт', tasks:'Задачи', myday:'Мой день', system:'Система',
    projects:'Проекты', coordination:'Координации', analytics:'Аналитика',
    finance:'Финансы', business:'Бизнес', learning:'Обучение',
  },
  _ui: {
    skip:'Пропустить', prev:'Назад', done:'Онбординг завершён!',
    askAI:'Спросить AI-ассистента', minUnit:'мин', overview:'Обзор',
    completed:'выполнено', complete:'Завершить', estLabel:'Ориентировочное время:',
    next:'Следующий шаг', stepsOf:'шаги', stepsLabel:'Шаги выполнения',
  },

  setup_company: {
    title:'Настройка компании', subtitle:'Блок 0 · Старт', est:'5 мин',
    actionLabel:'Открыть настройки',
    description:'<b>Первый шаг перед всем.</b> Без базовых настроек система работает некорректно — неправильное время в дедлайнах, безымянная компания, отсутствие уведомлений.<br><br><b>Название компании</b> — отображается везде: в приглашениях, отчётах, протоколах координаций.<br><b>Часовой пояс</b> — критично для дедлайнов и напоминаний.<br><b>Еженедельный отчёт</b> — владелец получает сводку по выполнению задач каждую неделю автоматически.<br><br><b>Где найти:</b> Система → Сотрудники → вкладка «Компания» (видна только Owner).',
    tipText:'Настройка компании — 5 минут один раз. Без правильного часового пояса все напоминания будут смещены.',
    tasks:[
      {text:'Открыть Система → Сотрудники → вкладка «Компания»', detail:'Вкладка видима только для владельца (Owner).'},
      {text:'Ввести название компании и сохранить', detail:'Название отображается в приглашениях и заголовке системы.'},
      {text:'Проверить часовой пояс — установить правильный', detail:'По умолчанию Киев (UTC+2/+3). Если команда в другом поясе — изменить.'},
      {text:'Включить еженедельный отчёт владельцу', detail:'Каждый понедельник получаете сводку по выполнению задач.'},
    ],
  },

  setup_telegram: {
    title:'Подключение Telegram', subtitle:'Блок 0 · Старт', est:'5 мин',
    actionLabel:'Открыть профиль',
    description:'<b>Боль без этого:</b> задача поставлена — исполнитель не знает. Дедлайн пришёл — ничего не напомнило.<br><br>Без Telegram уведомлений:<br>— Новые задачи не сообщаются<br>— Дедлайны не напоминаются<br>— Просрочки никуда не сигналят<br>— Решения координаций не приходят<br><br><b>Как подключить:</b> откройте свой профиль (кнопка с именем вверху справа) → раздел «Telegram уведомления» → «Подключить Telegram» → бот → /start.<br><br><b>Каждый сотрудник подключает самостоятельно</b> после регистрации.',
    tipText:'Telegram — не бонус, это обязанность. Кто не подключил — они вне системы.',
    tasks:[
      {text:'Открыть профиль → найти раздел «Telegram уведомления»', detail:'Кликните на своё имя или аватар вверху справа.'},
      {text:'Нажать «Подключить Telegram» и пройти процесс', detail:'Откроется бот TALKO. Нажмите /start → система подтвердит подключение.'},
      {text:'Проверить — отправить тестовую задачу себе', detail:'Задача где вы исполнитель → через 10–20 секунд должно прийти уведомление.'},
      {text:'Попросить каждого сотрудника подключить Telegram после регистрации', detail:'Без этого уведомления не работают. Сделайте обязательным условием.'},
    ],
  },

  setup_invite: {
    title:'Приглашение команды', subtitle:'Блок 0 · Старт', est:'10 мин',
    actionLabel:'Открыть сотрудников',
    description:'<b>Боль без этого:</b> система настроена — но в ней только владелец. Вся ценность TALKO — в том что команда в системе.<br><br><b>Процесс:</b> Система → Сотрудники → «Пригласить» → Email → роль → отправить.<br><br><b>Роли:</b><br>— <b>Owner</b> — видит и может всё<br>— <b>Manager</b> — видит свою команду и аналитику<br>— <b>Employee</b> — видит только свои задачи<br><br><b>Правило:</b> начинайте с минимально необходимых прав.',
    tipText:'Ошибка: приглашать всех сразу. Лучше 3–5 ключевых → наладить процесс → остальные.',
    tasks:[
      {text:'Составить список сотрудников для приглашения', detail:'Начинайте с 3–5 ключевых людей. Не всех сразу.'},
      {text:'Пригласить первого сотрудника через Система → Сотрудники', detail:'Кнопка «Пригласить» → email → роль → отправить. Письмо придёт за минуту.'},
      {text:'Убедиться что приглашённый зарегистрировался и появился в списке', detail:'Обновите список. Новый член команды должен появиться со статусом «Активный».'},
      {text:'Назначить новому сотруднику первую тестовую задачу', detail:'Это закрепит навык и покажет что система живёт.'},
    ],
  },

  tasks_views: {
    title:'Задачи: виды отображения и фильтры', subtitle:'Блок 1 · Задачи', est:'10 мин',
    actionLabel:'Открыть задачи',
    description:'<b>Боль без этого:</b> руководитель не понимает что происходит, команда держит задачи в мессенджерах.<br><br><b>6 видов отображения:</b><br>— <b>День</b> — что сделать сегодня<br>— <b>Неделя</b> — картина на 7 дней<br>— <b>Месяц</b> — стратегический вид<br>— <b>Список</b> — все задачи строкой<br>— <b>Канбан</b> — по столбцам статусов<br>— <b>Сроки</b> — Gantt-схема<br><br><b>Фильтры:</b> по исполнителю, статусу, функции, дедлайну, приоритету.',
    tipText:'Канбан-вид — идеален для еженедельного обзора с командой. Видно где затор и почему не двигается.',
    tasks:[
      {text:'Открыть «Все задачи» и переключить все 6 видов', detail:'Каждый вид — для разной задачи управления. Канбан и Список — для ежедневной работы.'},
      {text:'Применить фильтр: выбрать конкретного исполнителя', detail:'Панель фильтров над списком задач. Выберите имя — сразу видите только их задачи.'},
      {text:'Применить фильтр по статусу «Просрочено»', detail:'Критический фильтр для руководителя. Сразу видно что «горит» и у кого.'},
      {text:'Найти задачу через глобальный поиск', detail:'Строка поиска вверху. Ищет по названию, комментариях, именах. Мгновенно.'},
    ],
  },

  tasks_anatomy: {
    title:'Задачи: анатомия и правильная постановка', subtitle:'Блок 1 · Задачи', est:'15 мин',
    actionLabel:'Открыть задачи',
    description:'<b>Боль без этого:</b> исполнитель сделал «своё», руководитель ждал «другое». Переделки, потеря времени.<br><br>Правильная задача отвечает: <i>кто, что, до когда, что является результатом, кто проверяет.</i><br><br>— <b>Название</b> — конкретное действие (не «Реклама», а «Запустить Facebook рекламу до пятницы»)<br>— <b>Исполнитель</b> — один человек<br>— <b>Дедлайн</b> — конкретная дата и время<br>— <b>Приоритет</b> — Критический / Высокий / Средний / Низкий<br>— <b>Ожидаемый результат</b> — ЧТО должно быть сделано<br>— <b>Формат отчёта</b> — КАК отчитывается исполнитель<br>— <b>Чеклист, напоминания, проверка, комментарии и файлы</b>',
    tipText:'Правило: если исполнитель может выполнить задачу без единого дополнительного вопроса — поставлено правильно.',
    tasks:[
      {text:'Создать тестовую задачу заполнив все поля', detail:'Название, исполнитель, дедлайн, приоритет, ожидаемый результат, формат отчёта.'},
      {text:'Добавить чеклист с 3 подпунктами', detail:'Внутри задачи — раздел «Чеклист» → «Добавить пункт».'},
      {text:'Поставить напоминание на завтра в 9:00', detail:'Исполнитель получит уведомление в Telegram в указанное время.'},
      {text:'Включить «Проверку после выполнения»', detail:'После отметки done — статус «На проверке». Контролёр получает сигнал.'},
      {text:'Написать комментарий и прикрепить файл', detail:'Вся переписка остаётся внутри задачи навсегда.'},
    ],
  },

  regular_tasks: {
    title:'Регулярные задачи: автоматизация рутины', subtitle:'Блок 1 · Задачи', est:'10 мин',
    actionLabel:'Открыть регулярные',
    description:'<b>Боль без этого:</b> каждую неделю вручную ставите одни и те же задачи. Это 2–3 часа в месяц только на постановку.<br><br>Настраиваете один раз → система ставит автоматически → исполнитель получает уведомление в Telegram.<br><br>— <b>Ежедневные</b> — появляются каждое утро<br>— <b>Еженедельные</b> — в определённый день недели<br>— <b>Ежемесячные</b> — в определённую дату месяца',
    tipText:'Золотое правило: любую задачу которую ставите больше 2 раз — автоматизируйте.',
    tasks:[
      {text:'Открыть вкладку «Регулярные задачи»', detail:'Задачи → «Регулярные» или через меню «Все задачи».'},
      {text:'Определить 3 задачи которые ставите вручную каждую неделю', detail:'Например: отчёт, планёрка, проверка показателей.'},
      {text:'Создать еженедельную регулярную задачу с напоминанием', detail:'Кнопка «+ Регулярная» → исполнитель, день недели, время, результат.'},
      {text:'Проверить что задача автоматически появилась у исполнителя', detail:'Фильтр по исполнителю → регулярная задача уже там с дедлайном.'},
    ],
  },

  myday: {
    title:'Мой день: фокус и планирование', subtitle:'Блок 2 · Мой день', est:'5 мин',
    actionLabel:'Открыть Мой день',
    description:'<b>Боль без этого:</b> человек приходит на работу и не знает с чего начать. Или хватается за всё и ничего не доводит до конца.<br><br><b>«Мой день»</b> — персональный экран. Показывает только то что нужно сделать СЕГОДНЯ.<br><br>— <b>Обычный вид</b> — все задачи на сегодня с дедлайнами по приоритету<br>— <b>Режим «Фокус»</b> — одна задача на весь экран. Выполнил → «Готово» → следующая. Без отвлечений.',
    tipText:'Попросите команду начинать день с «Моего дня». 5 минут утром — и каждый знает свой план.',
    tasks:[
      {text:'Открыть «Мой день» и просмотреть задачи на сегодня', detail:'Если задач нет — создайте тестовую с дедлайном сегодня.'},
      {text:'Переключиться в режим «Фокус» и выполнить одну задачу', detail:'Кнопка «Фокус» вверху вкладки. Нажмите «Готово» — система переходит к следующей.'},
    ],
  },

  functions: {
    title:'Функции: отделы и KPI бизнеса', subtitle:'Блок 3 · Система', est:'15 мин',
    actionLabel:'Открыть функции',
    description:'<b>Боль без этого:</b> задачи висят «в воздухе» без привязки к отделу. Аналитика не показывает где нагрузка и где пробелы.<br><br><b>Функции</b> — это отделы вашего бизнеса. Каждая функция имеет:<br>— <b>Ответственного</b> — кто управляет этим направлением<br>— <b>KPI</b> — конкретные цифры результата<br>— <b>Задачи</b> — всё что выполняется в этом отделе<br><br><b>Примеры функций:</b> Продажи, Маркетинг, Финансы, HR, Операционная, Клиентский сервис.<br><br><b>KPI — это числа, не пожелания:</b><br>— Правильно: «20 новых клиентов в месяц»<br>— Неправильно: «Увеличить продажи»<br><br><b>Два режима просмотра:</b><br>— <b>Карточки</b> — детальная информация по каждой функции<br>— <b>Структура</b> — схема связей между отделами',
    tipText:'Минимум: 3–5 функций с KPI. Это фундамент аналитики. Без функций отчёт по отделам пуст.',
    tasks:[
      {text:'Открыть Система → Функции', detail:'Без функций аналитика по отделам не работает.'},
      {text:'Создать минимум 3 ключевые функции своего бизнеса', detail:'«+ Функция» → название → назначить ответственного. Начните с: Продажи, Операционная, Финансы.'},
      {text:'К каждой функции добавить минимум 1 KPI с конкретным числом', detail:'Внутри функции → «KPI» → «+ KPI». Пример: Новые сделки — 20 — шт/мес.'},
      {text:'Переключиться в режим «Структура» и проверить схему', detail:'Кнопка «Структура» вверху. Видна иерархия отделов.'},
      {text:'Привязать существующие задачи к соответствующим функциям', detail:'Откройте задачу → поле «Функция» → выберите отдел.'},
    ],
  },

  bizstructure: {
    title:'Структура: организационная схема компании', subtitle:'Блок 3 · Система', est:'10 мин',
    actionLabel:'Открыть структуру',
    description:'<b>Боль без этого:</b> команда не понимает кто кому подчиняется. Новый сотрудник не знает к кому обращаться. Руководитель не видит всю картину сразу.<br><br><b>Структура</b> — это интерактивная организационная схема вашей компании:<br>— Отделы и подразделения<br>— Иерархия подчинения<br>— Каждый сотрудник на своём месте<br>— Количество задач и нагрузка по каждому<br><br><b>Структура строится автоматически</b> на основе функций и сотрудников. Если функции заполнены — структура уже есть.<br><br><b>Что видно в карточке сотрудника:</b><br>— Роль и отдел<br>— Активные задачи и статусы<br>— Нагрузка и эффективность',
    tipText:'Структура — первое что показываете новому менеджеру. Человек сразу понимает где он, кто рядом, кто выше. Экономит 2–3 недели адаптации.',
    tasks:[
      {text:'Открыть Система → Структура', detail:'Если пусто — сначала заполните Функции.'},
      {text:'Проверить что все отделы отображаются корректно', detail:'Сравните с реальной структурой бизнеса.'},
      {text:'Кликнуть на карточку сотрудника и просмотреть детали', detail:'Роль, отдел, активные задачи, нагрузка.'},
      {text:'Проверить что каждый сотрудник привязан к своему отделу', detail:'Если кто-то «без отдела» — откройте карточку → измените функцию.'},
    ],
  },

  team_management: {
    title:'Сотрудники: роли, доступы и приглашения', subtitle:'Блок 3 · Система', est:'15 мин',
    actionLabel:'Открыть сотрудников',
    description:'<b>Боль без этого:</b> все видят всё — или наоборот, кто-то не видит нужное. Доступы «на подозрении», а не на логике.<br><br><b>Вкладка Сотрудники</b> имеет 4 раздела:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">СПИСОК</b><br>Все сотрудники с ролью, отделом, статусом и нагрузкой. Отсюда — в карточку каждого.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ПРИГЛАСИТЬ</b><br>Отправить email-приглашение → человек регистрируется → сразу в системе с нужной ролью.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">РОЛИ</b><br><b>Owner</b> — полный доступ ко всему. <b>Manager</b> — свой отдел и аналитика. <b>Employee</b> — только свои задачи. Устанавливайте минимально необходимое.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">КОМПАНИЯ</b><br>Название, часовой пояс, еженедельный отчёт владельцу. Видно только Owner.</div></div>',
    tipText:'Ошибка №1: всем дают Owner. Потом удивляются почему рядовой сотрудник видит зарплаты. Роли — настройте один раз правильно.',
    tasks:[
      {text:'Открыть Система → Сотрудники → вкладка «Список»', detail:'Проверьте всех активных. Карточка: роль, отдел, количество задач.'},
      {text:'Проверить роли — соответствуют ли реальным обязанностям', detail:'Клик → «Изменить роль». Правило: минимально необходимый доступ.'},
      {text:'Перейти на вкладку «Роли» и изучить матрицу доступов', detail:'Owner — всё. Manager — свой отдел + аналитика. Employee — только свои задачи.'},
      {text:'Пригласить нового сотрудника через вкладку «Пригласить»', detail:'Email → роль → функция → «Отправить».'},
      {text:'Открыть вкладку «Компания» и проверить настройки (только Owner)', detail:'Название, часовой пояс, еженедельный отчёт.'},
    ],
  },

  system_integrations: {
    title:'Интеграции: подключение внешних сервисов', subtitle:'Блок 3 · Система', est:'15 мин',
    actionLabel:'Открыть интеграции',
    description:'<b>Боль без этого:</b> данные разбросаны по разным сервисам. Звонок в телефонии — отдельно. Событие в календаре — отдельно. TALKO не знает что происходит вне системы.<br><br><b>Доступные интеграции:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Уведомления о новых задачах, дедлайнах, решениях координаций. Подключает каждый сотрудник самостоятельно в своём профиле.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Синхронизация дедлайнов задач с календарём. Все дедлайны — автоматически в Google Calendar.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ТЕЛЕФОНИЯ: BINOTEL / RINGOSTAT / STREAM</b><br>Звонки фиксируются автоматически. Пропущенный звонок → задача «Перезвонить» → исполнитель → дедлайн. Ноль ручной работы.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Подключение любых внешних систем: свой сайт, формы, другие CRM. Лиды и события — автоматически в TALKO.</div></div>',
    tipText:'Телефония — наибольшая точка потерь для бизнесов со входящими звонками. Без интеграции: пропущенный звонок = потерянный клиент.',
    tasks:[
      {text:'Открыть Бизнес → Интеграции и просмотреть доступные', detail:'Список сервисов со статусом «Подключено» или «Не подключено».'},
      {text:'Проверить что Telegram подключён в вашем профиле', detail:'Клик на имя вверху справа → «Telegram уведомления» → должно быть «Подключено».'},
      {text:'Подключить Google Calendar или просмотреть инструкцию', detail:'Интеграции → Google Calendar → «Подключить» → авторизация Google.'},
      {text:'Если используете Binotel, Ringostat или Stream — подключить телефонию', detail:'Интеграции → провайдер → API ключ → сохранить.'},
      {text:'Попросить каждого сотрудника подключить Telegram', detail:'Без этого уведомления не приходят. Сделайте обязательным условием.'},
    ],
  },

  projects: {
    title:'Проекты: сложные задачи с таймлайном', subtitle:'Блок 4 · Проекты и процессы', est:'10 мин',
    actionLabel:'Открыть проекты',
    description:'<b>Боль без этого:</b> сложный проект на 20 задач «рассыпается» в общем списке. Непонятно что сделано, где задержка.<br><br><b>Три вида:</b> Карты (канбан), Список, Таймлайн (Gantt).<br><b>Прогресс</b> — считается автоматически из выполненных задач.<br><br>Примеры: «Открытие новой точки», «Запуск продукта», «Внедрение CRM».',
    tipText:'Таймлайн — сразу видно где «узкое место» и кто блокирует остальных.',
    tasks:[
      {text:'Открыть вкладку «Проекты» и просмотреть имеющиеся', detail:'Если нет — создайте тестовый. Название + дедлайн + задачи.'},
      {text:'Переключить вид: Карты → Список → Таймлайн', detail:'Таймлайн — наиболее информативный вид для контроля.'},
      {text:'Добавить задачи и проверить прогресс', detail:'Добавьте 3–4 задачи → проверьте таймлайн.'},
    ],
  },

  processes: {
    title:'Процессы: шаблоны для повторяющихся ситуаций', subtitle:'Блок 4 · Проекты и процессы', est:'15 мин',
    actionLabel:'Открыть процессы',
    description:'<b>Боль без этого:</b> каждый раз когда приходит новый клиент — объясняете «с нуля», или что-то забывается.<br><br><b>Процессы</b> — шаблоны последовательности действий. Один раз настраиваете → запускаете кликом → все задачи создаются автоматически с исполнителями и дедлайнами.<br><br>Примеры: приём клиента, онбординг сотрудника, закрытие месяца.',
    tipText:'1 настроенный процесс = сотни сэкономленных часов в год.',
    tasks:[
      {text:'Открыть вкладку «Процессы» и просмотреть логику', detail:'Найдите демо-шаблоны. Обратите внимание: шаблон → запуск → активный процесс.'},
      {text:'Определить 1 повторяющийся процесс в своём бизнесе', detail:'Что делаете несколько раз в месяц одинаково? Это кандидат.'},
      {text:'Создать шаблон процесса с 3–4 этапами', detail:'Процессы → «Новый шаблон» → добавьте этапы. Каждый: кто + дней + результат.'},
      {text:'Запустить процесс и проверить что задачи создались', detail:'Перейдите в «Все задачи» — задачи уже там с исполнителями и дедлайнами.'},
    ],
  },

  coordination_types: {
    title:'Координации: типы и когда использовать', subtitle:'Блок 5 · Координации', est:'10 мин',
    actionLabel:'Открыть координации',
    description:'<b>Боль без этого:</b> совещание прошло — через неделю ничего не сделано. Решения «потерялись в мессенджере».<br><br><b>8 типов координаций:</b> Ежедневная · Еженедельная · Ежемесячная · Рекомендательный совет · Совет директора · Исполнительный совет · Совет основателей · Разовая.<br><br>Каждое решение → сразу становится задачей с исполнителем и дедлайном.',
    tipText:'Еженедельная планёрка — базовый ритм бизнеса. Без неё команда «рассыпается» на островки.',
    tasks:[
      {text:'Открыть вкладку «Координации» и просмотреть все 8 типов', detail:'Каждый тип — отдельный шаблон повестки и длительность.'},
      {text:'Определить какие типы нужны вашему бизнесу', detail:'Минимум: Еженедельная + Ежемесячная. Для руководителей — Исполнительный совет.'},
      {text:'Настроить регулярную еженедельную координацию', detail:'«Новая координация» → тип → день → время → участники.'},
    ],
  },

  coordination_process: {
    title:'Координации: как провести и зафиксировать результат', subtitle:'Блок 5 · Координации', est:'15 мин',
    actionLabel:'Открыть координации',
    description:'<b>Боль без этого:</b> даже если совещание проведено — решения «потерялись». Нет протокола, нет ответственных.<br><br><b>Порядок еженедельной координации:</b><br>1. Статистики участников<br>2. Выполнение предыдущих задач<br>3. Отчёты участников<br>4. Вопросы<br>5. Решения — фиксируем каждое прямо в системе<br>6. Новые задачи — каждое решение сразу становится задачей<br><br><b>Таймер, протокол (PDF), эскалация</b> — всё встроено.',
    tipText:'Правило: каждое совещание заканчивается протоколом с задачами.',
    tasks:[
      {text:'Создать координацию «Еженедельная» и добавить участников', detail:'«Новая координация» → тип → название → участники.'},
      {text:'Запустить координацию и пройти повестку до конца', detail:'Кнопка «Начать» → повестка → зафиксируйте минимум 1 решение.'},
      {text:'Зафиксировать решение и назначить исполнителя с дедлайном', detail:'«+ Добавить решение» → текст → исполнитель → дедлайн. Сразу становится задачей.'},
      {text:'Завершить координацию и проверить что задачи появились', detail:'Перейдите в «Все задачи» — все решения уже там.'},
      {text:'Открыть автоматически сформированный протокол', detail:'В архиве → завершённая координация → кнопка «Протокол». Готовый PDF.'},
    ],
  },

  control: {
    title:'Контроль: пульс бизнеса за 5 минут в день', subtitle:'Блок 5 · Контроль', est:'15 мин',
    actionLabel:'Открыть контроль',
    description:'<b>Боль без этого:</b> руководитель узнаёт о проблеме когда уже «пожар».<br><br><b>Критическое внимание</b> — дашборд: просроченные задачи, без исполнителя, без дедлайна. 2 минуты — знаешь где «пожар».<br><b>Нагрузка</b> — кто и сколько задач ведёт.<br><b>Воронка делегирования</b> — где задачи «застревают».<br><b>Журнал управленческих сбоев</b> — реестр системных проблем.',
    tipText:'Утренний ритуал: 5 минут в «Критическом внимании» — состояние бизнеса без единого совещания.',
    tasks:[
      {text:'Открыть «Контроль» → нажать «Критическое внимание»', detail:'Ваш утренний ритуал. 2 минуты — знаете где «пожар».'},
      {text:'Просмотреть «Нагрузку» — увидеть распределение по команде', detail:'У кого 15 задач а у кого 2? Дисбаланс — признак неправильного делегирования.'},
      {text:'Открыть «Воронку делегирования» и понять логику', detail:'Если большинство на первом этапе — исполнители не берут в работу.'},
      {text:'Добавить первую запись в «Журнал управленческих сбоев»', detail:'Факт → причина → решение. Через 3 месяца видны системные паттерны.'},
    ],
  },

  analytics: {
    title:'Эффективность и Статистика: цифры вместо ощущений', subtitle:'Блок 6 · Аналитика', est:'10 мин',
    actionLabel:'Открыть аналитику',
    description:'<b>Боль без этого:</b> владелец управляет «по ощущениям». Проблема возникла — непонятно где и когда началась.<br><br><b>Эффективность</b> — KPI по каждому сотруднику: сколько выполнено вовремя, сколько просрочено, динаміка по неделям.<br><b>Статистика</b> — ваши бизнес-метрики которые вы сами добавляете (выручка, клиенты, звонки и т.д.).',
    tipText:'Если метрика не измеряется — ею невозможно управлять. 3 цифры в день — минимум.',
    tasks:[
      {text:'Открыть «Эффективность» — просмотреть статистику по задачам', detail:'Кто выполняет вовремя а кто постоянно переносит. Объективные данные.'},
      {text:'Открыть «Статистика» и добавить 3 ключевые метрики', detail:'Примеры: «Выручка за день», «Новых клиентов», «Выполненных заказов».'},
      {text:'Переключить метрики между День / Неделя / Месяц', detail:'Месяц показывает тренд, день — текущий пульс.'},
    ],
  },

  finance_dashboard: {
    title:'Финансы: дашборд и общая картина', subtitle:'Блок 7 · Финансы', est:'10 мин',
    actionLabel:'Открыть финансы',
    description:'<b>Боль без этого:</b> владелец не знает сколько реально зарабатывает бизнес. Деньги есть — но это не прибыль.<br><br><b>Дашборд</b> показывает: Доход, Расходы, Прибыль, Маржа за месяц.<br>График доходов/расходов за 6 месяцев — тренд и сезонность.<br>Топ расходов по категориям. Автоматические сигналы.',
    tipText:'Финансы без данных — красивый но пустой дашборд. Начинайте вносить транзакции с сегодня.',
    tasks:[
      {text:'Открыть Бизнес → Финансы и просмотреть дашборд', detail:'Выберите текущий месяц.'},
      {text:'Просмотреть все подвкладки: Доходы, Расходы, Счета, Планирование', detail:'Пройдите по каждой — поймите логику перед внесением данных.'},
      {text:'Настроить счета (касса, банк, карта)', detail:'Финансы → Настройки → Счета. Добавьте минимум 2: наличные и текущий счёт.'},
    ],
  },

  finance_transactions: {
    title:'Финансы: доходы, расходы и категории', subtitle:'Блок 7 · Финансы', est:'15 мин',
    actionLabel:'Открыть финансы',
    description:'<b>Боль без этого:</b> в конце месяца непонятно куда ушли деньги. Категорий нет — все расходы в одну кучу.<br><br><b>Доходы и расходы</b> по категориям. <b>Повторяющиеся транзакции</b> (аренда, зарплата, подписки) — настраиваете один раз, списываются автоматически.',
    tipText:'Стандарт: вносить транзакции ежедневно или минимум раз в 2–3 дня.',
    tasks:[
      {text:'Внести 3 тестовых дохода по разным категориям', detail:'Финансы → Доходы → «+ Доход». Категория, сумма, счёт, дата.'},
      {text:'Внести 3 тестовых расхода по разным категориям', detail:'Привяжите к функции — тогда аналитика по отделам работает.'},
      {text:'Настроить повторяющуюся транзакцию (например аренда)', detail:'Финансы → Повторяющиеся → «+ Повторяющаяся» → ежемесячно, сумма, категория.'},
      {text:'Проверить дашборд после внесения данных', detail:'Теперь графики и топ расходов заполнены реальными данными.'},
    ],
  },

  finance_planning: {
    title:'Финансы: бюджетирование, счета и P&L', subtitle:'Блок 7 · Финансы', est:'15 мин',
    actionLabel:'Открыть финансы',
    description:'<b>Боль без этого:</b> в конце месяца — расходов больше чем планировалось. Бюджет существует «в голове».<br><br><b>Планирование</b> — бюджет Plan vs Fact с отклонениями.<br><b>Счета (Invoices)</b> — выставление клиентам. Оплачен → автоматически транзакция дохода.<br><b>P&L</b> — отчёт о прибылях и убытках. Формируется автоматически.',
    tipText:'P&L — первый документ в разговоре с инвестором или банком. Теперь формируется автоматически.',
    tasks:[
      {text:'Открыть Финансы → Планирование и внести план доходов на месяц', detail:'Ожидаемый доход по каждой категории.'},
      {text:'Внести план расходов по категориям', detail:'Зарплата, аренда, маркетинг, материалы — детализируйте.'},
      {text:'Создать тестовый счёт клиенту и проверить статусы', detail:'Финансы → Счета → «+ Счёт». Позиции → дедлайн → отметить «Оплачено».'},
      {text:'Просмотреть P&L отчёт за текущий месяц', detail:'Если есть транзакции — P&L заполнится автоматически.'},
    ],
  },

  crm: {
    title:'CRM: клиенты, сделки, продажи', subtitle:'Блок 8 · Бизнес', est:'15 мин',
    actionLabel:'Открыть CRM',
    description:'<b>Боль без этого:</b> клиенты в Excel или голове продавца. Он увольняется — бизнес теряет всю базу.<br><br><b>Канбан сделок:</b> Лид → Переговоры → Предложение → Счёт → Оплата.<br><b>Клиенты</b> — база контактов со всеми сделками, перепиской, следующим контактом.<br><b>Сделка → счёт → автоматически в Финансы.</b>',
    tipText:'Главное правило CRM: любое взаимодействие с клиентом — фиксируется. Через 6 месяцев этот журнал становится ценнейшим активом.',
    tasks:[
      {text:'Открыть CRM и просмотреть канбан сделок', detail:'Настройте названия стадий: CRM → Настройки → Воронки.'},
      {text:'Создать тестовую сделку и перетащить между стадиями', detail:'«+ Сделка». Название, сумма, клиент, стадия. Попробуйте drag & drop.'},
      {text:'Добавить клиента и привязать к нему сделку', detail:'CRM → Клиенты → «+ Клиент».'},
      {text:'Из сделки создать задачу «Перезвонить» с дедлайном', detail:'Откройте сделку → «Задача». Появляется в системе.'},
    ],
  },

  bots_sites: {
    title:'Маркетинг, Боты и Мои сайты', subtitle:'Блок 8 · Бизнес', est:'10 мин',
    actionLabel:'Открыть боты',
    description:'<b>Боты</b> — конструктор Telegram-ботов без кода. Лиды автоматически в CRM.<br><b>Мои сайты</b> — конструктор лендингов. Формы → автоматически в CRM.<br><b>Маркетинг</b> — шаблоны, статистика по каналам.',
    tipText:'Даже простой бот который отвечает и передаёт контакт в CRM — уже лучше чем ничего.',
    tasks:[
      {text:'Открыть «Боты» и посмотреть как подключается Telegram-бот', detail:'Боты → «+ Новый бот» → токен от @BotFather → приветственное сообщение.'},
      {text:'Просмотреть конструктор цепочек сообщений', detail:'В боте → «Цепочки» → «+ Новая цепочка». Drag & drop: Сообщение, Вопрос, Условие.'},
      {text:'Открыть «Мои сайты» и просмотреть конструктор', detail:'Сайты → «+ Новый сайт». Шаблон → редактировать → опубликовать. Форма → в CRM.'},
    ],
  },

  warehouse: {
    title:'Склад: учёт товаров и материалов', subtitle:'Блок 8 · Бизнес', est:'10 мин',
    actionLabel:'Открыть склад',
    description:'<b>Боль без этого:</b> материалы списываются «на глаз», склад существует только в голове одного менеджера, инвентаризация раз в год.<br><br><b>Каталог товаров</b> — каждая позиция с артикулом, единицей, минимальным запасом.<br><b>Движение материалов:</b> Приход, Выдача, Списание, Корректировка.<br><b>Алерты</b> — система уведомляет когда остаток падает ниже минимума.',
    tipText:'Установите минимальный запас для критических материалов — система будет предупреждать автоматически.',
    tasks:[
      {text:'Открыть Бизнес → Склад', detail:'Вкладка «Склад» в меню Бизнес.'},
      {text:'Добавить 2-3 товара в каталог', detail:'«+ Добавить товар» → название, SKU, единица, минимальный запас.'},
      {text:'Выполнить операцию «Приход»', detail:'Операции → «Приход» → выбрать товар → указать количество и поставщика.'},
      {text:'Проверить дашборд склада — алерты и остатки', detail:'Дашборд → проверьте алерты по минимальному запасу.'}
    ]
  },

  booking: {
    title:'Бронирование: онлайн-запись клиентов', subtitle:'Блок 8 · Бизнес', est:'10 мин',
    actionLabel:'Открыть бронирование',
    description:'<b>Боль без этого:</b> клиенты пишут в Direct чтобы записаться, менеджер переносит в таблицу, конфликты времени, ручное подтверждение.<br><br><b>Бронирование</b> — собственный Calendly внутри TALKO:<br>• Настройте услуги и продолжительность<br>• Укажите рабочие дни и часы<br>• Получите публичную ссылку для записи<br>• Заявки автоматически в системе',
    tipText:'Поставьте ссылку в Instagram bio или в Telegram-бота — клиенты сами записываются без менеджера.',
    tasks:[
      {text:'Открыть Бизнес → Бронирование', detail:'Вкладка «Бронирование» в меню Бизнес.'},
      {text:'Добавить услугу с длительностью', detail:'«+ Услуга» → название, длительность (мин), описание.'},
      {text:'Настроить рабочие дни и часы', detail:'Выберите дни недели и укажите начало/конец рабочего дня.'},
      {text:'Скопировать ссылку и открыть в браузере', detail:'«Копировать ссылку» → открыть в новой вкладке → проверить как выглядит для клиента.'}
    ]
  },

  learning_start: {
    title:'Обучение: маршрут программы и первые модули', subtitle:'Блок 9 · Обучение', est:'20 мин',
    actionLabel:'Открыть обучение',
    description:'<b>Обучение — не бонус, это база.</b> Без методологии владелец будет «кликать кнопки» не понимая зачем.<br><br>Вкладка <b>«Обучение»</b> теперь в главном меню сверху. Там 15 модулей.<br><br><b>С чего начать — первые 5 модулей:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 0</b><br><b>Маршрут программы</b> — пошаговая карта внедрения. <b>Начинать отсюда.</b></div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 4</b><br><b>Система поручений</b> — как ставить задачи чтобы выполняли.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 5</b><br><b>Система РАДАР</b> — как перестать быть «пожарником» для команды.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 9</b><br><b>Цель, замысел, функциональная структура</b> — фундамент системного бизнеса.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 13</b><br><b>Система статистик</b> — как видеть бизнес в цифрах.</div></div>',
    tipText:'Обучение и внедрение — параллельно. Прошли модуль → сразу настроили в системе → закрепилось.',
    tasks:[
      {text:'Открыть вкладку «Обучение» в главном меню', detail:'Новая кнопка в десктопном меню. На мобильном — в нижнем меню.'},
      {text:'Просмотреть Модуль 0 «Маршрут программы»', detail:'Это карта всего пути. После просмотра станет понятно в какой последовательности двигаться.'},
      {text:'Просмотреть Модуль 4 «Система поручений»', detail:'После этого модуля качество делегирования растёт сразу.'},
      {text:'Запланировать прохождение остальных модулей — по 1 в неделю', detail:'Не пытайтесь пройти всё сразу. 1 модуль в неделю = усвоено и внедрено.'},
    ],
  },

  learning_ai: {
    title:'AI-ассистент и интеграции', subtitle:'Блок 9 · Обучение', est:'5 мин',
    actionLabel:'Открыть интеграции',
    description:'<b>Зелёная кнопка вверху</b> — AI-ассистент который знает всю систему TALKO. Может:<br>— Ответить на любой вопрос о функционале<br>— Помочь правильно поставить задачу<br>— Подсказать как настроить процесс или бота<br><br>Это не общий ChatGPT — это консультант по TALKO.<br><br><b>Интеграции:</b> Google Calendar (синхронизация дедлайнов), Telegram (уведомления), Webhook API.',
    tipText:'AI-ассистент 24/7 — первая точка помощи. Прежде чем писать разработчику — спросите ассистента.',
    tasks:[
      {text:'Нажать зелёную кнопку и задать вопрос о платформе', detail:'Например: «Как настроить повторяющуюся задачу?»'},
      {text:'Открыть «Интеграции» и просмотреть доступные подключения', detail:'Google Calendar, Telegram, Webhook.'},
      {text:'Подключить Google Calendar или убедиться что Telegram подключён', detail:'Выберите интеграцию → следуйте инструкции. 3–5 минут.'},
    ],
  },
}, // end ru


}; // end OB_I18N



window.OB_I18N.pl = {
  _blocks:{start:'Start',tasks:'Zadania',myday:'Mój dzień',system:'System',projects:'Projekty',coordination:'Koordynacje',analytics:'Analityka',finance:'Finanse',business:'Biznes',learning:'Nauka'},
  _ui:{skip:'Pomiń',prev:'Wstecz',done:'Onboarding ukończony!',askAI:'Zapytaj AI',minUnit:'min',overview:'Przegląd',completed:'ukończono',complete:'Zakończ',estLabel:'Szacowany czas:',next:'Następny krok',stepsOf:'kroki',stepsLabel:'Ukończone kroki'},
  setup_company:{title:'Konfiguracja firmy',subtitle:'Blok 0 · Start',est:'5 min',actionLabel:'Otwórz ustawienia',description:'<b>Pierwszy krok przed wszystkim.</b> Bez podstawowych ustawień system działa nieprawidłowo — błędny czas w terminach, nienazwana firma, brak powiadomień.<br><br><b>Nazwa firmy</b> — wyświetlana wszędzie: w zaproszeniach, raportach, protokołach koordynacji.<br><b>Strefa czasowa</b> — krytyczna dla terminów i przypomnień.<br><b>Raport tygodniowy</b> — właściciel automatycznie dostaje podsumowanie co tydzień.<br><br><b>Gdzie znaleźć:</b> System → Pracownicy → zakładka Firma (tylko Właściciel).',tipText:'Konfiguracja zajmuje 5 minut. Bez właściwej strefy wszystkie przypomnienia będą przesunięte.',tasks:[{text:'Otwórz System → Pracownicy → zakładka Firma',detail:'Widoczna tylko dla Właściciela.'},{text:'Wpisz nazwę firmy i zapisz',detail:'Pojawia się w zaproszeniach i nagłówku.'},{text:'Sprawdź strefę czasową',detail:'Domyślnie Kijów (UTC+2/+3). Zmień jeśli potrzeba.'},{text:'Włącz tygodniowy raport',detail:'Każdy poniedziałek automatyczne podsumowanie.'}]},
  setup_telegram:{title:'Połącz Telegram',subtitle:'Blok 0 · Start',est:'5 min',actionLabel:'Otwórz profil',description:'<b>Ból bez tego:</b> zadanie przypisane — wykonawca nie wie. Termin nadszedł — nic nie przypomina.<br><br>Bez powiadomień Telegram:<br>— Nowe zadania nie są ogłaszane<br>— Terminy nie są przypominane<br>— Przeterminowane nigdzie nie sygnalizują<br>— Decyzje koordynacji nie docierają<br><br><b>Jak połączyć:</b> profil (imię, górny prawy róg) → Powiadomienia Telegram → Połącz Telegram → bot → /start.<br><br><b>Każdy pracownik łączy samodzielnie</b> po rejestracji.',tipText:'Telegram to nie bonus — to obowiązek. Kto nie połączył — jest poza systemem.',tasks:[{text:'Otwórz profil → znajdź Powiadomienia Telegram',detail:'Kliknij imię lub avatar.'},{text:'Kliknij Połącz Telegram i ukończ',detail:'Bot TALKO → /start → potwierdzenie.'},{text:'Sprawdź — wyślij sobie testowe zadanie',detail:'Powiadomienie w 10–20 sekund.'},{text:'Poproś każdego pracownika o połączenie',detail:'Obowiązkowy warunek.'}]},
  setup_invite:{title:'Zaproś zespół',subtitle:'Blok 0 · Start',est:'10 min',actionLabel:'Otwórz pracowników',description:'<b>Ból bez tego:</b> system skonfigurowany — ale jest w nim tylko właściciel. Cała wartość TALKO polega na tym, że zespół jest w systemie.<br><br><b>Proces:</b> System → Pracownicy → Zaproś → Email → rola → wyślij.<br><br><b>Role:</b><br>— <b>Owner</b> — widzi i może wszystko<br>— <b>Manager</b> — swój zespół i analityka<br>— <b>Employee</b> — tylko swoje zadania<br><br><b>Zasada:</b> zacznij od minimalnych uprawnień.',tipText:'Błąd: zapraszanie wszystkich naraz. Lepiej 3–5 kluczowych → ustal proces → potem reszta.',tasks:[{text:'Sporządź listę pracowników do zaproszenia',detail:'3–5 kluczowych osób. Nie wszystkich naraz.'},{text:'Zaproś pierwszego pracownika',detail:'Zaproś → email → rola → wyślij. E-mail w minutę.'},{text:'Potwierdź rejestrację i pojawienie się w liście',detail:'Status Aktywny.'},{text:'Przypisz pierwsze testowe zadanie',detail:'Utrwala nawyk.'}]},
  tasks_views:{title:'Zadania: widoki i filtry',subtitle:'Blok 1 · Zadania',est:'10 min',actionLabel:'Otwórz zadania',description:'<b>Ból bez tego:</b> menedżer nie rozumie co się dzieje, zespół trzyma zadania w komunikatorach.<br><br><b>6 typów widoków:</b><br>— <b>Dzień</b> — co zrobić dzisiaj<br>— <b>Tydzień</b> — obraz na 7 dni<br>— <b>Miesiąc</b> — widok strategiczny<br>— <b>Lista</b> — wszystkie zadania<br>— <b>Kanban</b> — według kolumn statusów<br>— <b>Harmonogram</b> — wykres Gantta<br><br><b>Filtry:</b> wg wykonawcy, statusu, funkcji, terminu, priorytetu.',tipText:'Kanban idealny do cotygodniowych przeglądów. Widać gdzie są blokady i dlaczego.',tasks:[{text:'Otwórz Wszystkie zadania i przełącz przez 6 widoków',detail:'Kanban i Lista — dla codziennej pracy.'},{text:'Zastosuj filtr: wybierz konkretnego wykonawcę',detail:'Panel filtrów nad listą.'},{text:'Zastosuj filtr statusu Przeterminowane',detail:'Krytyczny filtr dla menedżerów.'},{text:'Znajdź zadanie przez globalne wyszukiwanie',detail:'Pasek wyszukiwania na górze.'}]},
  tasks_anatomy:{title:'Zadania: anatomia i właściwe ustawienie',subtitle:'Blok 1 · Zadania',est:'15 min',actionLabel:'Otwórz zadania',description:'<b>Ból bez tego:</b> wykonawca zrobił swoje, menedżer oczekiwał czegoś innego. Przeróbki, strata czasu.<br><br>Właściwe zadanie odpowiada: <i>kto, co, do kiedy, co jest wynikiem, kto sprawdza.</i><br><br>— <b>Tytuł</b> — konkretne działanie<br>— <b>Wykonawca</b> — jedna osoba<br>— <b>Termin</b> — konkretna data i godzina<br>— <b>Priorytet</b> — Krytyczny / Wysoki / Średni / Niski<br>— <b>Oczekiwany wynik</b> — CO<br>— <b>Format raportu</b> — JAK<br>— <b>Lista kontrolna, przypomnienia, weryfikacja, komentarze i pliki</b>',tipText:'Zasada: jeśli wykonawca może ukończyć bez jednego pytania — jest ustawione prawidłowo.',tasks:[{text:'Utwórz testowe zadanie wypełniając wszystkie pola',detail:'Tytuł, wykonawca, termin, priorytet, wynik, format.'},{text:'Dodaj listę kontrolną z 3 podpunktami',detail:'Lista kontrolna → Dodaj punkt.'},{text:'Ustaw przypomnienie na jutro o 9:00',detail:'Telegram o podanej godzinie.'},{text:'Włącz Weryfikację po ukończeniu',detail:'Status Do weryfikacji.'},{text:'Napisz komentarz i dołącz plik',detail:'Korespondencja pozostaje wewnątrz zadania.'}]},
  regular_tasks:{title:'Zadania cykliczne: automatyzacja rutyny',subtitle:'Blok 1 · Zadania',est:'10 min',actionLabel:'Otwórz cykliczne',description:'<b>Ból bez tego:</b> co tydzień ręcznie ustawiasz te same zadania. 2–3 godziny miesięcznie tylko na ustawienie.<br><br>Skonfiguruj raz → system przypisuje automatycznie → wykonawca dostaje Telegram.<br><br>— <b>Codzienne</b> — pojawiają się każdego ranka<br>— <b>Tygodniowe</b> — w ustalony dzień<br>— <b>Miesięczne</b> — w ustaloną datę',tipText:'Złota zasada: każde zadanie które ustawiasz więcej niż dwa razy — zautomatyzuj.',tasks:[{text:'Otwórz zakładkę Zadania cykliczne',detail:'Zadania → Cykliczne.'},{text:'Zidentyfikuj 3 zadania ustawiane ręcznie co tydzień',detail:'Raport, planowanie, przegląd wskaźników.'},{text:'Utwórz tygodniowe zadanie cykliczne z przypomnieniem',detail:'Wykonawca, dzień, czas, wynik.'},{text:'Sprawdź czy pojawiło się automatycznie',detail:'Filtr wg wykonawcy.'}]},
  myday:{title:'Mój dzień: skupienie i planowanie',subtitle:'Blok 2 · Mój dzień',est:'5 min',actionLabel:'Otwórz Mój dzień',description:'<b>Ból bez tego:</b> osoba przychodzi do pracy i nie wie od czego zacząć. Albo rzuca się na wszystko i nic nie kończy.<br><br><b>Mój dzień</b> — osobisty ekran. Pokazuje tylko to co trzeba zrobić DZISIAJ.<br><br>— <b>Widok normalny</b> — wszystkie zadania z terminami<br>— <b>Tryb Skupienie</b> — jedno zadanie na pełnym ekranie. Gotowe → Zakończ → następne.',tipText:'Poproś zespół aby zaczynał każdy dzień od Mojego dnia. 5 minut = każdy zna plan.',tasks:[{text:'Otwórz Mój dzień i przejrzyj dzisiejsze zadania',detail:'Jeśli brak — utwórz testowe z dzisiejszym terminem.'},{text:'Przejdź do trybu Skupienie i ukończ jedno zadanie',detail:'Kliknij Gotowe — system przechodzi do następnego.'}]},
  functions:{title:'Funkcje: działy i KPI biznesu',subtitle:'Blok 3 · System',est:'15 min',actionLabel:'Otwórz funkcje',description:'<b>Ból bez tego:</b> zadania wiszą w powietrzu bez powiązania z działem. Analityka nie pokazuje gdzie jest obciążenie i gdzie luki.<br><br><b>Funkcje</b> — działy Twojego biznesu. Każda ma Odpowiedzialnego, KPI i Zadania.<br><br><b>KPI — liczby, nie życzenia:</b><br>— Poprawnie: 20 nowych klientów miesięcznie<br>— Niepoprawnie: Zwiększyć sprzedaż',tipText:'Minimum: 3–5 funkcji z KPI. To fundament analityki. Bez funkcji raport działów jest pusty.',tasks:[{text:'Otwórz System → Funkcje',detail:'Bez funkcji analityka działów nie działa.'},{text:'Utwórz co najmniej 3 kluczowe funkcje biznesowe',detail:'Sprzedaż, Operacje, Finanse.'},{text:'Dodaj co najmniej 1 KPI z konkretną liczbą do każdej',detail:'Nowe transakcje — 20 — szt/mies.'},{text:'Przełącz na widok Struktura i przejrzyj schemat',detail:'Hierarchia i połączenia działów.'},{text:'Powiąż istniejące zadania z funkcjami',detail:'Pole Funkcja w zadaniu.'}]},
  bizstructure:{title:'Struktura: schemat organizacyjny',subtitle:'Blok 3 · System',est:'10 min',actionLabel:'Otwórz strukturę',description:'<b>Ból bez tego:</b> zespół nie rozumie kto komu podlega. Nowy pracownik nie wie do kogo się zwrócić. Menedżer nie widzi całego obrazu.<br><br><b>Struktura</b> — interaktywny schemat organizacyjny: działy, hierarchia, każdy pracownik na miejscu, liczba zadań i obciążenie.',tipText:'Pierwsze co pokazujesz nowemu menedżerowi. Natychmiast rozumie gdzie jest. Oszczędza 2–3 tygodnie wdrożenia.',tasks:[{text:'Otwórz System → Struktura',detail:'Jeśli pusty — najpierw wypełnij Funkcje.'},{text:'Sprawdź czy wszystkie działy wyświetlają się poprawnie',detail:'Porównaj z rzeczywistą strukturą.'},{text:'Kliknij kartę dowolnego pracownika i przejrzyj szczegóły',detail:'Rola, dział, aktywne zadania, obciążenie.'},{text:'Sprawdź czy każdy jest powiązany ze swoim działem',detail:'Bez działu → otwórz kartę → zmień funkcję.'}]},
  team_management:{title:'Pracownicy: role, dostępy i zaproszenia',subtitle:'Blok 3 · System',est:'15 min',actionLabel:'Otwórz pracowników',description:'<b>Ból bez tego:</b> wszyscy widzą wszystko — lub odwrotnie, ktoś nie widzi tego co potrzebuje.<br><br><b>Zakładka Pracownicy</b> ma 4 sekcje:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">LISTA</b><br>Wszyscy pracownicy z rolą, działem, statusem i obciążeniem.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ZAPROŚ</b><br>E-mail → rejestracja → system z właściwą rolą.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ROLE</b><br><b>Owner</b> — wszystko. <b>Manager</b> — swój dział. <b>Employee</b> — tylko swoje zadania.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">FIRMA</b><br>Nazwa, strefa, raport tygodniowy. Tylko Owner.</div></div>',tipText:'Błąd nr 1: dawanie wszystkim roli Owner. Ustaw role raz prawidłowo.',tasks:[{text:'Otwórz System → Pracownicy → Lista',detail:'Rola, dział, liczba zadań.'},{text:'Sprawdź czy role odpowiadają obowiązkom',detail:'Minimalny wymagany dostęp.'},{text:'Przejdź do zakładki Role i zapoznaj się z matrycą',detail:'Owner — wszystko. Manager — dział. Employee — własne.'},{text:'Zaproś nowego pracownika przez Zaproś',detail:'E-mail → rola → funkcja → Wyślij.'},{text:'Otwórz zakładkę Firma (tylko Owner)',detail:'Nazwa, strefa, raport.'}]},
  system_integrations:{title:'Integracje: łączenie zewnętrznych usług',subtitle:'Blok 3 · System',est:'15 min',actionLabel:'Otwórz integracje',description:'<b>Ból bez tego:</b> dane są rozproszone po różnych serwisach.<br><br><b>Dostępne integracje:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Powiadomienia o zadaniach, terminach, decyzjach.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Synchronizacja terminów z kalendarzem.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEFONIA: BINOTEL / RINGOSTAT / STREAM</b><br>Nieodebrane → zadanie Oddzwoń → wykonawca → termin.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Dowolne zewnętrzne systemy: strona, formularze, CRM.</div></div>',tipText:'Telefonia to największy punkt strat. Bez integracji: nieodebrane = utracony klient.',tasks:[{text:'Otwórz Biznes → Integracje',detail:'Status Połączono lub Nie połączono.'},{text:'Sprawdź czy Telegram jest połączony w profilu',detail:'Powinno pokazywać Połączono.'},{text:'Połącz Google Calendar',detail:'Integracje → Google Calendar → Połącz.'},{text:'Połącz telefonię jeśli używana',detail:'API klucz → zapisz.'},{text:'Poproś każdego pracownika o połączenie Telegrama',detail:'Obowiązkowy warunek.'}]},
  projects:{title:'Projekty: złożone zadania z harmonogramem',subtitle:'Blok 4 · Projekty i procesy',est:'10 min',actionLabel:'Otwórz projekty',description:'<b>Ból bez tego:</b> złożony projekt z 20 zadaniami rozsypuje się na ogólnej liście. Niejasne co zrobione, gdzie opóźnienie.<br><br><b>Trzy widoki:</b> Karty (kanban), Lista, Harmonogram (Gantt).<br><b>Postęp</b> — obliczany automatycznie z ukończonych zadań.',tipText:'Harmonogram natychmiast pokazuje wąskie gardło i kto blokuje resztę.',tasks:[{text:'Otwórz zakładkę Projekty i przejrzyj istniejące',detail:'Jeśli brak — utwórz testowy.'},{text:'Przełącz widoki: Karty → Lista → Harmonogram',detail:'Harmonogram — najbardziej informacyjny.'},{text:'Dodaj kilka zadań i sprawdź postęp',detail:'3–4 zadania → harmonogram.'}]},
  processes:{title:'Procesy: szablony dla powtarzających się sytuacji',subtitle:'Blok 4 · Projekty i procesy',est:'15 min',actionLabel:'Otwórz procesy',description:'<b>Ból bez tego:</b> za każdym razem gdy przychodzi nowy klient — tłumaczysz od zera, lub coś zostaje zapomniane.<br><br><b>Procesy</b> — szablony sekwencji działań. Skonfiguruj raz → uruchom kliknięciem → wszystkie zadania automatycznie z wykonawcami i terminami.<br><br>Przykłady: przyjęcie klienta, wdrożenie pracownika, zamknięcie miesiąca.',tipText:'1 skonfigurowany proces = setki zaoszczędzonych godzin rocznie.',tasks:[{text:'Otwórz zakładkę Procesy i zapoznaj się z logiką',detail:'Szablon → uruchomienie → aktywny proces.'},{text:'Zidentyfikuj 1 powtarzający się proces w biznesie',detail:'Co robisz tak samo kilka razy w miesiącu?'},{text:'Utwórz szablon procesu z 3–4 krokami',detail:'Kto + dni + wynik.'},{text:'Uruchom proces i sprawdź czy zadania zostały utworzone',detail:'Wszystkie zadania z wykonawcami i terminami.'}]},
  coordination_types:{title:'Koordynacje: typy i kiedy używać',subtitle:'Blok 5 · Koordynacje',est:'10 min',actionLabel:'Otwórz koordynacje',description:'<b>Ból bez tego:</b> spotkanie odbyło się — tydzień później nic nie zostało zrobione. Decyzje zaginęły w komunikatorze.<br><br><b>8 typów koordynacji:</b> Dzienna · Tygodniowa · Miesięczna · Rada Doradcza · Rada Dyrektorów · Rada Wykonawcza · Rada Założycieli · Jednorazowa.<br><br>Każde rozhodnutí → natychmiast zadanie z wykonawcą i terminem.',tipText:'Tygodniowe spotkanie planistyczne — podstawowy rytm biznesu. Bez niego zespół się rozpada.',tasks:[{text:'Otwórz Koordynacje i przejrzyj wszystkie 8 typów',detail:'Każdy typ — własna agenda i czas trwania.'},{text:'Określ które typy są potrzebne w Twoim biznesie',detail:'Minimum: Tygodniowa + Miesięczna.'},{text:'Skonfiguruj regularną tygodniową koordynację',detail:'Typ → dzień → godzina → uczestnicy.'}]},
  coordination_process:{title:'Koordynacje: jak prowadzić i rejestrować wyniki',subtitle:'Blok 5 · Koordynacje',est:'15 min',actionLabel:'Otwórz koordynacje',description:'<b>Ból bez tego:</b> nawet jeśli spotkanie odbyło się — decyzje zaginęły. Brak protokołu, brak odpowiedzialnych.<br><br><b>Porządek tygodniowej koordynacji:</b><br>1. Statystyki uczestników<br>2. Realizacja poprzednich zadań<br>3. Raporty uczestników<br>4. Pytania<br>5. Decyzje — rejestruj każdą w systemie<br>6. Nowe zadania<br><br><b>Timer, protokół (PDF), eskalacja</b> — wszystko wbudowane.',tipText:'Zasada: każde spotkanie kończy się protokołem z zadaniami.',tasks:[{text:'Utwórz koordynację Tygodniową i dodaj uczestników',detail:'Typ → nazwa → uczestnicy.'},{text:'Uruchom koordynację i przejdź przez całą agendę',detail:'Zarejestruj co najmniej 1 decyzję.'},{text:'Zarejestruj decyzję i przypisz wykonawcę z terminem',detail:'Natychmiast staje się zadaniem.'},{text:'Zakończ koordynację i sprawdź czy zadania się pojawiły',detail:'Wszystkie decyzje są w zadaniach.'},{text:'Otwórz automatycznie wygenerowany protokół',detail:'Archiwum → koordynacja → Protokół. PDF.'}]},
  control:{title:'Kontrola: puls biznesu w 5 minut dziennie',subtitle:'Blok 5 · Kontrola',est:'15 min',actionLabel:'Otwórz kontrolę',description:'<b>Ból bez tego:</b> menedżer dowiaduje się o problemie gdy jest już pożarem.<br><br><b>Krytyczna uwaga</b> — dashboard: przeterminowane, bez wykonawcy, bez terminu.<br><b>Obciążenie</b> — kto ma ile zadań.<br><b>Lejek delegowania</b> — gdzie zadania się zatykają.<br><b>Dziennik problemów zarządczych</b> — rejestr problemów systemowych.',tipText:'Poranny rytuał: 5 minut w Krytycznej uwadze — stan biznesu bez jednego spotkania.',tasks:[{text:'Otwórz Kontrolę → kliknij Krytyczna uwaga',detail:'2 minuty — wiesz gdzie jest pożar.'},{text:'Przejrzyj Obciążenie — rozkład w zespole',detail:'Nierównowaga = złe delegowanie.'},{text:'Otwórz Lejek delegowania i zrozum logikę',detail:'Większość na kroku 1 — wykonawcy nie podejmują.'},{text:'Dodaj pierwszy wpis do Dziennika problemów',detail:'Fakt → przyczyna → rozwiązanie.'}]},
  analytics:{title:'Efektywność i Statystyki: liczby zamiast odczuć',subtitle:'Blok 6 · Analityka',est:'10 min',actionLabel:'Otwórz analitykę',description:'<b>Ból bez tego:</b> właściciel zarządza na wyczucie. Problem pojawia się — niejasne gdzie i kiedy zaczął.<br><br><b>Efektywność</b> — KPI każdego pracownika: ukończone na czas, przeterminowane, dynamika tygodniowa.<br><b>Statystyki</b> — wskaźniki biznesowe które sam dodajesz (przychód, klienci, połączenia itp.).',tipText:'Jeśli wskaźnik nie jest mierzony — nie można nim zarządzać. 3 liczby dziennie — minimum.',tasks:[{text:'Otwórz Efektywność — przejrzyj statystyki zadań',detail:'Kto kończy na czas vs kto ciągle przekłada.'},{text:'Otwórz Statystyki i dodaj 3 kluczowe wskaźniki',detail:'Dzienny przychód, Nowi klienci, Zrealizowane zamówienia.'},{text:'Przełącz między Dzień / Tydzień / Miesiąc',detail:'Miesiąc — trend, dzień — aktualny puls.'}]},
  finance_dashboard:{title:'Finanse: dashboard i ogólny obraz',subtitle:'Blok 7 · Finanse',est:'10 min',actionLabel:'Otwórz finanse',description:'<b>Ból bez tego:</b> właściciel nie wie ile biznes naprawdę zarabia. Są pieniądze — ale to nie zysk.<br><br><b>Dashboard:</b> Przychód, Wydatki, Zysk, Marża za miesiąc. Wykres 6 miesięcy. Top wydatków. Automatyczne sygnały.',tipText:'Finanse bez danych — pusty dashboard. Zacznij wprowadzać transakcje od dziś.',tasks:[{text:'Otwórz Biznes → Finanse i przejrzyj dashboard',detail:'Wybierz bieżący miesiąc.'},{text:'Przejrzyj wszystkie podzakładki: Przychody, Wydatki, Konta, Planowanie',detail:'Zrozum logikę przed wprowadzaniem danych.'},{text:'Skonfiguruj konta (gotówka, bank, karta)',detail:'Minimum 2: gotówka i rachunek bieżący.'}]},
  finance_transactions:{title:'Finanse: przychody, wydatki i kategorie',subtitle:'Blok 7 · Finanse',est:'15 min',actionLabel:'Otwórz finanse',description:'<b>Ból bez tego:</b> na koniec miesiąca niejasne gdzie poszły pieniądze. Brak kategorii — wszystkie wydatki w jednej kupce.<br><br><b>Przychody i wydatki</b> wg kategorii. <b>Transakcje cykliczne</b> (czynsz, wynagrodzenie, subskrypcje) — skonfiguruj raz, naliczane automatycznie.',tipText:'Standard: transakcje codziennie lub co 2–3 dni.',tasks:[{text:'Wprowadź 3 testowe przychody w różnych kategoriach',detail:'Kategoria, kwota, konto, data.'},{text:'Wprowadź 3 testowe wydatki w różnych kategoriach',detail:'Powiąż z funkcją.'},{text:'Skonfiguruj transakcję cykliczną (np. czynsz)',detail:'Miesięczna, kwota, kategoria.'},{text:'Sprawdź dashboard po wprowadzeniu danych',detail:'Wykresy z rzeczywistymi danymi.'}]},
  finance_planning:{title:'Finanse: budżetowanie, faktury i P&L',subtitle:'Blok 7 · Finanse',est:'15 min',actionLabel:'Otwórz finanse',description:'<b>Ból bez tego:</b> na koniec miesiąca — wydatki przekroczyły plan. Budżet istnieje w czyjejś głowie.<br><br><b>Planowanie</b> — budżet Plan vs Fakt z odchyleniami.<br><b>Faktury</b> — wystawiaj klientom. Opłacona → automatycznie transakcja przychodowa.<br><b>P&L</b> — generowany automatycznie.',tipText:'P&L — pierwszy dokument w rozmowie z inwestorem. Teraz automatyczny.',tasks:[{text:'Otwórz Planowanie i wprowadź plan przychodów na miesiąc',detail:'Oczekiwane przychody wg kategorii.'},{text:'Wprowadź plan wydatków wg kategorii',detail:'Wynagrodzenia, czynsz, marketing, materiały.'},{text:'Utwórz testową fakturę dla klienta i sprawdź statusy',detail:'Oznacz Opłacono.'},{text:'Przejrzyj raport P&L za bieżący miesiąc',detail:'Z transakcjami — P&L automatycznie.'}]},
  crm:{title:'CRM: klienci, transakcje, sprzedaż',subtitle:'Blok 8 · Biznes',est:'15 min',actionLabel:'Otwórz CRM',description:'<b>Ból bez tego:</b> klienci w Excelu lub w głowie sprzedawcy. Odchodzi — biznes traci całą bazę.<br><br><b>Kanban transakcji:</b> Lead → Negocjacje → Propozycja → Faktura → Płatność.<br><b>Klienci</b> — baza kontaktów ze wszystkimi transakcjami i korespondencją.<br><b>Transakcja → faktura → automatycznie do Finansów.</b>',tipText:'Każda interakcja z klientem jest rejestrowana. Po 6 miesiącach ten dziennik to najcenniejszy aktyw.',tasks:[{text:'Otwórz CRM i przejrzyj kanban transakcji',detail:'CRM → Ustawienia → Lejki.'},{text:'Utwórz testową transakcję i przeciągnij między etapami',detail:'Drag & drop.'},{text:'Dodaj klienta i powiąż go z transakcją',detail:'CRM → Klienci.'},{text:'Z transakcji utwórz zadanie Oddzwoń z terminem',detail:'Pojawia się w systemie.'}]},
  bots_sites:{title:'Marketing, Boty i Moje strony',subtitle:'Blok 8 · Biznes',est:'10 min',actionLabel:'Otwórz boty',description:'<b>Boty</b> — konstruktor botów Telegram bez kodu. Leady automatycznie do CRM.<br><b>Moje strony</b> — konstruktor landing page. Formularze → CRM.<br><b>Marketing</b> — szablony, statystyki kanałów.',tipText:'Nawet prosty bot który przekazuje kontakt do CRM jest lepszy niż nic.',tasks:[{text:'Otwórz Boty i sprawdź jak połączyć bota Telegram',detail:'Token od @BotFather → wiadomość powitalna.'},{text:'Przeglądaj konstruktor sekwencji wiadomości',detail:'Drag & drop: Wiadomość, Pytanie, Warunek.'},{text:'Otwórz Moje strony i przejrzyj konstruktor',detail:'Szablon → edytuj → opublikuj.'}]},
  learning_start:{title:'Nauka: mapa programu i pierwsze moduły',subtitle:'Blok 9 · Nauka',est:'20 min',actionLabel:'Otwórz naukę',description:'<b>Nauka to nie bonus — to fundament.</b> Bez metodologii właściciel będzie klikał przyciski nie rozumiejąc dlaczego.<br><br>Zakładka <b>Nauka</b> — 15 modułów.<br><br><b>Pierwsze 5 modułów:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUŁ 0</b><br><b>Mapa programu</b> — zacznij tutaj.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUŁ 4</b><br><b>System delegowania</b> — jak przypisywać zadania aby były wykonywane.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUŁ 5</b><br><b>System RADAR</b> — jak przestać być strażakiem.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUŁ 9</b><br><b>Cel, zamysł, struktura</b> — fundament systemowego biznesu.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUŁ 13</b><br><b>System statystyk</b> — jak widzieć biznes w liczbach.</div></div>',tipText:'Nauka i wdrożenie — równolegle. Ukończ moduł → skonfiguruj w systemie.',tasks:[{text:'Otwórz zakładkę Nauka w głównym menu',detail:'Nowy przycisk w menu.'},{text:'Obejrzyj Moduł 0 Mapa programu',detail:'Mapa całej drogi.'},{text:'Obejrzyj Moduł 4 System delegowania',detail:'Jakość delegowania poprawi się natychmiast.'},{text:'Zaplanuj moduly — 1 tygodniowo',detail:'1 moduł = zrozumiane i wdrożone.'}]},
  learning_ai:{title:'Asystent AI i integracje',subtitle:'Blok 9 · Nauka',est:'5 min',actionLabel:'Otwórz integracje',description:'<b>Zielony przycisk na górze</b> — asystent AI który zna cały system TALKO.<br>— Odpowiada na pytania o funkcjonalność<br>— Pomaga prawidłowo ustawić zadanie<br>— Podpowiada jak skonfigurować proces lub bota<br><br><b>Integracje:</b> Google Calendar, Telegram, Webhook API.',tipText:'AI asistent 24/7 — pierwszy punkt pomocy. Przed deweloperem — zapytaj asystenta.',tasks:[{text:'Kliknij zielony przycisk i zadaj pytanie o platformę',detail:'Np.: Jak skonfigurować zadanie cykliczne?'},{text:'Otwórz Integracje i przejrzyj dostępne',detail:'Google Calendar, Telegram, Webhook.'},{text:'Połącz Google Calendar lub potwierdź Telegram',detail:'3–5 minut.'}]},

// ══════════════════════════════════════════════════════════
// DEUTSCH
// ══════════════════════════════════════════════════════════
de: {
  _blocks: {
    start:'Start', tasks:'Aufgaben', myday:'Mein Tag', system:'System',
    projects:'Projekte', coordination:'Koordination', analytics:'Analytik',
    finance:'Finanzen', business:'Business', learning:'Lernen',
  },
  _ui: {
    skip:'Überspringen', prev:'Zurück', done:'Onboarding abgeschlossen!',
    askAI:'KI-Assistenten fragen', minUnit:'Min', overview:'Übersicht',
    completed:'abgeschlossen', complete:'Abschließen', estLabel:'Geschätzte Zeit:',
    next:'Nächster Schritt', stepsOf:'Schritte', stepsLabel:'Abgeschlossene Schritte',
  },
  warehouse: {
    title:'Lager: Produkt- und Materialverfolgung',
    subtitle:'Block 8 · Business', est:'10 Min',
    actionLabel:'Lager öffnen',
    description:'<b>Problem ohne dies:</b> Materialien werden schätzungsweise abgeschrieben, Lager existiert nur im Kopf eines Managers, Inventur einmal im Jahr.<br><br><b>Produktkatalog</b> — jeder Artikel mit SKU, Einheit, Mindestbestand.<br><b>Materialbewegung:</b> Eingang, Ausgang, Abschreibung, Anpassung.',
    tipText:'Mindestbestand für kritische Materialien festlegen — System warnt automatisch.',
    tasks:[
      {text:'Business → Lager öffnen', detail:'Lager-Tab ist im Business-Menü.'},
      {text:'2-3 Produkte zum Katalog hinzufügen', detail:'"+ Artikel" → Name, SKU, Einheit, Mindestbestand.'},
      {text:'"Eingang"-Operation durchführen', detail:'Vorgänge → "Eingang" → Artikel auswählen → Menge eingeben.'},
      {text:'Lager-Dashboard prüfen', detail:'Dashboard → Mindestbestand-Warnungen prüfen.'},
    ]
  },
  booking: {
    title:'Buchung: Online-Kundentermine',
    subtitle:'Block 8 · Business', est:'10 Min',
    actionLabel:'Buchung öffnen',
    description:'<b>Problem ohne dies:</b> Kunden schreiben in DMs zum Buchen, Manager trägt in Tabelle ein, Zeitkonflikte.<br><br><b>Buchung</b> — eigenes Calendly in TALKO:<br>• Dienstleistungen einrichten<br>• Arbeitstage und -zeiten festlegen<br>• Öffentlichen Buchungslink erhalten',
    tipText:'Link in Instagram Bio oder Telegram-Bot stellen — Kunden buchen selbst.',
    tasks:[
      {text:'Business → Buchung öffnen', detail:'Buchungs-Tab im Business-Menü.'},
      {text:'Dienstleistung hinzufügen', detail:'"+ Dienst" → Name, Dauer (Min).'},
      {text:'Arbeitstage und -zeiten einstellen', detail:'Wochentage und Arbeitszeiten festlegen.'},
      {text:'Link kopieren und testen', detail:'"Link kopieren" → in neuem Tab öffnen.'},
    ]
  },
},
// ══════════════════════════════════════════════════════════
// POLSKI
// ══════════════════════════════════════════════════════════
pl: {
  _blocks: {
    start:'Start', tasks:'Zadania', myday:'Mój dzień', system:'System',
    projects:'Projekty', coordination:'Koordynacja', analytics:'Analityka',
    finance:'Finanse', business:'Biznes', learning:'Nauka',
  },
  _ui: {
    skip:'Pomiń', prev:'Wstecz', done:'Onboarding ukończony!',
    askAI:'Zapytaj asystenta AI', minUnit:'min', overview:'Przegląd',
    completed:'ukończono', complete:'Ukończ', estLabel:'Szacowany czas:',
    next:'Następny krok', stepsOf:'kroków', stepsLabel:'Ukończone kroki',
  },
  warehouse: {
    title:'Magazyn: śledzenie produktów i materiałów',
    subtitle:'Blok 8 · Biznes', est:'10 min',
    actionLabel:'Otwórz magazyn',
    description:'<b>Problem bez tego:</b> materiały odpisywane na oko, magazyn istnieje tylko w głowie jednego managera, inwentaryzacja raz w roku.<br><br><b>Katalog produktów</b> — każda pozycja z SKU, jednostką, minimalnym zapasem.<br><b>Ruch materiałów:</b> Przyjęcie, Wydanie, Odpisanie, Korekta.',
    tipText:'Ustaw minimalny zapas dla krytycznych materiałów — system będzie ostrzegał automatycznie.',
    tasks:[
      {text:'Otwórz Biznes → Magazyn', detail:'Zakładka Magazyn jest w menu Biznes.'},
      {text:'Dodaj 2-3 produkty do katalogu', detail:'"+ Dodaj pozycję" → nazwa, SKU, jednostka, minimalny zapas.'},
      {text:'Wykonaj operację "Przyjęcie"', detail:'Operacje → "Przyjęcie" → wybierz pozycję → podaj ilość.'},
      {text:'Sprawdź pulpit magazynu', detail:'Pulpit → sprawdź alerty minimalnego zapasu.'},
    ]
  },
  booking: {
    title:'Rezerwacja: wizyty klientów online',
    subtitle:'Blok 8 · Biznes', est:'10 min',
    actionLabel:'Otwórz rezerwacje',
    description:'<b>Problem bez tego:</b> klienci piszą w DM żeby się umówić, manager przenosi do tabeli, konflikty czasowe.<br><br><b>Rezerwacja</b> — własny Calendly w TALKO:<br>• Skonfiguruj usługi<br>• Ustaw dni robocze i godziny<br>• Uzyskaj publiczny link do rezerwacji',
    tipText:'Wstaw link w bio Instagram lub do bota Telegram — klienci sami się umawiają.',
    tasks:[
      {text:'Otwórz Biznes → Rezerwacja', detail:'Zakładka Rezerwacja w menu Biznes.'},
      {text:'Dodaj usługę z czasem trwania', detail:'"+ Usługa" → nazwa, czas (min).'},
      {text:'Ustaw dni robocze i godziny', detail:'Wybierz dni tygodnia i godziny pracy.'},
      {text:'Skopiuj link i przetestuj', detail:'"Kopiuj link" → otwórz w nowej karcie.'},
    ]
  },
},
// ══════════════════════════════════════════════════════════
// ČEŠTINA
// ══════════════════════════════════════════════════════════
cs: {
  _blocks: {
    start:'Start', tasks:'Úkoly', myday:'Můj den', system:'Systém',
    projects:'Projekty', coordination:'Koordinace', analytics:'Analytika',
    finance:'Finance', business:'Byznys', learning:'Výuka',
  },
  _ui: {
    skip:'Přeskočit', prev:'Zpět', done:'Onboarding dokončen!',
    askAI:'Zeptat se AI asistenta', minUnit:'min', overview:'Přehled',
    completed:'dokončeno', complete:'Dokončit', estLabel:'Odhadovaný čas:',
    next:'Další krok', stepsOf:'kroků', stepsLabel:'Dokončené kroky',
  },
  warehouse: {
    title:'Sklad: sledování produktů a materiálů',
    subtitle:'Blok 8 · Byznys', est:'10 min',
    actionLabel:'Otevřít sklad',
    description:'<b>Problém bez toho:</b> materiály se odpisují odhadem, sklad existuje jen v hlavě jednoho manažera, inventura jednou ročně.<br><br><b>Katalog produktů</b> — každá položka s SKU, jednotkou, minimální zásobou.<br><b>Pohyb materiálů:</b> Příjem, Výdej, Odpis, Úprava.',
    tipText:'Nastavte minimální zásobu pro kritické materiály — systém bude upozorňovat automaticky.',
    tasks:[
      {text:'Otevřete Byznys → Sklad', detail:'Záložka Sklad je v menu Byznys.'},
      {text:'Přidejte 2-3 produkty do katalogu', detail:'"+ Přidat položku" → název, SKU, jednotka, minimální zásoba.'},
      {text:'Proveďte operaci "Příjem"', detail:'Operace → "Příjem" → vyberte položku → zadejte množství.'},
      {text:'Zkontrolujte dashboard skladu', detail:'Dashboard → zkontrolujte upozornění na minimální zásobu.'},
    ]
  },
  booking: {
    title:'Rezervace: online schůzky s klienty',
    subtitle:'Blok 8 · Byznys', est:'10 min',
    actionLabel:'Otevřít rezervace',
    description:'<b>Problém bez toho:</b> klienti píší do DM kvůli rezervaci, manažer přenáší do tabulky, časové konflikty.<br><br><b>Rezervace</b> — vlastní Calendly uvnitř TALKO:<br>• Nastavte služby<br>• Nastavte pracovní dny a hodiny<br>• Získejte veřejný odkaz pro rezervaci',
    tipText:'Vložte odkaz do Instagram bio nebo Telegram bota — klienti se sami objednají.',
    tasks:[
      {text:'Otevřete Byznys → Rezervace', detail:'Záložka Rezervace v menu Byznys.'},
      {text:'Přidejte službu s dobou trvání', detail:'"+ Služba" → název, doba (min).'},
      {text:'Nastavte pracovní dny a hodiny', detail:'Vyberte dny týdne a nastavte pracovní dobu.'},
      {text:'Zkopírujte odkaz a otestujte', detail:'"Kopírovat odkaz" → otevřít v nové kartě.'},
    ]
  },
},
};

window.OB_I18N.de = {
  _blocks:{start:'Start',tasks:'Aufgaben',myday:'Mein Tag',system:'System',projects:'Projekte',coordination:'Koordinationen',analytics:'Analytik',finance:'Finanzen',business:'Business',learning:'Lernen'},
  _ui:{skip:'Überspringen',prev:'Zurück',done:'Onboarding abgeschlossen!',askAI:'KI fragen',minUnit:'Min',overview:'Übersicht',completed:'abgeschlossen',complete:'Abschließen',estLabel:'Geschätzte Zeit:',next:'Nächster Schritt',stepsOf:'Schritte',stepsLabel:'Abgeschlossene Schritte'},
  setup_company:{title:'Unternehmenseinrichtung',subtitle:'Block 0 · Start',est:'5 Min',actionLabel:'Einstellungen öffnen',description:'<b>Erster Schritt vor allem anderen.</b> Ohne grundlegende Einstellungen funktioniert das System nicht korrekt — falsche Zeit in Fristen, unbenanntes Unternehmen, fehlende Benachrichtigungen.<br><br><b>Unternehmensname</b> — überall angezeigt: in Einladungen, Berichten, Protokollen.<br><b>Zeitzone</b> — kritisch für Fristen und Erinnerungen.<br><b>Wöchentlicher Bericht</b> — der Eigentümer erhält automatisch jede Woche eine Zusammenfassung.<br><br><b>Wo zu finden:</b> System → Mitarbeiter → Registerkarte Unternehmen (nur Eigentümer).',tipText:'Einmalig 5 Minuten. Ohne korrekte Zeitzone werden alle Erinnerungen verschoben.',tasks:[{text:'System → Mitarbeiter → Registerkarte Unternehmen öffnen',detail:'Nur für den Eigentümer sichtbar.'},{text:'Unternehmensnamen eingeben und speichern',detail:'Erscheint in Einladungen und Header.'},{text:'Zeitzone prüfen und richtige einstellen',detail:'Standard Kiew (UTC+2/+3).'},{text:'Wöchentlichen Bericht aktivieren',detail:'Jeden Montag automatische Zusammenfassung.'}]},
  setup_telegram:{title:'Telegram verbinden',subtitle:'Block 0 · Start',est:'5 Min',actionLabel:'Profil öffnen',description:'<b>Schmerz ohne dies:</b> Aufgabe zugewiesen — der Ausführende weiß es nicht. Frist kommt — nichts erinnert.<br><br>Ohne Telegram:<br>— Neue Aufgaben nicht angekündigt<br>— Fristen nicht erinnert<br>— Überfällige signalisieren nirgends<br>— Koordinationsentscheidungen kommen nicht an<br><br><b>Wie verbinden:</b> Profil öffnen → Telegram-Benachrichtigungen → Telegram verbinden → Bot → /start.<br><br><b>Jeder Mitarbeiter verbindet sich selbständig</b> nach Registrierung.',tipText:'Telegram ist kein Bonus — es ist Pflicht. Wer nicht verbunden ist, ist außerhalb des Systems.',tasks:[{text:'Profil öffnen → Telegram-Benachrichtigungen finden',detail:'Namen oder Avatar oben rechts klicken.'},{text:'Telegram verbinden klicken und abschließen',detail:'Bot öffnet sich. /start → Verbindung bestätigt.'},{text:'Prüfen — Testaufgabe an sich selbst senden',detail:'In 10–20 Sekunden Benachrichtigung.'},{text:'Jeden Mitarbeiter bitten Telegram zu verbinden',detail:'Pflichtbedingung nach Registrierung.'}]},
  setup_invite:{title:'Team einladen',subtitle:'Block 0 · Start',est:'10 Min',actionLabel:'Mitarbeiter öffnen',description:'<b>Schmerz ohne dies:</b> das System ist eingerichtet — aber nur der Eigentümer ist darin. Der gesamte Wert von TALKO liegt darin, dass das Team im System ist.<br><br><b>Prozess:</b> System → Mitarbeiter → Einladen → E-Mail → Rolle → senden.<br><br><b>Rollen:</b><br>— <b>Owner</b> — sieht und kann alles<br>— <b>Manager</b> — sieht sein Team und Analytik<br>— <b>Employee</b> — sieht nur eigene Aufgaben<br><br><b>Regel:</b> mit minimalen Berechtigungen beginnen.',tipText:'Fehler: alle auf einmal einladen. Besser 3–5 Schlüsselpersonen → Prozess etablieren.',tasks:[{text:'Liste der einzuladenden Mitarbeiter erstellen',detail:'3–5 Schlüsselpersonen. Nicht alle auf einmal.'},{text:'Ersten Mitarbeiter einladen',detail:'Einladen → E-Mail → Rolle → senden. E-Mail in einer Minute.'},{text:'Bestätigen dass Eingeladener registriert ist',detail:'Status Aktiv in der Liste.'},{text:'Neuem Mitarbeiter erste Testaufgabe zuweisen',detail:'Festigt die Gewohnheit.'}]},
  tasks_views:{title:'Aufgaben: Ansichten und Filter',subtitle:'Block 1 · Aufgaben',est:'10 Min',actionLabel:'Aufgaben öffnen',description:'<b>Schmerz ohne dies:</b> Manager versteht nicht was passiert, Team hält Aufgaben in Messengern.<br><br><b>6 Ansichtstypen:</b><br>— <b>Tag</b> — was heute zu tun ist<br>— <b>Woche</b> — Bild für 7 Tage<br>— <b>Monat</b> — strategische Ansicht<br>— <b>Liste</b> — alle Aufgaben<br>— <b>Kanban</b> — nach Statusspalten<br>— <b>Zeitplan</b> — Gantt-Diagramm<br><br><b>Filter:</b> nach Ausführendem, Status, Funktion, Frist, Priorität.',tipText:'Kanban ideal für wöchentliche Team-Reviews. Zeigt wo Staus sind und warum.',tasks:[{text:'Alle Aufgaben öffnen und alle 6 Ansichten durchschalten',detail:'Kanban und Liste — für tägliche Arbeit.'},{text:'Filter anwenden: bestimmten Ausführenden wählen',detail:'Filterbereich über der Liste.'},{text:'Statusfilter Überfällig anwenden',detail:'Sofort sehen was brennt.'},{text:'Aufgabe über globale Suche finden',detail:'Sucht in Titeln, Kommentaren, Namen.'}]},
  tasks_anatomy:{title:'Aufgaben: Anatomie und richtige Einrichtung',subtitle:'Block 1 · Aufgaben',est:'15 Min',actionLabel:'Aufgaben öffnen',description:'<b>Schmerz ohne dies:</b> Ausführender tat sein Ding, Manager erwartete etwas anderes. Nacharbeit, Zeitverlust.<br><br>Richtige Aufgabe beantwortet: <i>wer, was, bis wann, Ergebnis, wer prüft.</i><br><br>— <b>Titel</b> — konkrete Aktion<br>— <b>Ausführender</b> — eine Person<br>— <b>Frist</b> — Datum und Uhrzeit<br>— <b>Priorität</b> — Kritisch / Hoch / Mittel / Niedrig<br>— <b>Erwartetes Ergebnis</b> — WAS<br>— <b>Berichtsformat</b> — WIE<br>— <b>Checkliste, Erinnerungen, Überprüfung, Kommentare, Dateien</b>',tipText:'Regel: wenn Ausführender Aufgabe ohne Rückfrage abschließen kann — ist sie richtig eingerichtet.',tasks:[{text:'Testaufgabe erstellen und alle Felder ausfüllen',detail:'Titel, Ausführender, Frist, Priorität, Ergebnis, Berichtsformat.'},{text:'Checkliste mit 3 Unterpunkten hinzufügen',detail:'Checkliste → Punkt hinzufügen.'},{text:'Erinnerung für morgen 9:00 Uhr setzen',detail:'Telegram-Benachrichtigung.'},{text:'Überprüfung nach Abschluss aktivieren',detail:'Status Zur Überprüfung.'},{text:'Kommentar schreiben und Datei anhängen',detail:'Korrespondenz bleibt in der Aufgabe.'}]},
  regular_tasks:{title:'Wiederkehrende Aufgaben: Routine automatisieren',subtitle:'Block 1 · Aufgaben',est:'10 Min',actionLabel:'Wiederkehrende öffnen',description:'<b>Schmerz ohne dies:</b> jede Woche dieselben Aufgaben manuell einrichten. 2–3 Stunden pro Monat.<br><br>Einmal konfigurieren → automatisch zugewiesen → Ausführender erhält Telegram.<br><br>— <b>Täglich</b> — erscheinen jeden Morgen<br>— <b>Wöchentlich</b> — an einem bestimmten Wochentag<br>— <b>Monatlich</b> — an einem bestimmten Monatstag',tipText:'Goldene Regel: jede Aufgabe die Sie mehr als zweimal einrichten — automatisieren.',tasks:[{text:'Registerkarte Wiederkehrende Aufgaben öffnen',detail:'Aufgaben → Wiederkehrend.'},{text:'3 Aufgaben identifizieren die wöchentlich manuell gesetzt werden',detail:'Bericht, Planungstreffen, Kennzahlencheck.'},{text:'Wöchentliche wiederkehrende Aufgabe mit Erinnerung erstellen',detail:'Ausführender, Wochentag, Uhrzeit, Ergebnis.'},{text:'Prüfen ob Aufgabe automatisch erschienen ist',detail:'Filter nach Ausführendem.'}]},
  myday:{title:'Mein Tag: Fokus und Planung',subtitle:'Block 2 · Mein Tag',est:'5 Min',actionLabel:'Mein Tag öffnen',description:'<b>Schmerz ohne dies:</b> Person kommt zur Arbeit und weiß nicht wo anfangen. Oder greift nach allem und beendet nichts.<br><br><b>Mein Tag</b> — persönlicher Bildschirm. Zeigt nur was HEUTE zu tun ist.<br><br>— <b>Normale Ansicht</b> — alle Aufgaben nach Priorität<br>— <b>Fokus-Modus</b> — eine Aufgabe auf dem ganzen Bildschirm. Erledigt → Abschließen → nächste.',tipText:'Team bitten jeden Tag mit Mein Tag zu beginnen. 5 Minuten = jeder kennt seinen Plan.',tasks:[{text:'Mein Tag öffnen und heutige Aufgaben prüfen',detail:'Testaufgabe mit heutigem Datum erstellen wenn keine vorhanden.'},{text:'In Fokus-Modus wechseln und eine Aufgabe abschließen',detail:'Erledigt klicken — System geht zur nächsten.'}]},
  functions:{title:'Funktionen: Abteilungen und Business-KPIs',subtitle:'Block 3 · System',est:'15 Min',actionLabel:'Funktionen öffnen',description:'<b>Schmerz ohne dies:</b> Aufgaben hängen ohne Abteilungsverbindung. Analytik zeigt nicht wo Last und Lücken sind.<br><br><b>Funktionen</b> — Abteilungen Ihres Unternehmens. Jede hat Verantwortlichen, KPI und Aufgaben.<br><br><b>KPI — Zahlen, keine Wünsche:</b><br>— Richtig: 20 neue Kunden pro Monat<br>— Falsch: Umsatz steigern',tipText:'Minimum: 3–5 Funktionen mit KPIs. Fundament der Analytik. Ohne Funktionen ist der Abteilungsbericht leer.',tasks:[{text:'System → Funktionen öffnen',detail:'Ohne Funktionen keine Abteilungsanalytik.'},{text:'Mindestens 3 Schlüsselfunktionen erstellen',detail:'Vertrieb, Operations, Finanzen.'},{text:'Jeder Funktion mindestens 1 KPI hinzufügen',detail:'Neue Deals — 20 — Stk/Monat.'},{text:'Zur Struktur-Ansicht wechseln',detail:'Hierarchie und Verbindungen.'},{text:'Bestehende Aufgaben mit Funktionen verknüpfen',detail:'Feld Funktion in der Aufgabe.'}]},
  bizstructure:{title:'Struktur: Organigramm',subtitle:'Block 3 · System',est:'10 Min',actionLabel:'Struktur öffnen',description:'<b>Schmerz ohne dies:</b> Team versteht nicht wer wem untersteht. Neuer Mitarbeiter weiß nicht an wen er sich wendet. Manager sieht nicht das Gesamtbild.<br><br><b>Struktur</b> — interaktives Organigramm: Abteilungen, Hierarchie, jeder Mitarbeiter an seinem Platz, Aufgabenanzahl.',tipText:'Erste Sache die Sie einem neuen Manager zeigen. Spart 2–3 Wochen Einarbeitung.',tasks:[{text:'System → Struktur öffnen',detail:'Wenn leer — zuerst Funktionen ausfüllen.'},{text:'Prüfen ob alle Abteilungen korrekt angezeigt werden',detail:'Mit tatsächlicher Struktur vergleichen.'},{text:'Auf Mitarbeiterkarte klicken und Details prüfen',detail:'Rolle, Abteilung, Aufgaben, Belastung.'},{text:'Prüfen ob alle Mitarbeiter ihrer Abteilung zugeordnet sind',detail:'Ohne Abteilung → Karte → Funktion ändern.'}]},
  team_management:{title:'Mitarbeiter: Rollen, Zugriffe und Einladungen',subtitle:'Block 3 · System',est:'15 Min',actionLabel:'Mitarbeiter öffnen',description:'<b>Schmerz ohne dies:</b> alle sehen alles — oder jemand sieht nicht was er braucht.<br><br><b>Registerkarte Mitarbeiter</b> hat 4 Abschnitte:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">LISTE</b><br>Alle Mitarbeiter mit Rolle, Abteilung, Status und Belastung.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">EINLADEN</b><br>E-Mail → Registrierung → sofort im System.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ROLLEN</b><br><b>Owner</b> — alles. <b>Manager</b> — Abteilung. <b>Employee</b> — nur eigene Aufgaben.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">UNTERNEHMEN</b><br>Name, Zeitzone, Wochenbericht. Nur Eigentümer.</div></div>',tipText:'Fehler Nr. 1: allen Owner geben. Rollen einmal richtig einrichten.',tasks:[{text:'System → Mitarbeiter → Liste öffnen',detail:'Rolle, Abteilung, Aufgabenanzahl.'},{text:'Rollen auf tatsächliche Aufgaben prüfen',detail:'Minimaler erforderlicher Zugriff.'},{text:'Registerkarte Rollen und Zugriffsmatrix studieren',detail:'Owner — alles. Manager — Abteilung. Employee — eigene.'},{text:'Neuen Mitarbeiter über Einladen einladen',detail:'E-Mail → Rolle → Funktion → Senden.'},{text:'Registerkarte Unternehmen prüfen (nur Eigentümer)',detail:'Name, Zeitzone, Wochenbericht.'}]},
  system_integrations:{title:'Integrationen: Externe Dienste verbinden',subtitle:'Block 3 · System',est:'15 Min',actionLabel:'Integrationen öffnen',description:'<b>Schmerz ohne dies:</b> Daten verstreut über verschiedene Dienste.<br><br><b>Verfügbare Integrationen:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Benachrichtigungen über Aufgaben, Fristen, Entscheidungen.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Fristensynchronisierung mit dem Kalender.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEFONIE: BINOTEL / RINGOSTAT / STREAM</b><br>Verpasster Anruf → Aufgabe Zurückrufen → Ausführender → Frist.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Beliebige externe Systeme verbinden.</div></div>',tipText:'Telefonie: verpasster Anruf = verlorener Kunde.',tasks:[{text:'Business → Integrationen öffnen',detail:'Status Verbunden oder Nicht verbunden.'},{text:'Telegram-Verbindung im Profil prüfen',detail:'Sollte Verbunden zeigen.'},{text:'Google Calendar verbinden',detail:'Integrationen → Google Calendar → Verbinden.'},{text:'Telefonie verbinden falls verwendet',detail:'API-Schlüssel → speichern.'},{text:'Alle Mitarbeiter bitten Telegram zu verbinden',detail:'Pflichtbedingung.'}]},
  projects:{title:'Projekte: Komplexe Aufgaben mit Zeitplan',subtitle:'Block 4 · Projekte und Prozesse',est:'10 Min',actionLabel:'Projekte öffnen',description:'<b>Schmerz ohne dies:</b> Projekt mit 20 Aufgaben fällt in der Gesamtliste auseinander. Unklar was erledigt ist, wo die Verzögerung ist.<br><br><b>Drei Ansichten:</b> Karten (Kanban), Liste, Zeitplan (Gantt).<br><b>Fortschritt</b> — automatisch berechnet.',tipText:'Zeitplanansicht zeigt sofort Engpass und wer das Team blockiert.',tasks:[{text:'Registerkarte Projekte öffnen',detail:'Wenn keine — Testprojekt erstellen.'},{text:'Ansichten wechseln: Karten → Liste → Zeitplan',detail:'Zeitplan am informativsten.'},{text:'Aufgaben hinzufügen und Fortschritt prüfen',detail:'3–4 Aufgaben → Zeitplan.'}]},
  processes:{title:'Prozesse: Vorlagen für wiederkehrende Situationen',subtitle:'Block 4 · Projekte und Prozesse',est:'15 Min',actionLabel:'Prozesse öffnen',description:'<b>Schmerz ohne dies:</b> bei jedem neuen Kunden von vorn erklären oder etwas vergessen.<br><br><b>Prozesse</b> — Aktionssequenz-Vorlagen. Einmal konfigurieren → per Klick starten → alle Aufgaben automatisch mit Ausführenden und Fristen.<br><br>Beispiele: Kundenaufnahme, Mitarbeitereinführung, Monatsabschluss.',tipText:'1 konfigurierter Prozess = hunderte gesparte Stunden jährlich.',tasks:[{text:'Registerkarte Prozesse öffnen und Logik prüfen',detail:'Demo-Vorlagen finden.'},{text:'1 wiederkehrenden Prozess im Unternehmen identifizieren',detail:'Was machen Sie mehrmals im Monat gleich?'},{text:'Prozessvorlage mit 3–4 Schritten erstellen',detail:'Wer + Tage + Ergebnis.'},{text:'Prozess starten und Aufgaben prüfen',detail:'Bereits mit Ausführenden und Fristen.'}]},
  coordination_types:{title:'Koordinationen: Typen und wann verwenden',subtitle:'Block 5 · Koordinationen',est:'10 Min',actionLabel:'Koordinationen öffnen',description:'<b>Schmerz ohne dies:</b> Meeting war — eine Woche später nichts getan. Entscheidungen im Messenger verloren.<br><br><b>8 Koordinationstypen:</b> Täglich · Wöchentlich · Monatlich · Beirat · Aufsichtsrat · Vorstand · Gründerrat · Einmalig.<br><br>Jede Entscheidung → sofort Aufgabe mit Ausführendem und Frist.',tipText:'Wöchentliches Planungsmeeting — Grundrhythmus des Unternehmens. Ohne es zerfällt das Team.',tasks:[{text:'Registerkarte Koordinationen öffnen und alle 8 Typen prüfen',detail:'Eigene Agenda-Vorlage und Dauer.'},{text:'Bestimmen welche Typen das Unternehmen braucht',detail:'Minimum: Wöchentlich + Monatlich.'},{text:'Regelmäßige wöchentliche Koordination einrichten',detail:'Typ → Tag → Uhrzeit → Teilnehmer.'}]},
  coordination_process:{title:'Koordinationen: Wie durchführen und Ergebnisse festhalten',subtitle:'Block 5 · Koordinationen',est:'15 Min',actionLabel:'Koordinationen öffnen',description:'<b>Schmerz ohne dies:</b> Meeting war — Entscheidungen gingen verloren. Kein Protokoll, keine Verantwortlichen.<br><br><b>Ablauf wöchentliche Koordination:</b><br>1. Statistiken der Teilnehmer<br>2. Erfüllung vorheriger Aufgaben<br>3. Berichte der Teilnehmer<br>4. Fragen<br>5. Entscheidungen — direkt im System<br>6. Neue Aufgaben<br><br><b>Timer, Protokoll (PDF), Eskalation</b> — alles eingebaut.',tipText:'Regel: jedes Meeting endet mit Protokoll und Aufgaben.',tasks:[{text:'Wöchentliche Koordination erstellen und Teilnehmer hinzufügen',detail:'Typ → Name → Teilnehmer.'},{text:'Koordination starten und Agenda durchgehen',detail:'Mindestens 1 Entscheidung festhalten.'},{text:'Entscheidung festhalten mit Ausführendem und Frist',detail:'Wird sofort zur Aufgabe.'},{text:'Koordination abschließen und Aufgaben prüfen',detail:'Alle Entscheidungen sind bereits dort.'},{text:'Automatisch erstelltes Protokoll öffnen',detail:'Archiv → Koordination → Protokoll. PDF.'}]},
  control:{title:'Kontrolle: Geschäftspuls in 5 Minuten täglich',subtitle:'Block 5 · Kontrolle',est:'15 Min',actionLabel:'Kontrolle öffnen',description:'<b>Schmerz ohne dies:</b> Manager erfährt von Problem wenn es schon brennt.<br><br><b>Kritische Aufmerksamkeit</b> — Dashboard: überfällig, ohne Ausführenden, ohne Frist.<br><b>Arbeitsbelastung</b> — wer hat wie viele Aufgaben.<br><b>Delegierungstrichter</b> — wo Aufgaben stecken bleiben.<br><b>Managementfehlerprotokoll</b> — systemische Probleme.',tipText:'Morgenritual: 5 Minuten → Geschäftsstatus ohne Meeting.',tasks:[{text:'Kontrolle → Kritische Aufmerksamkeit',detail:'2 Minuten — wissen wo es brennt.'},{text:'Arbeitsbelastung prüfen',detail:'Ungleichgewicht = schlechte Delegation.'},{text:'Delegierungstrichter öffnen',detail:'Schritt 1 voll — Ausführende nehmen nichts an.'},{text:'Ersten Eintrag in Managementfehlerprotokoll',detail:'Fakt → Ursache → Lösung.'}]},
  analytics:{title:'Effizienz und Statistiken: Zahlen statt Gefühle',subtitle:'Block 6 · Analytik',est:'10 Min',actionLabel:'Analytik öffnen',description:'<b>Schmerz ohne dies:</b> Eigentümer verwaltet nach Gefühl. Problem entsteht — unklar wo und wann es begann.<br><br><b>Effizienz</b> — KPIs pro Mitarbeiter: pünktlich, überfällig, wöchentliche Dynamik.<br><b>Statistiken</b> — eigene Kennzahlen die Sie hinzufügen.',tipText:'Nicht gemessen = nicht manageable. 3 Zahlen täglich — Minimum.',tasks:[{text:'Effizienz öffnen — Aufgabenstatistiken prüfen',detail:'Wer pünktlich vs wer verschiebt.'},{text:'Statistiken öffnen und 3 Kennzahlen hinzufügen',detail:'Tagesumsatz, Neue Kunden, Bestellungen.'},{text:'Zwischen Tag / Woche / Monat umschalten',detail:'Monat = Trend, Tag = aktueller Puls.'}]},
  finance_dashboard:{title:'Finanzen: Dashboard und Gesamtbild',subtitle:'Block 7 · Finanzen',est:'10 Min',actionLabel:'Finanzen öffnen',description:'<b>Schmerz ohne dies:</b> Eigentümer weiß nicht wie viel das Unternehmen verdient. Es gibt Geld — aber es ist kein Gewinn.<br><br><b>Dashboard:</b> Einnahmen, Ausgaben, Gewinn, Marge. 6-Monats-Graph. Top-Ausgaben. Automatische Signale.',tipText:'Ohne Daten — schönes leeres Dashboard. Heute beginnen.',tasks:[{text:'Business → Finanzen öffnen und Dashboard prüfen',detail:'Aktuellen Monat wählen.'},{text:'Alle Unterregisterkarten prüfen',detail:'Logik verstehen bevor Daten eingegeben werden.'},{text:'Konten einrichten',detail:'Mindestens 2: Bargeld und Girokonto.'}]},
  finance_transactions:{title:'Finanzen: Einnahmen, Ausgaben und Kategorien',subtitle:'Block 7 · Finanzen',est:'15 Min',actionLabel:'Finanzen öffnen',description:'<b>Schmerz ohne dies:</b> am Monatsende unklar wo Geld hinging. Keine Kategorien — alle Ausgaben in einem Haufen.<br><br><b>Einnahmen und Ausgaben</b> nach Kategorien. <b>Wiederkehrende Transaktionen</b> (Miete, Gehalt, Abonnements) — einmal einrichten, automatisch abgebucht.',tipText:'Täglich oder alle 2–3 Tage eingeben.',tasks:[{text:'3 Testeinnahmen in verschiedenen Kategorien',detail:'Kategorie, Betrag, Konto, Datum.'},{text:'3 Testausgaben in verschiedenen Kategorien',detail:'Mit Funktion verknüpfen.'},{text:'Wiederkehrende Transaktion einrichten (z.B. Miete)',detail:'Monatlich, Betrag, Kategorie.'},{text:'Dashboard nach Dateneingabe prüfen',detail:'Diagramme mit echten Daten.'}]},
  finance_planning:{title:'Finanzen: Budgetierung, Rechnungen und P&L',subtitle:'Block 7 · Finanzen',est:'15 Min',actionLabel:'Finanzen öffnen',description:'<b>Schmerz ohne dies:</b> Ausgaben überschritten Plan. Budget im Kopf.<br><br><b>Planung</b> — Plan vs Ist mit Abweichungen.<br><b>Rechnungen</b> — an Kunden. Bezahlt → automatisch Einnahmetransaktion.<br><b>P&L</b> — automatisch generiert.',tipText:'P&L — erstes Dokument für Investor. Jetzt automatisch.',tasks:[{text:'Finanzen → Planung öffnen und Einnahmenplan eingeben',detail:'Nach Kategorie.'},{text:'Ausgabenplan eingeben',detail:'Gehalt, Miete, Marketing, Materialien.'},{text:'Testrechnung erstellen',detail:'Bezahlt markieren.'},{text:'P&L-Bericht prüfen',detail:'Mit Transaktionen — automatisch.'}]},
  crm:{title:'CRM: Kunden, Deals, Vertrieb',subtitle:'Block 8 · Business',est:'15 Min',actionLabel:'CRM öffnen',description:'<b>Schmerz ohne dies:</b> Kunden in Excel oder im Kopf des Verkäufers. Er kündigt — gesamte Datenbank weg.<br><br><b>Deal-Kanban:</b> Lead → Verhandlung → Angebot → Rechnung → Zahlung.<br><b>Kunden</b> — Kontaktdatenbank mit allen Deals und Korrespondenz.<br><b>Deal → Rechnung → automatisch in Finanzen.</b>',tipText:'Jede Kundeninterakton erfassen. Nach 6 Monaten wertvolles Asset.',tasks:[{text:'CRM öffnen und Deal-Kanban prüfen',detail:'CRM → Einstellungen → Pipelines.'},{text:'Testdeal erstellen und zwischen Stufen ziehen',detail:'Drag & Drop.'},{text:'Kunden hinzufügen und mit Deal verknüpfen',detail:'CRM → Kunden.'},{text:'Aus Deal Aufgabe Zurückrufen erstellen',detail:'Erscheint im System.'}]},
  bots_sites:{title:'Marketing, Bots und Meine Seiten',subtitle:'Block 8 · Business',est:'10 Min',actionLabel:'Bots öffnen',description:'<b>Bots</b> — Telegram-Bot-Builder ohne Code. Leads ins CRM.<br><b>Meine Seiten</b> — Landing-Page-Builder. Formulare → CRM.<br><b>Marketing</b> — Vorlagen, Kanalstatistiken.',tipText:'Ein einfacher Bot der Kontakt ans CRM weitergibt ist besser als nichts.',tasks:[{text:'Bots öffnen und Telegram-Bot-Verbindung prüfen',detail:'Token von @BotFather → Willkommensnachricht.'},{text:'Nachrichtensequenz-Builder durchsuchen',detail:'Drag & Drop: Nachricht, Frage, Bedingung.'},{text:'Meine Seiten öffnen',detail:'Vorlage → bearbeiten → veröffentlichen.'}]},
  learning_start:{title:'Lernen: Programm-Roadmap und erste Module',subtitle:'Block 9 · Lernen',est:'20 Min',actionLabel:'Lernen öffnen',description:'<b>Lernen ist das Fundament.</b> Ohne Methodik wird der Eigentümer auf Knöpfe klicken ohne zu verstehen warum.<br><br>Registerkarte <b>Lernen</b> — 15 Module.<br><br><b>Erste 5 Module:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 0</b><br><b>Programm-Roadmap</b> — hier beginnen.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 4</b><br><b>Delegierungssystem</b> — Aufgaben so zuweisen dass sie erledigt werden.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 5</b><br><b>RADAR-System</b> — aufhören Feuerwehrmann zu sein.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 9</b><br><b>Ziel, Absicht, Struktur</b> — Fundament des systematischen Unternehmens.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 13</b><br><b>Statistiksystem</b> — Unternehmen in Zahlen sehen.</div></div>',tipText:'Lernen und Implementierung parallel. Modul → im System konfigurieren → es festigt sich.',tasks:[{text:'Registerkarte Lernen im Hauptmenü öffnen',detail:'Neue Schaltfläche im Menü.'},{text:'Modul 0 Programm-Roadmap ansehen',detail:'Karte der gesamten Reise.'},{text:'Modul 4 Delegierungssystem ansehen',detail:'Delegierungsqualität verbessert sich sofort.'},{text:'Verbleibende Module planen — 1 pro Woche',detail:'1 Modul = verstanden und implementiert.'}]},
  learning_ai:{title:'KI-Assistent und Integrationen',subtitle:'Block 9 · Lernen',est:'5 Min',actionLabel:'Integrationen öffnen',description:'<b>Der grüne Knopf oben</b> — KI-Assistent der das gesamte TALKO-System kennt.<br>— Jede Frage zur Funktionalität beantwortet<br>— Hilft Aufgaben richtig einzurichten<br>— Konfiguration von Prozessen und Bots<br><br><b>Integrationen:</b> Google Calendar, Telegram, Webhook API.',tipText:'KI-Assistent 24/7 — erste Anlaufstelle. Vor Entwicklerkontakt — Assistenten fragen.',tasks:[{text:'Grünen Knopf klicken und Frage stellen',detail:'Z.B.: Wie wiederkehrende Aufgabe einrichten?'},{text:'Integrationen öffnen und verfügbare prüfen',detail:'Google Calendar, Telegram, Webhook.'},{text:'Google Calendar verbinden oder Telegram bestätigen',detail:'3–5 Minuten.'}]},
};

window.OB_I18N.cs = {
  _blocks:{start:'Start',tasks:'Úkoly',myday:'Můj den',system:'Systém',projects:'Projekty',coordination:'Koordinace',analytics:'Analytika',finance:'Finance',business:'Business',learning:'Výuka'},
  _ui:{skip:'Přeskočit',prev:'Zpět',done:'Onboarding dokončen!',askAI:'Zeptat se AI',minUnit:'min',overview:'Přehled',completed:'dokončeno',complete:'Dokončit',estLabel:'Odhadovaný čas:',next:'Další krok',stepsOf:'kroky',stepsLabel:'Dokončené kroky'},
  setup_company:{title:'Nastavení společnosti',subtitle:'Blok 0 · Start',est:'5 min',actionLabel:'Otevřít nastavení',description:'<b>První krok před vším ostatním.</b> Bez základních nastavení systém funguje nesprávně — špatný čas v termínech, nepojmenovaná společnost, chybějící oznámení.<br><br><b>Název společnosti</b> — zobrazuje se všude: v pozvánkách, zprávách, protokolech.<br><b>Časové pásmo</b> — kritické pro termíny a připomínky.<br><b>Týdenní zpráva</b> — vlastník automaticky dostává každý týden souhrn.<br><br><b>Kde najít:</b> Systém → Zaměstnanci → záložka Společnost (pouze Vlastník).',tipText:'Jednorázově 5 minut. Bez správného pásma jsou všechny připomínky posunuty.',tasks:[{text:'Otevřít Systém → Zaměstnanci → záložka Společnost',detail:'Viditelná pouze pro Vlastníka.'},{text:'Zadat název společnosti a uložit',detail:'Zobrazuje se v pozvánkách a záhlaví.'},{text:'Zkontrolovat časové pásmo',detail:'Výchozí Kyjev (UTC+2/+3).'},{text:'Aktivovat týdenní zprávu',detail:'Každé pondělí automatický souhrn.'}]},
  setup_telegram:{title:'Připojit Telegram',subtitle:'Blok 0 · Start',est:'5 min',actionLabel:'Otevřít profil',description:'<b>Bolest bez toho:</b> úkol přidělen — vykonavatel to neví. Termín přišel — nic nepřipomíná.<br><br>Bez Telegram oznámení:<br>— Nové úkoly nejsou oznamovány<br>— Termíny nejsou připomínány<br>— Zpožděné nikam nesignalizují<br>— Rozhodnutí koordinací nepřicházejí<br><br><b>Jak připojit:</b> profil → Telegram oznámení → Připojit Telegram → bot → /start.<br><br><b>Každý zaměstnanec se připojuje samostatně</b> po registraci.',tipText:'Telegram není bonus — je to povinnost. Kdo se nepřipojil — je mimo systém.',tasks:[{text:'Otevřít profil → najít Telegram oznámení',detail:'Klikněte na jméno vpravo nahoře.'},{text:'Kliknout Připojit Telegram a dokončit',detail:'Bot TALKO → /start → potvrzení.'},{text:'Ověřit — poslat si testovací úkol',detail:'V 10–20 sekundách by mělo přijít oznámení.'},{text:'Požádat každého zaměstnance o připojení',detail:'Povinná podmínka.'}]},
  setup_invite:{title:'Pozvat tým',subtitle:'Blok 0 · Start',est:'10 min',actionLabel:'Otevřít zaměstnance',description:'<b>Bolest bez toho:</b> systém nastaven — ale je v něm pouze vlastník. Celá hodnota TALKO spočívá v tom, že tým je v systému.<br><br><b>Postup:</b> Systém → Zaměstnanci → Pozvat → E-mail → role → odeslat.<br><br><b>Role:</b><br>— <b>Owner</b> — vidí a může vše<br>— <b>Manager</b> — svůj tým a analytiku<br>— <b>Employee</b> — pouze vlastní úkoly<br><br><b>Pravidlo:</b> začněte s minimálními oprávněními.',tipText:'Chyba: zvát všechny najednou. Lepší 3–5 klíčových → ustanovit proces.',tasks:[{text:'Sestavit seznam zaměstnanců k pozvání',detail:'3–5 klíčových. Ne všechny najednou.'},{text:'Pozvat prvního zaměstnance',detail:'Pozvat → e-mail → role → odeslat.'},{text:'Potvrdit registraci a zobrazení v seznamu',detail:'Status Aktivní.'},{text:'Přiřadit první testovací úkol',detail:'Upevní návyk.'}]},
  tasks_views:{title:'Úkoly: zobrazení a filtry',subtitle:'Blok 1 · Úkoly',est:'10 min',actionLabel:'Otevřít úkoly',description:'<b>Bolest bez toho:</b> manažer nerozumí co se děje, tým drží úkoly v messengerech.<br><br><b>6 typů zobrazení:</b><br>— <b>Den</b> — co udělat dnes<br>— <b>Týden</b> — obraz na 7 dní<br>— <b>Měsíc</b> — strategický pohled<br>— <b>Seznam</b> — všechny úkoly<br>— <b>Kanban</b> — podle sloupců stavů<br>— <b>Harmonogram</b> — Ganttův diagram<br><br><b>Filtry:</b> vykonavatel, stav, funkce, termín, priorita.',tipText:'Kanban ideální pro týdenní přehledy. Vidíte kde jsou zácpy a proč.',tasks:[{text:'Otevřít Všechny úkoly a přepínat 6 zobrazení',detail:'Kanban a Seznam — pro denní práci.'},{text:'Použít filtr: vybrat vykonavatele',detail:'Panel filtrů nad seznamem.'},{text:'Použít filtr Zpožděné',detail:'Okamžitě vidíte co hoří.'},{text:'Najít úkol přes globální vyhledávání',detail:'Hledá v názvech, komentářích, jménech.'}]},
  tasks_anatomy:{title:'Úkoly: anatomie a správné nastavení',subtitle:'Blok 1 · Úkoly',est:'15 min',actionLabel:'Otevřít úkoly',description:'<b>Bolest bez toho:</b> vykonavatel udělal své, manažer čekal něco jiného. Přepracování, ztráta času.<br><br>Správný úkol odpovídá: <i>kdo, co, do kdy, výsledek, kdo kontroluje.</i><br><br>— <b>Název</b> — konkrétní akce<br>— <b>Vykonavatel</b> — jedna osoba<br>— <b>Termín</b> — datum a čas<br>— <b>Priorita</b> — Kritická / Vysoká / Střední / Nízká<br>— <b>Očekávaný výsledek</b> — CO<br>— <b>Formát zprávy</b> — JAK<br>— <b>Kontrolní seznam, připomínky, přezkoumání, komentáře, soubory</b>',tipText:'Pravidlo: bez jediné dodatečné otázky — nastaveno správně.',tasks:[{text:'Vytvořit testovací úkol a vyplnit všechna pole',detail:'Název, vykonavatel, termín, priorita, výsledek, formát.'},{text:'Přidat kontrolní seznam se 3 podpunkty',detail:'Kontrolní seznam → Přidat bod.'},{text:'Nastavit připomínku na zítra v 9:00',detail:'Telegram v zadanou dobu.'},{text:'Aktivovat Přezkoumání po dokončení',detail:'Status K přezkoumání.'},{text:'Napsat komentář a přiložit soubor',detail:'Vše zůstane uvnitř úkolu.'}]},
  regular_tasks:{title:'Opakující se úkoly: automatizace rutiny',subtitle:'Blok 1 · Úkoly',est:'10 min',actionLabel:'Otevřít opakující se',description:'<b>Bolest bez toho:</b> každý týden ručně nastavujete stejné úkoly. 2–3 hodiny měsíčně.<br><br>Nastavte jednou → systém přiděluje automaticky → Telegram.<br><br>— <b>Každodenní</b> — každé ráno<br>— <b>Týdenní</b> — v určený den<br>— <b>Měsíční</b> — v určené datum',tipText:'Zlaté pravidlo: úkol více než dvakrát — automatizujte.',tasks:[{text:'Otevřít záložku Opakující se úkoly',detail:'Úkoly → Opakující se.'},{text:'Identifikovat 3 úkoly nastavované každý týden ručně',detail:'Zpráva, plánování, přezkoumání ukazatelů.'},{text:'Vytvořit týdenní opakující se úkol s připomínkou',detail:'Vykonavatel, den, čas, výsledek.'},{text:'Ověřit automatické zobrazení',detail:'Filtr podle vykonavatele.'}]},
  myday:{title:'Můj den: soustředění a plánování',subtitle:'Blok 2 · Můj den',est:'5 min',actionLabel:'Otevřít Můj den',description:'<b>Bolest bez toho:</b> osoba přijde a neví kde začít. Nebo se vrhne na vše a nic nedokončí.<br><br><b>Můj den</b> — osobní obrazovka. Pouze co je třeba udělat DNES.<br><br>— <b>Normální zobrazení</b> — úkoly podle priority<br>— <b>Režim Soustředění</b> — jeden úkol na celé obrazovce. Hotovo → Dokončit → další.',tipText:'Začínat každý den Mým dnem. 5 minut = každý zná plán.',tasks:[{text:'Otevřít Můj den a zkontrolovat dnešní úkoly',detail:'Pokud žádné — vytvořit testovací.'},{text:'Přepnout do režimu Soustředění a dokončit jeden úkol',detail:'Hotovo → systém přejde na další.'}]},
  functions:{title:'Funkce: oddělení a KPI podniku',subtitle:'Blok 3 · Systém',est:'15 min',actionLabel:'Otevřít funkce',description:'<b>Bolest bez toho:</b> úkoly visí bez oddělení. Analytika neukazuje zátěž a mezery.<br><br><b>Funkce</b> — oddělení podniku. Každá má Odpovědného, KPI a Úkoly.<br><br><b>KPI — čísla:</b><br>— Správně: 20 nových klientů měsíčně<br>— Nesprávně: Zvýšit prodeje',tipText:'Minimum 3–5 funkcí s KPI. Základ analytiky. Bez funkcí je zpráva prázdná.',tasks:[{text:'Otevřít Systém → Funkce',detail:'Bez funkcí analytika nefunguje.'},{text:'Vytvořit alespoň 3 klíčové funkce',detail:'Prodej, Provoz, Finance.'},{text:'Přidat alespoň 1 KPI ke každé funkci',detail:'Nové obchody — 20 — ks/měs.'},{text:'Přepnout na zobrazení Struktura',detail:'Hierarchie a propojení.'},{text:'Propojit úkoly s funkcemi',detail:'Pole Funkce v úkolu.'}]},
  bizstructure:{title:'Struktura: organizační schéma',subtitle:'Blok 3 · Systém',est:'10 min',actionLabel:'Otevřít strukturu',description:'<b>Bolest bez toho:</b> tým nerozumí hierarchii. Nový zaměstnanec neví na koho se obrátit. Manažer nevidí celý obraz.<br><br><b>Struktura</b> — interaktivní organizační schéma: oddělení, hierarchie, každý zaměstnanec na místě, počet úkolů.',tipText:'První co ukážete novému manažerovi. Ušetří 2–3 týdny zapracování.',tasks:[{text:'Otevřít Systém → Struktura',detail:'Pokud prázdné — nejprve Funkce.'},{text:'Ověřit správné zobrazení oddělení',detail:'Porovnat se skutečnou strukturou.'},{text:'Kliknout na kartu zaměstnance',detail:'Role, oddělení, úkoly, zátěž.'},{text:'Ověřit propojení zaměstnanců s odděleními',detail:'Bez oddělení → karta → změnit funkci.'}]},
  team_management:{title:'Zaměstnanci: role, přístupy a pozvánky',subtitle:'Blok 3 · Systém',est:'15 min',actionLabel:'Otevřít zaměstnance',description:'<b>Bolest bez toho:</b> všichni vidí vše — nebo někdo nevidí co potřebuje.<br><br><b>Záložka Zaměstnanci</b> má 4 sekce:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">SEZNAM</b><br>Všichni zaměstnanci s rolí, oddělením, stavem a zátěží.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">POZVAT</b><br>E-mail → registrace → okamžitě v systému.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ROLE</b><br><b>Owner</b> — vše. <b>Manager</b> — oddělení. <b>Employee</b> — vlastní úkoly.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">SPOLEČNOST</b><br>Název, pásmo, týdenní zpráva. Pouze Vlastník.</div></div>',tipText:'Chyba č. 1: dávat všem Owner. Nastavte role jednou správně.',tasks:[{text:'Otevřít Systém → Zaměstnanci → Seznam',detail:'Role, oddělení, počet úkolů.'},{text:'Ověřit role odpovídají povinnostem',detail:'Minimální přístup.'},{text:'Prostudovat matici přístupů v Role',detail:'Owner — vše. Manager — oddělení. Employee — vlastní.'},{text:'Pozvat nového zaměstnance přes Pozvat',detail:'E-mail → role → funkce → odeslat.'},{text:'Otevřít Společnost (pouze Vlastník)',detail:'Název, pásmo, zpráva.'}]},
  system_integrations:{title:'Integrace: připojení externích služeb',subtitle:'Blok 3 · Systém',est:'15 min',actionLabel:'Otevřít integrace',description:'<b>Bolest bez toho:</b> data roztroušena po různých službách.<br><br><b>Dostupné integrace:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Oznámení o úkolech, termínech, rozhodnutích.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Synchronizace termínů s kalendářem.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEFONIE: BINOTEL / RINGOSTAT / STREAM</b><br>Zmeškaný hovor → úkol Zavolat zpět → vykonavatel → termín.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Libovolné externí systémy.</div></div>',tipText:'Zmeškaný hovor = ztracený klient. Telefonie je největší bod ztrát.',tasks:[{text:'Otevřít Business → Integrace',detail:'Status Připojeno nebo Nepřipojeno.'},{text:'Ověřit Telegram v profilu',detail:'Mělo by zobrazovat Připojeno.'},{text:'Připojit Google Calendar',detail:'Integrace → Google Calendar → Připojit.'},{text:'Připojit telefonii pokud se používá',detail:'API klíč → uložit.'},{text:'Požádat zaměstnance o připojení Telegramu',detail:'Povinná podmínka.'}]},
  projects:{title:'Projekty: komplexní úkoly s harmonogramem',subtitle:'Blok 4 · Projekty a procesy',est:'10 min',actionLabel:'Otevřít projekty',description:'<b>Bolest bez toho:</b> projekt s 20 úkoly se rozpadá v obecném seznamu. Nejasné co je hotovo, kde je zpoždění.<br><br><b>Tři zobrazení:</b> Karty (kanban), Seznam, Harmonogram (Gantt).<br><b>Pokrok</b> — automaticky.',tipText:'Harmonogram okamžitě ukáže úzké hrdlo.',tasks:[{text:'Otevřít záložku Projekty',detail:'Pokud žádné — vytvořit testovací.'},{text:'Přepínat zobrazení: Karty → Seznam → Harmonogram',detail:'Harmonogram nejinformativnější.'},{text:'Přidat úkoly a ověřit pokrok',detail:'3–4 úkoly → harmonogram.'}]},
  processes:{title:'Procesy: šablony pro opakující se situace',subtitle:'Blok 4 · Projekty a procesy',est:'15 min',actionLabel:'Otevřít procesy',description:'<b>Bolest bez toho:</b> každý nový klient — od začátku nebo se na něco zapomene.<br><br><b>Procesy</b> — šablony sekvencí akcí. Jednou nastavit → kliknout → úkoly automaticky s vykonavateli a termíny.<br><br>Příklady: příjem klienta, onboarding zaměstnance, uzávěrka měsíce.',tipText:'1 nakonfigurovaný proces = stovky ušetřených hodin ročně.',tasks:[{text:'Otevřít záložku Procesy a prostudovat logiku',detail:'Šablona → spuštění → aktivní proces.'},{text:'Identifikovat 1 opakující se proces',detail:'Co děláte stejně několikrát měsíčně?'},{text:'Vytvořit šablonu se 3–4 kroky',detail:'Kdo + dny + výsledek.'},{text:'Spustit a ověřit úkoly',detail:'Všechny úkoly s vykonavateli a termíny.'}]},
  coordination_types:{title:'Koordinace: typy a kdy používat',subtitle:'Blok 5 · Koordinace',est:'10 min',actionLabel:'Otevřít koordinace',description:'<b>Bolest bez toho:</b> schůzka proběhla — týden poté nic neuděláno. Rozhodnutí se ztratila v messengeru.<br><br><b>8 typů koordinací:</b> Denní · Týdenní · Měsíční · Poradní rada · Představenstvo · Výkonná rada · Rada zakladatelů · Jednorázová.<br><br>Každé rozhodnutí → okamžitě úkol.',tipText:'Týdenní schůzka — základní rytmus. Bez ní se tým rozpadá.',tasks:[{text:'Otevřít Koordinace a prohlédnout 8 typů',detail:'Každý typ — vlastní agenda.'},{text:'Určit které typy podnik potřebuje',detail:'Minimum: Týdenní + Měsíční.'},{text:'Nastavit pravidelnou týdenní koordinaci',detail:'Typ → den → čas → účastníci.'}]},
  coordination_process:{title:'Koordinace: jak vést a zaznamenávat výsledky',subtitle:'Blok 5 · Koordinace',est:'15 min',actionLabel:'Otevřít koordinace',description:'<b>Bolest bez toho:</b> schůzka proběhla — rozhodnutí ztratila. Žádný protokol, žádní odpovědní.<br><br><b>Pořadí týdenní koordinace:</b><br>1. Statistiky účastníků<br>2. Plnění předchozích úkolů<br>3. Zprávy účastníků<br>4. Otázky<br>5. Rozhodnutí — přímo v systému<br>6. Nové úkoly<br><br><b>Časovač, protokol (PDF), eskalace</b> — vše zabudováno.',tipText:'Každá schůzka končí protokolem s úkoly.',tasks:[{text:'Vytvořit koordinaci Týdenní a přidat účastníky',detail:'Typ → název → účastníci.'},{text:'Spustit a projít agendou',detail:'Alespoň 1 rozhodnutí.'},{text:'Zaznamenat rozhodnutí s vykonavatelem a termínem',detail:'Okamžitě se stane úkolem.'},{text:'Dokončit a ověřit úkoly',detail:'Všechna rozhodnutí jsou v úkolech.'},{text:'Otevřít automatický protokol',detail:'Archiv → koordinace → Protokol. PDF.'}]},
  control:{title:'Kontrola: puls podniku za 5 minut denně',subtitle:'Blok 5 · Kontrola',est:'15 min',actionLabel:'Otevřít kontrolu',description:'<b>Bolest bez toho:</b> manažer se dozví o problému až při požáru.<br><br><b>Kritická pozornost</b> — dashboard: zpožděné, bez vykonavatele, bez termínu.<br><b>Zátěž</b> — kdo má kolik úkolů.<br><b>Trychtýř delegování</b> — kde se úkoly zasekávají.<br><b>Deník selhání</b> — systémové problémy.',tipText:'Ranní rituál: 5 minut → stav podniku bez schůzky.',tasks:[{text:'Otevřít Kontrolu → Kritická pozornost',detail:'2 minuty — víte kde je požár.'},{text:'Zkontrolovat Zátěž',detail:'Nerovnováha = špatné delegování.'},{text:'Otevřít Trychtýř delegování',detail:'Krok 1 plný — úkoly nikdo nebere.'},{text:'Přidat záznam do Deníku selhání',detail:'Fakt → příčina → řešení.'}]},
  analytics:{title:'Efektivita a Statistiky: čísla místo pocitů',subtitle:'Blok 6 · Analytika',est:'10 min',actionLabel:'Otevřít analytiku',description:'<b>Bolest bez toho:</b> vlastník řídí podle pocitu. Problém nastane — nejasné kde a kdy začal.<br><br><b>Efektivita</b> — KPI každého: včas, zpožděno, týdenní dynamika.<br><b>Statistiky</b> — vlastní ukazatele které přidáváte.',tipText:'Co se neměří — nelze řídit. 3 čísla denně — minimum.',tasks:[{text:'Otevřít Efektivita — zkontrolovat statistiky',detail:'Kdo včas vs kdo odkládá.'},{text:'Otevřít Statistiky a přidat 3 klíčové ukazatele',detail:'Denní příjmy, Noví klienti, Objednávky.'},{text:'Přepínat Den / Týden / Měsíc',detail:'Měsíc = trend, den = puls.'}]},
  finance_dashboard:{title:'Finance: dashboard a celkový obraz',subtitle:'Blok 7 · Finance',est:'10 min',actionLabel:'Otevřít finance',description:'<b>Bolest bez toho:</b> vlastník neví kolik podnik vydělává. Jsou peníze — ale to není zisk.<br><br><b>Dashboard:</b> Příjmy, Výdaje, Zisk, Marže. Graf 6 měsíců. Top výdajů. Automatické signály.',tipText:'Bez dat — prázdný dashboard. Začněte od dneška.',tasks:[{text:'Otevřít Business → Finance',detail:'Vybrat aktuální měsíc.'},{text:'Projít všechny podzáložky',detail:'Pochopit logiku před zadáváním dat.'},{text:'Nastavit účty',detail:'Hotovost a běžný účet.'}]},
  finance_transactions:{title:'Finance: příjmy, výdaje a kategorie',subtitle:'Blok 7 · Finance',est:'15 min',actionLabel:'Otevřít finance',description:'<b>Bolest bez toho:</b> na konci měsíce nejasné kde šly peníze. Žádné kategorie.<br><br><b>Příjmy a výdaje</b> podle kategorií. <b>Opakující se transakce</b> (nájem, mzda, předplatné) — nastavit jednou, automaticky.',tipText:'Denně nebo každé 2–3 dny.',tasks:[{text:'Zadat 3 testovací příjmy v různých kategoriích',detail:'Kategorie, částka, účet, datum.'},{text:'Zadat 3 testovací výdaje',detail:'Propojit s funkcí.'},{text:'Nastavit opakující se transakci (nájem)',detail:'Měsíčně, částka, kategorie.'},{text:'Zkontrolovat dashboard',detail:'Grafy s reálnými daty.'}]},
  finance_planning:{title:'Finance: rozpočtování, faktury a P&L',subtitle:'Blok 7 · Finance',est:'15 min',actionLabel:'Otevřít finance',description:'<b>Bolest bez toho:</b> výdaje překročily plán. Rozpočet v hlavě.<br><br><b>Plánování</b> — Plan vs Skutečnost.<br><b>Faktury</b> — pro klienty. Zaplacena → automaticky transakce.<br><b>P&L</b> — automaticky.',tipText:'P&L — první dokument pro investora. Nyní automaticky.',tasks:[{text:'Otevřít Plánování a zadat plán příjmů',detail:'Podle kategorií.'},{text:'Zadat plán výdajů',detail:'Mzdy, nájem, marketing, materiály.'},{text:'Vytvořit testovací fakturu',detail:'Zaplaceno.'},{text:'Zkontrolovat P&L za aktuální měsíc',detail:'S transakcemi — automaticky.'}]},
  crm:{title:'CRM: klienti, obchody, prodeje',subtitle:'Blok 8 · Business',est:'15 min',actionLabel:'Otevřít CRM',description:'<b>Bolest bez toho:</b> klienti v Excelu nebo v hlavě obchodníka. Odejde — ztracena databáze.<br><br><b>Kanban obchodů:</b> Lead → Jednání → Nabídka → Faktura → Platba.<br><b>Klienti</b> — kontaktní databáze se všemi obchody.<br><b>Obchod → faktura → automaticky do Finance.</b>',tipText:'Každá interakce zaznamenána. Po 6 měsících nejcennější aktivum.',tasks:[{text:'Otevřít CRM a prohlédnout kanban obchodů',detail:'CRM → Nastavení → Trychtýře.'},{text:'Vytvořit testovací obchod a přetáhnout',detail:'Drag & drop.'},{text:'Přidat klienta a propojit s obchodem',detail:'CRM → Klienti.'},{text:'Z obchodu vytvořit úkol Zavolat zpět',detail:'Zobrazí se v systému.'}]},
  bots_sites:{title:'Marketing, Boty a Moje stránky',subtitle:'Blok 8 · Business',est:'10 min',actionLabel:'Otevřít boty',description:'<b>Boty</b> — konstruktor Telegram botů bez kódu. Leady do CRM.<br><b>Moje stránky</b> — landing page. Formuláře → CRM.<br><b>Marketing</b> — šablony, statistiky.',tipText:'Jednoduchý bot předávající kontakt do CRM je lepší než nic.',tasks:[{text:'Otevřít Boty a zjistit jak připojit bota',detail:'Token od @BotFather → uvítací zpráva.'},{text:'Procházet konstruktor sekvencí',detail:'Drag & drop: Zpráva, Otázka, Podmínka.'},{text:'Otevřít Moje stránky',detail:'Šablona → upravit → zveřejnit.'}]},
  learning_start:{title:'Výuka: plán programu a první moduly',subtitle:'Blok 9 · Výuka',est:'20 min',actionLabel:'Otevřít výuku',description:'<b>Výuka je základ.</b> Bez metodiky bude vlastník klikat tlačítka aniž by chápal proč.<br><br>Záložka <b>Výuka</b> — 15 modulů.<br><br><b>Prvních 5 modulů:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 0</b><br><b>Plán programu</b> — začněte zde.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 4</b><br><b>Systém delegování</b> — jak přidělovat úkoly aby byly splněny.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 5</b><br><b>Systém RADAR</b> — přestat být hasičem.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 9</b><br><b>Cíl, záměr, struktura</b> — základ systematického podniku.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">MODUL 13</b><br><b>Systém statistik</b> — podnik v číslech.</div></div>',tipText:'Výuka a implementace — paralelně. Modul → konfigurovat → upevní se.',tasks:[{text:'Otevřít záložku Výuka v hlavním menu',detail:'Nové tlačítko v menu.'},{text:'Prohlédnout Modul 0 Plán programu',detail:'Mapa celé cesty.'},{text:'Prohlédnout Modul 4 Systém delegování',detail:'Kvalita delegování se zlepší okamžitě.'},{text:'Naplánovat moduly — 1 týdně',detail:'1 modul = pochopeno a implementováno.'}]},
  learning_ai:{title:'AI asistent a integrace',subtitle:'Blok 9 · Výuka',est:'5 min',actionLabel:'Otevřít integrace',description:'<b>Zelené tlačítko nahoře</b> — AI asistent který zná celý systém TALKO.<br>— Odpovídá na otázky o funkcionalitě<br>— Pomáhá správně nastavit úkol<br>— Navrhuje konfiguraci procesů a botů<br><br><b>Integrace:</b> Google Calendar, Telegram, Webhook API.',tipText:'AI asistent 24/7 — první bod pomoci. Před vývojářem — zeptat se asistenta.',tasks:[{text:'Kliknout zelené tlačítko a položit otázku',detail:'Napr.: Jak nastavit opakující se úkol?'},{text:'Otevřít Integrace a prohlédnout dostupné',detail:'Google Calendar, Telegram, Webhook.'},{text:'Připojit Google Calendar nebo ověřit Telegram',detail:'3–5 minut.'}]},
};

// ─── HELPER: patch step with current language ──────────────
window.getLocalizedStep = function(step) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
    if (lang === 'ua') return step;
    var i18n = window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang][step.id];
    if (!i18n) return step;
    var patched = Object.assign({}, step);
    if (i18n.title)        patched.title       = i18n.title;
    if (i18n.subtitle)     patched.subtitle    = i18n.subtitle;
    if (i18n.est)          patched.est         = i18n.est;
    if (i18n.description)  patched.description = i18n.description;
    if (i18n.tipText)      patched._tipText    = i18n.tipText;
    if (i18n.actionLabel && patched.action)
        patched.action = Object.assign({}, patched.action, {label: i18n.actionLabel});
    if (i18n.tasks && i18n.tasks.length)
        patched.tasks = step.tasks.map(function(t, idx) {
            var tr = i18n.tasks[idx];
            if (!tr) return t;
            return Object.assign({}, t, {text: tr.text || t.text, detail: tr.detail || t.detail});
        });
    return patched;
};

window.getOBBlockLabel = function(blockId) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._blocks
            && window.OB_I18N[lang]._blocks[blockId]) || blockId;
};

window.getOBUI = function(key) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._ui
            && window.OB_I18N[lang]._ui[key]) || '';
};
