# Phase 1 OpenAI compatibility verification

## Result

Verified on 2026-10-30 using the official `openai` Node.js SDK and the
assessment API key supplied for this project. The key was supplied only through
the process environment and was not written to the repository, output, or
logs.

The selected approach is:

- SDK: `openai`
- API: Chat Completions
- Model: `gpt-audio-1.5`
- Input: `input_audio` content part with base64-encoded WAV bytes
- Input modality: direct audio
- Output modality: text (`modalities: ["text"]`)
- Tool mode: Chat Completions `tools` plus `tool_choice`

## Request shape

```ts
const response = await client.chat.completions.create({
  model: "gpt-audio-1.5",
  modalities: ["text"],
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Use the list_products function now." },
        {
          type: "input_audio",
          input_audio: { data: base64Audio, format: "wav" },
        },
      ],
    },
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "list_products",
        description: "List products in the store catalog.",
        parameters: {
          type: "object",
          properties: {
            keyword: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
  ],
  tool_choice: {
    type: "function",
    function: { name: "list_products" },
  },
  store: false,
});
```

The final implementation should use automatic tool selection. The explicit
`tool_choice` above was used only to prove the tool-call response shape.

A follow-up live request on 2026-10-30 used the same direct audio input with
`modalities: ["text"]` and no output-audio configuration. It succeeded with a
text response, so the implementation uses text-only output and does not rely
on `message.audio.transcript`.

## Observed response shape

The live request returned a successful response with these relevant values:

```json
{
  "model": "gpt-audio-1.5",
  "finishReason": "stop",
  "hasMessage": true,
  "hasToolCall": true,
  "toolCallIdPresent": true,
  "toolName": "list_products",
  "argumentsJson": "{}"
}
```

The first request used the same audio and tool declaration with
`tool_choice: "auto"`. The supplied OpenAI sample recording did not contain a
product request, so the model correctly returned no tool call. The second
request forced `list_products` and confirmed that the same audio-capable model
returns a real tool call with an ID, function name, and JSON arguments.

## Conclusion

The assessment's required architecture is technically viable with this
model/API approach:

```text
uploaded audio -> base64 input_audio -> gpt-audio-1.5
               -> tool call -> local function -> tool result -> model
```

No transcription service was used. The tool loop and customer-facing route
remain for later phases.

## Limitations

- This verifies request compatibility and the tool-call response shape, not the
  complete multi-turn tool-result loop.
- The test used the official OpenAI sample WAV because no assessment sample
  recording existed yet.
- Access, quotas, model behavior, and pricing may vary after the exposed key
  is rotated or its spending limit changes.
