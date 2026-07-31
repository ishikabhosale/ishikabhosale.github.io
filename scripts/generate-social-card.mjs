import sharp from "sharp";

const [
  input = "/private/tmp/local-hero-front.png",
  output = "public/social-card.png",
] = process.argv.slice(2);

await sharp(input)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(`Saved ${output}`);
