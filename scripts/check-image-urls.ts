import { FOOD_IMAGE_CATALOG } from "../apps/web/lib/food-images";


async function checkUrls() {
  const entries = Object.entries(FOOD_IMAGE_CATALOG);
  const results = [];

  for (const [name, url] of entries) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.status !== 200) {
        results.push({ name, url, status: res.status });
      }
    } catch (err) {
      results.push({ name, url, status: "FETCH_ERROR" });
    }
  }

  console.log("Failed URLs Count:", results.length);
  console.log(JSON.stringify(results, null, 2));
}

checkUrls();
