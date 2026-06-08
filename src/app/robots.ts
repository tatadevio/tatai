import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/settings"],
      },
    ],
    sitemap: "https://www.tatai.cloud/sitemap.xml",
    host: "https://www.tatai.cloud",
  };
}
