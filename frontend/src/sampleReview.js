// Dev-only mock (open http://localhost:5173/?demo) to work on the review UI without the backend.
export default {
  topic: 'Photosynthesis',
  score: 68,
  summary: 'Solid grasp of the light reactions and where photosynthesis happens. One gas mix-up and the Calvin cycle is missing.',
  correct: [
    { concept: 'Location', note: 'Correctly said photosynthesis happens in the chloroplasts.' },
    { concept: 'Chlorophyll', note: 'Explained that chlorophyll absorbs light energy.' },
  ],
  partial: [
    { concept: 'Light reactions', what_was_said: 'Light makes energy for the plant.', fix: 'Light reactions produce ATP and NADPH and split water, releasing O₂.' },
  ],
  wrong: [
    { concept: 'Gas exchange', what_was_said: 'Plants take in oxygen and release carbon dioxide.', correct_version: 'Plants take in CO₂ and release O₂ during photosynthesis.' },
  ],
  missed: [
    { concept: 'Calvin cycle', why_it_matters: 'This is where CO₂ is fixed into glucose using ATP and NADPH.' },
    { concept: 'Overall equation', why_it_matters: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ ties the whole process together.' },
  ],
  next_step: 'Revise the Calvin cycle and practise saying the overall equation from memory.',
  grounded: false,
  model: 'gemma-4-31B-it',
}
