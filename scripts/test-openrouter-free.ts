import { chatWithFreeRouter } from "../src/lib/openrouterClient";

async function main() {
  const response = await chatWithFreeRouter([
    { role: "user", content: "Reply with exactly: OpenRouter free model is working." },
  ]);

  console.log(response?.content ?? "No content returned.");
}

main().catch((error) => {
  console.error("OpenRouter free test failed:", error);
  process.exit(1);
});
