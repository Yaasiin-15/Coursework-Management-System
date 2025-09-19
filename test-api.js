const http = require('http');

async function testAPI() {
  try {
    // This is the new token from the create-test-user.js script
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODliOTQ3Y2VlODFhNDY5NzljZTI3ZWMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc1NTAyNzM3NSwiZXhwIjoxNzU1NjMyMTc1fQ.2idOyfXEFtZb6T9XH2HEHgNU-G4vRKhIb1LrzUnVMe4';
    
    console.log('Testing API endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/assignments',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:', data);
      });
    });

    req.on('error', (error) => {
      console.error('Error testing API:', error);
    });

    req.end();
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
