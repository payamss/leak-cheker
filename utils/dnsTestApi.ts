export const fetchDNSServers = async (
  apiUrl: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ ip?: string; [key: string]: any } | null> => {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch DNS server info');
    }

    const contentType = response.headers.get('Content-Type') || '';

    // Check if response is JSON based on Content-Type
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      return jsonData;
    } else {
      const textData = await response.text();
      return { ip: textData }; // Treat as plain text
    }
  } catch (error) {
    console.error('DNS Server Fetch Error:', error);
    return null;
  }
};
