export const fetchDNSServers = async (
  apiUrl: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ ip?: string; [key: string]: any } | null> => {
  try {

        if (typeof window === 'undefined') {
        console.error('fetchDNSServers should only run on the client');
        return null;
    }
    
    console.log(`Fetching DNS server info from: ${apiUrl}`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from ${apiUrl}: ${response.statusText}`);
      throw new Error('Failed to fetch DNS server info');
    }

    const contentType = response.headers.get('Content-Type') || '';

    // Check if response is JSON based on Content-Type
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log(`Received JSON data from ${apiUrl}:`, jsonData);
      return jsonData;
    } else {
      const textData = await response.text();
      console.log(`Received text data from ${apiUrl}:`, textData);
      return { ip: textData }; // Treat as plain text
    }
  } catch (error) {
    console.error(`DNS Server Fetch Error from ${apiUrl}:`, error);
    return null;
  }
};
