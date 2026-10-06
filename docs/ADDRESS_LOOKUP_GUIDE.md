# Dutch Address Lookup Integration - OpenPostcode.nl

## 🎯 Overview

Integrated automatic Dutch address lookup using the free [OpenPostcode.nl](https://openpostcode.nl/) API. Customers only need to enter their postcode and house number, and the system automatically resolves the street name and city.

---

## ✅ Features Implemented

### 1. **Automatic Address Resolution**
- ✅ User enters only postcode (e.g., "1234AB") and house number (e.g., "42")
- ✅ Click "Find Address" button
- ✅ System automatically fills in street name and city
- ✅ Street and city fields become **read-only** after resolution
- ✅ Real-time validation with OpenPostcode.nl API

### 2. **Backend API Endpoint**
- ✅ `/api/address/lookup` endpoint
- ✅ Validates Dutch postcode format (1234AB)
- ✅ Proxies requests to OpenPostcode.nl
- ✅ Handles errors gracefully
- ✅ Returns formatted address data

### 3. **User Experience**
- ✅ Beautiful blue-highlighted address section
- ✅ Clear instructions in Dutch and English
- ✅ Loading state during lookup
- ✅ Success/error toast notifications
- ✅ Disabled fields until address is resolved
- ✅ Visual feedback for resolved addresses

---

## 📋 How It Works

### User Flow:

```
1. User adds items to cart
   ↓
2. Clicks "Checkout"
   ↓
3. Fills in personal details (name, email, phone)
   ↓
4. In "Address Details" section:
   - Enters postcode: "1234AB"
   - Enters house number: "42"
   ↓
5. Clicks "🔍 Zoek Adres" (Find Address)
   ↓
6. System calls OpenPostcode.nl API
   ↓
7. If found:
   - Street name appears (read-only)
   - City name appears (read-only)
   - Fields are grayed out
   - Success message shown
   ↓
8. User completes checkout
```

---

## 🔧 Technical Implementation

### Backend (`worker/src/routes/address.ts`):

```typescript
GET /api/address/lookup?postcode=1234AB&number=42

// Validates postcode format
// Calls: https://api.openpostcode.nl/rest/1234AB/42
// Returns formatted address data
```

**Response Format**:
```json
{
  "success": true,
  "address": {
    "postcode": "1234AB",
    "number": "42",
    "street": "Hoofdstraat",
    "city": "Amsterdam",
    "municipality": "Amsterdam",
    "province": "Noord-Holland"
  }
}
```

### Frontend (`src/pages/Cart.tsx`):

**New State**:
- `house_number` - House number input
- `isLookingUpAddress` - Loading state
- `addressResolved` - Whether address was successfully looked up

**New Function**:
- `handleAddressLookup()` - Calls API and fills address fields

**Validation**:
- Requires postcode and house number before lookup
- Requires address to be resolved before checkout
- Shows error if address not found

---

## 🎨 UI Components

### Address Lookup Section:

```
┌─────────────────────────────────────┐
│ 📋 Adresgegevens                    │
│                                     │
│ Vul je postcode en huisnummer in om│
│ je adres automatisch op te zoeken. │
│                                     │
│ [Postcode]     [Huisnummer]        │
│ 1234 AB        42                   │
│                                     │
│ [🔍 Zoek Adres]                     │
│                                     │
│ ──────────────────────────────      │
│                                     │
│ Straatnaam (niet bewerkbaar)       │
│ █ Hoofdstraat                       │
│                                     │
│ Plaats (niet bewerkbaar)            │
│ █ Amsterdam                         │
└─────────────────────────────────────┘
```

**Features**:
- Blue-highlighted section
- Clear instructions
- Two-column layout for postcode and number
- Full-width lookup button
- Read-only fields appear after successful lookup
- Grayed-out background for non-editable fields

---

## 📝 Validation Rules

### Postcode Format:
- **Pattern**: `1234AB` (4 digits + 2 letters)
- **Example Valid**: `1012AB`, `2611AA`, `3511LX`
- **Example Invalid**: `123AB`, `12345AB`, `1234`, `AB1234`

### Required Fields:
1. ✅ Postcode
2. ✅ House number
3. ✅ Address must be resolved (street & city filled)

### Error Handling:
- Invalid postcode format → Error message
- Address not found → Toast error notification
- Network error → User-friendly error message
- Fields reset if postcode/number changed after resolution

---

## 🌍 Multi-Language Support

### Dutch (NL):
- "Adresgegevens"
- "Postcode"
- "Huisnummer"
- "🔍 Zoek Adres"
- "Vul je postcode en huisnummer in om je adres automatisch op te zoeken"
- "Adres gevonden!"
- "Adres niet gevonden"
- "Straatnaam"
- "Plaats"

### English (EN):
- "Address Details"
- "Postcode"
- "House Number"
- "🔍 Find Address"
- "Enter your postcode and house number to automatically find your address"
- "Address found!"
- "Address not found"
- "Street Name"
- "City"

---

## 🔍 OpenPostcode.nl API

### About:
- **Free API** for Dutch address validation
- No API key required
- No rate limits for reasonable use
- Official Dutch postal code data
- URL: https://openpostcode.nl/

### API Endpoint:
```
GET https://api.openpostcode.nl/rest/{postcode}/{number}
```

**Example Request**:
```
GET https://api.openpostcode.nl/rest/1012AB/1
```

**Example Response**:
```json
{
  "postcode": "1012AB",
  "number": "1",
  "street": "Amstel",
  "city": "Amsterdam",
  "municipality": "Amsterdam",
  "province": "Noord-Holland"
}
```

### Error Responses:
- `404` - Address not found
- `400` - Invalid format
- `500` - Server error

---

## 🧪 Testing

### Test with Real Dutch Addresses:

1. **Amsterdam Central**:
   - Postcode: `1012AB`
   - Number: `1`
   - Expected: Amstel, Amsterdam

2. **Rotterdam**:
   - Postcode: `3011AA`
   - Number: `1`
   - Expected: Address in Rotterdam

3. **Weesp** (Your location):
   - Postcode: `1381AB`
   - Number: `1`
   - Expected: Address in Weesp

### Test Scenarios:

**Scenario 1: Valid Address**
1. Enter valid postcode and number
2. Click "Find Address"
3. ✅ Street and city appear
4. ✅ Fields become read-only
5. ✅ Success message shown

**Scenario 2: Invalid Address**
1. Enter invalid postcode
2. Click "Find Address"
3. ✅ Error message shown
4. ✅ Fields remain empty and editable

**Scenario 3: Change After Resolution**
1. Resolve address successfully
2. Change postcode or number
3. ✅ Resolution flag resets
4. ✅ Must lookup again before checkout

---

## 📊 Full Order Flow with Address

```
Cart → Checkout
  ↓
Personal Details
  - Name
  - Email
  - Phone
  ↓
Address Lookup
  - Postcode: 1234AB
  - Number: 42
  - Click: Find Address
  ↓
Auto-filled (Read-only)
  - Street: Hoofdstraat
  - City: Amsterdam
  ↓
Country
  - Nederland (default)
  ↓
Place Order
  ↓
Order Created with Full Address:
  - "Hoofdstraat 42"
  - "1234AB Amsterdam"
  - "Nederland"
```

---

## 🎯 Benefits

### For Customers:
- ✅ Faster checkout (less typing)
- ✅ No spelling mistakes in addresses
- ✅ Guaranteed accurate addresses
- ✅ Better delivery success rate

### For You:
- ✅ Validated addresses only
- ✅ Standardized format
- ✅ Fewer delivery issues
- ✅ Professional checkout experience

---

## 🚀 Deployment Status

✅ **Backend Deployed**:
- Worker Version: `3ef482bf-cb0a-4d8a-a35f-0cd1e915e8a5`
- Address endpoint: `/api/address/lookup`
- OpenPostcode.nl integration active

✅ **Frontend Built**:
- New checkout form with address lookup
- Read-only fields after resolution
- Multi-language support
- Ready to deploy to Cloudflare Pages

⏳ **Needs Push**:
```bash
git push
```

---

## 📞 Support

### OpenPostcode.nl:
- Website: https://openpostcode.nl/
- Free to use
- No registration required
- Usage terms: https://openpostcode.nl/gebruiksvoorwaarden

### Implementation:
- Backend: `worker/src/routes/address.ts`
- Frontend: `src/pages/Cart.tsx` (checkout dialog)
- Documentation: This file

---

## ✅ Summary

**What's New**:
- ✨ Automatic Dutch address lookup
- 🔍 OpenPostcode.nl integration
- 🔒 Read-only resolved fields
- ✅ Validated addresses only
- 🌍 Multi-language support

**User Experience**:
1. Enter postcode + number
2. Click "Find Address"
3. Street and city auto-fill
4. Complete checkout

**Technical**:
- Free API (no key needed)
- Backend proxy for security
- Error handling
- Format validation
- Real-time lookup

Push to GitHub and your customers will enjoy the streamlined address entry! 🎉


