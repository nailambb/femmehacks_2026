# Alter'd

Have you ever wanted to customize your clothing, but are unsure what to do? Then Alter'd is the best way to figure that out! It takes you interests and skill level and outputs something new :)

## Tech Stack

- **Frontend**: TypeScript, React, Tailwind CSS
- **AI Layer**: Gemini API (for generating styling and alteration ideas)
- **Backend / Data Sync**: Convex (real-time database and state synchronization)

## Features

- **Style Generation**  
  Input a clothing item (e.g., `"oversized denim jacket"`) as an image and receive outfit combinations.

- **Garment Transformation**  
  Suggests alterations or repurposing ideas (e.g., jeans → shorts, hoodie → cropped hoodie).

- **Skill-Aware Recommendations**  
  Filters outputs based on user skill level:
  - Beginner
  - Intermediate
  - Advanced

- **Instructional Resources**  
  Provides links to tutorials, patterns, and guides for each suggestion.

- **Inspiration Mapping**  
  Surfaces design references and aesthetic directions.

- **Real-Time Sync**  
  Uses Convex to persist:
  - User profiles
  - Saved ideas
  - Generated outputs

## Installation

Clone the repository and install dependencies:

```bash
git clone [URL]
cd threadlab
npm install
