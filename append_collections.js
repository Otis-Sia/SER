const fs = require('fs');

const collectionHelpers = `

// -------------------------------------------------------------
// COLLECTION MANAGERS WRAPPERS
// -------------------------------------------------------------

export async function getProjects() { return getCmsCollection('projects'); }
export async function addProject(data) { return saveCmsDocument('projects', null, data); }
export async function updateProject(id, data) { return saveCmsDocument('projects', id, data); }
export async function deleteProject(id) { return deleteCmsDocument('projects', id); }

export async function getEvents() { return getCmsCollection('events'); }
export async function addEvent(data) { return saveCmsDocument('events', null, data); }
export async function updateEvent(id, data) { return saveCmsDocument('events', id, data); }
export async function deleteEvent(id) { return deleteCmsDocument('events', id); }

export async function getGalleryItems() { return getCmsCollection('gallery'); }
export async function addGalleryItem(data) { return saveCmsDocument('gallery', null, data); }
export async function updateGalleryItem(id, data) { return saveCmsDocument('gallery', id, data); }
export async function deleteGalleryItem(id) { return deleteCmsDocument('gallery', id); }

export async function getFaqs() { return getCmsCollection('faqs'); }
export async function addFaq(data) { return saveCmsDocument('faqs', null, data); }
export async function updateFaq(id, data) { return saveCmsDocument('faqs', id, data); }
export async function deleteFaq(id) { return deleteCmsDocument('faqs', id); }

export async function getProducts() { return getCmsCollection('products'); }
export async function addProduct(data) { return saveCmsDocument('products', null, data); }
export async function updateProduct(id, data) { return saveCmsDocument('products', id, data); }
export async function deleteProduct(id) { return deleteCmsDocument('products', id); }
`;

fs.appendFileSync('client/src/app/admin/actions.js', collectionHelpers);
console.log('Appended collection manager wrappers to actions.js');
