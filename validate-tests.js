const jsTopics = require('./topics');
const reactTopics = require('./topics-react');

function testCatalog(catalog, name) {
  let totalQuestions = 0;
  let totalTestCases = 0;
  catalog.forEach(cat => {
    cat.topics.forEach(t => {
      ['Basic', 'Medium', 'Hard'].forEach(diff => {
        const q = t.challenges[diff];
        if (!q) throw new Error('Missing ' + diff + ' in ' + t.title);
        if (!q.testCases || q.testCases.length === 0) throw new Error('Missing test cases in ' + t.title + ' - ' + diff);
        totalQuestions++;
        totalTestCases += q.testCases.length;
        q.testCases.forEach((tc, idx) => {
          try {
            new Function('deepEqual', 'return (async () => { ' + tc.testFn + ' })();');
          } catch (e) {
            throw new Error('Syntax error in ' + t.title + ' [' + diff + '] testCase ' + idx + ': ' + e.message);
          }
        });
      });
    });
  });
  console.log(`[${name}] ${totalQuestions} questions verified with ${totalTestCases} test cases!`);
}

testCatalog(jsTopics, 'JavaScript');
testCatalog(reactTopics, 'React');
