
const express = require('express');
require('dotenv').config()
const https = require('https');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const app = express();
const port = 4422;
const path = require('path');


app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());


const pool = new Pool({
    user: 'postgres',
    host: '128.199.144.65',
    database: 'foodorder',
    password: 'openpgpwd',
    port: 5432,
    max: 200, // Maximum number of connections
    idleTimeoutMillis: 30000, // Time in ms before an idle connection is closed
    connectionTimeoutMillis: 2000,
});


const JWT_SECRET = 'c09a42022c2b32fc1094cfbb16b156ffc814e2f9aa29fca39ecaff101b1d5731';

var tokens;


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store images in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
    },
});

const upload = multer({ storage });


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM userz WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        if (password !== user.password) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.get('/locations', async (req, res) => {
    const result = await pool.query('SELECT * FROM locations');
    res.json(result.rows);
});

app.get('/available-times', async (req, res) => {
    const { date } = req.query;
    const result = await pool.query('SELECT * FROM bookings WHERE date = $1', [date]);
    res.json(result.rows);
});

app.get('/table-prices', async (req, res) => {
    const result = await pool.query('SELECT * FROM tables');
    res.json(result.rows);
});

app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM category');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/categories', upload.single('image'), async (req, res) => {
    const { name, description, image } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO category (name, description,image) VALUES ($1, $2,$3) RETURNING *',
            [name, description, image]
        );
        console.log(result);
        res.status(201).json(result.rows[0]); // Return the newly created category with its ID
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM category');

        // Map through each row and prepend the full URL for the image
        const categoriesWithImageURLs = result.rows.map(category => ({
            ...category,
            image: category.image ? `${req.protocol}://${req.get('host')}/uploads/${category.image}` : null // If image exists, build the full URL
        }));

        res.status(200).json(categoriesWithImageURLs); // Return the categories with full image URLs
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/categories/:id', async (req, res) => {
    const id = req.params.id;
    const { name, description, image } = req.body;

    try {
        const result = await pool.query(
            'UPDATE category SET name = $1, description = $2 WHERE id = $3',
            [name, description, id]
        );
        // Check if any row was affected
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // If the update is successful, respond with a success message
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/categories/:id', async (req, res) => {
    const id = req.params.id; // Get the ID from the request parameters
    try {
        const result = await pool.query(
            'DELETE FROM category WHERE id = $1',
            [id] // Include ID in the query
        );

        // Check if any row was deleted
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Respond with a success message
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Create a new menu item with image upload
app.post('/menus', upload.single('image'), async (req, res) => {
    const { name, description, price, category_id } = req.body;
    const image = req.file ? req.file.filename : null; // Get the image filename from multer

    try {
        const result = await pool.query(
            'INSERT INTO menus (name, description, price, category_id, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, category_id, image]
        );

        res.status(201).json(result.rows[0]); // Return the newly created menu item
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/menus/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id; // Get the ID from the request parameters
    const { name, description, price, category_id } = req.body; // Extract other fields from the request body
    const image = req.file ? req.file.filename : null; // Get the image filename if it exists

    try {
        // Start building the update query
        let query = `UPDATE menus SET name = $1, description = $2, price = $3, category_id = $4`;
        const queryParams = [name, description, price, category_id];

        // If an image is provided, include it in the query
        if (image) {
            query += `, image = $5 WHERE id = $6`;
            queryParams.push(image, id);
        } else {
            // If no image is provided, do not update the image field
            query += ` WHERE id = $5`;
            queryParams.push(id);
        }

        // Execute the update query
        const result = await pool.query(query, queryParams);

        // Check if the update was successful
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Fetch the updated menu item from the database to return in the response
        const updatedItem = await pool.query('SELECT * FROM menus WHERE id = $1', [id]);
        res.status(200).json(updatedItem.rows[0]);

    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.delete('/menus/:id', async (req, res) => {
    const id = req.params.id; // Get the ID from the request parameters

    try {
        const result = await pool.query(
            'DELETE FROM menus WHERE id = $1',
            [id] // Include ID in the query
        );

        // Check if any row was deleted
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Respond with a success message
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/menus', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT m.id, m.name, m.description, m.price, m.category_id, c.name AS category_name, m.image 
      FROM menus m
      LEFT JOIN category c ON m.category_id = c.id
    `);

        // Map through each row and prepend the full URL for the image
        const menusWithImageURLs = result.rows.map(menu => ({
            ...menu,
            image: menu.image ? `${req.protocol}://${req.get('host')}/uploads/${menu.image}` : null // If image exists, build the full URL
        }));

        res.status(200).json(menusWithImageURLs); // Return the menu items with category names and image URLs
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/menus', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT m.id, m.name, m.description, m.price, m.category_id, c.name AS category_name, m.image 
      FROM menus m
      LEFT JOIN category c ON m.category_id = c.id
    `);
        console.log(result);
        res.status(200).json(result.rows); // Return the menu items with category names and image URLs
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/categorymenus', async (req, res) => {
    try {
        // Query to get categories and their associated menu items
        const result = await pool.query(`
          SELECT 
              c.id AS category_id, 
              c.name AS category_name, 
              json_agg(m) AS items 
          FROM category c 
          LEFT JOIN (
              SELECT id, name, description, price, category_id 
              FROM menus
          ) m ON c.id = m.category_id 
          GROUP BY c.id
      `);

        res.status(200).json(result.rows); // Return the categories with their menu items
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Simple validation example
const validateBookingData = (data) => {
    const { location, date, startTime, numberOfPeople, name, phoneNumber } = data;

    if (!location || !date || !startTime || !numberOfPeople || !name || !phoneNumber) {
        throw new Error('All fields are required');
    }
};



app.post('/pay', async (req, res) => {
    console.log("Pay called", req.query)
    let { evcNumber, amount } = req.body;
    const waafipay = require('waafipay-sdk-node').API("API-1144768468AHX", "1000201", "M0910188", { testMode: true }); // TestMode flag -->  true is production : false is test 

    waafipay.preAuthorize({
        paymentMethod: "MWALLET_ACCOUNT",
        accountNo: "252" + evcNumber,
        amount: amount,
        currency: "USD",
        description: "wan diray"
    }, function (err, result) {
        console.log("response", result)

        if (result.responseCode == "2001") {


            res.send({ success: true, message: "Payment Processed successfully" })
            return;

        } else {
            if (result.responseMsg.includes("Aborted")) {
                res.render('index', { fail: true, message: "Waad ka laabatay lacag bixinta" });
                return;
            } else {
                res.send({ success: false, message: "Laguma Guulaysan Lacag Bixinta , Isku day markale", })



            }
        }
    })


});
app.post('/book-table', async (req, res) => {
    try {
        // Validate the booking data including startTime and endTime
        validateBookingData(req.body);

        // Destructure the data from the request body
        const {
            location,
            date,
            startTime,
            numberOfPeople,
            name,
            phoneNumber
        } = req.body;

        // Insert the booking into the database with start and end times
        await pool.query(
            'INSERT INTO bookings (location, date, start_time, num_people, name, phone_number) VALUES ($1, $2, $3, $4, $5, $6)',
            [location, date, startTime, numberOfPeople, name, phoneNumber]
        );
        tokens = await getDeviceTokens();
        var message = {
            tokens: tokens,
            notification: {
                title: "Booking notification",
                body: "new Booking Message",
            },
        };
        await admin.messaging().sendEachForMulticast(message);

        // Send a success response
        res.status(200).send('Booking confirmed');
    } catch (error) {
        console.error('Error booking table:', error);
        res.status(400).send(`Error: ${error.message}`);
    }
});

// server.js
async function getDeviceTokens() {
    try {
        const result = await pool.query('SELECT deviceid FROM devicetoken');
        // Extract device tokens from the query result
        return result.rows.map(row => row.deviceid);
    } catch (error) {
        console.error('Error fetching device tokens:', error);
        throw new Error('Could not fetch device tokens');
    }
}


app.post('/send-email', async (req, res) => {
    const { email, subject, message } = req.body;

    try {
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: email,
            subject: subject,
            text: message,
        });

        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ error: 'Failed to send email' });
    }
});



// Bookings Route
app.get('/bookings', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        b.id, 
        b.date, 
        b.name, 
        b.phone_number, 
        loc.name AS location,
        b.start_time, 
        b.num_people,
        b.status
      FROM bookings b
      LEFT JOIN locations loc ON b.location::integer = loc.id
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send({ error: 'Failed to retrieve bookings' });
    }
});

app.get('/bookings/:deviceToken', async (req, res) => {
    const { deviceToken } = req.params;
    try {
        // Execute both operations concurrently
        const [, bookingsResult] = await Promise.all([
            // Save or store the device token (but we don't need to return this result)
            pool.query(
                `INSERT INTO devicetoken (deviceid)
         VALUES ($1)
         ON CONFLICT (deviceid) DO NOTHING`,
                [deviceToken]
            ),

            // Fetch the booking data
            pool.query(`
        SELECT 
          b.id, 
          b.date, 
          b.name, 
          b.phone_number, 
          loc.name AS location,
          b.start_time, 
          b.num_people,
          b.status
        FROM bookings b
        LEFT JOIN locations loc ON b.location::integer = loc.id
      `)
        ]);

        // Send only the booking data as the response
        res.json(bookingsResult.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send({ error: 'Failed to retrieve bookings' });
    }
});

app.post('/bookingList', async (req, res) => {
    try {
        const { status, date } = req.body; // Make sure your request body includes both 'status' and 'date'
        const query = `
      SELECT 
        b.id, 
        b.date, 
        b.name, 
        b.phone_number, 
        loc.name AS location,
        b.start_time, 
        b.num_people,
        b.status
      FROM bookings b
      LEFT JOIN locations loc ON b.location::integer = loc.id
      WHERE b.date = $1
        AND b.status = $2
    `;

        // Execute the query with parameterized values
        const result = await pool.query(query, [date, status]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send({ error: 'Failed to retrieve bookings' });
    }
});

app.put('/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'active', 'completed'];

    if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: 'Invalid status' });
    }

    try {
        await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
        res.status(200).send('Booking status updated');
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).send({ error: 'Failed to update booking status' });
    }
});


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM userz WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }
        const user = result.rows[0];
        if (password !== user.password) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, 'JWT_SECRET', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await pool.query('SELECT * FROM userz WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).send({ message: 'User already exists' });
        }

        // Insert the new user into the database
        const result = await pool.query(
            'INSERT INTO userz (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, password] // Directly using the password
        );

        // Return the newly created user
        const newUser = result.rows[0];
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Edit User (update password or other details)
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body; // Assuming you're updating password

    try {
        const result = await pool.query('UPDATE userz SET password = $1 WHERE id = $2 RETURNING *', [password, id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Delete User
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM userz WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Get Users List Route
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM userz');
        res.json(result.rows); // Return the list of users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Serve static files
app.use(express.static(path.join(__dirname, "build")));

// Handle client-side routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
