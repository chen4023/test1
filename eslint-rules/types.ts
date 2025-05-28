export interface TeamImportRuleOptions {
  allowedGlobalFolders: string[];
  teamFolderPrefix: string;
  teamsBasePath: string;
}

export interface ImportAnalysis {
  type: "external" | "relative" | "global" | "team" | "restricted" | "unknown";
  folder: string | null;
  team: string | null;
  description?: string;
}
