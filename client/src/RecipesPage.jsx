// app/recipes/page.jsx  (Server Component)
import { use, Suspense } from 'react';

// --- Data Fetching (Inside same file but still decoupled) ---
async function fetchRecipes() {
  const res = await fetch("https://dummyjson.com/recipes", {
    next: { revalidate: 60 }, // Cache for 60s (ISR-like)
  });
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

// --- Component that actually renders recipes ---
function RecipesContent() {
  const data = use(fetchRecipes());

  return (
    <div className="p-4 space-y-4">
      {data.recipes.map(recipe => (
        <div
          key={recipe.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{recipe.name}</h2>
          <p className="text-sm text-gray-600">Cuisine: {recipe.cuisine}</p>
          <p className="text-sm">Prep Time: {recipe.prepTimeMinutes} mins</p>
        </div>
      ))}
    </div>
  );
}

// --- Page Component with Suspense ---
export default function RecipesPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading recipes...</p>}>
      <RecipesContent />
    </Suspense>
  );
}
