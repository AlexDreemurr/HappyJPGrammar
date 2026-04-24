export async function translateJapanese(text) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个日文翻译助手。用户会发送日文句子，你只需要回复对应的中文翻译，不要添加任何解释或多余内容。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`翻译请求失败：${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
