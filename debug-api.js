const axios = require('axios');
require('dotenv').config();

async function debugProductboardAPI() {
  console.log('=== PRODUCTBOARD API DEBUG ===');
  
  const API_TOKEN = process.env.PRODUCTBOARD_API_TOKEN;
  
  if (!API_TOKEN || API_TOKEN === 'test-token') {
    console.log('❌ No valid API token found. Please check your .env file.');
    console.log('Expected: PRODUCTBOARD_API_TOKEN=your_actual_token');
    return;
  }
  
  console.log('✅ API token found (length:', API_TOKEN.length, ')');
  console.log('Token starts with:', API_TOKEN.substring(0, 10) + '...');
  
  const apiClient = axios.create({
    baseURL: 'https://api.productboard.com',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-Version': '1',
      'Content-Type': 'application/json'
    }
  });
  
  try {
    console.log('\n=== MAKING API CALL ===');
    console.log('URL: https://api.productboard.com/notes');
    
    const response = await apiClient.get('/notes');
    
    console.log('✅ API call successful!');
    console.log('Status:', response.status);
    console.log('Response headers:', response.headers);
    
    console.log('\n=== RESPONSE STRUCTURE ===');
    console.log('Response data keys:', Object.keys(response.data));
    console.log('Response data type:', typeof response.data);
    
    if (response.data.data) {
      console.log('Data array length:', response.data.data.length);
      
      if (response.data.data.length > 0) {
        const firstNote = response.data.data[0];
        console.log('\n=== FIRST NOTE ANALYSIS ===');
        console.log('Note keys:', Object.keys(firstNote));
        console.log('Full note structure:', JSON.stringify(firstNote, null, 2));
        
        console.log('\n=== COMPANY FIELD ANALYSIS ===');
        console.log('Has company field:', 'company' in firstNote);
        console.log('Company value:', firstNote.company);
        console.log('Company type:', typeof firstNote.company);
        
        if (firstNote.company && typeof firstNote.company === 'object') {
          console.log('Company object keys:', Object.keys(firstNote.company));
          
          // Try to fetch company details using the company ID
          if (firstNote.company.id) {
            try {
              console.log('\n=== FETCHING COMPANY DETAILS ===');
              const companyResponse = await apiClient.get(`/companies/${firstNote.company.id}`);
              console.log('Company details response:', JSON.stringify(companyResponse.data, null, 2));
            } catch (companyError) {
              console.log('Error fetching company details:', companyError.response?.status, companyError.response?.data);
            }
          }
        }
        
        // Check for other potential company-related fields
        const potentialCompanyFields = ['organization', 'customer', 'account', 'client'];
        console.log('\n=== CHECKING FOR OTHER COMPANY-RELATED FIELDS ===');
        potentialCompanyFields.forEach(field => {
          if (field in firstNote) {
            console.log(`Found ${field}:`, firstNote[field]);
          }
        });
      }
    } else {
      console.log('No data array found in response');
    }
    
  } catch (error) {
    console.log('❌ API call failed');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.message);
    console.log('Error response data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This looks like an authentication error. Please check:');
      console.log('1. Your API token is correct');
      console.log('2. Your Productboard account has API access (Pro plan or higher)');
      console.log('3. The token has the necessary permissions');
    }
  }
}

debugProductboardAPI();