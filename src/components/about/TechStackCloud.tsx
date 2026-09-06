"use client";

import { useEffect, useState } from "react";
import { IconCloud } from "@/components/ui/icon-cloud";

const slugs = [
  "dotnet",
  "csharp",
  "javascript",
  "react",
  "express",
  "postgresql",
  "mysql",
  "ngrok",
  "firebase",
  "kubernetes",
  "nginx",
  "docker",
  "swagger",
  "postman",
  "cloudflare",
  "grafana",
  "prometheus",
  "terraform",
  "jenkins",
  "kibana",
  "elasticsearch",
  "git",
  "jira",
  "github",
  "gitlab",
  "php",
  "phpmyadmin",
  "pnpm",
  "pytorch",
  "ollama",
  "lmstudio",
  "npm",
  "visualstudiocode",
  "visualstudio",
  "sonarqube",
];

// Once UI'ın data-theme attribute'unu izleyen küçük hook
function useOnceUITheme() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const root = document.documentElement; // farklıysa document.body dene
    const read = () => setTheme(root.getAttribute("data-theme") || "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function TechStackCloud() {
  const theme = useOnceUITheme();

  // dark modda beyaz, light modda marka renginde (ya da siyah) ikonlar
  const images = slugs.map((slug) =>
    theme === "dark"
      ? `https://cdn.simpleicons.org/${slug}/ffffff`
      : `https://cdn.simpleicons.org/${slug}/${slug}`
  );

  return (
    <div>
      <IconCloud showControl={false} images={images} />
    </div>
  );
}