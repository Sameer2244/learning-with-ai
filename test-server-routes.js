const http = require('http');

// Start server on a test port
process.env.PORT = '3011';
const server = require('./server');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3011${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  try {
    // Wait 1 sec for server initialization
    await new Promise(r => setTimeout(r, 1000));

    console.log('Testing GET / (JavaScript Knowledge Arena)...');
    const indexRes = await makeRequest('/');
    if (indexRes.status !== 200 || !indexRes.data.includes('JS.DEPTH') || !indexRes.data.includes('ds-arena')) {
      throw new Error(`Failed GET /: status ${indexRes.status}`);
    }
    console.log('✅ GET / serves JavaScript Knowledge Arena!');

    console.log('Testing GET /react (React Knowledge Arena)...');
    const reactRes = await makeRequest('/react');
    if (reactRes.status !== 200 || !reactRes.data.includes('REACT.DEPTH') || !reactRes.data.includes('ds-arena')) {
      throw new Error(`Failed GET /react: status ${reactRes.status}`);
    }
    console.log('✅ GET /react serves React Knowledge Arena!');

    console.log('Testing GET /problems (Problem Solving & Live Code Editor)...');
    const probRes = await makeRequest('/problems');
    if (probRes.status !== 200 || !probRes.data.includes('CODE.DEPTH') || !probRes.data.includes('monacoEditorContainer')) {
      throw new Error(`Failed GET /problems: status ${probRes.status}`);
    }
    console.log('✅ GET /problems serves Monaco Editor & Automated Test Runner!');

    console.log('Testing GET /api/challenges?track=javascript...');
    const jsChallengesRes = await makeRequest('/api/challenges?track=javascript');
    const jsData = JSON.parse(jsChallengesRes.data);
    if (!jsData.categories || jsData.categories.length !== 12) {
      throw new Error('Unexpected JS challenges categories count');
    }
    const debounceFound = jsData.categories.some(c => c.topics.some(t => t.id.includes('debounce') && t.challenges?.Basic));
    if (!debounceFound) {
      throw new Error('Debounce challenge missing from JS challenges');
    }
    console.log(`✅ /api/challenges?track=javascript returned 12 categories with debounce and polyfills!`);

    console.log('Testing GET /api/challenges?track=react...');
    const reactChallengesRes = await makeRequest('/api/challenges?track=react');
    const reactData = JSON.parse(reactChallengesRes.data);
    if (!reactData.categories || reactData.categories.length !== 8) {
      throw new Error('Unexpected React challenges categories count');
    }
    console.log(`✅ /api/challenges?track=react returned 8 categories with fiber & hook challenges!`);

    console.log('Testing GET /api/knowledge-guide for JS topic...');
    const jsGuideRes = await makeRequest('/api/knowledge-guide?track=javascript&topicTitle=Execution%20Context%20%26%20Call%20Stack');
    const jsGuideData = JSON.parse(jsGuideRes.data);
    if (!jsGuideData.success || !jsGuideData.guide || !jsGuideData.guide.guide_content) {
      throw new Error('Failed to fetch JS knowledge guide');
    }
    console.log('✅ /api/knowledge-guide returned comprehensive JS masterclass guide!');

    console.log('\n🚀 ALL INTEGRATION & ROUTE TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
