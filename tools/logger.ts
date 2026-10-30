export function logToolCall(
  toolName: string,
  argumentsValue: unknown,
  result: unknown,
): void {
  console.log(
    JSON.stringify({
      event: "tool_call",
      timestamp: new Date().toISOString(),
      toolName,
      arguments: argumentsValue,
      result,
    }),
  );
}
