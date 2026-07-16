function getEnvVar(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  apiBaseUrl: getEnvVar(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
};
