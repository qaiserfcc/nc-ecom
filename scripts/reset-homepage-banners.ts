import fs from "node:fs";
import path from "node:path";
import { sql } from "@/lib/db";

function parseLeadingNumber(filename: string): number {
  const match = filename.match(/^\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

async function main() {
  const assetsDir = path.join(process.cwd(), "public", "eco-friendly-banner");
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Missing folder: ${assetsDir}`);
  }

  const filenames = fs
    .readdirSync(assetsDir)
    .filter((name) => name.toLowerCase().endsWith(".svg"))
    .sort((a, b) => {
      const na = parseLeadingNumber(a);
      const nb = parseLeadingNumber(b);
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });

  if (filenames.length === 0) {
    throw new Error(`No .svg files found in: ${assetsDir}`);
  }

  const rows = filenames.map((name, index) => {
    const image_url = `/eco-friendly-banner/${name}`;
    return {
      title: `Eco-friendly banner ${index + 1}`,
      description: "",
      image_url,
      link_url: "/shop",
      sort_order: index + 1,
      is_active: true,
    };
  });

  await sql`BEGIN`;
  try {
    await sql`DELETE FROM homepage_banners`;

    for (const row of rows) {
      await sql`
        INSERT INTO homepage_banners (title, description, image_url, link_url, sort_order, is_active)
        VALUES (${row.title}, ${row.description}, ${row.image_url}, ${row.link_url}, ${row.sort_order}, ${row.is_active})
      `;
    }

    await sql`COMMIT`;
  } catch (err) {
    await sql`ROLLBACK`;
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Reset homepage_banners: inserted ${rows.length} banners.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("❌ Failed to reset homepage banners:", err);
  process.exitCode = 1;
});
