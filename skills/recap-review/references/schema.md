# Review JSON schema

Return a single JSON object, no prose and no code fences.

| Field | Type | Notes |
|---|---|---|
| `topic` | string | The topic being explained |
| `score` | integer 0–100 | ~60% accuracy + ~40% coverage |
| `summary` | string | 1–2 encouraging sentences |
| `correct` | list of `{concept, note}` | Right and well explained |
| `partial` | list of `{concept, what_was_said, fix}` | Right idea, incomplete or imprecise |
| `wrong` | list of `{concept, what_was_said, correct_version}` | Factually incorrect |
| `missed` | list of `{concept, why_it_matters}` | Max 5 important omissions |
| `next_step` | string | One concrete thing to revise next |

Recap Buddy's API adds two fields after the model answers: `grounded` (true if reference notes were used) and `model` (the model ID that answered).

## Example

Explanation: *"So photosynthesis happens in the chloroplasts, umm, chlorophyll absorbs light, and the light makes energy for the plant. Plants take in oxygen and release carbon dioxide."*

```json
{
  "topic": "Photosynthesis",
  "score": 62,
  "summary": "Good start — you know where photosynthesis happens and what chlorophyll does. The gas exchange is reversed and the Calvin cycle is missing.",
  "correct": [
    { "concept": "Location", "note": "Photosynthesis happens in the chloroplasts." },
    { "concept": "Chlorophyll", "note": "Chlorophyll absorbs light energy." }
  ],
  "partial": [
    {
      "concept": "Light reactions",
      "what_was_said": "the light makes energy for the plant",
      "fix": "The light reactions convert light into chemical energy as ATP and NADPH, splitting water and releasing O₂."
    }
  ],
  "wrong": [
    {
      "concept": "Gas exchange",
      "what_was_said": "Plants take in oxygen and release carbon dioxide.",
      "correct_version": "During photosynthesis plants take in CO₂ and release O₂."
    }
  ],
  "missed": [
    { "concept": "Calvin cycle", "why_it_matters": "This is where CO₂ is fixed into sugar using ATP and NADPH." },
    { "concept": "Overall equation", "why_it_matters": "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ summarises inputs and outputs." }
  ],
  "next_step": "Revise the Calvin cycle and practise stating the overall equation from memory."
}
```
