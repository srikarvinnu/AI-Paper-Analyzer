const API_URL =
  "https://ai-paper-analyzer-production.up.railway.app";

export async function uploadPDF(
  file: File,
  conversationId: number
) {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );
  formData.append(
  "conversation_id",
  String(conversationId)
);

  const response = await fetch(
    `${API_URL}/index-pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
}

export async function askQuestion(
  conversationId: number,
  question: string
) {

  const response = await fetch(
  `${API_URL}/ask`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      question,
    }),
  }
);

if (!response.ok) {
  throw new Error(
    `HTTP ${response.status}`
  );
}

return response.json();
}
export async function getConversations(
  email: string
) {
  const response = await fetch(
  `${API_URL}/conversations?user_email=${email}`
)

  return response.json();

}

export async function getConversationMessages(
  conversationId: number
) {

  const response = await fetch(
    `${API_URL}/conversation/${conversationId}`
  );

  return response.json();

}
export async function createConversation(
  title: string,
  userEmail: string
) {

  const response = await fetch(
    `${API_URL}/conversation`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
  title,
  user_email: userEmail,
}),
    }
  );

  return response.json();

}
export async function deleteConversation(
  conversationId: number
) {

  const response =
    await fetch(
      `${API_URL}/conversation/${conversationId}`,
      {
        method: "DELETE",
      }
    );

  return response.json();

}
export async function renameConversation(
  conversationId: number,
  title: string
) {

  const response = await fetch(
    `${API_URL}/conversation/${conversationId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    }
  );

  return response.json();

}