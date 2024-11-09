
const express = require('express');
require('dotenv').config()
const fs = require('fs');
const https = require('https');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const app = express();
const port = 4422;
const path = require('path');
const bcrypt = require('bcrypt');



const sslOptions = {
    key: fs.readFileSync('certificates/key.pem'), // Replace with the path to your private key
    cert: fs.readFileSync('certificates/cert.pem'), // Replace with the path to your certificate
};

app.use(cors(
    // {
    // origin: 'https://foodorderingsame.netlify.app', // replace with your client’s origin
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // credentials: true,
    // }
));
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

app.post('/login', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        // Iterate through all users to find one with a matching hashed password
        const usersQuery = 'SELECT user_id, username, role, employeeid, password_hash FROM Users';
        const users = await pool.query(usersQuery);

        // Search for a matching password
        const matchedUser = users.rows.find(async user => await bcrypt.compare(password, user.password_hash));

        // Return result
        if (matchedUser) {
            const { user_id, username, role, employeeid } = matchedUser;
            return res.status(200).json({
                message: 'Login successful',
                user: { user_id, username, role, employeeid },
            });
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store images in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
    },
});

const upload = multer({ storage });


app.get('/printers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM printerName');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});


app.post('/categories', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null; // Get the filename from req.file if it exists

    try {
        const result = await pool.query(
            'INSERT INTO category (name, description, image) VALUES ($1, $2, $3) RETURNING *',
            [name, description, image]
        );

        // Construct the image URL if the image exists
        const imageUrl = image ? `${req.protocol}://${req.get('host')}/uploads/${image}` : null;

        // Return the newly created category with the image URL
        res.status(201).json({ ...result.rows[0], image: imageUrl });
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


app.put('/categories/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id; // Get the ID from the request parameters
    const { name, description } = req.body; // Extract other fields from the request body
    const image = req.file ? req.file.filename : null; // Get the image filename if it exists

    try {
        // Start building the update query
        let query = `UPDATE category SET name = $1, description = $2`;
        const queryParams = [name, description];

        // If an image is provided, include it in the query
        if (image) {
            query += `, image = $3 WHERE id = $4`;
            queryParams.push(image, id);
        } else {
            // If no image is provided, do not update the image field
            query += ` WHERE id = $3`;
            queryParams.push(id);
        }

        // Execute the update query
        const result = await pool.query(query, queryParams);

        // Check if any row was affected
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch the updated category from the database to return in the response
        const updatedCategory = await pool.query('SELECT * FROM category WHERE id = $1', [id]);
        res.status(200).json(updatedCategory.rows[0]);

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

app.post('/subcategories', upload.single('image'), async (req, res) => {
    const { name, description, category_id } = req.body; // Get the category_id from the request
    const image = req.file ? req.file.filename : null; // Get the image filename if it exists

    try {
        const result = await pool.query(
            'INSERT INTO subcategory (name, description, image, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, image, category_id]
        );

        // Construct the image URL if the image exists
        const imageUrl = image ? `${req.protocol}://${req.get('host')}/uploads/${image}` : null;

        // Return the newly created subcategory with the image URL
        res.status(201).json({ ...result.rows[0], image: imageUrl });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/subcategories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM subcategory');
        const subcategoriesWithImageURLs = result.rows.map(subcategory => ({
            ...subcategory,
            image: subcategory.image ? `${req.protocol}://${req.get('host')}/uploads/${subcategory.image}` : null
        }));

        res.status(200).json(subcategoriesWithImageURLs); // Return all subcategories with image URLs
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/subcategories/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM subcategory WHERE category_id = $1', [categoryId]);
        const subcategoriesWithImageURLs = result.rows.map(subcategory => ({
            ...subcategory,
            image: subcategory.image ? `${req.protocol}://${req.get('host')}/uploads/${subcategory.image}` : null
        }));

        res.status(200).json(subcategoriesWithImageURLs); // Return the subcategories with image URLs
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/subcategories/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    const { name, description, category_id } = req.body; // Include category_id
    const image = req.file ? req.file.filename : null;

    try {
        // Start building the update query
        let query = `UPDATE subcategory SET name = $1, description = $2, category_id = $3`;
        const queryParams = [name, description, category_id];

        // If an image is provided, include it in the query
        if (image) {
            query += `, image = $4 WHERE id = $5`;
            queryParams.push(image, id);
        } else {
            query += ` WHERE id = $4`;
            queryParams.push(id);
        }

        // Execute the update query
        const result = await pool.query(query, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        // Fetch the updated subcategory to return in the response
        const updatedSubcategory = await pool.query('SELECT * FROM subcategory WHERE id = $1', [id]);
        res.status(200).json(updatedSubcategory.rows[0]);

    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/subcategories/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM subcategory WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// 1. Create a new menu item
app.post('/menus', upload.single('image'), async (req, res) => {
    const { name, price, category_id, subcategory_id, printerName, isFridge } = req.body;
    const image = req.file ? req.file.filename : null;

    // Convert empty string to null for subcategory_id
    const subcategoryId = subcategory_id === "" ? null : subcategory_id;

    try {
        // Insert the new menu item
        const insertResult = await pool.query(
            'INSERT INTO menu (name, price, category_id, subcategory_id, "printerName", "isFridge", image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, price, category_id, subcategoryId, printerName, isFridge, image]
        );

        const newMenuItem = insertResult.rows[0];

        // Fetch category and subcategory names
        const categoryQuery = `
            SELECT 
                category.name AS category_name,
                subcategory.name AS subcategory_name
            FROM category
            LEFT JOIN subcategory ON subcategory.id = $1
            WHERE category.id = $2
        `;

        // Use subcategoryId variable here
        const categoryResult = await pool.query(categoryQuery, [subcategoryId, category_id]);
        const categoryData = categoryResult.rows[0];

        // Construct the response
        const imageUrl = image ? `${req.protocol}://${req.get('host')}/uploads/${image}` : null;
        const response = {
            ...newMenuItem,
            image: imageUrl,
            category: categoryData ? categoryData.category_name : null,
            subCategory: categoryData ? categoryData.subcategory_name : null,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// 2. Retrieve all menu items with image URLs
app.get('/menus', async (req, res) => {
    try {
        const query = `
            SELECT 
                menu.*,
                category.name AS category_name,
                subcategory.name AS subcategory_name
            FROM menu
            LEFT JOIN category ON menu.category_id = category.id
            LEFT JOIN subcategory ON menu.subCategory_id = subcategory.id
        `;

        const result = await pool.query(query);

        const menusWithImageURLs = result.rows.map(menu => ({
            ...menu,
            image: menu.image ? `${req.protocol}://${req.get('host')}/uploads/${menu.image}` : null,
            category: menu.category_name,
            subCategory: menu.subcategory_name
        }));

        res.status(200).json(menusWithImageURLs);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// 3. Retrieve menu items by category ID
app.get('/menus/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM menu WHERE category_id = $1', [categoryId]);
        const menusWithImageURLs = result.rows.map(menu => ({
            ...menu,
            image: menu.image ? `${req.protocol}://${req.get('host')}/uploads/${menu.image}` : null
        }));

        res.status(200).json(menusWithImageURLs);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/menus/filtered', async (req, res) => {
    const { category_id, subCategory_id } = req.query;

    try {
        // Build the base query and parameters array
        let query = `SELECT * FROM menu WHERE category_id = $1`;
        let queryParams = [category_id];

        // If subCategory_id is provided, add it to the query
        if (subCategory_id) {
            query += ` AND subCategory_id = $2`;
            queryParams.push(subCategory_id);
        }

        const result = await pool.query(query, queryParams);

        // Construct the image URLs if images exist
        const menuItemsWithImageURLs = result.rows.map(item => ({
            ...item,
            image: item.image ? `${req.protocol}://${req.get('host')}/uploads/${item.image}` : null
        }));

        res.status(200).json(menuItemsWithImageURLs);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Update an existing menu item
app.put('/menus/:id', upload.single('image'), async (req, res) => {
    console.log(req.body);
    const id = req.params.id;
    const { name, price, category_id, subcategory_id, printerName, isFridge } = req.body;
    const image = req.file ? req.file.filename : null;
    const subcategoryId = subcategory_id === "" || 'null' ? null : subcategory_id;

    try {
        let query = `UPDATE menu SET name = $1, price = $2, category_id = $3, subcategory_id = $4, "printerName" = $5, "isFridge" = $6`;
        const queryParams = [name, price, category_id, subcategoryId, printerName, isFridge];

        if (image) {
            query += `, image = $7 WHERE id = $8`;
            queryParams.push(image, id);
        } else {
            query += ` WHERE id = $7`;
            queryParams.push(id);
        }

        // Execute the update
        const result = await pool.query(query, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Fetch the updated menu item along with category and subcategory names
        const updatedMenuQuery = `
            SELECT 
                menu.*,
                category.name AS category_name,
                subcategory.name AS subcategory_name
            FROM menu
            LEFT JOIN category ON menu.category_id = category.id
            LEFT JOIN subcategory ON menu.subcategory_id = subcategory.id
            WHERE menu.id = $1
        `;
        const updatedMenuResult = await pool.query(updatedMenuQuery, [id]);

        const updatedMenu = updatedMenuResult.rows[0];

        // Construct image URL
        const imageUrl = updatedMenu.image ? `${req.protocol}://${req.get('host')}/uploads/${updatedMenu.image}` : null;

        // Send response with updated item and category details
        res.status(200).json({
            ...updatedMenu,
            image: imageUrl,
            category: updatedMenu.category_name,
            subCategory: updatedMenu.subcategory_name
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// 5. Delete a menu item
app.delete('/menus/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM menu WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/orders', async (req, res) => {
    const { receiptData, receiptDetails } = req.body;
    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Insert into tblReceipt
        const receiptQuery = `
        INSERT INTO tblReceipt (Receipt_Date, Table_Number, Amount, Status, UserID, Waiter, Discount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING Receipt_ID
      `;
        const receiptValues = [
            receiptData.Receipt_Date,
            receiptData.Table_Number,
            receiptData.Amount,
            receiptData.Status,
            receiptData.UserID,
            receiptData.Waiter,
            receiptData.Discount
        ];
        console.log(receiptData.UserID);
        console.log(receiptData);
        const receiptResult = await pool.query(receiptQuery, receiptValues);
        const receiptId = receiptResult.rows[0].receipt_id;

        // Insert each item in receiptDetails into tblReceipt_Details
        const detailQuery = `
        INSERT INTO tblReceipt_Details (Receipt_ID, Item_Name, Category, Quantity, Price, Sub_Total, Status, kitchen_tv)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
        for (const item of receiptDetails) {
            const detailValues = [
                receiptId,
                item.Item_Name,
                item.Category,
                item.Quantity,
                item.Price,
                item.Sub_Total,
                item.Status,
                item.kitchen_tv
            ];
            await pool.query(detailQuery, detailValues);
        }

        // Update the status and UserID of the table in tblTables to 'Occupied' and set the UserID
        const updateTableStatusQuery = `
        UPDATE tblTables
        SET Status = 'Occupied', UserID = $2
        WHERE Table_Number = $1
      `;
        await pool.query(updateTableStatusQuery, [receiptData.Table_Number, receiptData.UserID]);

        // Commit transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await pool.query('ROLLBACK');
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// GET /api/orders - Retrieve all orders
app.get('/orders', async (req, res) => {
    // Define the query constant to fetch selected columns from tblReceipt
    const FETCH_SELECTED_ORDERS_QUERY = `
      SELECT 
        Receipt_ID AS "id",    
        Order_Nbr AS "orderNumber", 
        Receipt_Date AS "date", 
        Receipt_Time AS "time", 
        Table_Number AS "tableNumber", 
        Amount, 
        Status
      FROM tblReceipt
    `;

    try {
        const result = await pool.query(FETCH_SELECTED_ORDERS_QUERY);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});


app.post('/order-details/:id', async (req, res) => {
    const { receiptDetails } = req.body;
    const receiptId = req.params.id;
    console.log("Receipt-Id", receiptId);
    try {
        // Insert each item in receiptDetails into tblReceipt_Details
        const detailQuery = `
        INSERT INTO tblReceipt_Details (Receipt_ID,Item_Name, Category, Quantity, Price, Sub_Total, Status, kitchen_tv)
        VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
      `;
        for (const item of receiptDetails) {
            const detailValues = [
                receiptId,
                item.Item_Name,
                item.Category,
                item.Quantity,
                item.Price,
                item.Sub_Total,
                item.Status,
                item.kitchen_tv
            ];
            await pool.query(detailQuery, detailValues);
        }

        res.status(200).json({ message: 'Order details submitted successfully' });
    } catch (error) {
        console.error('Error submitting order details:', error);
        res.status(500).json({ message: 'Failed to submit order details' });
    }
});



// GET /api/order-details/:id - Retrieve details of a specific order
app.get('/order-details/:id', async (req, res) => {
    const { id } = req.params; // Extract the order ID from the URL parameters

    // Define the query constant within the route for selected columns
    const FETCH_ORDER_DETAILS_QUERY = `
      SELECT 
        Receipt_DetailID, 
        Item_Name, 
        Category, 
        Quantity, 
        Price, 
        Sub_Total, 
        Status, 
        Note
      FROM tblReceipt_Details
      WHERE Receipt_ID = $1
    `;
    try {
        const result = await pool.query(FETCH_ORDER_DETAILS_QUERY, [id]); // Execute the query with the provided ID
        res.status(200).json(result.rows); // Send the retrieved rows as the response
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});


// GET /api/order-details-by-table/:tableNumber - Retrieve order details by table number
app.get('/order-details-by-table/:tableNumber', async (req, res) => {
    console.log("--ENTERED HERE-------");
    const { tableNumber } = req.params; // Extract table number from the URL parameters

    // Define the query to fetch order details by joining tblReceipt and tblReceipt_Details
    const FETCH_ORDER_DETAILS_BY_TABLE_QUERY = `
      SELECT 
        rd.Receipt_DetailID AS "detailId",
        r.Receipt_ID AS "receiptId",
        r.Order_Nbr AS "orderNumber",
        r.Receipt_Date AS "date",
        r.Receipt_Time AS "time",
        r.Table_Number AS "tableNumber",
        rd.Item_Name AS "itemName",
        rd.Category AS "category",
        rd.Quantity AS "quantity",
        rd.Price AS "price",
        rd.Sub_Total AS "subTotal",
        rd.Status AS "status",
        rd.Note AS "note"
      FROM tblReceipt r
      INNER JOIN tblReceipt_Details rd ON r.Receipt_ID = rd.Receipt_ID
      WHERE r.Table_Number = $1
      AND r.Status = 'Pending' -- You can adjust this based on the order status you're interested in
    `;

    try {
        const result = await pool.query(FETCH_ORDER_DETAILS_BY_TABLE_QUERY, [tableNumber]); // Execute the query with the table number
        if (result.rows.length > 0) {
            console.log("--THIS IS WHAT IT IS-----");
            console.log(result.rows);
            res.status(200).json(result.rows); // Send the retrieved order details as the response
        } else {
            console.log('-------CHECKING VALUES-------');
            res.status(404).json({ message: 'No orders found for this table.' });
        }
    } catch (error) {
        console.log("------CATH ERROR-------");
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});



// DELETE an order and its associated order details
app.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Begin transaction
        await pool.query('BEGIN');

        const orderResult = await pool.query('SELECT Table_Number FROM tblReceipt WHERE Receipt_ID = $1', [id]);

        const tableNumber = orderResult.rows[0].table_number.trim();

        console.log(tableNumber);
        await pool.query(
            'UPDATE tbltables SET status = $1 WHERE table_number = $2',
            ['Available', tableNumber]
        );


        // await pool.query(updateTableStatusQuery, ["1"]);

        // Delete associated order details first
        const deleteDetailsResult = await pool.query('DELETE FROM tblReceipt_Details WHERE Receipt_ID = $1', [id]);

        // Then delete the order
        const deleteOrderResult = await pool.query('DELETE FROM tblReceipt WHERE Receipt_ID = $1', [id]);



        if (deleteOrderResult.rowCount === 0) {
            // Rollback if the order was not found
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }


        // Commit the transaction if both deletions are successful
        await pool.query('COMMIT');



        res.status(200).json({ message: 'Order and its details deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        // Rollback in case of any error
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/useremployees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employee WHERE loginrequirement = $1', ['yes']);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).send('Server error');
    }
});

// GET /api/employees - Retrieve all employees
app.get('/employees', async (req, res) => {
    // Define the query constant to fetch selected columns from the Employee table
    const FETCH_SELECTED_EMPLOYEES_QUERY = `
      SELECT 
        EmployeeID AS "id",    
        EmployeeTitle AS "title", 
        FirstName AS "firstName", 
        MiddleName AS "middleName", 
        LastName AS "lastName", 
        Phone, 
        Salary, 
        WagesDaily AS "dailyWage", 
        TaxAmount AS "taxAmount", 
        HireDate AS "hireDate", 
        LoginRequirement AS "loginRequired", 
        Image AS "image", 
        SalaryPaymentType AS "salaryPaymentType"
      FROM Employee
    `;

    try {
        const result = await pool.query(FETCH_SELECTED_EMPLOYEES_QUERY);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Failed to fetch employees' });
    }
});

// POST /api/employees - Add a new employee
app.post('/employees', upload.single('image'), async (req, res) => {
    console.log(req.body);
    const {
        employeeTitle,
        firstName,
        middleName,
        lastName,
        phone,
        salary,
        dailyWage,
        taxAmount,
        hireDate,
        loginRequired,
        image,
        salaryPaymentType
    } = req.body;

    const ADD_EMPLOYEE_QUERY = `
      INSERT INTO Employee (
        EmployeeTitle, FirstName, MiddleName, LastName, Phone, Salary, WagesDaily, 
        TaxAmount, HireDate, LoginRequirement, Image, SalaryPaymentType
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING EmployeeID AS "id";
    `;

    try {
        const result = await pool.query(ADD_EMPLOYEE_QUERY, [
            employeeTitle, firstName, middleName, lastName, phone, salary, dailyWage,
            taxAmount, hireDate, loginRequired, image, salaryPaymentType
        ]);
        res.status(201).json({ id: result.rows[0].id, message: 'Employee added successfully' });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ message: 'Failed to add employee' });
    }
});


// POST /api/employees - Add a new employee
// app.post('/employees', upload.single('image'), async (req, res) => {
//     console.log(req.body);
//     const {
//         employeeTitle,
//         firstName,
//         middleName,
//         lastName,
//         phone,
//         salary,
//         dailyWage,
//         taxAmount,
//         hireDate,
//         loginRequired, // This field should be either true or false
//         image,
//         salaryPaymentType
//     } = req.body;

//     // Convert loginRequired boolean to 'yes', 'no', or 'login' based on the boolean value
//     // let loginRequirementValue;
//     // if (loginRequired === 'true') {
//     //     loginRequirementValue = 'yes';
//     // } else if (loginRequired === 'false') {
//     //     loginRequirementValue = 'no';
//     // } else {
//     //     loginRequirementValue = 'login'; // Default, if no value or invalid value is provided
//     // }

//     const ADD_EMPLOYEE_QUERY = `
//       INSERT INTO Employee (
//         EmployeeTitle, FirstName, MiddleName, LastName, Phone, Salary, WagesDaily, 
//         TaxAmount, HireDate, LoginRequirement, Image, SalaryPaymentType
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
//       RETURNING EmployeeID AS "id";
//     `;

//     try {
//         const result = await pool.query(ADD_EMPLOYEE_QUERY, [
//             employeeTitle, firstName, middleName, lastName, phone, salary, dailyWage,
//             taxAmount, hireDate, loginRequirementValue, image, salaryPaymentType
//         ]);
//         res.status(201).json({ id: result.rows[0].id, message: 'Employee added successfully' });
//     } catch (error) {
//         console.error('Error adding employee:', error);
//         res.status(500).json({ message: 'Failed to add employee' });
//     }
// });


// PUT /api/employees/:id - Update an existing employee by ID
app.put('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const {
        employeeTitle,
        firstName,
        middleName,
        lastName,
        phone,
        salary,
        dailyWage,
        taxAmount,
        hireDate,
        loginRequired,
        image,
        salaryPaymentType
    } = req.body;

    const UPDATE_EMPLOYEE_QUERY = `
      UPDATE Employee 
      SET 
        EmployeeTitle = $1, FirstName = $2, MiddleName = $3, LastName = $4, Phone = $5, 
        Salary = $6, WagesDaily = $7, TaxAmount = $8, HireDate = $9, LoginRequirement = $10, 
        ImagePath = $11, SalaryPaymentType = $12
      WHERE EmployeeID = $13
      RETURNING EmployeeID AS "id";
    `;

    try {
        const result = await pool.query(UPDATE_EMPLOYEE_QUERY, [
            employeeTitle, firstName, middleName, lastName, phone, salary, dailyWage,
            taxAmount, hireDate, loginRequired, image, salaryPaymentType, id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ id: result.rows[0].id, message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Failed to update employee' });
    }
});

// DELETE /api/employees/:id - Delete an employee by ID
app.delete('/employees/:id', async (req, res) => {
    const { id } = req.params;

    const DELETE_EMPLOYEE_QUERY = `
      DELETE FROM Employee 
      WHERE EmployeeID = $1
      RETURNING EmployeeID AS "id";
    `;

    try {
        const result = await pool.query(DELETE_EMPLOYEE_QUERY, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ id: result.rows[0].id, message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Failed to delete employee' });
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

app.get('/tables', async (req, res) => {
    // Define the query as a constant within the route
    const GET_TABLES_QUERY = 'SELECT Table_Number, Status, GroupID, UserId FROM tblTables';

    try {
        // Execute the query
        const result = await pool.query(GET_TABLES_QUERY);
        res.status(200).json(result.rows);
        // Ensure that the result is structured as expected
        // if (Array.isArray(result) && result.length > 0) {
        //     const [rows] = result; // Destructure the rows if the result is valid
        //     res.json(rows); // Send the query result as JSON
        // } else {
        //     // Handle cases where the result is not as expected
        //     console.error('Unexpected query result:', result);
        //     res.status(404).json({ message: 'No tables found' }); // Return a 404 status if no data found
        // }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Server error' }); // Return a server error on exception
    }
});

// POST method to add a new user
// app.post('/users', async (req, res) => {
//     const { username, password, employeeid, role } = req.body;

//     if (!username || !password || !role) {
//         return res.status(400).json({ message: 'Username, password, and role are required' });
//     }

//     try {
//         // Hash the password
//         const passwordHash = await bcrypt.hash(password, 10);

//         // Insert the new user into the database
//         const query = `
//         INSERT INTO Users (username, password_hash, employeeid, role)
//         VALUES ($1, $2, $3, $4)
//         RETURNING user_id, username, role
//       `;
//         const values = [username, passwordHash, employeeid, role];

//         const result = await pool.query(query, values);

//         // Return the newly created user info (excluding the password hash)
//         res.status(201).json({
//             message: 'User created successfully',
//             user: result.rows[0],
//         });
//     } catch (error) {
//         console.error('Error inserting user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.post('/users', async (req, res) => {
    console.log(req.body);
    const { username, password, employeeId, role } = req.body;
    console.log(req.body);

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
    }


    try {
        await pool.query('BEGIN'); // Start a transaction

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert the new user into the Users table
        const userQuery = `
            INSERT INTO Users (username, password_hash, employeeid, role)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, role
        `;
        const userValues = [username, passwordHash, employeeId, role];
        const userResult = await pool.query(userQuery, userValues);

        // Update the loginRequirement field in the Employees table
        const employeeQuery = `
            UPDATE Employee
            SET loginrequirement = 'login'
            WHERE employeeid = $1
        `;
        const employeeValues = [employeeId];
        await pool.query(employeeQuery, employeeValues);

        await pool.query('COMMIT'); // Commit the transaction

        // Return the newly created user info (excluding the password hash)
        res.status(201).json({
            message: 'User created successfully and employee login requirement updated',
            user: userResult.rows[0],
        });
    } catch (error) {
        await pool.query('ROLLBACK'); // Roll back the transaction if there is an error
        console.error('Error inserting user and updating employee:', error);
        res.status(500).json({ message: 'Internal server error' });
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
    res.send("This is Food ordering backend");
});

//Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Create an HTTPS server
// https.createServer(sslOptions, app).listen(port, () => {
//     console.log(`Server running on https://localhost:${port}`);
//   });