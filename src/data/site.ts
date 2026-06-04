import projectsData from "./projects.json";
import awardsData from "./awards.json";
import type { AwardGroup, Project } from "../types";

export const projects = projectsData as Project[];
export const awards = awardsData as AwardGroup[];
export const activeProjects = projects.filter((project) => project.data.active !== false);

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.data.slug === slug || project.id === slug);
}

export function getNextProject(project: Project) {
  const index = activeProjects.findIndex((item) => item.data.slug === project.data.slug);
  return activeProjects[(index + 1) % activeProjects.length] ?? activeProjects[0];
}

export function thumbSrc(project: Project, ext: "webp" | "jpg" = "webp") {
  return `/images/thumbs/${project.data.thumbnail.src}.${project.data.thumbnail.type ?? ext}`;
}

export const recognitionSummary = [
  {
    title: "Awwwards",
    items: [
      ["Site of the Month", "x1"],
      ["Site of the Day", "x12"],
      ["Developer Award", "x12"],
      ["Mobile Of The Week", "x3"],
      ["Mobile Excellence", "x3"],
    ],
  },
  {
    title: "Webby Awards",
    items: [
      ["Webby Winner", "x1"],
      ["People's Voice Winner", "x1"],
    ],
  },
  {
    title: "Behance",
    items: [
      ["Adobe new creatives", "x1"],
      ["Best of Behance", "x2"],
      ["Digital Art Gallery", "x3"],
      ["Editorial Gallery", "x1"],
    ],
  },
  {
    title: "FWA",
    items: [
      ["Site of the Month", "x2"],
      ["Site of the Day", "x14"],
    ],
  },
  {
    title: "CSSDA",
    items: [
      ["Site of the month", "x2"],
      ["Site of the Day", "x13"],
    ],
  },
];
