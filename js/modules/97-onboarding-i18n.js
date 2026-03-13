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

// ─── HELPER: patch step with current language ──────────────
window.getLocalizedStep = function(step) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_lang') || 'ua';
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
             || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._blocks
            && window.OB_I18N[lang]._blocks[blockId]) || blockId;
};

window.getOBUI = function(key) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._ui
            && window.OB_I18N[lang]._ui[key]) || '';
};
