import axios from 'axios';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

export class LinkedInAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };
  }

  async getProfile(): Promise<LinkedInProfile> {
    try {
      // Fetch basic profile
      const profileResponse = await axios.get(`${LINKEDIN_API_BASE}/me`, {
        headers: this.getHeaders(),
      });

      // Fetch email
      const emailResponse = await axios.get(
        `${LINKEDIN_API_BASE}/emailAddress?q=members&projection=(elements*(handle~))`,
        { headers: this.getHeaders() }
      );

      const profile = profileResponse.data;
      const email = emailResponse.data.elements[0]['handle~']?.emailAddress;

      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        profilePicture: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        email,
      };
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw new Error('Failed to fetch LinkedIn profile');
    }
  }

  async publishPost(content: string): Promise<string> {
    try {
      const postData = {
        author: `urn:li:person:${await this.getPersonId()}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      const response = await axios.post(`${LINKEDIN_API_BASE}/ugcPosts`, postData, {
        headers: this.getHeaders(),
      });

      return response.data.id;
    } catch (error) {
      console.error('Error publishing LinkedIn post:', error);
      throw new Error('Failed to publish LinkedIn post');
    }
  }

  private async getPersonId(): Promise<string> {
    const response = await axios.get(`${LINKEDIN_API_BASE}/me`, {
      headers: this.getHeaders(),
    });
    return response.data.id;
  }
}

export const generateLinkedInAuthUrl = (): string => {
  const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
  const scope = 'openid profile email';
  const state = Math.random().toString(36).substring(7);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: scope,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; refresh_token?: string }> => {
  try {
    const response = await axios.post('/api/auth/linkedin/token', {
      code,
      redirect_uri: import.meta.env.VITE_LINKEDIN_REDIRECT_URI,
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code');
  }
};
