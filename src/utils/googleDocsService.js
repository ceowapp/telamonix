const { google } = require('googleapis');

exports.readGoogleDoc = async (fileId, accessToken) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const docs = google.docs({ version: 'v1', auth });

  try {
    const { data } = await docs.documents.get({ documentId: fileId });
    
    // Extract text from the document content
    return data.body.content.reduce((text, item) => {
      if (item.paragraph) {
        text += item.paragraph.elements
          .map((element) => element.textRun?.content || '')
          .join('');
      }
      return text;
    }, '');
  } catch (error) {
    console.error('Error reading Google Doc:', error);
    throw new Error('Failed to read Google Doc'); 
  }
};