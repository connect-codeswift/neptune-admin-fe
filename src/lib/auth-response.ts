type TokenCarrier = Record<string, unknown>;

/** Read accessToken from flat auth responses (camelCase or PascalCase). */
export function extractAccessToken(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const record = data as TokenCarrier;
  const direct =
    readString(record.accessToken) ?? readString(record.AccessToken);
  if (direct) return direct;

  const nested = record.dataModel;
  if (nested && typeof nested === "object") {
    const model = nested as TokenCarrier;
    return readString(model.accessToken) ?? readString(model.AccessToken);
  }

  return undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  return undefined;
}
