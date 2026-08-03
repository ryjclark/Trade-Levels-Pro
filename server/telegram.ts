interface SendMessageParams {
  token: string;
  chatId: string;
  text: string;
  // "none" sends plain text (no parse_mode), which cannot fail on formatting.
  parseMode?: "MarkdownV2" | "HTML" | "none";
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

export async function sendTelegramMessage({
  token,
  chatId,
  text,
  parseMode = "MarkdownV2",
}: SendMessageParams): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text,
    disable_web_page_preview: true,
  };
  if (parseMode !== "none") body.parse_mode = parseMode;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TelegramResponse;

  if (!data.ok) {
    throw new Error(data.description || "Failed to send Telegram message");
  }

  return data;
}
