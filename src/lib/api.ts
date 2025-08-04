import { createBasicAuthHeader } from './auth';

export interface QARecord {
  id: string;
  question: string;
  answer: string;
}

export interface CreateQARecord {
  question: string;
  answer: string;
}

export interface UpdateQARecord extends CreateQARecord {
  id: string;
}

const BASE_URL = 'https://n8n.oleksandr.ceo/webhook/v1/qa';

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

const createAuthHeaders = (username: string, password: string) => ({
  'Authorization': createBasicAuthHeader(username, password),
  'Content-Type': 'application/json',
});

export const qaAPI = {
  async getAll(username: string, password: string): Promise<QARecord[]> {
    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: createAuthHeaders(username, password),
      });

      if (!response.ok) {
        throw new APIError(`Failed to fetch QA records: ${response.status} ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error while fetching QA records');
    }
  },

  async getById(id: string, username: string, password: string): Promise<QARecord> {
    try {
      const response = await fetch(`${BASE_URL}/?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: createAuthHeaders(username, password),
      });

      if (!response.ok) {
        throw new APIError(`Failed to fetch QA record: ${response.status} ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error while fetching QA record');
    }
  },

  async create(data: CreateQARecord, username: string, password: string): Promise<QARecord> {
    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'POST',
        headers: createAuthHeaders(username, password),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new APIError(`Failed to create QA record: ${response.status} ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error while creating QA record');
    }
  },

  async update(data: UpdateQARecord, username: string, password: string): Promise<QARecord> {
    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'PATCH',
        headers: createAuthHeaders(username, password),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new APIError(`Failed to update QA record: ${response.status} ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error while updating QA record');
    }
  },

  async delete(id: string, username: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: createAuthHeaders(username, password),
      });

      if (!response.ok) {
        throw new APIError(`Failed to delete QA record: ${response.status} ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error while deleting QA record');
    }
  },
};
