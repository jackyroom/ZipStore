const dashboardController = require('./controllers/dashboard');
const resourcesController = require('./controllers/resources');
const categoriesController = require('./controllers/categories');
const uploadController = require('./controllers/upload');
const usersController = require('./controllers/users');
const settingsController = require('./controllers/settings');

module.exports = [
    // Dashboard
    ...dashboardController,

    // Resources & CMS
    ...resourcesController,

    // Categories
    ...categoriesController,

    // Upload API
    ...uploadController,

    // User Management (New)
    ...usersController,

    // System Settings (New)
    ...settingsController,

    // Test Route
    {
        path: '/test',
        method: 'get',
        handler: (req, res) => {
            res.send('Admin module is working! Modular architecture active.');
        }
    }
];
