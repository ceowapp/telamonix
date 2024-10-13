import { google } from 'googleapis'; 

export async function POST(req: Request): Promise<Response> {
  try {
    const { accessToken, fileId } = await req.json();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const docs = google.docs({ version: 'v1', auth });
    const { data } = await docs.documents.get({ documentId: fileId });
    const text = data.body.content.reduce((accumulatedText, item) => {
      if (item.paragraph) {
        accumulatedText += item.paragraph.elements
          .map((element) => element.textRun?.content || '')
          .join('');
      }
      return accumulatedText; 
    }, '');
    return new Response(text, { status: 200 });
  } catch (error: any) {
    let status = 500;
    let errorMessage = "An unexpected error occurred";
    let errorCode = "unknown_error";
    let errorType = "internal_server_error";
    if (error.response) {
      status = error.response.status;
      errorMessage = error.response.data?.message || errorMessage; 
      errorCode = error.response.data?.code || errorCode;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ 
      error: errorMessage, 
      status, 
      code: errorCode,
      type: errorType
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}