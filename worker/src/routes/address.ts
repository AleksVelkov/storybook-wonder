import { Hono } from 'hono';
import { Env } from '../types';

const address = new Hono<{ Bindings: Env }>();

// Lookup address by Dutch postcode and house number
address.get('/lookup', async (c) => {
  const postcode = c.req.query('postcode');
  const number = c.req.query('number');

  if (!postcode || !number) {
    return c.json({ error: 'Postcode and number are required' }, 400);
  }

  // Clean postcode (remove spaces)
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();

  // Validate Dutch postcode format (1234AB)
  const postcodeRegex = /^[1-9][0-9]{3}[A-Z]{2}$/;
  if (!postcodeRegex.test(cleanPostcode)) {
    return c.json({ error: 'Invalid postcode format. Use format: 1234AB' }, 400);
  }

  try {
    // Call OpenPostcode.nl API (correct endpoint)
    const apiUrl = `https://openpostcode.nl/api/address?postcode=${cleanPostcode}&huisnummer=${number}`;
    console.log('Looking up address:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('API Response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ error: 'Address not found for this postcode and number' }, 404);
      }
      const errorText = await response.text();
      console.error('OpenPostcode API error:', response.status, errorText);
      return c.json({ error: 'Failed to lookup address' }, 500);
    }

    const data = await response.json();
    console.log('Address found:', data);
    
    // OpenPostcode.nl returns Dutch field names
    // Map them to our expected format
    return c.json({
      success: true,
      address: {
        postcode: data.postcode || cleanPostcode,
        number: data.huisnummer || number,
        street: data.straat || '',
        city: data.woonplaats || '',
        municipality: data.gemeente || '',
        province: data.provincie || ''
      }
    });
  } catch (error: any) {
    console.error('Error looking up address:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: 'Failed to lookup address', details: error.message }, 500);
  }
});

export default address;

