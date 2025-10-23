const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const { sanitizeInput, validateEmail, hashPassword, verifyPassword, run, get, all, withTransaction } = require('./db/utils');

const app = express();
app.use(express.json());
app.use(cookieSession({
    name: 'session',
    keys: ['journey4life-secret'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Auth middleware
function checkAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    next();
}

function checkAdminAuth(req, res, next) {
    if (!req.session.adminId) {
        return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    next();
}

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }
        
        if (!validateEmail(email)) {
            return res.json({ success: false, message: 'Invalid email format' });
        }
        
        if (password.length < 6) {
            return res.json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = hashPassword(password);
        const result = await run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.json({ success: true, message: 'Registration successful', data: { user_id: result.id } });
    } catch (err) {
        res.json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const user = await get('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
        
        if (!user || !verifyPassword(password, user.password)) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user_id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.json({ success: false, message: 'Login failed: ' + err.message });
    }
});

app.post('/api/auth/admin_login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === 'admin@journey4life.com' && password === 'admin123') {
            req.session.adminId = 1;
            req.session.adminEmail = email;
            
            res.json({
                success: true,
                message: 'Admin login successful',
                data: { admin_id: 1, email }
            });
        } else {
            res.json({ success: false, message: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Admin login failed: ' + err.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session = null;
    res.json({ success: true, message: 'Logged out successfully' });
});

// Destinations endpoints
app.get('/api/destinations', async (req, res) => {
    try {
        const { action } = req.query;
        
        switch (action) {
            case 'get_all':
                const destinations = await all(
                    "SELECT * FROM destinations WHERE status = 'active' ORDER BY name"
                );
                res.json({ success: true, message: 'Destinations retrieved', data: destinations });
                break;

            case 'get_by_id':
                const id = parseInt(req.query.id);
                const destination = await get(
                    "SELECT * FROM destinations WHERE id = ? AND status = 'active'",
                    [id]
                );
                
                if (!destination) {
                    return res.json({ success: false, message: 'Destination not found' });
                }
                
                res.json({ success: true, message: 'Destination retrieved', data: destination });
                break;

            case 'search':
                const query = sanitizeInput(req.query.query);
                const searchResults = await all(
                    "SELECT * FROM destinations WHERE (name LIKE ? OR location LIKE ? OR description LIKE ?) AND status = 'active' ORDER BY name",
                    [`%${query}%`, `%${query}%`, `%${query}%`]
                );
                res.json({ success: true, message: 'Search results', data: searchResults });
                break;

            default:
                res.json({ success: false, message: 'Invalid action' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Database error: ' + err.message });
    }
});

app.post('/api/destinations', checkAdminAuth, async (req, res) => {
    try {
        const { action } = req.body;
        
        switch (action) {
            case 'create': {
                const { name, location, description, image_url, rating } = req.body;
                
                if (!name || !location || !description) {
                    return res.json({ success: false, message: 'Name, location, and description are required' });
                }
                
                const result = await run(
                    'INSERT INTO destinations (name, location, description, image_url, rating) VALUES (?, ?, ?, ?, ?)',
                    [name, location, description, image_url, rating]
                );
                
                res.json({ success: true, message: 'Destination created successfully', data: { id: result.id } });
                break;
            }
            
            case 'update': {
                const { id, name, location, description, image_url, rating } = req.body;
                
                await run(
                    'UPDATE destinations SET name = ?, location = ?, description = ?, image_url = ?, rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [name, location, description, image_url, rating, id]
                );
                
                res.json({ success: true, message: 'Destination updated successfully' });
                break;
            }
            
            case 'delete': {
                const { id } = req.body;
                
                await run(
                    "UPDATE destinations SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [id]
                );
                
                res.json({ success: true, message: 'Destination deleted successfully' });
                break;
            }
            
            default:
                res.json({ success: false, message: 'Invalid action' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Operation failed: ' + err.message });
    }
});

// Itineraries endpoints
app.get('/api/itineraries', async (req, res) => {
    try {
        const { action } = req.query;
        
        switch (action) {
            case 'get_all':
                const itineraries = await all(`
                    SELECT i.*, u.name as creator_name 
                    FROM itineraries i 
                    LEFT JOIN users u ON i.user_id = u.id 
                    WHERE i.status = 'active' 
                    ORDER BY i.created_at DESC
                `);
                res.json({ success: true, message: 'Itineraries retrieved', data: itineraries });
                break;

            case 'get_by_id': {
                const id = parseInt(req.query.id);
                const itinerary = await get(`
                    SELECT i.*, u.name as creator_name 
                    FROM itineraries i 
                    LEFT JOIN users u ON i.user_id = u.id 
                    WHERE i.id = ? AND i.status = 'active'
                `, [id]);
                
                if (!itinerary) {
                    return res.json({ success: false, message: 'Itinerary not found' });
                }
                
                const destinations = await all(`
                    SELECT d.* 
                    FROM itinerary_destinations id 
                    JOIN destinations d ON id.destination_id = d.id 
                    WHERE id.itinerary_id = ?
                `, [id]);
                
                itinerary.destinations = destinations;
                res.json({ success: true, message: 'Itinerary retrieved', data: itinerary });
                break;
            }

            case 'get_user_itineraries':
                if (!req.session.userId) {
                    return res.json({ success: false, message: 'Authentication required' });
                }
                
                const userItineraries = await all(
                    "SELECT * FROM itineraries WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC",
                    [req.session.userId]
                );
                res.json({ success: true, message: 'User itineraries retrieved', data: userItineraries });
                break;

            default:
                res.json({ success: false, message: 'Invalid action' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Database error: ' + err.message });
    }
});

app.post('/api/itineraries', checkAuth, async (req, res) => {
    try {
        const { action } = req.body;
        
        switch (action) {
            case 'create': {
                const { title, description, duration, budget, destinations } = req.body;
                
                if (!title || !description || !duration) {
                    return res.json({ success: false, message: 'Title, description, and duration are required' });
                }

                const result = await withTransaction(async (db) => {
                    const { lastID } = await new Promise((resolve, reject) => {
                        db.run(
                            "INSERT INTO itineraries (user_id, title, description, duration, budget, status) VALUES (?, ?, ?, ?, ?, 'pending')",
                            [req.session.userId, title, description, duration, budget],
                            function(err) {
                                if (err) reject(err);
                                resolve({ lastID: this.lastID });
                            }
                        );
                    });

                    if (destinations && destinations.length) {
                        const stmt = db.prepare('INSERT INTO itinerary_destinations (itinerary_id, destination_id) VALUES (?, ?)');
                        destinations.forEach(destId => {
                            stmt.run([lastID, destId]);
                        });
                        stmt.finalize();
                    }

                    return { id: lastID };
                });

                res.json({ success: true, message: 'Itinerary created successfully', data: result });
                break;
            }

            case 'update': {
                const { id, title, description, duration, budget, destinations } = req.body;

                await withTransaction(async (db) => {
                    await new Promise((resolve, reject) => {
                        db.run(
                            'UPDATE itineraries SET title = ?, description = ?, duration = ?, budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                            [title, description, duration, budget, id, req.session.userId],
                            function(err) {
                                if (err) reject(err);
                                resolve();
                            }
                        );
                    });

                    await new Promise((resolve, reject) => {
                        db.run('DELETE FROM itinerary_destinations WHERE itinerary_id = ?', [id], err => {
                            if (err) reject(err);
                            resolve();
                        });
                    });

                    if (destinations && destinations.length) {
                        const stmt = db.prepare('INSERT INTO itinerary_destinations (itinerary_id, destination_id) VALUES (?, ?)');
                        destinations.forEach(destId => {
                            stmt.run([id, destId]);
                        });
                        stmt.finalize();
                    }
                });

                res.json({ success: true, message: 'Itinerary updated successfully' });
                break;
            }

            case 'approve':
                if (!req.session.adminId) {
                    return res.json({ success: false, message: 'Admin authentication required' });
                }

                await run(
                    "UPDATE itineraries SET status = 'active', approved_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [req.body.id]
                );
                res.json({ success: true, message: 'Itinerary approved successfully' });
                break;

            case 'reject':
                if (!req.session.adminId) {
                    return res.json({ success: false, message: 'Admin authentication required' });
                }

                await run(
                    "UPDATE itineraries SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [req.body.reason, req.body.id]
                );
                res.json({ success: true, message: 'Itinerary rejected successfully' });
                break;

            case 'delete':
                await run(
                    "UPDATE itineraries SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
                    [req.body.id, req.session.userId]
                );
                res.json({ success: true, message: 'Itinerary deleted successfully' });
                break;

            default:
                res.json({ success: false, message: 'Invalid action' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Operation failed: ' + err.message });
    }
});

// Serve static site files (so Electron can load via HTTP)
app.use(express.static(path.join(__dirname)));

// Fallback for SPA / navigations
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function startServer(port = process.env.PORT || 3333) {
    return new Promise((resolve, reject) => {
        const s = app.listen(port, () => {
            const actual = s.address();
            const p = typeof actual === 'object' ? actual.port : port;
            console.log(`Local Express server running at http://localhost:${p}/`);
            resolve({ server: s, port: p });
        });
        s.on('error', reject);
    });
}

// Allow running standalone with `node server.js`
if (require.main === module) {
    startServer().catch(err => {
        console.error('Failed to start server', err);
        process.exit(1);
    });
}

module.exports = { startServer };
