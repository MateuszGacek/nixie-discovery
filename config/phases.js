export const phaseOrder = ["phase1", "phase2", "phase3", "phase4", "phase5", "phase6"];

export const phases = {
  phase1: {
    id: "phase1",
    order: 1,
    eyebrow: "Identity",
    title: "Who are you right now?",
    subtitle:
      "Start with the simplest version of the truth: what feels visible, what feels hidden, and how you describe yourself when nobody is editing the sentence.",
    questions: [
      {
        id: "phase1_identity_1",
        type: "text",
        label: "One word you return to often",
        placeholder: "Write a single word",
        required: true,
      },
      {
        id: "phase1_identity_2",
        type: "textarea",
        label: "How would you describe yourself in three honest sentences?",
        placeholder: "Be direct, not polished.",
        required: true,
      },
      {
        id: "phase1_identity_3",
        type: "select",
        label: "Which energy feels most like you this season?",
        options: ["Calm", "Curious", "Focused", "Tender", "Restless"],
        required: true,
      },
      {
        id: "phase1_identity_4",
        type: "radio",
        label: "When people first meet you, what do they usually notice?",
        options: ["Warmth", "Precision", "Humor", "Quietness", "Intensity"],
      },
    ],
  },
  phase2: {
    id: "phase2",
    order: 2,
    eyebrow: "Values",
    title: "What do you stand for?",
    subtitle:
      "Name the principles that still matter when you are tired, distracted, or under pressure. Values are easiest to read when they are tested.",
    questions: [
      {
        id: "phase2_values_1",
        type: "textarea",
        label: "Which value do you want to protect this year?",
        placeholder: "Explain why it matters.",
        required: true,
      },
      {
        id: "phase2_values_2",
        type: "radio",
        label: "Which tradeoff are you willing to make for a better life?",
        options: ["Less speed", "Less noise", "Less approval seeking", "Less perfectionism"],
      },
      {
        id: "phase2_values_3",
        type: "checkbox",
        label: "Which values feel non-negotiable?",
        options: ["Honesty", "Kindness", "Autonomy", "Craft", "Stability"],
      },
      {
        id: "phase2_values_4",
        type: "select",
        label: "What usually tells you that you are off course?",
        options: ["Burnout", "Resentment", "Procrastination", "Disconnection", "Confusion"],
      },
    ],
  },
  phase3: {
    id: "phase3",
    order: 3,
    eyebrow: "Fears",
    title: "What are you avoiding?",
    subtitle:
      "Fear often hides behind busy schedules, shallow standards, or permanent preparation. This phase is for naming what gets dodged.",
    questions: [
      {
        id: "phase3_fears_1",
        type: "textarea",
        label: "What are you most afraid of losing?",
        placeholder: "Name the thing directly.",
        required: true,
      },
      {
        id: "phase3_fears_2",
        type: "radio",
        label: "Which response shows up first under stress?",
        options: ["Shut down", "Over-explain", "Fix everything", "Withdraw", "People-please"],
      },
      {
        id: "phase3_fears_3",
        type: "checkbox",
        label: "Which fears feel familiar?",
        options: ["Being rejected", "Being seen", "Being ordinary", "Being too much", "Being left behind"],
      },
      {
        id: "phase3_fears_4",
        type: "text",
        label: "What is one fear you no longer want to organize your life around?",
        placeholder: "Write a short phrase",
      },
    ],
  },
  phase4: {
    id: "phase4",
    order: 4,
    eyebrow: "Dreams",
    title: "What do you want next?",
    subtitle:
      "Dreams get useful when they become specific. Name the future you are actually trying to move toward, not just the one that looks good in public.",
    questions: [
      {
        id: "phase4_dreams_1",
        type: "text",
        label: "If life opened up, what would you try first?",
        placeholder: "Be concrete.",
        required: true,
      },
      {
        id: "phase4_dreams_2",
        type: "textarea",
        label: "Describe a future version of you that feels calm and real.",
        placeholder: "What does a good week look like there?",
      },
      {
        id: "phase4_dreams_3",
        type: "select",
        label: "Which area needs the most expansion?",
        options: ["Work", "Rest", "Money", "Creativity", "Home", "Movement"],
      },
      {
        id: "phase4_dreams_4",
        type: "radio",
        label: "What pace feels sustainable?",
        options: ["Slow and steady", "Focused sprints", "Seasonal bursts", "A flexible rhythm"],
      },
    ],
  },
  phase5: {
    id: "phase5",
    order: 5,
    eyebrow: "Relationships",
    title: "Who shapes your world?",
    subtitle:
      "Relationships reveal what gets reinforced, drained, or protected. Notice the people, patterns, and conversations that change your sense of self.",
    questions: [
      {
        id: "phase5_relationships_1",
        type: "textarea",
        label: "Which relationship currently feels most nourishing?",
        placeholder: "Explain the pattern.",
        required: true,
      },
      {
        id: "phase5_relationships_2",
        type: "checkbox",
        label: "What do you need more of from others?",
        options: ["Encouragement", "Honesty", "Space", "Consistency", "Playfulness"],
      },
      {
        id: "phase5_relationships_3",
        type: "radio",
        label: "How do you usually recover after conflict?",
        options: ["Talk it through", "Need time alone", "Text first", "Avoid it", "Reflect privately"],
      },
      {
        id: "phase5_relationships_4",
        type: "text",
        label: "What boundary would make your life clearer?",
        placeholder: "Keep it short",
      },
    ],
  },
  phase6: {
    id: "phase6",
    order: 6,
    eyebrow: "Summary",
    title: "Purpose summary",
    subtitle:
      "Review everything you have saved so far. This page reads from localStorage and gives you a clean snapshot of the journey.",
    questions: [],
  },
};
