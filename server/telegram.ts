interface SendMessageParams {
  token: string;
  chatId: string;
  text: string;
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
  text
}: SendMessageParams): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    })
  });

  const data = await response.json() as TelegramResponse;
  
  if (!data.ok) {
    throw new Error(data.description || "Failed to send Telegram message");
  }

  return data;
}
