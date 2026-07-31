import sharp from "sharp";

const [input, output = "public/images/server-rack-poster.webp"] =
  process.argv.slice(2);

if (!input) {
  throw new Error(
    "Usage: node scripts/capture-model-poster.mjs <screenshot> [output]",
  );
}

await sharp(input)
  .extract({ left: 780, top: 250, width: 500, height: 529 })
  .resize(720, 620, {
    fit: "contain",
    background: { r: 11, g: 12, b: 16, alpha: 1 },
  })
  .webp({ quality: 84 })
  .toFile(output);

console.log(`Saved ${output}`);
