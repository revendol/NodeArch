// Convert controller name to base path
export function generateBasePath(controllerName: string): string {
  // Remove "Controller" suffix, convert to lowercase and replace camelCase with hyphens
  return controllerName
    .replace(/Controller$/, '')                // Remove "Controller"
    .replace(/([a-z])([A-Z])/g, '$1-$2')       // Convert camelCase to hyphen-case
    .toLowerCase();                            // Convert to lowercase
}