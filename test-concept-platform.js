const assert = require('assert');
const jsTopics = require('./topics');
const reactTopics = require('./topics-react');

console.log('--- Testing JavaScript Curriculum ---');
assert.strictEqual(jsTopics.length, 12, 'Must have 12 JavaScript categories');
let jsTopicCount = 0;
jsTopics.forEach(cat => {
  assert(cat.id && cat.category, 'Category must have id and category name');
  cat.topics.forEach(t => {
    jsTopicCount++;
    assert(t.id, `Topic ${t.title} missing id`);
    assert(t.title, `Topic missing title`);
    assert(t.importance && t.importance.length > 20, `Topic ${t.title} missing importance`);
    assert(t.mentalModel && t.mentalModel.length > 20, `Topic ${t.title} missing mentalModel`);
    assert(t.traps && t.traps.length > 10, `Topic ${t.title} missing traps`);
    assert(Array.isArray(t.interviewQuestions) && t.interviewQuestions.length > 0, `Topic ${t.title} missing interviewQuestions`);
    assert(t.defaultGuide && t.defaultGuide.length > 500, `Topic ${t.title} missing defaultGuide`);
  });
});
assert.strictEqual(jsTopicCount, 24, 'Must have 24 JavaScript topics');
console.log(`✅ All ${jsTopicCount} JavaScript topics passed validation with rich concept questions and guides!`);

console.log('\n--- Testing React Curriculum ---');
assert.strictEqual(reactTopics.length, 8, 'Must have 8 React categories');
let reactTopicCount = 0;
reactTopics.forEach(cat => {
  assert(cat.id && cat.category, 'Category must have id and category name');
  cat.topics.forEach(t => {
    reactTopicCount++;
    assert(t.id, `Topic ${t.title} missing id`);
    assert(t.title, `Topic missing title`);
    assert(t.importance && t.importance.length > 20, `Topic ${t.title} missing importance`);
    assert(t.mentalModel && t.mentalModel.length > 20, `Topic ${t.title} missing mentalModel`);
    assert(t.traps && t.traps.length > 10, `Topic ${t.title} missing traps`);
    assert(Array.isArray(t.interviewQuestions) && t.interviewQuestions.length > 0, `Topic ${t.title} missing interviewQuestions`);
    assert(t.defaultGuide && t.defaultGuide.length > 500, `Topic ${t.title} missing defaultGuide`);
  });
});
assert.strictEqual(reactTopicCount, 19, 'Must have 19 React topics');
console.log(`✅ All ${reactTopicCount} React topics passed validation with rich concept questions and guides!`);

console.log('\n🎉 ALL CONCEPT PLATFORM TESTS PASSED SUCCESSFULLY!');
