const CACHE_NAME = 'folio-v1';

self.addEventListener('install', function(event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll([
'/',
'/index.html',
'/about.html',
'/admin.html'
]);
})
);
});

self.addEventListener('activate', function(event) {
event.waitUntil(
caches.keys().then(function(names) {
return Promise.all(
names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); })
);
})
);
});

self.addEventListener('fetch', function(event) {
event.respondWith(
caches.match(event.request).then(function(response) {
return response || fetch(event.request).catch(function() {
if (event.request.mode === 'navigate') {
return caches.match('/index.html');
}
});
})
);
});

self.addEventListener('message', function(event) {
if (event.data && event.data.type === 'AI_QUERY') {
var prompt = event.data.prompt || '';
var language = event.data.language || 'EN';

fetch('https://propitpilot.page.dev/api/folio', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify({
prompt: prompt,
language: language
})
})
.then(function(res) { return res.json(); })
.then(function(data) {
var responseText = data.response || data.answer || 'I apologize, I could not generate a response at this time. Please try again.';
self.clients.matchAll().then(function(clients) {
clients.forEach(function(client) {
client.postMessage({
type: 'AI_RESPONSE',
response: responseText
});
});
});
})
.catch(function() {
self.clients.matchAll().then(function(clients) {
clients.forEach(function(client) {
client.postMessage({
type: 'AI_RESPONSE',
response: 'Thank you for your question! Vaccines are one of the most important tools we have to protect our children. For specific questions, please visit your nearest primary health center where trained health workers can provide personalized guidance. Remember: a vaccinated child is a protected child!'
});
});
});
});
}
});