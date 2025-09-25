/**
 * Script básico de testing para endpoints MVP
 * Ejecutar con: node tests/basic-test.js
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'http://fedora:3000';
let globalTokens = {
  accessToken: '',
  refreshToken: ''
};

// Función helper para hacer requests HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Función para parsing de URL
function parseUrl(url) {
  const urlObj = new URL(url);
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search
  };
}

// Test 1: Registrar usuario
async function testRegister() {
  console.log('🧪 Testing: Register User');
  
  const userData = {
    name: "Test User",
    identification: "12345678",
    email: "test@example.com",
    password: "SecurePassword123",
    phone: "+1234567890",
    address: "123 Test Street",
    type_user: "student"
  };
  
  const url = parseUrl(`${BASE_URL}/api/auth/register`);
  const options = {
    ...url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(userData))
    }
  };
  
  try {
    const response = await makeRequest(options, userData);
    
    if (response.statusCode === 201) {
      console.log('✅ Register test PASSED');
      console.log('   Response:', response.body.msg);
    } else {
      console.log('❌ Register test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Register test ERROR:', error.message);
  }
  
  console.log('');
}

// Test 2: Login
async function testLogin() {
  console.log('🧪 Testing: Login User');
  
  const loginData = {
    email: "test@example.com",
    password: "SecurePassword123"
  };
  
  const url = parseUrl(`${BASE_URL}/api/auth/login`);
  const options = {
    ...url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
    }
  };
  
  try {
    const response = await makeRequest(options, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Login test PASSED');
      console.log('   Response:', response.body.msg);
      
      // Guardar tokens para tests posteriores
      globalTokens.accessToken = response.body.accessToken;
      globalTokens.refreshToken = response.body.refreshToken;
      console.log('   Tokens saved for next tests');
    } else {
      console.log('❌ Login test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Login test ERROR:', error.message);
  }
  
  console.log('');
}

// Test 3: Get Profile (requiere autenticación)
async function testGetProfile() {
  console.log('🧪 Testing: Get Profile (Protected)');
  
  if (!globalTokens.accessToken) {
    console.log('❌ No access token available. Skipping test.');
    console.log('');
    return;
  }
  
  const url = parseUrl(`${BASE_URL}/api/profile`);
  const options = {
    ...url,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${globalTokens.accessToken}`
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Get Profile test PASSED');
      console.log('   User:', response.body.user.name);
    } else {
      console.log('❌ Get Profile test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Get Profile test ERROR:', error.message);
  }
  
  console.log('');
}

// Test 4: Probar acceso sin token (debe fallar)
async function testUnauthorizedAccess() {
  console.log('🧪 Testing: Unauthorized Access (Should Fail)');
  
  const url = parseUrl(`${BASE_URL}/api/profile`);
  const options = {
    ...url,
    method: 'GET',
    headers: {}
  };
  
  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 401) {
      console.log('✅ Unauthorized Access test PASSED (correctly blocked)');
      console.log('   Response:', response.body.msg || response.body);
    } else {
      console.log('❌ Unauthorized Access test FAILED (should have been blocked)');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Unauthorized Access test ERROR:', error.message);
  }
  
  console.log('');
}

// Test 5: Logout
async function testLogout() {
  console.log('🧪 Testing: Logout');
  
  if (!globalTokens.accessToken) {
    console.log('❌ No access token available. Skipping test.');
    console.log('');
    return;
  }
  
  const url = parseUrl(`${BASE_URL}/api/auth/logout`);
  const options = {
    ...url,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${globalTokens.accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Logout test PASSED');
      console.log('   Response:', response.body.msg);
    } else {
      console.log('❌ Logout test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Logout test ERROR:', error.message);
  }
  
  console.log('');
}

// Función principal de testing
async function runTests() {
  console.log('🚀 Iniciando tests básicos para User Management API MVP');
  console.log('='.repeat(60));
  console.log('');
  
  console.log('⚠️  NOTA: Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  console.log('   Ejecuta: npm run dev');
  console.log('');
  
  // Esperar un poco para que el usuario lea la nota
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await testRegister();
    await testLogin();
    await testGetProfile();
    await testUnauthorizedAccess();
    await testLogout();
    
    console.log('='.repeat(60));
    console.log('🎉 Tests completados!');
    console.log('');
    console.log('💡 Para testing más avanzado:');
    console.log('   - Importa postman-collection.json en Postman/Thunder Client');
    console.log('   - Revisa manual-testing-guide.js para más casos de prueba');
    console.log('   - Considera instalar jest y supertest para testing automatizado');
    
  } catch (error) {
    console.log('💥 Error general en testing:', error.message);
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };