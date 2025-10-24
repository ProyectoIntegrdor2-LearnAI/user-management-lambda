/**
 * Script básico de testing para endpoints MVP
 * Ejecutar con: node tests/basic-test.js
 */

import https from 'node:https';
import http from 'node:http';

const BASE_URL = 'http://fedora:3000';
let globalTokens = {
  accessToken: '',
  refreshToken: ''
};

/**
 * Helper para hacer requests HTTP/HTTPS
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        let parsedBody = body;

        try {
          // Parsear solo si parece JSON
          if (contentType.includes('application/json')) {
            parsedBody = body ? JSON.parse(body) : {};
          }
        } catch (error) {
          return reject(new Error(`Failed to parse JSON: ${error.message}`));
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (data) {
      if (typeof data === 'object') {
        data = JSON.stringify(data);
        if (!options.headers) options.headers = {};
        options.headers['Content-Type'] = 'application/json';
      }
      req.write(data);
    }

    req.end();
  });
}

/**
 * Helper: parsear URL en formato usable para http.request
 */
function parseUrl(url) {
  const urlObj = new URL(url);
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search
  };
}

/**
 * Test 1: Registro de usuario
 */
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
    console.log('💥 Register test ERROR:', error.message);
  }

  console.log('');
}

/**
 * Test 2: Login de usuario
 */
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

      // Guardar tokens
      globalTokens.accessToken = response.body.accessToken;
      globalTokens.refreshToken = response.body.refreshToken;
      console.log('   Tokens saved for next tests');
    } else {
      console.log('❌ Login test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('💥 Login test ERROR:', error.message);
  }

  console.log('');
}

/**
 * Test 3: Obtener perfil (protegido)
 */
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
      console.log('   User:', response.body.user?.name || 'Unknown');
    } else {
      console.log('❌ Get Profile test FAILED');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('💥 Get Profile test ERROR:', error.message);
  }

  console.log('');
}

/**
 * Test 4: Acceso sin token (debe fallar)
 */
async function testUnauthorizedAccess() {
  console.log('🧪 Testing: Unauthorized Access (Should Fail)');

  const url = parseUrl(`${BASE_URL}/api/profile`);
  const options = {
    ...url,
    method: 'GET'
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
    console.log('💥 Unauthorized Access test ERROR:', error.message);
  }

  console.log('');
}

/**
 * Test 5: Logout
 */
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
    console.log('💥 Logout test ERROR:', error.message);
  }

  console.log('');
}

/**
 * Función principal de testing
 */
async function runTests() {
  console.log('🚀 Iniciando tests básicos para User Management API MVP');
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  console.log('   Ejecuta: npm run dev');
  console.log('');

  // Pausa breve para lectura
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
    console.log('   - Importa postman-collection.json en Postman o Thunder Client');
    console.log('   - Revisa manual-testing-guide.js');
    console.log('   - Considera usar Jest + Supertest para automatización completa');
  } catch (error) {
    console.log('💥 Error general en testing:', error.message);
  }
}

// Ejecutar directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  await runTests();
}

export { runTests };


